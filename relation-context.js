/* Filter relationship roles using the current reading, independently of the deck. */
(function(root){
  'use strict';
  const knownIds=new Set([96,97,98,99,101,102,103,105,108,109,110,111,112]);
  const newIds=new Set([100,106]);
  const loveKnownIds=new Set([61,63,64,65,66,67,68,70]);
  const loveNewIds=new Set([62]);
  function normalize(text){
    return String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’‘]/g,"'");
  }
  function classify(text){
    const s=normalize(text);
    // Remove explicitly negated alternatives before looking for positive evidence.
    const positive=s.replace(/(?:ne\s+[^.!?;]{0,35}?pas|pas|sans|aucune?|not|no|without)\s+(?:(?:une?|de|d'|a|an|any)\s*)?(?:nouvelle?\s+(?:personne|rencontre|relation)|personne\s+(?:deja\s+)?connue|new\s+(?:person|encounter|relationship)|someone\s+new)\b/g,'');
    const fresh=/\b(?:nouvelle? (?:personne|rencontre)|personne (?:nouvelle|inconnue)|quelqu'un (?:de nouveau|que vous ne connaissez pas)|(?:personne|quelqu'un) que vous n'avez (?:pas encore|jamais) rencontr|(?:pas encore|jamais) (?:rencontre|connu)|new (?:person|encounter)|someone new|someone you (?:do not|don't) know|(?:not yet|never) met)\b/.test(positive);
    const known=/\b(?:personne (?:deja )?connue|quelqu'un que vous connaissez|vous (?:vous )?connaissez deja|lien (?:deja )?(?:existant|etabli|ancien)|relation (?:deja )?(?:existante|etablie|actuelle)|votre (?:partenaire|conjoint|conjointe|ex|collegue)|vos (?:retrouvailles|echanges passes)|histoire (?:commune|partagee)|personne (?:de votre passe|que vous connaissez)|someone you (?:already )?know|(?:known|familiar) person|(?:existing|established|current) (?:relationship|bond)|your (?:partner|spouse|ex)|shared history)\b/.test(positive);
    return fresh===known?'ambiguous':fresh?'new':'known';
  }
  function context(story,question){
    // The actual narrative wins; the question only fills an unspecified context.
    const result=classify(story);
    return result==='ambiguous' && !String(story||'').trim()?classify(question):result;
  }
  function filter(cards,kind){
    return cards.filter(card=>{
      const known=card.oracle==='amour'?loveKnownIds:knownIds;
      const fresh=card.oracle==='amour'?loveNewIds:newIds;
      return kind==='known'?!fresh.has(Number(card.id)):kind==='new'?!known.has(Number(card.id)):true;
    });
  }
  const api={classify,context,filter};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CR_RELATION_CONTEXT=api;
})(typeof window==='undefined'?globalThis:window);

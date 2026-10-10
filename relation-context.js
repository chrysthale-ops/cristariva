/* Filter relationship roles using the current reading, independently of the deck. */
(function(root){
  'use strict';
  const knownIds=new Set([96,97,98,99,101,102,103,104,105,108,110,112]);
  const newIds=new Set([100,106]);
  const loveKnownIds=new Set([61,64,65,66,68]);
  const loveNewIds=new Set([62]);
  function normalize(text){
    return String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’‘]/g,"'");
  }
  function narrativeClassify(text){
    const s=normalize(text);
    // Remove explicitly negated alternatives before looking for positive evidence.
    const positive=s.replace(/(?:ne\s+[^.!?;]{0,35}?pas|pas|sans|aucune?|not|no|without)\s+(?:(?:une?|de|d'|a|an|any)\s*)?(?:nouvelle?\s+(?:personne|rencontre|relation)|personne\s+(?:deja\s+)?connue|new\s+(?:person|encounter|relationship)|someone\s+new)\b/g,'');
    const fresh=/\b(?:nouvelle? (?:personne|rencontre)|personne (?:nouvelle|inconnue)|quelqu'un (?:de nouveau|que vous ne connaissez pas)|(?:personne|quelqu'un) que vous n'avez (?:pas encore|jamais) rencontr|(?:pas encore|jamais) (?:rencontre|connu)|new (?:person|encounter)|someone new|someone you (?:do not|don't) know|(?:not yet|never) met)\b/.test(positive);
    const known=/\b(?:personne (?:deja )?connue|quelqu'un que vous connaissez|vous (?:vous )?connaissez deja|lien (?:deja )?(?:existant|etabli|ancien)|relation (?:deja )?(?:existante|etablie|actuelle)|votre (?:partenaire|conjoint|conjointe|ex|collegue)|vos (?:retrouvailles|echanges passes)|histoire (?:commune|partagee)|personne (?:de votre passe|que vous connaissez)|someone you (?:already )?know|(?:known|familiar) person|(?:existing|established|current) (?:relationship|bond)|your (?:partner|spouse|ex)|shared history)\b/.test(positive);
    return fresh===known?'ambiguous':fresh?'new':'known';
  }
  // Roles identify the subject, never a predicted event or a name alone.
  const roleRules=[
    ['ex', /\b(?:mon|ma|mes|votre|ton|ta|son|sa|my|your)\s+(?:ancien(?:ne)?\s+(?:partenaire|conjoint(?:e)?|compagnon|compagne)|ex(?:[- ](?:partenaire|conjoint(?:e)?|mari|femme))?|ex[- ]partner)\b/],
    ['partner', /\b(?:mon|ma|mes|notre|nos|votre|vos|ton|ta|ce|cet|cette|le|la|my|your|our|the)\s+(?:partenaire|conjoint(?:e)?|compagnon|compagne|mari|femme|epoux|epouse|petit(?:e)?[- ]ami(?:e)?|copain|copine|partner|spouse|husband|wife|boyfriend|girlfriend)\b/],
    ['friend', /\b(?:mon|ma|mes|notre|nos|votre|vos|ton|ta|ce|cet|cette|le|la|my|your|our|the)\s+(?:ami(?:e)?s?|friend)\b/],
    ['colleague', /\b(?:mon|ma|mes|notre|nos|votre|vos|ton|ta|ce|cet|cette|le|la|my|your|our|the)\s+(?:collegue?s?|coworker|colleague)\b/],
    ['manager', /\b(?:mon|ma|mes|notre|nos|votre|vos|ton|ta|ce|cet|cette|le|la|my|your|our|the)\s+(?:responsable|superieur(?:e)?|patron(?:ne)?|chef(?:fe)?|manager|boss)\b/],
    ['family', /\b(?:mon|ma|mes|notre|nos|votre|vos|ton|ta|ce|cet|cette|le|la|my|your|our|the)\s+(?:pere|mere|parent(?:s)?|famille|father|mother|parent|family)\b/],
    ['sibling', /\b(?:mon|ma|mes|notre|nos|votre|vos|ton|ta|ce|cet|cette|le|la|my|your|our|the)\s+(?:frere|soeur|brother|sister)\b/],
    ['child', /\b(?:mon|ma|mes|notre|nos|votre|vos|ton|ta|ce|cet|cette|le|la|my|your|our|the)\s+(?:enfant(?:s)?|fils|fille|child|son|daughter)\b/],
    ['crush', /\b(?:mon|ma|notre|votre|ton|ta|ce|cet|cette|le|la|my|your|our|the)\s+crush\b/]
  ];
  const grandRoles={ex:[102,112],partner:[98],friend:[96,108],colleague:[103,105,110],manager:[104,110],family:[97],sibling:[101],child:[99],crush:[109]};
  const loveRoles={ex:[61,65],partner:[66],friend:[64],crush:[63]};
  const grandIdentity=new Set([96,97,98,99,101,102,103,104,105,108,110,112]);
  const loveIdentity=new Set([61,64,65,66]);
  function analyze(question){
    let s=normalize(question);
    // Negated possibilities are not evidence of the person being asked about.
    s=s.replace(/\b(?:pas|sans|aucune?|not|no|without)\s+(?:(?:une?|de|d'|a|an|any)\s*)?(?:nouvelle?\s+(?:personne|rencontre|relation)|new\s+(?:person|encounter|relationship))\b/g,'');
    s=s.replace(/\b(?:pas|sans|not|without)\s+(?:mon|ma|mes|votre|my|your)\s+(?:ex(?:[- ]partenaire)?|partenaire|conjoint(?:e)?|collegue|ami(?:e)?|partner|friend|colleague)\b/g,'');
    // A new meeting with a known subject is a new event, not a new person.
    s=s.replace(/\b(?:nouvelle? rencontre|new encounter)\s+(?:avec|with)\s+(?=(?:mon|ma|votre|my|your)\s+(?:ex|partenaire|conjoint|collegue|ami|partner|friend|colleague)\b)/g,'avec ');
    const roles=roleRules.filter(([,rule])=>rule.test(s)).map(([role])=>role);
    const fresh=/\b(?:nouvelle? (?:personne|rencontre)|personne (?:nouvelle|inconnue)|quelqu'un (?:de nouveau|d'inconnu)|(?:une?|un(?:e)? )?inconnu(?:e)?|new (?:person|encounter)|someone new|stranger)\b|(?:personne|quelqu'un|homme|femme) que (?:je|vous) (?:ne connais(?:sez)? pas|n'ai jamais rencontre|n'avez jamais rencontre)|(?:personne|quelqu'un) (?:que|qui).{0,20}(?:pas encore|jamais) (?:rencontr|connu)|someone (?:i|you) (?:do not|don't) know/.test(s);
    const known=roles.length>0||/\b(?:personne (?:deja )?connue|quelqu'un que (?:je|vous) connais(?:sez)?|nous (?:nous )?connaissons|on se connait|histoire (?:commune|partagee)|lien (?:deja )?(?:existant|etabli|ancien)|relation (?:deja )?(?:existante|etablie|actuelle)|someone (?:i|you) (?:already )?know|shared history|revoir|retrouvailles)\b|(?:personne|quelqu'un|homme|femme) que (?:je|j'|vous)\s*(?:connais(?:sez)?|ai (?:deja )?rencontre|avez (?:deja )?rencontre)|(?:personne|quelqu'un|homme|femme) avec (?:qui|lequel|laquelle) (?:je|j'|nous).{0,50}(?:echange|parle|travaille|message|relation)|(?:je|nous).{0,25}(?:echange|parle).{0,25}(?:avec lui|avec elle|avec cette personne)/.test(s);
    const kind=fresh&&known?'mixed':fresh?'new':known?'known':'ambiguous';
    return {kind,roles};
  }
  function classify(text){
    const info=analyze(text);
    return info.kind==='mixed'?'ambiguous':info.kind==='ambiguous'?narrativeClassify(text):info.kind;
  }
  function resolve(story,question){
    const info=analyze(question);
    // Explicit question facts win. Mixed alternatives stay open rather than
    // allowing one narrative clause to erase one of the user's possibilities.
    if(info.kind!=='ambiguous')return {...info,source:'question'};
    return {kind:classify(story),roles:[],source:'story'};
  }
  function context(story,question){
    const kind=resolve(story,question).kind;
    return kind==='mixed'?'ambiguous':kind;
  }
  function filter(cards,selection){
    const {kind,roles=[]}=typeof selection==='string'?{kind:selection}:selection;
    return cards.filter(card=>{
      const love=card.oracle==='amour',id=Number(card.id);
      const known=love?loveKnownIds:knownIds,fresh=love?loveNewIds:newIds;
      if(kind==='known'&&fresh.has(id)||kind==='new'&&known.has(id))return false;
      if(roles.length){
        const allowed=roles.flatMap(role=>(love?loveRoles:grandRoles)[role]||[]);
        const identities=love?loveIdentity:grandIdentity;
        if(identities.has(id)&&!allowed.includes(id))return false;
        // A named structural role cannot be replaced by an unrelated crush.
        if((love?id===63:id===109)&&!roles.some(r=>['friend','colleague','crush'].includes(r)))return false;
      }
      return true;
    });
  }
  const api={classify,analyze,resolve,context,filter};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CR_RELATION_CONTEXT=api;
})(typeof window==='undefined'?globalThis:window);


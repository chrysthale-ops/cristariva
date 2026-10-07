import relay from '../lib/groq.cjs';
export default async function(request) {
 const result=await relay.handler({httpMethod:request.method,headers:Object.fromEntries(request.headers),body:request.method==='POST'?await request.text():''});
 return new Response(result.statusCode===204?null:result.body,{status:result.statusCode,headers:result.headers});
}
export const config={rateLimit:{windowLimit:6,windowSize:60,aggregateBy:['ip','domain']}};

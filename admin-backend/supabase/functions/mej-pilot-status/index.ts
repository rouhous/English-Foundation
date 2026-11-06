// Public, read-only pilot availability. Never accepts or creates accounts.
const origin = 'https://rouhous.github.io';
function reply(status:number,payload:unknown,requestOrigin:string|null) {
 return new Response(JSON.stringify(payload),{status,headers:{
  'content-type':'application/json; charset=utf-8',
  'cache-control':'no-store',
  ...(requestOrigin===origin?{'access-control-allow-origin':origin,'vary':'Origin'}:{})
 }});
}
Deno.serve(async request=>{
 const reqOrigin=request.headers.get('origin');
 if(reqOrigin && reqOrigin!==origin)return reply(403,{ok:false},reqOrigin);
 if(request.method==='OPTIONS'){
  if(reqOrigin!==origin)return reply(403,{ok:false},reqOrigin);
  return new Response(null,{status:204,headers:{
   'access-control-allow-origin':origin,'access-control-allow-methods':'GET, OPTIONS',
   'access-control-allow-headers':'content-type','access-control-max-age':'600','vary':'Origin'
  }});
 }
 if(request.method!=='GET')return reply(405,{ok:false},reqOrigin);
 try {
  const base=Deno.env.get('SUPABASE_URL');
  const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!base||!key)throw Error('SERVER_CONFIG');
  const response=await fetch(base+'/rest/v1/rpc/mej_pilot_seat_status',{
   method:'POST',
   headers:{'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json'},
   body:'{}',
   signal:AbortSignal.timeout(5000)
  });
  if(!response.ok)throw Error('DATABASE_UNAVAILABLE');
  const list=await response.json();
  const student=list.find((x:{role_name:string})=>x.role_name==='student');
  const teacher=list.find((x:{role_name:string})=>x.role_name==='teacher');
  if(!student||!teacher)throw Error('CAPACITY_STATUS');
  return reply(200,{
   ok:true,
   registration:{studentOpen:student.accepting===true,teacherOpen:teacher.accepting===true},
   freePilot:true,
   contactWhatsApp:'https://wa.me/96898262956'
  },reqOrigin);
 }catch(_){return reply(503,{ok:false,error:'AVAILABILITY_UNAVAILABLE'},reqOrigin)}
});

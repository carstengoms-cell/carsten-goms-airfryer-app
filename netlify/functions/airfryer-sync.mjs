import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const safeId=s=>String(s||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80);
export default async (req)=>{
  if(req.method!=='POST') return json({error:'Method not allowed'},405);
  try{
    const body=await req.json();
    const code=String(body.code||'').trim();
    if(code.length<8||code.length>200) return json({error:'Ungültiger Sync-Code'},400);
    const prefix=createHash('sha256').update(code).digest('hex');
    const store=getStore({name:'cg-airfryer-sync',consistency:'strong'});
    const incoming=Array.isArray(body.recipes)?body.recipes:[];
    const incomingDeleted=body.deleted&&typeof body.deleted==='object'?body.deleted:{};
    const listed=await store.list({prefix:`${prefix}/`});
    const serverRecipes=new Map(), serverDeleted={};
    for(const b of listed.blobs){
      if(b.key.includes('/r/')){const val=await store.get(b.key,{type:'json',consistency:'strong'});if(val?.id)serverRecipes.set(val.id,val)}
      else if(b.key.includes('/d/')){const id=b.key.split('/').pop();const v=await store.get(b.key,{type:'json',consistency:'strong'});serverDeleted[id]=Number(v?.updatedAt||0)}
    }
    for(const r of incoming){
      const id=safeId(r?.id); if(!id) continue;
      const client={...r,id,updatedAt:Number(r.updatedAt||1)};
      const srv=serverRecipes.get(id), delTs=Math.max(Number(serverDeleted[id]||0),Number(incomingDeleted[id]||0));
      if(delTs>=client.updatedAt){serverRecipes.delete(id);serverDeleted[id]=delTs;continue}
      if(!srv||client.updatedAt>=Number(srv.updatedAt||0))serverRecipes.set(id,client);
    }
    for(const [id,ts0] of Object.entries(incomingDeleted)){
      const sid=safeId(id),ts=Number(ts0||0);if(!sid||!ts)continue;
      const srv=serverRecipes.get(sid);
      if(!srv||ts>=Number(srv.updatedAt||0)){serverRecipes.delete(sid);serverDeleted[sid]=Math.max(ts,Number(serverDeleted[sid]||0))}
    }
    // Persist current merged state.
    const existingKeys=new Set(listed.blobs.map(b=>b.key));
    const desiredKeys=new Set();
    for(const [id,r] of serverRecipes){const key=`${prefix}/r/${safeId(id)}`;desiredKeys.add(key);await store.setJSON(key,r)}
    for(const [id,ts] of Object.entries(serverDeleted)){if(!ts)continue;const key=`${prefix}/d/${safeId(id)}`;desiredKeys.add(key);await store.setJSON(key,{updatedAt:Number(ts)})}
    for(const key of existingKeys)if(!desiredKeys.has(key))await store.delete(key);
    return json({recipes:[...serverRecipes.values()],deleted:serverDeleted});
  }catch(e){console.error(e);return json({error:'Synchronisation fehlgeschlagen'},500)}
};

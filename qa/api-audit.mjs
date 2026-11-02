// Run only against the disposable QA server, never a live database.
import fs from 'node:fs';
const base=process.env.QA_API_URL || 'http://localhost:4100/api';
if(!base.startsWith('http://localhost:4100/')) throw Error('Requires isolated localhost:4100 QA server');
const results=[]; const actors={};
async function request(actor,path,method='GET',body,extra={}){
 const res=await fetch(base+path,{method,headers:{...(body instanceof FormData?{}:body!==undefined?{'Content-Type':'application/json'}:{}),...(actors[actor]?{Cookie:actors[actor]}:{}),...extra},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)});
 const cookie=res.headers.get('set-cookie');if(cookie&&actor)actors[actor]=cookie.split(';')[0];
 const text=await res.text();let data;try{data=JSON.parse(text)}catch{data=text}
 return {status:res.status,data,headers:res.headers};
}
async function check(name,actor,path,method,body,expected=200,verify=()=>true){
 try{const r=await request(actor,path,method,body);const ok=(Array.isArray(expected)?expected:[expected]).includes(r.status)&&verify(r.data,r);results.push({name,status:ok?'PASS':'FAIL',http:r.status,...(!ok?{response:r.data}: {})});return r.data;}catch(e){results.push({name,status:'ERROR',error:e.message});return {};}
}
const pass='QaOnlyPassword123';
await check('Health endpoint',null,'/health');
await check('Anonymous admin denied',null,'/admin/users','GET',undefined,401);
await check('Anonymous editorial denied',null,'/editorial/posts','GET',undefined,401);
await check('Bad login rejected',null,'/auth/login','POST',{email:'admin@qa.invalid',password:'bad'},401);
await check('Admin login','admin','/auth/login','POST',{email:'admin@qa.invalid',password:pass});
await check('Admin session','admin','/auth/me','GET',undefined,200,d=>d.user.role==='admin');
for(const [name,role] of [['author','author'],['other','author'],['editor','editor'],['second','admin'],['customer','user']]){
 await check(`${name} signup`,name,'/auth/signup','POST',{fullName:`QA ${name}`,email:`${name}@qa.invalid`,password:pass},201);
 if(role!=='user'){
 const u=(await request('admin','/admin/users')).data.users.find(x=>x.email===`${name}@qa.invalid`);
 await check(`Assign ${name} role`,'admin',`/admin/users/${u.id}/role`,'PATCH',{role});
 }
}
await check('Signup cannot elevate role',null,'/auth/signup','POST',{fullName:'QA intruder',email:'intruder@qa.invalid',password:pass,role:'admin'},400);
for(const actor of ['author','editor','customer'])await check(`${actor} cannot view admin users`,actor,'/admin/users','GET',undefined,403);
await check('Customer cannot enter editorial','customer','/editorial/posts','GET',undefined,403);
{const r=await request(null,'/health','GET',undefined,{Origin:'https://untrusted.qa.invalid'});results.push({name:'Disallowed CORS origin',status:r.status===403?'PASS':'FAIL',http:r.status});}
for(const endpoint of ['stats','users','leads','leads/meta','leads/stats','alerts','plan-requests','buddy-applications','buddies','stories','hero-slides'])await check(`Admin read ${endpoint}`,'admin',`/admin/${endpoint}`);
await check('Contact requires name',null,'/leads','POST',{email:'blank@qa.invalid',consent:true},400);
await check('Contact requires consent',null,'/leads','POST',{fullName:'QA',email:'blank@qa.invalid'},400);
await check('Invalid email rejected',null,'/leads','POST',{fullName:'QA',email:'bad',consent:true},400);
await check('Reversed dates rejected',null,'/leads','POST',{fullName:'QA',email:'dates@qa.invalid',consent:true,arrive:'2026-12-03',depart:'2026-12-01'},400);
let refs=[];for(const type of ['general','trip','service','experience','partner','complaint']){
 const d=await check(`Persist ${type} enquiry`,null,'/leads','POST',{type,fullName:'QA Visitor',email:`lead-${type}@qa.invalid`,consent:true,message:'Isolated QA enquiry',service:'transport',item:'airport-transfer',experience:'sunrise-rowing-boat-assi'},201,d=>!!d.reference);refs.push(d.reference);
}
await check('Enquiries visible in admin','admin','/admin/leads','GET',undefined,200,d=>refs.every(ref=>d.leads.some(l=>l.reference===ref)));
await check('Partner assignment requires name','admin',`/admin/leads/${refs[0]}`,'PATCH',{status:'partner_assigned'},400);
await check('Complete requires financial details','admin',`/admin/leads/${refs[0]}`,'PATCH',{status:'completed'},400);
await check('Record contact','admin',`/admin/leads/${refs[0]}`,'PATCH',{status:'contacted'});
await check('Assign partner','admin',`/admin/leads/${refs[0]}`,'PATCH',{status:'partner_assigned',partnerName:'QA Supplier'});
await check('Record partner acceptance','admin',`/admin/leads/${refs[0]}`,'PATCH',{partnerResponse:'accepted'});
await check('Confirm booking','admin',`/admin/leads/${refs[0]}`,'PATCH',{status:'confirmed'});
await check('Reject excess commission','admin',`/admin/leads/${refs[0]}`,'PATCH',{status:'completed',bookingValue:100,commission:200},400);
await check('Complete booking','admin',`/admin/leads/${refs[0]}`,'PATCH',{status:'completed',bookingValue:1000,commission:100});
await check('Booking history','admin',`/admin/leads/${refs[0]}/history`,'GET',undefined,200,d=>d.history.length>=5);
await check('Reject reopening completed booking without explicit workflow','admin',`/admin/leads/${refs[0]}`,'PATCH',{status:'new'},[400,409]);
await check('Impossible calendar date rejected',null,'/leads','POST',{type:'trip',fullName:'QA Dates',email:'impossible@qa.invalid',consent:true,arrive:'2026-02-30'},400);
await check('Negative travellers rejected',null,'/leads','POST',{type:'trip',fullName:'QA Count',email:'negative@qa.invalid',consent:true,travellers:-2},400);
const repeated={type:'general',fullName:'QA Duplicate',email:'duplicate@qa.invalid',consent:true};
const one=await request(null,'/leads','POST',repeated);const two=await request(null,'/leads','POST',repeated);
results.push({name:'Duplicate submit idempotency',status:one.data.reference===two.data.reference||two.status===409?'PASS':'FAIL',http:two.status,detail:'Two identical immediate submissions'});
const alert=await check('Create travel alert','admin','/admin/alerts','POST',{title:'QA test advisory',body:'Local test only',severity:'advisory',hours:2},201);
await check('Active alert is public',null,'/public/alerts','GET',undefined,200,d=>d.alerts.some(a=>a.id===alert.id));
await check('Delete alert','admin',`/admin/alerts/${alert.id}`,'DELETE');
await check('Deleted alert removed publicly',null,'/public/alerts','GET',undefined,200,d=>!d.alerts.some(a=>a.id===alert.id));
const buddy={name:'QA Buddy',city:'QA',years:2,rating:4,tongue:'English',hue:'#123456'};
const b=await check('Create buddy','admin','/admin/buddies','POST',buddy,201);await check('Update buddy','admin',`/admin/buddies/${b.buddy?.id}`,'PUT',{...buddy,name:'QA Updated'});await check('Delete buddy','admin',`/admin/buddies/${b.buddy?.id}`,'DELETE');
const story={quote:'Synthetic QA story',name:'QA Visitor',trip:'QA trip'};const s=await check('Create story','admin','/admin/stories','POST',story,201);await check('Update story','admin',`/admin/stories/${s.story?.id}`,'PUT',{...story,quote:'QA updated'});await check('Delete story','admin',`/admin/stories/${s.story?.id}`,'DELETE');
const cats=await check('Editorial categories','author','/editorial/categories');const category=cats.categories?.[0]?.slug;
const post=await check('Author creates draft','author','/editorial/posts','POST',{title:'QA Varanasi riverside planning guide'},201);const pid=post.postId,rid=post.revisionId;
const detail=await request('author',`/editorial/posts/${pid}`);const slug=detail.data.post?.slug;
await check('Draft excluded publicly',null,`/blog/posts/${slug}`,'GET',undefined,200,d=>d.post===null);
await check('Other author cannot view draft','other',`/editorial/posts/${pid}`,'GET',undefined,404);
await check('Other author cannot edit draft','other',`/editorial/revisions/${rid}`,'PUT',{title:'Stolen'},404);
await check('Incomplete draft cannot submit','author',`/editorial/revisions/${rid}/actions`,'POST',{action:'submit'},400);
const body={title:'QA Varanasi riverside planning guide',excerpt:'A synthetic article for checking the complete editorial workflow.',body:('# QA planning guide\n\nA synthetic article used only in the isolated local test environment. Plan walks with breaks, confirm current arrangements, and respect people living and working along the river.\n\n').repeat(3),category,tags:['qa-test'],sources:[{title:'QA source',url:'https://example.com/qa-source'}],verifiedOn:new Date().toISOString().slice(0,10),coverUrl:'/img/boats.jpg',coverAlt:'Boats by the river',coverCredit:'QA fixture'};
await check('Author saves formatted draft','author',`/editorial/revisions/${rid}`,'PUT',body);
const preview=await check('Create private preview','author',`/editorial/revisions/${rid}/preview`,'POST',{});
const token=new URL(preview.url).searchParams.get('token');await check('Preview signed access',null,`/blog/preview?token=${encodeURIComponent(token)}`);
await check('Preview invalid token blocked',null,'/blog/preview?token=bad','GET',undefined,[400,403,404]);
for(const [actor,action] of [['author','submit'],['editor','start_review'],['editor','send_to_fact_check'],['editor','verify']])await check(`Workflow ${action}`,actor,`/editorial/revisions/${rid}/actions`,'POST',{action});
await check('Author cannot approve','author',`/editorial/revisions/${rid}/actions`,'POST',{action:'approve'},[403,409]);
await check('Editor cannot publish','editor',`/editorial/revisions/${rid}/actions`,'POST',{action:'publish'},[403,409]);
await check('Admin approves reviewed revision','admin',`/editorial/revisions/${rid}/actions`,'POST',{action:'approve'});
await check('Approved revision locked','author',`/editorial/revisions/${rid}`,'PUT',{title:'Unapproved change'},409);
await check('Admin publishes','admin',`/editorial/revisions/${rid}/actions`,'POST',{action:'publish'});
await check('Published post publicly readable',null,`/blog/posts/${slug}`,'GET',undefined,200,d=>d.post?.title===body.title);
await check('Blog filter by tag',null,'/blog/posts?tag=qa-test','GET',undefined,200,d=>d.posts.some(p=>p.slug===slug));
await check('Blog search',null,'/blog/posts?q=riverside','GET',undefined,200,d=>d.posts.some(p=>p.slug===slug));
await check('Published slug cannot change','author',`/editorial/posts/${pid}`,'PATCH',{slug:'changed-slug'},409);
const revision=await check('New draft of live article','author',`/editorial/posts/${pid}/revisions`,'POST',{},201);
await check('Live revision preserved while updating',null,`/blog/posts/${slug}`,'GET',undefined,200,d=>d.post?.title===body.title);
await check('Duplicate open revision blocked','author',`/editorial/posts/${pid}/revisions`,'POST',{},409);
await check('Reviewer requests changes','editor',`/editorial/revisions/${revision.revisionId}/actions`,'POST',{action:'submit'});
await check('Request changes needs reason','editor',`/editorial/revisions/${revision.revisionId}/actions`,'POST',{action:'request_changes'},400);
await check('Reviewer requests changes with reason','editor',`/editorial/revisions/${revision.revisionId}/actions`,'POST',{action:'request_changes',comment:'Add context.'});
await check('Author edits requested changes','author',`/editorial/revisions/${revision.revisionId}`,'PUT',{title:'QA revised article'});
await check('Archive published post','admin',`/editorial/posts/${pid}/archive`,'POST',{});
await check('Archived article hidden',null,`/blog/posts/${slug}`,'GET',undefined,200,d=>d.post===null);
await check('Unarchive published post','admin',`/editorial/posts/${pid}/unarchive`,'POST',{});
await check('Unarchived article visible',null,`/blog/posts/${slug}`,'GET',undefined,200,d=>!!d.post);
await check('Author profile update','author','/editorial/me/profile','PUT',{displayName:'QA Travel Author',slug:'qa-travel-author',bio:'Synthetic test author'});
await check('Public author profile',null,'/blog/authors/qa-travel-author','GET',undefined,200,d=>!!d.author);
const own=await check('Admin creates own draft','admin','/editorial/posts','POST',{title:'QA admin authored article'},201);await check('Admin fills own draft','admin',`/editorial/revisions/${own.revisionId}`,'PUT',body);
for(const action of ['submit','start_review','send_to_fact_check','verify'])await check(`Own admin ${action}`,'admin',`/editorial/revisions/${own.revisionId}/actions`,'POST',{action});
await check('Admin self approval denied','admin',`/editorial/revisions/${own.revisionId}/actions`,'POST',{action:'approve'},403);
await check('Second admin approves','second',`/editorial/revisions/${own.revisionId}/actions`,'POST',{action:'approve'});
await check('Schedule approved post','second',`/editorial/revisions/${own.revisionId}/actions`,'POST',{action:'schedule',scheduledFor:new Date(Date.now()+3600000).toISOString()});
await check('Unschedule post','second',`/editorial/revisions/${own.revisionId}/actions`,'POST',{action:'unschedule'});
await check('Reject malformed blog field without 500','author',`/editorial/revisions/${revision.revisionId}`,'PUT',{coverUrl:{invalid:true}},400);
const fake=new FormData();fake.append('image',new Blob(['not an image'],{type:'image/png'}),'fake.png');await check('Fake image rejected','author','/editorial/media','POST',fake,400);
const real=new FormData();real.append('image',new Blob([fs.readFileSync('web/public/img/boats.jpg')],{type:'image/jpeg'}),'boats.jpg');await check('Real blog image upload','author','/editorial/media','POST',real,201);
await check('Unknown analytics event rejected',null,'/events','POST',{name:'unknown'},400);
await check('Analytics valid event',null,'/events','POST',{name:'page_view',page:'/',props:{days:2}},204);
await check('Logout invalidates session','customer','/auth/logout','POST',{});
await check('Logged out customer session empty','customer','/auth/me','GET',undefined,200,d=>d.user===null);
fs.writeFileSync('qa/api-results.json',JSON.stringify({base,results,fixtures:{pid,rid,slug,previewUrl:preview.url,leadReferences:refs}},null,2));
console.log(JSON.stringify({total:results.length,pass:results.filter(r=>r.status==='PASS').length,failures:results.filter(r=>r.status!=='PASS')},null,2));

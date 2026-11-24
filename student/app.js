'use strict';
(() => {
const D = window.NAT_DATA;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = (name,cl='small') => `<svg class="icon ${cl}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const STORE = 'nat_ielts_student_';
const get = (k, fallback='') => {try {return localStorage.getItem(STORE+k) ?? fallback;}catch(e){return fallback;}};
const set = (k, val) => {try {localStorage.setItem(STORE+k,val);}catch(e){}};
const json = (s, fallback) => {try{return JSON.parse(s);}catch(e){return fallback;}};
const WORDS = (s) => (String(s||'').trim().match(/\b[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*\b/gu)||[]).length;
const short = (s,n=96) => s.length>n ? s.slice(0,n-1)+'…' : s;
const labelFor = (t) => t===1 ? 'Academic Task 1' : 'Academic Task 2';
const state = {page:'home',libraryFilter:'all',task:1,promptId:'t1-phone',result:null,history:json(get('history','[]'),[]),timer:1200,timerRunning:false,timerTick:null,timerTask:1,toastTimeout:null,saveTimeout:null,model:null,busy:false};
function navigate(page){
  if(!['home','library','practice','results','history','settings'].includes(page))page='home';
  if(state.page==='practice' && page!=='practice')saveDraftNow();
  state.page=page;
  for (const el of document.querySelectorAll('.view'))el.classList.toggle('active',el.id==='view-'+page);
  for (const el of document.querySelectorAll('.nav-link'))el.classList.toggle('active',el.dataset.go===page);
  $('breadcrumbCurrent').textContent=({home:'Tổng quan',library:'Thư viện',practice:'Phòng luyện viết',results:'Phân tích bằng AI',history:'Bài viết đã lưu',settings:'Kết nối AI'})[page];
  $('sidebar').classList.remove('open');$('navBackdrop').classList.remove('open');
  if(page==='home')renderHomeStats(); if(page==='history')renderHistory(); if(page==='results')renderResults();
  window.scrollTo({top:0,behavior:'instant'});
  if(location.hash!=='#'+page){history.replaceState(null,'','#'+page);}
}
function toast(msg,isError=false){const el=$('toast');el.textContent=msg;el.classList.toggle('err',isError);el.classList.add('show');clearTimeout(state.toastTimeout);state.toastTimeout=setTimeout(()=>el.classList.remove('show'),3600);}
function filePreviewName(d){return d.filename.split('/').at(-1).replace(/\.pdf$/,'')+'.webp';}
function docCard(d){return `<article class="doc-card" data-task="${d.task}"><div class="doc-preview"><img loading="lazy" src="assets/previews/${esc(filePreviewName(d))}" alt="Trang xem trước tài liệu ${esc(d.title)}"><span class="doc-badge">WRITING TASK ${d.task}</span></div><div class="doc-copy"><span class="doc-index">CHEATSHEET ${d.index} / ${d.task===1?'06':'05'}</span><h3>${esc(d.title)}</h3><p class="doc-subtitle">${esc(d.subtitle)}</p><div class="doc-meta"><span>${icon('file')} ${d.pages} trang kiến thức</span><span>${icon('clock')} ${d.duration}</span></div><div class="doc-actions"><button class="btn outline" data-preview="${esc(d.id)}">${icon('books')} Xem PDF</button><button class="doc-more" data-study="${esc(d.id)}">Luyện tập ${icon('arrow')}</button></div></div></article>`;}
function renderDocs(){
  $('homeDocs').innerHTML=[D.docs[0],D.docs[1],D.docs[8]].map(docCard).join('');
  const term=$('docSearch').value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const list=D.docs.filter(d=>(state.libraryFilter==='all'||String(d.task)===state.libraryFilter)&&[d.title,d.subtitle,...d.lessons].join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(term));
  $('libraryGrid').innerHTML=list.map(docCard).join('');$('docsEmpty').classList.toggle('hidden',list.length>0);
}
function openDoc(id){const d=D.docs.find(x=>x.id===id);if(!d)return;
  $('modalDocType').textContent='WRITING TASK '+d.task+' · CHEATSHEET '+d.index;
  $('modalDocTitle').textContent=d.title;
  $('pdfFrame').src=d.filename+'#toolbar=1&navpanes=0';$('pdfDownload').href=d.filename;
  $('pdfModal').showModal();
}
function setTask(t,chooseFirst=true){t=Number(t)===2?2:1;
  if(t===state.task && !chooseFirst)return;
  saveDraftNow();state.task=t;
  if(chooseFirst || !D.prompts.some(p=>p.id===state.promptId&&p.task===t))state.promptId=D.prompts.find(p=>p.task===t).id;
  resetTimer(t===1?20:40);
  renderPractice();
}
function loadPrompt(id){const p=D.prompts.find(p=>p.id===id);if(!p)return;saveDraftNow();state.task=p.task;state.promptId=id;resetTimer(p.task===1?20:40);renderPractice();}
function currentPrompt(){return D.prompts.find(p=>p.id===state.promptId)||D.prompts[0];}
function draftKey(){return 'draft_'+state.promptId;}
function saveDraftNow(){let editor=$('essayEditor');if(!editor)return; if(document.querySelector('#view-practice.active')){set(draftKey(),editor.value);$('saveState').classList.remove('saving');$('saveState').innerHTML='<span></span> Đã lưu';}}
function renderPractice(){const p=currentPrompt();
  for(const el of document.querySelectorAll('#practiceTasks button'))el.classList.toggle('active',Number(el.dataset.task)===state.task);
  $('promptSelect').innerHTML=D.prompts.filter(p=>p.task===state.task).map(p=>`<option value="${p.id}" ${p.id===state.promptId?'selected':''}>${esc(p.title)} — ${esc(p.kind)}</option>`).join('');
  $('promptKind').textContent=labelFor(p.task).toUpperCase()+' · '+p.kind.toUpperCase();$('promptTitle').textContent=p.title;$('promptQuestion').textContent=p.question;
  $('promptImageWrap').classList.toggle('hidden',!p.image);
  if(p.image){$('promptImage').src=p.image;$('promptImage').alt=p.title;}
  $('essayEditor').value=get('draft_'+p.id);
  $('essayEditor').placeholder=state.task===1?'Introduction…\n\nOverall,…\n\nBody paragraph 1…\n\nBody paragraph 2…':'Introduction…\n\nBody paragraph 1…\n\nBody paragraph 2…\n\nConclusion…';
  $('taskChecklistSubtitle').textContent=labelFor(p.task);
  const checks=state.task===1?[
   'Giới thiệu đúng đối tượng, đơn vị và thời gian','Có Overview thể hiện đặc điểm nổi bật','Chọn số liệu chính xác, không tự suy đoán','Dùng thì và từ vựng phù hợp loại biểu đồ','Viết tối thiểu 150 từ']:[
   'Trả lời đầy đủ mọi phần của đề','Lập trường/định hướng thể hiện rõ ràng','Mỗi đoạn thân bài có luận điểm phát triển','Có giải thích và ví dụ phù hợp','Viết tối thiểu 250 từ'];
  $('writingChecklist').innerHTML=checks.map((c,i)=>`<label><input type="checkbox" data-check="${i}"><span>${esc(c)}</span></label>`).join('');
  $('promptGuides').innerHTML=p.guide.map((c,i)=>`<div class="guide-item"><span class="guide-num">${i+1}</span><span>${esc(c)}</span></div>`).join('');
  $('promptVocab').innerHTML=p.vocab.map(v=>`<span>${esc(v)}</span>`).join('');
  updateWordCount();
}
function updateWordCount(){const n=WORDS($('essayEditor').value),target=state.task===1?150:250;
 $('wordCount').textContent=n;$('targetCount').textContent=target;
 $('wordStatus').textContent=n>=target?'Đủ số từ tối thiểu':'Còn '+Math.max(0,target-n)+' từ';
 $('wordStatus').classList.toggle('ok',n>=target);
}
function onWrite(){updateWordCount();$('saveState').classList.add('saving');$('saveState').innerHTML='<span></span> Đang lưu…';clearTimeout(state.saveTimeout);state.saveTimeout=setTimeout(saveDraftNow,470);}
function startTimer(){if(state.timerRunning){clearInterval(state.timerTick);state.timerRunning=false;renderTimer();return;}
 let last=Date.now();state.timerRunning=true;state.timerTick=setInterval(()=>{const now=Date.now();const diff=Math.round((now-last)/1000);last=now;state.timer=Math.max(0,state.timer-diff);renderTimer();if(state.timer===0){clearInterval(state.timerTick);state.timerRunning=false;renderTimer();toast('Hết thời gian! Hãy kiểm tra lại bài trước khi nộp.');}},1000);renderTimer();}
function resetTimer(min){clearInterval(state.timerTick);state.timerTick=null;state.timerRunning=false;state.timer=Math.round((min|| (state.task===1?20:40))*60);renderTimer();}
function renderTimer(){const m=Math.floor(state.timer/60),s=state.timer%60;$('timerDisplay').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');$('timerBtn').innerHTML=icon(state.timerRunning?'pause':'play');$('timerBtn').ariaLabel=state.timerRunning?'Tạm dừng đồng hồ':'Bắt đầu đồng hồ';document.querySelector('.timer-box').classList.toggle('running',state.timerRunning);}
function downloadText(text,filename,mime='text/plain;charset=utf-8'){const blob=new Blob([text],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function setBusy(show,text='AI đang đọc và phân tích bài viết...'){state.busy=show;$('busy').classList.toggle('hidden',!show);$('busyText').textContent=text;}
async function imageForPrompt(p){if(!p?.image)return '';try{const r=await fetch(p.image);if(!r.ok)throw Error('Cannot load chart');const blob=await r.blob();if(blob.size>1600000)return '';return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});}catch(e){return '';}}
async function aiCall(payload){
 if(!window.NAT_GEMINI_DIRECT)throw Error('Chưa tải được bộ gọi Gemini trực tiếp. Hãy tải lại trang.');
 return await window.NAT_GEMINI_DIRECT.call(payload);
}
function validateWriting(){const essay=$('essayEditor').value.trim();if(WORDS(essay)<25){toast('Hãy viết ít nhất 25 từ để AI có đủ dữ liệu phân tích.',true);return null;}return essay;}
async function gradeEssay(){if(state.busy)return;const essay=validateWriting();if(!essay)return;
 saveDraftNow();const p=currentPrompt();
 try{setBusy(true,'AI đang chấm bốn tiêu chí và phân tích từng câu...');const result=await aiCall({action:'grade',task:p.task,prompt:p.question,kind:p.kind,essay,dataContext:p.dataContext||'',chartImage:await imageForPrompt(p)});
  state.result={...result,promptId:p.id,essay,task:p.task,gradedAt:Date.now(),demo:false};
  const entry={id:Date.now(),promptId:p.id,essay,review:state.result,createdAt:Date.now()};
  state.history.unshift(entry);state.history=state.history.slice(0,12);set('history',JSON.stringify(state.history));
  navigate('results');toast('Đã nhận phản hồi phân tích chi tiết.');
 }catch(err){toast(err.message,true);}finally{setBusy(false);}
}
async function generateModel(){if(state.busy)return;const p=currentPrompt();
 try{setBusy(true,'AI đang xây dựng bài mẫu và giải thích từ vựng...');const result=await aiCall({action:'sample',task:p.task,prompt:p.question,kind:p.kind,dataContext:p.dataContext||'',chartImage:await imageForPrompt(p)});
  state.model={...result,task:p.task,promptId:p.id};state.result=null;navigate('results');toast('Đã tạo bài mẫu để tham khảo.');
 }catch(err){toast(err.message,true);}finally{setBusy(false);}
}
function headingText(task){return Number(task)===1?'Task Achievement':'Task Response';}
function rubricDetails(r){const s=r.scores||{};return [['TR',headingText(r.task),s.TR],['CC','Coherence & Cohesion',s.CC],['LR','Lexical Resource',s.LR],['GRA','Grammar Range & Accuracy',s.GRA]];}
function renderResults(){const root=$('resultsContent');
 if(!state.result && !state.model){root.innerHTML=`<div class="review-empty"><div class="large-symbol">${icon('sparkle','')}</div><h2>Mỗi bài viết đều có thể tốt hơn.</h2><p>Hãy viết bài trong Phòng luyện viết và chọn “Chấm bài bằng AI”, hoặc xem phản hồi minh họa để hiểu cách hệ thống hoạt động.</p><div><button class="btn primary" data-go="practice">${icon('pen')} Đi tới phòng luyện viết</button><button class="btn outline" id="demoGradeBtn">${icon('stars')} Xem bài chấm minh họa</button></div><p class="mini-note">Bản minh họa không kết nối AI và không chấm bài thật.</p></div>`;return;}
 if(state.model && !state.result){renderModelResult();return;}
 const r=state.result;
 const scores=r.scores||{};const criteria=rubricDetails(r);const overall=(typeof r.overall_band==='number'||typeof r.overall_band==='string')?r.overall_band:'—';
 root.innerHTML=`<div class="result-panel result-intro"><div><div class="eyebrow">${r.demo?'MINH HỌA KHÔNG PHẢI AI THẬT':'AI WRITING REVIEW'} · TASK ${r.task}</div><h2>${r.demo?'Bài phân tích minh họa':'Phản hồi cá nhân hóa của bạn'}</h2><p>${esc(r.overall_feedback_vi||'Đánh giá dựa trên đoạn văn bạn đã viết. Các điểm số chỉ mang tính tham khảo.')}</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:17px"><button class="btn outline" id="downloadReview">${icon('download')} Xuất phản hồi TXT</button><button class="btn outline" data-go="practice">${icon('edit')} Tiếp tục sửa bài</button></div></div><div class="band-orb"><strong>${esc(overall)}</strong><span>ƯỚC LƯỢNG</span></div></div>${r.demo?'<div class="demo-ribbon">Chế độ minh họa giao diện — dữ liệu mẫu, không phải kết quả chấm AI</div>':''}
 <div class="result-notice">${icon('info')} <span>Đây là ước lượng học tập, không phải điểm thi chính thức. Với bài thiếu số từ, hoặc đề không đầy đủ dữ liệu, độ tin cậy sẽ thấp hơn. Kết luận phải dựa trên toàn bài.</span></div>
 <div class="rubric-grid">${criteria.map(([id,name,val])=>`<article class="rubric-card"><small>${esc(name).toUpperCase()}</small><b>${esc(val?.band??'—')}</b><p>${esc(short(val?.summary_vi||'Chưa có nhận xét',145))}</p><div class="rubric-bar"><span style="width:${Math.min(100,Math.max(0,(Number(val?.band)||0)/9*100))}%"></span></div></article>`).join('')}</div>
 <div class="review-layout"><div><div class="result-panel"><h3>Chữa lỗi theo từng câu</h3><p class="panel-sub">Mở một câu để xem lỗi, lý do sai, cấu trúc đúng và chọn “Soi từng từ”.</p>${(r.sentences||[]).map(renderSentence).join('')||'<p>AI chưa trả về danh sách câu. Bạn có thể yêu cầu chấm lại.</p>'}</div><div class="result-panel"><h3>Phiên bản viết nâng cấp</h3><p class="panel-sub">Tham khảo cách diễn đạt; đừng học thuộc khi chưa hiểu lý do chỉnh sửa.</p><div class="example-essay"><p>${esc(r.improved_excerpt||'')}</p></div></div></div><aside><div class="result-panel"><h3>Ưu điểm của bài viết</h3><ul>${(r.strengths||[]).map(s=>`<li>${esc(s)}</li>`).join('')||'<li>Chưa có dữ liệu</li>'}</ul><h3 style="margin-top:22px">Cần ưu tiên sửa</h3><ol>${(r.priorities||[]).map(s=>`<li>${esc(s)}</li>`).join('')||'<li>Chưa có dữ liệu</li>'}</ol></div><div class="result-panel"><h3>Từ vựng nâng cấp</h3><p class="panel-sub">Dùng đúng ngữ nghĩa, không thay thế từ một cách máy móc.</p>${(r.vocabulary||[]).map(v=>`<div class="vocab-row"><strong>${esc(v.better||'')}</strong><small>${esc(v.original||'')} · ${esc(v.meaning_vi||'')}</small><p>${esc(v.usage_vi||'')}</p></div>`).join('')||'<p>Chưa có từ vựng được đề xuất.</p>'}</div><div class="result-panel"><h3>Bài tập sau khi chấm</h3><ol>${(r.next_steps||[]).map(s=>`<li>${esc(s)}</li>`).join('')||'<li>Viết lại đoạn yếu nhất.</li>'}</ol></div></aside></div>`;
}
function highlightOriginal(s,issues){let raw=String(s||'');if(!issues||!issues.length)return esc(raw);
 let marks=[];for(const issue of issues){const q=String(issue.quote||'').trim();if(!q)continue;const start=raw.toLowerCase().indexOf(q.toLowerCase());if(start>=0)marks.push({s:start,e:start+q.length,tip:issue.problem_vi||'Cần sửa'});}
 marks.sort((a,b)=>a.s-b.s);let cursor=0,out='';for(const m of marks){if(m.s<cursor)continue;out+=esc(raw.slice(cursor,m.s))+`<mark title="${esc(m.tip)}">${esc(raw.slice(m.s,m.e))}</mark>`;cursor=m.e;}return out+esc(raw.slice(cursor));}
function renderSentence(s,i){const issues=Array.isArray(s.issues)?s.issues:[];const idx=Number.isInteger(s.index)?s.index:i+1;
 return `<section class="sentence-item"><div class="sentence-head" data-toggle-sentence="${i}" role="button" tabindex="0" aria-expanded="${i===0?'true':'false'}"><strong>CÂU ${idx} ${issues.length?'· '+issues.length+' điểm cần chú ý':'· Đã phân tích'}</strong><small>${esc(short(s.overview_vi||'Mở để xem chi tiết',50))} ${icon('chevron')}</small></div><div class="sentence-body ${i===0?'':'hidden'}" id="sentenceBody${i}"><div class="sentence-text">${highlightOriginal(s.original,issues)}</div><div class="correction">${esc(s.corrected||s.original)}</div><p style="margin:12px 0 0;font-size:11px">${esc(s.overview_vi||'')}</p>${issues.map(is=>`<div class="issue"><div class="issue-title"><b>${esc(is.quote||'Điểm cần lưu ý')} → ${esc(is.correction||'')}</b><span class="issue-category">${esc(is.category||'Grammar')}${is.severity?' · '+esc(is.severity):''}</span></div><p><b>Vì sao cần sửa?</b> ${esc(is.problem_vi||'')}</p><p><b>Quy tắc:</b> ${esc(is.rule_vi||'')}</p><p><b>Giải thích:</b> ${esc(is.explanation_vi||'')}</p><p class="example"><b>Ví dụ:</b> ${esc(is.example||'')}</p></div>`).join('')}<button class="detail-button" data-deep="${i}">${icon('search')} Soi từng từ trong câu này</button><div class="deep-dive-host" id="deepHost${i}"></div></div></section>`;}
async function deepDive(index){const s=state.result?.sentences?.[index];if(!s)return;if(state.result.demo){showDemoDeep(index);return;}
 const p=D.prompts.find(x=>x.id===state.result.promptId);
 try{setBusy(true,'AI đang soi từng từ, cấu trúc và vai trò ngữ pháp...');const out=await aiCall({action:'deep_dive',task:state.result.task,prompt:p?.question||'',essay:state.result.essay,sentence:s.original,corrected:s.corrected});renderDeep(index,out);toast('Đã hoàn thành phân tích từng từ.');}catch(e){toast(e.message,true);}finally{setBusy(false);}
}
function renderDeep(index,out){const host=$('deepHost'+index);if(!host)return;host.innerHTML=`<div class="deep-dive-panel"><div class="eyebrow">WORD-BY-WORD ANALYSIS</div><h4 style="margin:9px 0 13px">Phân tích vai trò của từng từ</h4><div class="token-table-scroll"><table class="token-table"><thead><tr><th>Từ / dấu</th><th>Từ loại & vai trò</th><th>Phân tích / cách sửa</th></tr></thead><tbody>${(out.tokens||[]).map(x=>`<tr class="${x.is_error?'token-issue':''}"><td>${esc(x.token||'')}</td><td><b>${esc(x.part_of_speech||'')}</b><br>${esc(x.role_vi||'')}</td><td>${esc(x.grammar_vi||'')}${x.is_error?`<br><strong>✓ ${esc(x.suggestion||'')}</strong><br>${esc(x.why_vi||'')}`:''}</td></tr>`).join('')}</tbody></table></div><p style="font-size:12px;margin-top:14px"><b>Cấu trúc câu:</b> ${esc(out.structure_vi||'')}</p><p style="font-size:12px"><b>Ghi nhớ:</b> ${esc(out.main_lesson_vi||'')}</p><div class="correction">${esc(out.corrected||'')}</div></div>`;}
function showDemoDeep(index){if(index!==0){toast('Bài minh họa chỉ có một câu được phân tích từng từ.');return;}renderDeep(index,{corrected:'Overall, spending on cell phone services increased significantly.',structure_vi:'Overall (trạng từ liên kết) + subject (spending on...) + verb (increased) + adverb (significantly).',main_lesson_vi:'Không dùng danh từ “expenditure” với “increase significant” khi bạn đang cần trạng từ mô tả động từ.',tokens:[{token:'Overall,',part_of_speech:'Linking adverb',role_vi:'Mở câu tổng quan',grammar_vi:'Dùng để mở Overview, theo sau là dấu phẩy.',is_error:false,suggestion:'',why_vi:''},{token:'spending',part_of_speech:'Noun / gerund',role_vi:'Chủ ngữ',grammar_vi:'spending on + service = chi tiêu cho dịch vụ.',is_error:false,suggestion:'',why_vi:''},{token:'on',part_of_speech:'Preposition',role_vi:'Đi cùng spending',grammar_vi:'Collocation: spending on something.',is_error:false,suggestion:'',why_vi:''},{token:'cell',part_of_speech:'Noun modifier',role_vi:'Bổ nghĩa cho phone',grammar_vi:'cell phone services là tên nhóm dữ liệu.',is_error:false,suggestion:'',why_vi:''},{token:'phone',part_of_speech:'Noun modifier',role_vi:'Bổ nghĩa cho services',grammar_vi:'Giữ đúng tên nhóm dịch vụ.',is_error:false,suggestion:'',why_vi:''},{token:'services',part_of_speech:'Plural noun',role_vi:'Tân ngữ của on',grammar_vi:'Tên dịch vụ dùng dạng số nhiều.',is_error:false,suggestion:'',why_vi:''},{token:'increase',part_of_speech:'Verb',role_vi:'Động từ chính',grammar_vi:'Dữ liệu quá khứ nên dùng increased.',is_error:true,suggestion:'increased',why_vi:'Dùng quá khứ đơn vì giai đoạn đã kết thúc.'},{token:'significant',part_of_speech:'Adjective',role_vi:'Bổ nghĩa sai dạng',grammar_vi:'Sau động từ increased cần trạng từ significantly.',is_error:true,suggestion:'significantly',why_vi:'Adjective dùng cho danh từ; adverb dùng cho động từ.'}]});}
function demoGrade(){state.model=null;state.result={task:1,promptId:'t1-phone',essay:'Overall, spending on cell phone services increase significant. International services was the lowest over the whole period.',demo:true,gradedAt:Date.now(),overall_band:'—',overall_feedback_vi:'Đây chỉ là dữ liệu mẫu để minh họa cách máy chấm sẽ giải thích những lỗi thực tế, không phải band ước lượng của học sinh.',scores:{TR:{band:'—',summary_vi:'Thiếu độ dài và có một nhận xét khái quát sai dữ liệu.'},CC:{band:'—',summary_vi:'Chưa có đủ cấu trúc bài hoàn chỉnh.'},LR:{band:'—',summary_vi:'Dùng từ cần đúng loại từ và collocation.'},GRA:{band:'—',summary_vi:'Sai thì và sự hòa hợp chủ ngữ - động từ.'}},strengths:['Có ý định xác định xu hướng chính.','Biết dùng Overall để mở đoạn tổng quan.'],priorities:['Sửa tăng/giảm theo thì quá khứ khi dữ liệu kết thúc trong quá khứ.','Không khẳng định một nhóm thấp nhất xuyên suốt khi năm đầu không đúng.'],sentences:[{index:1,original:'Overall, spending on cell phone services increase significant.',corrected:'Overall, spending on cell phone services increased significantly.',overview_vi:'Sai thì quá khứ và nhầm tính từ với trạng từ.',issues:[{quote:'increase',category:'Grammar',problem_vi:'Dùng hiện tại đơn trong khi năm 2001–2010 đã kết thúc.',rule_vi:'Dùng past simple để mô tả xu hướng trong thời kỳ hoàn toàn quá khứ.',correction:'increased',explanation_vi:'Chủ ngữ spending vẫn là số ít; vấn đề ở đây là chọn thì.',example:'Expenditure increased significantly between 2001 and 2010.'},{quote:'significant',category:'Word form',problem_vi:'Adjective significant không trực tiếp bổ nghĩa cho động từ increased.',rule_vi:'Verb + adverb: increase significantly. Adjective + noun: a significant increase.',correction:'significantly',explanation_vi:'Hai cấu trúc đều đúng nhưng cần dùng đúng chức năng từ.',example:'There was a significant increase in expenditure.'}]},{index:2,original:'International services was the lowest over the whole period.',corrected:'International services recorded the lowest spending from 2003 onwards.',overview_vi:'Khái quát sai: năm 2001, cell phone mới thấp nhất; cần sửa phạm vi thời gian.',issues:[{quote:'was the lowest over the whole period',category:'Data accuracy',problem_vi:'Theo hình nguồn, năm 2001 international không thấp nhất.',rule_vi:'Overview chỉ được khái quát khi đúng cho phạm vi được nói.',correction:'recorded the lowest spending from 2003 onwards',explanation_vi:'Đổi mốc thời gian để mô tả đúng dữ liệu.',example:'International services had the lowest figure from 2003 onwards.'}]}],vocabulary:[{original:'increase significant',better:'increased significantly',meaning_vi:'tăng đáng kể',usage_vi:'Động từ quá khứ + trạng từ.'},{original:'the lowest over the whole period',better:'the lowest from 2003 onwards',meaning_vi:'thấp nhất từ năm 2003',usage_vi:'Gắn đúng mốc thời gian khi khẳng định thứ hạng.'}],next_steps:['Viết lại Overview bằng 2 câu chính xác.','Viết một câu chứa whereas để so sánh hai xu hướng đối lập.'],improved_excerpt:'Overall, spending on cell phone services rose sharply, whereas expenditure on national fixed-line services declined steadily. International services showed only a modest increase and had the lowest spending from 2003 onwards.'};navigate('results');}
function renderModelResult(){const r=state.model;if(!r)return;const root=$('resultsContent');root.innerHTML=`<div class="result-panel"><div class="eyebrow">ORIGINAL LEARNING REFERENCE · TASK ${r.task}</div><h2 style="margin:10px 0">Bài mẫu để học cách lập luận</h2><p>Đây là bài tham khảo do AI tạo ra, không được giám khảo chấm Band chính thức. Hãy học cách tổ chức thông tin thay vì chép nguyên văn.</p><div class="result-notice">${icon('info')} <span>${esc(r.caution_vi||'Luôn đối chiếu đề và dữ liệu gốc trước khi sử dụng ví dụ và số liệu.')}</span></div>${(r.paragraphs||[]).map(p=>`<div style="margin:20px 0;padding-bottom:18px;border-bottom:1px solid #edf0f6"><div class="eyebrow">${esc(p.label||'PARAGRAPH')}</div><p style="font:15px/1.9 Georgia,serif;color:#243e5c;margin:10px 0">${esc(p.text||'')}</p><p style="font-size:12px"><b>Vì sao đoạn này hiệu quả?</b> ${esc(p.analysis_vi||'')}</p></div>`).join('')}<button class="btn outline" id="copyModelEssay">${icon('copy')} Sao chép bài mẫu</button></div><div class="result-panel"><h3>Từ vựng / cấu trúc học từ bài mẫu</h3>${(r.vocabulary||[]).map(v=>`<div class="vocab-row"><strong>${esc(v.phrase||'')}</strong><small>${esc(v.meaning_vi||'')}</small><p>${esc(v.usage_vi||'')}</p></div>`).join('')}</div>`;}
function renderHomeStats(){let n=0;for(const p of D.prompts)if(get('draft_'+p.id).trim())n++;$('homeDraftCount').textContent=n;$('homeReviewCount').textContent=state.history.filter(h=>h.review&&!h.review.demo).length;}
function renderHistory(){const root=$('historyList');const saved= D.prompts.filter(p=>get('draft_'+p.id).trim());if(!saved.length&&!state.history.length){root.innerHTML=`<div class="review-empty"><div class="large-symbol">${icon('history')}</div><h2>Chưa có bài viết nào</h2><p>Hãy vào Phòng luyện viết để bắt đầu một bài mới. Bản nháp của bạn sẽ tự động lưu trên thiết bị này.</p><button class="btn primary" data-go="practice">Đi tới phòng luyện viết ${icon('arrow')}</button></div>`;return;}
 root.innerHTML=`<div class="result-panel"><h3>Bản nháp (${saved.length})</h3><p class="panel-sub">Nhấn Tiếp tục để mở lại bài viết.</p>${saved.map(p=>`<div class="history-card"><div><span class="eyebrow">TASK ${p.task}</span><h3>${esc(p.title)}</h3><p>${WORDS(get('draft_'+p.id))} từ · lưu ở trình duyệt</p></div><button class="btn outline" data-resume="${p.id}">${icon('edit')} Tiếp tục</button></div>`).join('')||'<p>Không có bản nháp.</p>'}</div><div class="result-panel"><h3>Phản hồi AI (${state.history.length})</h3>${state.history.map((h,i)=>{const p=D.prompts.find(p=>p.id===h.promptId);return `<div class="history-card"><div><span class="eyebrow">TASK ${h.review?.task||p?.task||1} · ${new Date(h.createdAt).toLocaleString('vi-VN')}</span><h3>${esc(p?.title||'Bài đã chấm')}</h3><p>${WORDS(h.essay||'')} từ</p></div><div class="history-tools"><span class="history-badge">Band ${esc(h.review?.overall_band??'—')}</span><button class="btn outline" data-reopen="${i}">Xem lại</button><button class="btn subtle" data-remove-review="${i}" title="Xóa phản hồi">${icon('trash')}</button></div></div>`;}).join('')||'<p>Chưa có lượt chấm.</p>'}</div>`;}
function getReviewText(){const r=state.result;if(!r)return'';return [`NAT IELTS — AI WRITING REVIEW (${r.demo?'MINH HOA':'THAM KHAO'})`,`Task: ${r.task}; band: ${r.overall_band}`,r.overall_feedback_vi||'',...rubricDetails(r).map(([id,name,val])=>`${name}: ${val?.band||'?'} — ${val?.summary_vi||''}`),...((r.sentences||[]).flatMap(s=>[`\nCau ${s.index||''}: ${s.original}`,`Sua: ${s.corrected}`,...(s.issues||[]).map(i=>`[${i.category}] ${i.quote} -> ${i.correction}\nVi sao: ${i.problem_vi}\nQuy tac: ${i.rule_vi}\nGiai thich: ${i.explanation_vi}`)])),...((r.vocabulary||[]).map(v=>`${v.original} -> ${v.better}: ${v.meaning_vi} (${v.usage_vi})`))].join('\n');}
function settingsLoad(){
 const el=$('aiModeText');
 if(el)el.textContent='Website dùng Gemini trực tiếp từ JavaScript trên GitHub Pages. Học sinh không phải nhập mã. Key trong mã nguồn là công khai.';
 const model=$('aiModelText');if(model)model.textContent=window.NAT_GEMINI_CONFIG?.model||'gemini-3-flash-preview';
 const f=$('connectionFeedback');if(f){
  f.className='connection-feedback';
  if(!window.NAT_GEMINI_DIRECT?.configured()){
   f.className='connection-feedback err';f.textContent='Chưa có API key hoặc địa chỉ API của nhà cung cấp không hợp lệ trong file config.js.';
  } else {
   f.textContent='Đã nạp cấu hình AI. Nhấn “Kiểm tra kết nối AI” để xác nhận key và model có hoạt động thật hay không.';
  }
 }
}
async function testConnection(){
 const f=$('connectionFeedback');f.className='connection-feedback';f.textContent='Đang kiểm tra kết nối thực tế tới model Gemini...';
 try{const r=await window.NAT_GEMINI_DIRECT.ping();
  f.className='connection-feedback ok';f.textContent='Kết nối thành công ('+(window.NAT_GEMINI_CONFIG?.model||'Gemini')+'). '+(r.note||'');
 }catch(e){f.className='connection-feedback err';f.textContent='Chưa thể sử dụng AI thật. '+e.message;}
}
function bindEvents(){document.addEventListener('click',async(e)=>{
 const nav=e.target.closest('[data-go]');if(nav){e.preventDefault();navigate(nav.dataset.go);return;}
 const prev=e.target.closest('[data-preview]');if(prev){openDoc(prev.dataset.preview);return;}
 const study=e.target.closest('[data-study]');if(study){const p=D.prompts.find(p=>p.doc===study.dataset.study);if(p){loadPrompt(p.id);navigate('practice');}else{openDoc(study.dataset.study);}return;}
 const toggle=e.target.closest('[data-toggle-sentence]');if(toggle){const id=Number(toggle.dataset.toggleSentence),target=$('sentenceBody'+id);if(target){target.classList.toggle('hidden');toggle.setAttribute('aria-expanded',String(!target.classList.contains('hidden')));}return;}
 const deep=e.target.closest('[data-deep]');if(deep){deepDive(Number(deep.dataset.deep));return;}
 const resume=e.target.closest('[data-resume]');if(resume){loadPrompt(resume.dataset.resume);navigate('practice');return;}
 const reopen=e.target.closest('[data-reopen]');if(reopen){const entry=state.history[Number(reopen.dataset.reopen)];if(entry){state.model=null;state.result=entry.review;navigate('results');}return;}
 const rem=e.target.closest('[data-remove-review]');if(rem){if(!confirm('Xóa bản phản hồi đã lưu trên thiết bị này?'))return;state.history.splice(Number(rem.dataset.removeReview),1);set('history',JSON.stringify(state.history));renderHistory();return;}
 if(e.target.closest('#demoGradeBtn')){demoGrade();return;}
 if(e.target.closest('#downloadReview')){downloadText(getReviewText(),'NAT_IELTS_Feedback.txt');return;}
 if(e.target.closest('#copyModelEssay')){const t=(state.model?.paragraphs||[]).map(p=>p.text).join('\n\n');try{await navigator.clipboard.writeText(t);toast('Đã sao chép bài mẫu.');}catch(e){toast('Không thể sao chép trong trình duyệt này.',true);}return;}
 });
 for(const b of document.querySelectorAll('#libraryTasks button'))b.addEventListener('click',()=>{state.libraryFilter=b.dataset.filter;document.querySelectorAll('#libraryTasks button').forEach(x=>x.classList.toggle('active',x===b));renderDocs();});
 $('docSearch').addEventListener('input',renderDocs);
 for(const b of document.querySelectorAll('#practiceTasks button'))b.addEventListener('click',()=>setTask(Number(b.dataset.task)));
 $('promptSelect').addEventListener('change',e=>loadPrompt(e.target.value));
 $('promptShuffle').addEventListener('click',()=>{const opts=D.prompts.filter(p=>p.task===state.task&&p.id!==state.promptId);loadPrompt(opts[Math.floor(Math.random()*opts.length)].id);});
 $('essayEditor').addEventListener('input',onWrite);window.addEventListener('beforeunload',saveDraftNow);
 $('gradeFromEditor').addEventListener('click',gradeEssay);$('generateModel').addEventListener('click',generateModel);
 $('clearDraft').addEventListener('click',()=>{if(confirm('Xóa nội dung bài hiện tại? Hành động này không thể hoàn tác.')){$('essayEditor').value='';onWrite();saveDraftNow();toast('Đã xóa bản nháp hiện tại.');}});
 $('downloadDraft').addEventListener('click',()=>downloadText(`${currentPrompt().question}\n\n${$('essayEditor').value}`,`NAT_IELTS_${state.promptId}.txt`));
 $('timerBtn').addEventListener('click',startTimer);$('timerReset').addEventListener('click',()=>resetTimer(state.task===1?20:40));
 $('openRelatedDoc').addEventListener('click',()=>openDoc(currentPrompt().doc));
 $('expandChart').addEventListener('click',()=>{const p=currentPrompt();if(!p.image)return;$('largeImage').src=p.image;$('largeImage').alt=p.title;$('imageModal').showModal();});
 $('pdfClose').addEventListener('click',()=>{$('pdfModal').close();$('pdfFrame').src='about:blank';});$('imageClose').addEventListener('click',()=>$('imageModal').close());
 $('pdfModal').addEventListener('close',()=>$('pdfFrame').src='about:blank');
 $('homeT1').addEventListener('click',()=>{setTask(1);navigate('practice');});$('homeT2').addEventListener('click',()=>{setTask(2);navigate('practice');});
 $('testConnection').addEventListener('click',testConnection);
 $('menuBtn').addEventListener('click',()=>{$('sidebar').classList.toggle('open');$('navBackdrop').classList.toggle('open');});
 $('navBackdrop').addEventListener('click',()=>{$('sidebar').classList.remove('open');$('navBackdrop').classList.remove('open');});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('sidebar').classList.remove('open');$('navBackdrop').classList.remove('open');}const t=e.target;if((e.key==='Enter'||e.key===' ')&&t?.hasAttribute?.('data-toggle-sentence')){e.preventDefault();t.click();}});
 window.addEventListener('hashchange',()=>{const p=location.hash.slice(1);if(p&&p!==state.page)navigate(p);});
}
function init(){bindEvents();renderDocs();renderPractice();resetTimer(20);settingsLoad();renderHomeStats();const hash=location.hash.slice(1);navigate(hash||'home');}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

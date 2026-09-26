


window.adminInterval=null; 
window.isEditModalOpen=false;
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzzkX0F9MSPYNYbq-3QPkWmoJ5hP1kgfZtFdBITloPbRI8UOXqK9eiiGG3J7CucxpDT/exec";
const accessCodesDB = {"ZIAD-MASTER-2024":{level:"*",maxUses:9999,type:"master"}};

// === نظام تحميل الليفلات عند الطلب فقط + كاش الصوت ===
window.levelsData = window.levelsData || {};
var levelsData = window.levelsData;

// تحميل ملف ليفل واحد بس لما يحتاجه
function loadLevelScript(levelNum){
  return new Promise((resolve, reject)=>{
    if(window.levelsData && window.levelsData[levelNum]){
      resolve();
      return;
    }
    // شوف لو الاسكريبت متحمل قبل كده
    const existing = document.querySelector(`script[data-level="${levelNum}"]`);
    if(existing){
      // لو موجود بس لسه بيحمل
      existing.addEventListener('load', ()=>resolve());
      existing.addEventListener('error', ()=>reject());
      return;
    }
    const script = document.createElement('script');
    script.src = `level/level${levelNum}.js?v=${Date.now()}`;
    script.dataset.level = levelNum;
    script.onload = ()=>{
      window.levelsData = window.levelsData || {};
      levelsData = window.levelsData;
      resolve();
    };
    script.onerror = (e)=>{
      console.error('فشل تحميل ليفل', levelNum, e);
      reject(e);
    };
    document.body.appendChild(script);
  });
}


function showAudioLoading(text="جاري تجهيز الصوت..."){
  let overlay = document.getElementById('audio-preload-overlay');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.id = 'audio-preload-overlay';
    overlay.innerHTML = `
      <div class="orange-loader-card">
        <div class="orange-pulse-wrapper">
          <div class="orange-pulse-ring"></div>
          <div class="orange-pulse-ring delay-1"></div>
          <div class="orange-pulse-ring delay-2"></div>
          <div class="orange-icon">🎧</div>
        </div>
        <div id="preload-text" class="orange-title">${text}</div>
        <div id="preload-sub" class="orange-sub">يتم حفظ الصوت على جهازك للمرة القادمة</div>
        
        <div class="orange-progress-wrap">
          <div class="orange-progress-track">
            <div id="preload-bar" class="orange-progress-bar"></div>
          </div>
          <div class="orange-progress-info">
            <span id="preload-percent">0%</span>
            <span id="preload-files" class="orange-files"></span>
          </div>
        </div>

        <div class="orange-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  } else {
    const t = overlay.querySelector('#preload-text');
    if(t) t.innerText = text;
  }
  overlay.style.display='flex';
  // reset bar
  const bar = overlay.querySelector('#preload-bar');
  if(bar) bar.style.width='0%';
  return overlay;
}
function updatePreloadProgress(pct, fileName=""){
  const bar = document.getElementById('preload-bar');
  const perc = document.getElementById('preload-percent');
  const files = document.getElementById('preload-files');
  const pctInt = Math.round(pct*100);
  if(bar) bar.style.width = pctInt+'%';
  if(perc) perc.innerText = pctInt+'%';
  if(files){
    if(fileName){
      // اظهر اسم الملف باختصار
      const short = fileName.replace('audio/','').replace('✔ ','');
      files.innerText = fileName.includes('✔') ? '✓ '+short : short;
    }
  }
}
function hideAudioLoading(){
  const overlay = document.getElementById('audio-preload-overlay');
  if(!overlay) return;
  overlay.classList.add('orange-hide');
  setTimeout(()=>{
    overlay.style.display='none';
    overlay.classList.remove('orange-hide');
  }, 400);
}


// تحميل وتخزين الصوتيات لليفل المختار فقط
async function preloadAudiosForLevel(levelNum){
  const lvl = window.levelsData[levelNum];
  if(!lvl || !lvl.listening) return true;

  // اجمع كل ملفات الصوت الفريدة لليفل ده بس
  const uniqueSrc = new Set();
  if(lvl.listening.A) lvl.listening.A.forEach(q=>{ if(q.audioSrc) uniqueSrc.add(q.audioSrc); });
  if(lvl.listening.B) lvl.listening.B.forEach(q=>{ if(q.audioSrc) uniqueSrc.add(q.audioSrc); });

  const srcList = Array.from(uniqueSrc);
  if(srcList.length===0) return true;

  showAudioLoading(`جاري تجهيز Level ${levelNum}...`);

  // حاول تستخدم Cache API لو موجود
  let cache = null;
  try{
    if('caches' in window){
      cache = await caches.open('audio-levels-v1');
    }
  }catch(e){ console.log('Cache API not available', e); }

  let loaded = 0;
  const total = srcList.length;

  for(let src of srcList){
    try{
      updatePreloadProgress(loaded/total, src);
      
      // لو متخزن قبل كده في الكاش، تخطى
      if(cache){
        const match = await cache.match(src);
        if(match){
          loaded++;
          updatePreloadProgress(loaded/total, '✔ '+src);
          continue;
        }
      } else {
        // fallback: شوف localStorage flag
        const flag = localStorage.getItem('audio_cached_'+levelNum+'_'+src);
        if(flag){
          loaded++;
          updatePreloadProgress(loaded/total, '✔ '+src);
          continue;
        }
      }

      // حمل الملف كامل
      const response = await fetch(src, {cache: 'no-cache'});
      if(!response.ok) throw new Error('فشل تحميل '+src);

      if(cache){
        await cache.put(src, response.clone());
      } else {
        // لو مفيش Cache API، احفظ علامة بس
        localStorage.setItem('audio_cached_'+levelNum+'_'+src, '1');
      }

      // اتأكد انه يشتغل فعلا بتحميله في audio مؤقت
      await new Promise((res, rej)=>{
        const tmpAudio = new Audio();
        tmpAudio.preload = 'auto';
        tmpAudio.src = src;
        tmpAudio.oncanplaythrough = ()=>res();
        tmpAudio.onerror = ()=>res(); // حتى لو فيه مشكلة كمل
        setTimeout(()=>res(), 5000); // fallback 5 ثواني
      });

      loaded++;
      updatePreloadProgress(loaded/total, '✔ '+src);

    }catch(err){
      console.error('خطأ في تحميل', src, err);
      // لو ملف واحد فشل، كمل الباقي واظهر رسالة
      loaded++;
      updatePreloadProgress(loaded/total, '⚠ '+src);
    }
  }

  updatePreloadProgress(1, 'جاهز ✓');
  localStorage.setItem('audio_cached_level_'+levelNum, '1');
  localStorage.setItem('audio_cached_level_'+levelNum+'_time', Date.now().toString());

  await new Promise(r=>setTimeout(r, 600));
  return true;
}

// تحقق لو الليفل متحمل صوته قبل كده
async function isLevelAudioCached(levelNum){
  try{
    const flag = localStorage.getItem('audio_cached_level_'+levelNum);
    if(!flag) return false;
    if('caches' in window){
      const cache = await caches.open('audio-levels-v1');
      const lvl = window.levelsData[levelNum];
      if(!lvl || !lvl.listening) return false;
      const srcSet = new Set();
      if(lvl.listening.A) lvl.listening.A.forEach(q=> srcSet.add(q.audioSrc));
      if(lvl.listening.B) lvl.listening.B.forEach(q=> srcSet.add(q.audioSrc));
      for(let src of srcSet){
        const m = await cache.match(src);
        if(!m) return false;
      }
      return true;
    }
    return true;
  }catch(e){ return false; }
}



window.addEventListener('DOMContentLoaded', ()=>{
  function addEye(inputId){
    const inp = document.getElementById(inputId);
    if(!inp || document.getElementById(inputId+'-eye')) return;
    const wrapper = document.createElement('div');
    wrapper.style.position='relative';
    inp.parentNode.insertBefore(wrapper, inp);
    wrapper.appendChild(inp);
    inp.style.paddingLeft='40px';
    const eye = document.createElement('span');
    eye.id = inputId+'-eye';
    eye.innerText='👁';
    eye.style.cssText='position:absolute;left:10px;top:50%;transform:translateY(-50%);cursor:pointer;user-select:none;font-size:18px';
    eye.onclick = ()=>togglePass(inputId);
    wrapper.appendChild(eye);
  }
  addEye('reg-pass');
  addEye('log-pass');
  const regTab = document.getElementById('tab-reg');
  if(regTab) regTab.innerText = 'تسجيل جديد';
  const logTab = document.getElementById('tab-log');
  if(logTab) logTab.innerText = 'دخول';
});


let currentIP="", currentPhone="", pendingLevel="", currentQuestions=[], currentIndex=0, userAnswers=[], studentName="", selectedLevel="18", selectedForm="A", currentSkill="reading", timerInterval=null, timeLeft=17, isTimerRunning=false;
const audio=document.getElementById('audio');
fetch('https://api.ipify.org?format=json').then(r=>r.json()).then(d=>{ currentIP=d.ip; const a=document.getElementById('ip-display'); if(a) a.innerText='IP: '+d.ip; const b=document.getElementById('ip-display2'); if(b) b.innerText='IP: '+d.ip; const c=document.getElementById('modal-ip'); if(c) c.innerText='IP: '+d.ip; }).catch(()=>{ currentIP='local-'+Math.random().toString(36).substr(2,6); });
function getDB(){ try{ return JSON.parse(localStorage.getItem('students_db_final')||'{}'); }catch(e){ return {}; } }
function saveDB(db){ localStorage.setItem('students_db_final', JSON.stringify(db)); }
async function verifyPasswordFromSheet(){ if(!currentPhone) return; try{ const res = await fetchWithRetry(GOOGLE_SHEET_URL+"?phone="+encodeURIComponent(currentPhone)+"&t="+Date.now(), 8000, 1); const students = await res.json(); if(Array.isArray(students) && students.length>0){ const sheetData = students[0]; const sheetPass = (sheetData.password||'').toString().trim(); const db = getDB(); const local = db[currentPhone]; if(!local) return; let needRender = false; if(sheetPass && local.password !== sheetPass){ localStorage.removeItem('currentSessionPhone'); currentPhone = ""; local.password = sheetPass; saveDB(db); document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active-screen')); const loginScreen = document.getElementById('login-screen'); if(loginScreen) loginScreen.classList.add('active-screen'); switchAuth('log'); const err = document.getElementById('log-error'); if(err){ err.innerText = '⚠ تم تغيير الباسورد من الإدارة - سجل دخول بالباسورد الجديد'; err.style.display = 'block'; } return; } if(sheetData.levels){ const sheetLevels = sheetData.levels.toString().split(',').map(l=>l.toString().replace(/[^0-9]/g,'').trim()).filter(l=>l); if(!local.unlockedLevels) local.unlockedLevels={}; sheetLevels.forEach(lvl=>{ if(!local.unlockedLevels[lvl]){ local.unlockedLevels[lvl]={code:sheetData.code||'FROM-SHEET',ip:'sheet',at:new Date().toISOString()}; needRender = true; } }); } if(sheetData.pendingCodes){ try{ let pcs=JSON.parse(sheetData.pendingCodes); if(typeof pcs==='object' && Object.keys(pcs).length>0){ if(!local.pendingCodes) local.pendingCodes={}; let hasNew = false; for(let c in pcs){ if(!local.pendingCodes[c]){ hasNew=true; break; } } if(hasNew || Object.keys(local.pendingCodes).length===0){ local.pendingCodes = pcs; } } }catch(e){} } if(needRender){ saveDB(db); const levelsScreen = document.getElementById('levels-screen'); if(levelsScreen && levelsScreen.classList.contains('active-screen')){ renderLevels(); } } else { saveDB(db); } } }catch(e){} }
setInterval(verifyPasswordFromSheet, 10000);
window.addEventListener('focus', verifyPasswordFromSheet);
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) verifyPasswordFromSheet(); });
function switchScreen(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active-screen')); const el=document.getElementById(id); if(el) el.classList.add('active-screen'); }
function switchAuth(t){ document.getElementById('tab-reg').classList.toggle('active', t==='reg'); document.getElementById('tab-log').classList.toggle('active', t==='log'); document.getElementById('reg-box').style.display=t==='reg'?'block':'none'; document.getElementById('log-box').style.display=t==='log'?'block':'none'; }
function backToLogin(){ localStorage.removeItem('currentSessionPhone'); currentPhone=""; switchScreen('login-screen'); switchAuth('log'); const lp = document.getElementById('log-phone'); if(lp) setTimeout(()=>lp.focus(), 100); }
function adminBackToLogin(){ localStorage.removeItem('currentSessionPhone'); currentPhone=""; switchScreen('login-screen'); switchAuth('log'); const lp = document.getElementById('log-phone'); if(lp) setTimeout(()=>lp.focus(), 100); }
function goToLevelsFromSkill(){ renderLevels(); setExamStudentName(); switchScreen('levels-screen'); }
function keepZeroPhone(p){ if(!p) return ''; let d = p.toString().trim().replace(/[^0-9]/g,''); if(!d) return ''; if(d.length===10 && d.startsWith('1')) d='0'+d; return d; }
function searchKey(p){ if(!p) return ''; return p.toString().trim().replace(/[^0-9]/g,'').replace(/^0+/, ''); }
function findStudentByPhone(db, inputPhone){ let key = searchKey(inputPhone); if(!key) return null; if(db[key]) return {st: db[key], key: key}; for(let k in db){ if(searchKey(k)===key || searchKey(db[k].phone||'')===key) return {st: db[k], key: k}; } return null; }
function togglePass(id){ const inp=document.getElementById(id); const eye=document.getElementById(id+'-eye'); if(!inp) return; if(inp.type==='password'){ inp.type='text'; if(eye) eye.innerText='🙈'; } else { inp.type='password'; if(eye) eye.innerText='👁'; } }
function generateRandomCode(prefix){ if(!prefix) prefix='ZIAD-'; const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let r=''; for(let i=0;i<7;i++) r+=c.charAt(Math.floor(Math.random()*c.length)); return prefix+r; }
function setExamStudentName(){ const db=getDB(); const st=db[currentPhone]; const name=st?st.name:document.getElementById('welcome-name')?.innerText||'طالب'; const el1=document.getElementById('display-student-name'); if(el1) el1.innerText=name; const el2=document.getElementById('result-student-name'); if(el2) el2.innerText=name; studentName=name; }
function syncToSheet(data){ try{ fetch(GOOGLE_SHEET_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(data)}); }catch(e){} }
async function fetchWithRetry(url, timeout=20000, retries=2){ for(let attempt=1; attempt<=retries+1; attempt++){ try{ const controller = new AbortController(); const timer = setTimeout(()=>controller.abort(), timeout); const res = await fetch(url, {cache:'no-store', signal: controller.signal}); clearTimeout(timer); if(!res.ok) throw new Error('HTTP '+res.status); return res; }catch(e){ if(attempt>retries) throw e; await new Promise(r=>setTimeout(r, 800*attempt)); } } }
async function autoLoadSheet(force=false){ try{ const res=await fetchWithRetry(GOOGLE_SHEET_URL+"?t="+Date.now(), 20000, 2); const students=await res.json(); if(!Array.isArray(students)) throw new Error('رد غريب'); const db=getDB(); students.forEach(s=>{ let disp=keepZeroPhone(s.phone||''); let phone=searchKey(s.phone||''); if(!phone) return; if(!db[phone]){ db[phone]={name:(s.name||'').toString().trim()||disp,phone:disp,password:(s.password||'').toString().trim()||'123',id:(s.id||'').toString().trim()||'Z-'+Math.floor(1000+Math.random()*9000),ip:(s.ip||'').toString().trim()||'',created:new Date().toISOString(),unlockedLevels:{},pendingCodes:{}}; } if(s.name) db[phone].name=(s.name||'').toString().trim(); if(s.password) db[phone].password=(s.password||'').toString().trim(); if(s.id) db[phone].id=(s.id||'').toString().trim(); if(s.isBlocked!==undefined){ db[phone].isBlocked = (s.isBlocked===true || s.isBlocked==='TRUE' || s.isBlocked==='true'); } if(s.levels){ if(!db[phone].unlockedLevels) db[phone].unlockedLevels={}; s.levels.toString().split(',').forEach(l=>{ let n=l.toString().replace(/[^0-9]/g,''); if(n) db[phone].unlockedLevels[n]={code:s.code||'FROM-SHEET',ip:'sheet',at:new Date().toISOString()}; }); } if(s.pendingCodes){ try{ let pcs=JSON.parse(s.pendingCodes); if(typeof pcs==='object'&&Object.keys(pcs).length>0) db[phone].pendingCodes=pcs; }catch(e){} } if(!db[phone].pendingCodes || Object.keys(db[phone].pendingCodes).length===0){ const nc=generateRandomCode(); db[phone].pendingCodes={}; db[phone].pendingCodes[nc]={level:'*',generic:true,used:false,createdAt:new Date().toISOString()}; } }); saveDB(db); renderAdmin(); if(currentPhone && db[currentPhone]){ renderLevels(); } }catch(e){} }
window.addEventListener('load', ()=>{ setTimeout(()=>autoLoadSheet(false), 800); });

function registerPhone(){
  const nameEl=document.getElementById('reg-name');
  const phoneEl=document.getElementById('reg-phone');
  const passEl=document.getElementById('reg-pass');
  const err=document.getElementById('reg-error');
  const suc=document.getElementById('reg-success');
  const btn=document.querySelector('#reg-box .btn');
  const oldText=btn?btn.innerText:'تسجيل';
  err.style.display='none'; suc.style.display='none';
  try{
    const name=nameEl.value.trim();
    const rawPhone=phoneEl.value.trim();
    const phoneDisplay=keepZeroPhone(rawPhone);
    const phone=searchKey(rawPhone);
    const pass=passEl.value.trim();
    let blockedIPs = JSON.parse(localStorage.getItem('blocked_ips')||'[]');
    if(currentIP && blockedIPs.includes(currentIP)){
      err.innerText='🚫 جهازك محظور نهائياً من التسجيل - تواصل مع الإدارة'; err.style.display='block'; return;
    }
    if(!name||!phone||!pass){ err.innerText='❌ اكمل البيانات'; err.style.display='block'; return; }
    const db=getDB();
    if(findStudentByPhone(db, phone)){ err.innerText='❌ الرقم موجود من قبل'; err.style.display='block'; return; }
    if(btn){ btn.innerText='⏳...'; btn.disabled=true; }
    const id='Z-'+Math.floor(1000+Math.random()*9000);
    const newCode=generateRandomCode('ZIAD-');
    const pending={}; pending[newCode]={level:'*',generic:true,used:false,createdAt:new Date().toISOString()};
    db[phone]={name:name,phone:phoneDisplay,password:pass,id:id,ip:currentIP||'',created:new Date().toISOString(),unlockedLevels:{},pendingCodes:pending};
    saveDB(db);
    suc.innerText='✅ تم التسجيل بنجاح - يمكنك تسجيل الدخول الآن'; suc.style.display='block';
    syncToSheet({name:name,phone:phoneDisplay,password:pass,id:id,ip:currentIP||'',levels:'',code:newCode,pendingCodes:JSON.stringify(pending),created:new Date().toLocaleString('ar-EG')});
    setTimeout(()=>switchAuth('log'), 1200);
    renderAdmin();
  }finally{
    if(btn){ setTimeout(()=>{ btn.innerText=oldText; btn.disabled=false; }, 500); }
  }
}

function quickAddStudent(){ const name=document.getElementById('quick-name').value.trim(); const rawPhone=document.getElementById('quick-phone').value.trim(); const phoneDisplay=keepZeroPhone(rawPhone); const phoneKey=searchKey(rawPhone); const pass=document.getElementById('quick-pass').value.trim(); const msg=document.getElementById('quick-msg'); if(!name||!phoneKey||!pass){ msg.innerHTML='<span style="color:#d93025">❌ اكمل البيانات</span>'; return; } const db=getDB(); if(findStudentByPhone(db, phoneKey)){ msg.innerHTML='<span style="color:#d93025">❌ الرقم موجود</span>'; return; } const id='Z-'+Math.floor(1000+Math.random()*9000); const newCode=generateRandomCode('ZIAD-'); const pending={}; pending[newCode]={level:'*',generic:true,used:false,createdAt:new Date().toISOString()}; db[phoneKey]={name:name,phone:phoneDisplay,password:pass,id:id,ip:'',created:new Date().toISOString(),unlockedLevels:{},pendingCodes:pending}; saveDB(db); syncToSheet({name:name,phone:phoneDisplay,password:pass,id:id,ip:'',levels:'',code:newCode,pendingCodes:JSON.stringify(pending),created:new Date().toLocaleString('ar-EG')}); msg.innerHTML='<span style="color:#137333">✅ اتضاف - ID: '+id+'</span>'; document.getElementById('quick-name').value=''; document.getElementById('quick-phone').value=''; document.getElementById('quick-pass').value=''; renderAdmin(); }
async function loginPhone(){ 
  const rawPhoneInput = document.getElementById('log-phone').value.trim();
  const phone=searchKey(rawPhoneInput); 
  const pass=document.getElementById('log-pass').value.trim(); 
  const err=document.getElementById('log-error'); 
  const suc=document.getElementById('log-success'); 
  const btn=document.getElementById('login-btn'); 
  err.style.display='none'; suc.style.display='none'; 
  let blockedIPs = JSON.parse(localStorage.getItem('blocked_ips')||'[]');
  if(currentIP && blockedIPs.includes(currentIP)){
    err.innerText='🚫 جهازك محظور نهائياً - تواصل مع الإدارة'; err.style.display='block'; return;
  }
  if(phone){
    let dbCheck=getDB(); 
    let foundCheck=findStudentByPhone(dbCheck, phone); 
    if(foundCheck && foundCheck.st && foundCheck.st.isBlocked){
      err.innerText='🚫 هذا الحساب محظور نهائياً - تواصل مع الإدارة'; 
      err.style.display='block'; 
      return; 
    }
  }
  if(!phone||!pass){ err.innerText='❌ اكمل البيانات'; err.style.display='block'; return; } 
  let db=getDB(); 
  let found=findStudentByPhone(db, phone); 
  let st=found?found.st:null; 
  let actualPhoneKey=found?found.key:phone; 
  if(st && st.isBlocked){ 
    err.innerText='🚫 هذا الحساب محظور نهائياً - تواصل مع الإدارة'; 
    err.style.display='block'; 
    return; 
  }
  if(st && (st.password||'').toString().trim()===pass){  currentPhone=actualPhoneKey||phone; if(currentIP) st.ip=currentIP; saveDB(db); document.getElementById('welcome-name').innerText=st.name; document.getElementById('welcome-phone').innerText=st.phone; document.getElementById('welcome-id').innerText=st.id; setExamStudentName(); switchScreen('levels-screen'); renderLevels(); setTimeout(verifyPasswordFromSheet, 2000); return; } if(st && (st.password||'').toString().trim()!==pass){ err.innerText='❌ الباسورد غلط'; err.style.display='block'; return; } const oldT=btn.innerText; btn.innerText='⏳ جاري التحميل...'; btn.disabled=true; suc.style.display='none'; try{ const res=await fetchWithRetry(GOOGLE_SHEET_URL+"?phone="+encodeURIComponent(phone)+"&t="+Date.now(), 20000, 2); const students=await res.json(); if(Array.isArray(students) && students.length>0){ const fs=students[0]; let pwd=(fs.password||'').toString().trim(); if(pwd!==pass){ err.innerText='❌ الباسورد غلط'; err.style.display='block'; btn.innerText=oldT; btn.disabled=false; return; } if(!db[phone]){ db[phone]={name:(fs.name||'').toString().trim()||phone,phone:phone,password:pwd,id:(fs.id||'').toString().trim()||'Z-'+Math.floor(1000+Math.random()*9000),ip:currentIP||'',created:new Date().toISOString(),unlockedLevels:{},pendingCodes:{}}; } else { db[phone].password=pwd; if(fs.name) db[phone].name=fs.name; if(fs.id) db[phone].id=fs.id; } if(fs.levels){ if(!db[phone].unlockedLevels) db[phone].unlockedLevels={}; fs.levels.toString().split(',').forEach(l=>{ let n=l.toString().replace(/[^0-9]/g,''); if(n) db[phone].unlockedLevels[n]={code:fs.code||'FROM-SHEET',ip:'sheet',at:new Date().toISOString()}; }); } if(fs.pendingCodes){ try{ let pcs=JSON.parse(fs.pendingCodes); if(typeof pcs==='object'&&Object.keys(pcs).length>0) db[phone].pendingCodes=pcs; }catch(e){} } if(!db[phone].pendingCodes||Object.keys(db[phone].pendingCodes).length===0){ const nc=generateRandomCode(); db[phone].pendingCodes={}; db[phone].pendingCodes[nc]={level:'*',generic:true,used:false,createdAt:new Date().toISOString()}; } if(currentIP) db[phone].ip=currentIP; saveDB(db); st=db[phone]; currentPhone=actualPhoneKey||phone; document.getElementById('welcome-name').innerText=st.name; document.getElementById('welcome-phone').innerText=st.phone; document.getElementById('welcome-id').innerText=st.id; setExamStudentName(); switchScreen('levels-screen'); renderLevels(); btn.innerText=oldT; btn.disabled=false; } else { err.innerText='❌ الرقم غير موجود، اعمل تسجيل جديد'; err.style.display='block'; btn.innerText=oldT; btn.disabled=false; } }catch(e){ db=getDB(); let found2=findStudentByPhone(db, phone); st=found2?found2.st:null; if(st && (st.password||'').toString().trim()===pass){ currentPhone=actualPhoneKey||phone; document.getElementById('welcome-name').innerText=st.name; document.getElementById('welcome-phone').innerText=st.phone; document.getElementById('welcome-id').innerText=st.id; setExamStudentName(); switchScreen('levels-screen'); renderLevels(); btn.innerText=oldT; btn.disabled=false; } else { err.innerText='❌ الرقم غير موجود'; err.style.display='block'; btn.innerText=oldT; btn.disabled=false; } } }
function renderLevels(){ 
  try{
    const grid=document.getElementById('levels-grid'); 
    if(!grid) return; 
    grid.innerHTML=''; 
    const db=getDB(); 
    const st=db[currentPhone]; 
    if(!st){ grid.innerHTML='<div style="color:#d93025">سجل دخول أولا</div>'; return; } 

    // === رجعنا الشكل الأصلي - قائمة الليفلات المتاحة ===
    const availableLevels = window.AVAILABLE_LEVELS || [16,17,18,19];
    
    for(let i=1;i<=23;i++){ 
      const card=document.createElement('div'); 
      const isAvailable = availableLevels.includes(i);
      const isUnlocked=st.unlockedLevels&&st.unlockedLevels[i]; 
      card.className='level-card '+(isAvailable?(isUnlocked?'unlocked':'available'):'locked'); 
      let icon='🔒',status='غير متاح'; 
      if(isAvailable){icon=isUnlocked?'🔓':'🔐'; status=isUnlocked?'مفتوح ✅':'مقفل - بكود';} 
      card.innerHTML=`<span style="font-size:20px">${icon}</span><div class="level-num">Level ${i}</div><div style="font-size:10px;margin-top:4px">${status}</div>`; 
      if(isAvailable){ card.onclick=()=>onLevelClick(i,isUnlocked); } 
      grid.appendChild(card); 
    }
  }catch(e){
    console.error("renderLevels error", e);
    const grid=document.getElementById('levels-grid');
    if(grid) grid.innerHTML='<div style="color:#d93025">خطأ: '+e.message+'</div>';
  }
}
async function onLevelClick(levelNum, alreadyUnlocked){ 
  selectedLevel=String(levelNum); 
  // حمل الليفل ده بس لو مش متحمل
  try{
    showAudioLoading('جاري تحميل بيانات Level '+levelNum+'...');
    await loadLevelScript(levelNum);
    hideAudioLoading();
  }catch(e){
    hideAudioLoading();
    alert('فشل تحميل بيانات Level '+levelNum+' تأكد من وجود الملف level/level'+levelNum+'.js');
    return;
  }

  if(alreadyUnlocked){ document.getElementById('opened-level-num').innerText=selectedLevel;
    // === التعديل الديناميك لعدد الأسئلة ===
    try{
      const rCount = levelsData[selectedLevel]?.reading?.length || 0;
      const readingOpt = document.querySelector('#type-select option[value="reading"]');
      if(readingOpt){
        readingOpt.innerText = rCount ? `Reading & Grammar (${rCount} سؤال)` : `Reading & Grammar`;
      }
      const lA = levelsData[selectedLevel]?.listening?.A?.length || 0;
      const lB = levelsData[selectedLevel]?.listening?.B?.length || 0;
      const lCount = lA + lB;
      const listeningOpt = document.querySelector('#type-select option[value="listening"]');
      if(listeningOpt){
        listeningOpt.innerText = lCount ? `Listening Test (${lCount} سؤال)` : `Listening Test`;
      }
    }catch(e){ console.log(e); } switchScreen('skill-screen'); setTimeout(()=>{ try{ toggleForm(); }catch(e){} }, 80); return; } pendingLevel=selectedLevel; document.getElementById('modal-level-num').innerText=selectedLevel; document.getElementById('modal-title-code').innerText=`🔒 Level ${selectedLevel} مقفول`; document.getElementById('modal-code-input').value=''; document.getElementById('modal-error').style.display='none'; document.getElementById('modal-success').style.display='none'; 
  let waBtn = document.getElementById('wa-contact-btn');
  if(!waBtn){
    waBtn = document.createElement('a');
    waBtn.id='wa-contact-btn';
    waBtn.target='_blank';
    waBtn.style.cssText='display:block;margin-top:10px;padding:10px;background:#25d366;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:13px;text-align:center';
    document.querySelector('#code-modal .modal-content').appendChild(waBtn);
  }
  waBtn.href='https://wa.me/201273552486?text=عايز%20كود%20Level%20'+selectedLevel;
  waBtn.innerText='💬 تواصل مع الأدمن للحصول على كود Level '+selectedLevel;
  document.getElementById('code-modal').classList.add('active'); 
  setTimeout(()=>{ const inp = document.getElementById('modal-code-input'); if(inp){ inp.focus(); inp.select(); } }, 150); }
function closeCodeModal(){ document.getElementById('code-modal').classList.remove('active'); }
function unlockLevel(){
  const codeVal=document.getElementById('modal-code-input').value.trim().toUpperCase();
  const err=document.getElementById('modal-error'); const succ=document.getElementById('modal-success'); const btn=document.getElementById('modal-unlock-btn');
  err.style.display='none'; succ.style.display='none';
  if(!codeVal){ err.innerText='❌ ادخل الكود'; err.style.display='block'; return; }
  const db=getDB(); const st=db[currentPhone]; if(!st){ err.innerText='❌ سجل دخول أولا'; err.style.display='block'; return; }
  let found=null, key=null;
  const cleanInput = codeVal.toUpperCase().trim().replace(/[^A-Z0-9-]/g,'');
  if(st.pendingCodes){ for(let c in st.pendingCodes){ const cleanStored = c.toUpperCase().trim().replace(/[^A-Z0-9-]/g,''); if(cleanStored===cleanInput || c.toUpperCase()===codeVal){ found=st.pendingCodes[c]; key=c; break; } } }
  if(found){
    btn.disabled=true; btn.innerText='⏳ جاري الفتح...';
    if(!st.unlockedLevels) st.unlockedLevels={};
    st.unlockedLevels[pendingLevel]={code:codeVal,ip:currentIP,at:new Date().toISOString()};
    const wasGangona = key && key.startsWith('GANGONA-');
    delete st.pendingCodes[key];
    const prefix = wasGangona ? 'GANGONA-' : 'ZIAD-';
    const nc=generateRandomCode(prefix);
    st.pendingCodes={};
    st.pendingCodes[nc]={level:'*',generic:true,used:false,createdAt:new Date().toISOString(),autoGenerated:true,prefix:prefix};
    saveDB(db);
    const allLevels = Object.keys(st.unlockedLevels).join(',');
    syncToSheet({name:st.name,phone:st.phone,password:st.password,id:st.id,ip:st.ip,levels:allLevels,code:codeVal,pendingCodes:JSON.stringify(st.pendingCodes),created:new Date().toLocaleString('ar-EG')});
    succ.innerText='✅ تم فتح المستوى '+pendingLevel; succ.style.display='block';
    setTimeout(()=>{ closeCodeModal(); renderLevels(); document.getElementById('opened-level-num').innerText=pendingLevel; switchScreen('skill-screen'); btn.disabled=false; btn.innerText='فتح 🔓'; },1000);
    return;
  }
  const cd=accessCodesDB[codeVal]; if(cd&&cd.type==='master'){ btn.disabled=true; btn.innerText='⏳...'; if(!st.unlockedLevels) st.unlockedLevels={}; st.unlockedLevels[pendingLevel]={code:codeVal,ip:currentIP,at:new Date().toISOString()}; saveDB(db); syncToSheet({name:st.name,phone:st.phone,password:st.password,id:st.id,ip:currentIP,levels:pendingLevel,code:codeVal,pendingCodes:JSON.stringify(st.pendingCodes||{}),created:new Date().toLocaleString('ar-EG')}); succ.innerText='✅ تم فتح المستوى '+pendingLevel; succ.style.display='block'; setTimeout(()=>{ closeCodeModal(); renderLevels(); document.getElementById('opened-level-num').innerText=pendingLevel; switchScreen('skill-screen'); btn.disabled=false; btn.innerText='فتح 🔓'; },800); return; }
  err.innerText='❌ كود غلط - اطلب كودك الخاص من الأدمن'; err.style.display='block';
}
let adminInterval=null; let autoSpeed=2000;
function toggleAutoSpeed(){ autoSpeed = autoSpeed===2000 ? 1000 : 2000; const btn=document.getElementById('auto-toggle'); if(btn) btn.innerText= autoSpeed===1000 ? '🐢 بطيء 2ث' : '⏩ سريع جدا 1ث'; if(adminInterval) clearInterval(adminInterval); adminInterval=setInterval(()=>{ const s=document.getElementById('admin-screen'); if(s&&s.classList.contains('active-screen')) pullFromSheetSilent(); }, autoSpeed); const statusEl=document.getElementById('auto-status'); if(statusEl) statusEl.innerText='● live '+ (autoSpeed/1000) +'s'; }
function openAdminLogin(){ const modal=document.getElementById('admin-login-modal'); if(modal){ modal.classList.add('active'); const inp=document.getElementById('admin-pass-input'); if(inp){ inp.value=''; setTimeout(()=>inp.focus(),100); } } }
function closeAdminLogin(){ const m=document.getElementById('admin-login-modal'); if(m) m.classList.remove('active'); }
function loginAdmin(){ const pass=document.getElementById('admin-pass-input').value.trim(); const err=document.getElementById('admin-login-error'); if(pass==='••••'||pass==='010'||pass==='admin'||pass==='ZIAD-MASTER-2024'){ closeAdminLogin(); switchScreen('admin-screen'); setTimeout(()=>pullFromSheet(),300); if(window.adminInterval) clearInterval(window.adminInterval); window.adminInterval=setInterval(()=>{ const s=document.getElementById('admin-screen'); if(s&&s.classList.contains('active-screen')&&!window.isEditModalOpen) pullFromSheetSilent(); },5000); } else { err.innerText='❌ باسورد غلط'; err.style.display='block'; } }
async function pullFromSheet(){ const statusEl=document.getElementById('auto-status'); if(statusEl){ statusEl.innerText='● جاري السحب...'; statusEl.style.color='#fbbc04'; } try{ const res=await fetchWithRetry(GOOGLE_SHEET_URL+"?t="+Date.now(),20000,2); const students=await res.json(); if(!Array.isArray(students)) throw new Error('invalid'); const db=getDB(); students.forEach(s=>{ let disp=keepZeroPhone(s.phone||''); let phone=searchKey(s.phone||''); if(!phone) return; if(!db[phone]){ db[phone]={name:(s.name||'').toString().trim()||phone,phone:phone,password:(s.password||'').toString().trim()||'123',id:(s.id||'').toString().trim()||'Z-'+Math.floor(1000+Math.random()*9000),ip:(s.ip||'').toString().trim()||'',created:new Date().toISOString(),unlockedLevels:{},pendingCodes:{},isBlocked:false}; } if(s.name) db[phone].name=s.name; if(s.password) db[phone].password=s.password; if(s.isBlocked!==undefined){ db[phone].isBlocked = (s.isBlocked===true || s.isBlocked==='TRUE' || s.isBlocked==='true'); if(db[phone].isBlocked && s.ip){ let bIPs=JSON.parse(localStorage.getItem('blocked_ips')||'[]'); if(!bIPs.includes(s.ip)) bIPs.push(s.ip); localStorage.setItem('blocked_ips', JSON.stringify(bIPs)); } } if(s.levels){ if(!db[phone].unlockedLevels) db[phone].unlockedLevels={}; s.levels.toString().split(',').forEach(l=>{ let n=l.toString().replace(/[^0-9]/g,''); if(n) db[phone].unlockedLevels[n]={code:s.code||'FROM-SHEET',ip:'sheet',at:new Date().toISOString()}; }); } if(s.pendingCodes){ try{ let pcs=JSON.parse(s.pendingCodes); if(typeof pcs==='object'&&Object.keys(pcs).length>0) db[phone].pendingCodes=pcs; }catch(e){} } if(!db[phone].pendingCodes||Object.keys(db[phone].pendingCodes).length===0){ const nc=generateRandomCode(); db[phone].pendingCodes={}; db[phone].pendingCodes[nc]={level:'*',generic:true,used:false,createdAt:new Date().toISOString()}; syncToSheet({name:db[phone].name,phone:db[phone].phone,password:db[phone].password,id:db[phone].id,ip:db[phone].ip,levels:Object.keys(db[phone].unlockedLevels||{}).join(','),code:nc,pendingCodes:JSON.stringify(db[phone].pendingCodes),created:new Date().toLocaleString('ar-EG')}); } }); saveDB(db); renderAdmin(); if(statusEl){ statusEl.innerText='● live - '+new Date().toLocaleTimeString('ar-EG')+' - '+Object.keys(db).length+' طالب'; statusEl.style.color='#34a853'; } }catch(e){ if(statusEl){ statusEl.innerText='● خطأ: '+e.message; statusEl.style.color='#d93025'; } } }
async function pullFromSheetSilent(){ 
  if(window.isEditModalOpen) return;
  try{ 
    const res=await fetchWithRetry(GOOGLE_SHEET_URL+"?t="+Date.now(),20000,1); 
    const students=await res.json(); 
    if(!Array.isArray(students)) return; 
    const db=getDB(); 
    let changed=false;
    students.forEach(s=>{ 
      let phone=searchKey(s.phone||''); 
      if(!phone) return; 
      if(!db[phone]){ 
        db[phone]={name:(s.name||'').toString().trim()||phone,phone:keepZeroPhone(s.phone||''),password:(s.password||'').toString().trim()||'123',id:(s.id||'').toString().trim()||'Z-'+Math.floor(1000+Math.random()*9000),ip:(s.ip||'').toString().trim()||'',created:new Date().toISOString(),unlockedLevels:{},pendingCodes:{},isBlocked:false}; 
        changed=true;
      } 
      if(s.levels){ 
        if(!db[phone].unlockedLevels) db[phone].unlockedLevels={}; 
        s.levels.toString().split(',').forEach(l=>{ 
          let n=l.toString().replace(/[^0-9]/g,''); 
          if(n && !db[phone].unlockedLevels[n]) {
            db[phone].unlockedLevels[n]={code:s.code||'FROM-SHEET',ip:'sheet',at:new Date().toISOString()};
            changed=true;
          }
        }); 
      } 
      if(s.pendingCodes){ 
        try{ 
          let pcs=JSON.parse(s.pendingCodes); 
          if(typeof pcs==='object'&&Object.keys(pcs).length>0){
            const localCodes=db[phone].pendingCodes||{};
            const localLatest=Object.values(localCodes).reduce((max,v)=>{ const t=v.createdAt?new Date(v.createdAt).getTime():0; return Math.max(max,t); },0);
            const now=Date.now();
            if(now - localLatest < 15000){
            } else {
              const sheetKeys=Object.keys(pcs).sort().join(',');
              const localKeys=Object.keys(localCodes).sort().join(',');
              if(sheetKeys!==localKeys){
                db[phone].pendingCodes=pcs;
                changed=true;
              }
            }
          }
        }catch(e){
        } 
      } 
    }); 
    if(changed){
      saveDB(db); 
      renderAdmin(); 
      if(window.isEditModalOpen){
        const oldPhone=document.getElementById('edit-phone-old').value;
        if(oldPhone){
          renderPendingCodesList(oldPhone);
          renderLevelsInEdit(oldPhone);
        }
      }
    }
  }catch(e){} 
}
window.blockStudent = function(dbKey){ 
  try{ 
    const db = JSON.parse(localStorage.getItem('students_db_final')||'{}'); 
    let st = db[dbKey]; 
    let realKey = dbKey; 
    if(!st){ for(let k in db){ if(k===dbKey){ st=db[k]; realKey=k; break; } } } 
    if(!st){ alert('مش لاقي الطالب'); return; } 
    st.isBlocked = !st.isBlocked; 
    let blockedIPs = JSON.parse(localStorage.getItem('blocked_ips')||'[]');
    if(st.isBlocked){
      if(st.ip && !blockedIPs.includes(st.ip)) blockedIPs.push(st.ip);
    } else {
      if(st.ip) blockedIPs = blockedIPs.filter(ip=>ip!==st.ip);
    }
    localStorage.setItem('blocked_ips', JSON.stringify(blockedIPs));
    db[realKey]=st; 
    localStorage.setItem('students_db_final', JSON.stringify(db)); 
    syncToSheet({
      name: st.name,
      phone: st.phone,
      password: st.password,
      id: st.id,
      ip: st.ip,
      levels: Object.keys(st.unlockedLevels||{}).join(','),
      code: Object.keys(st.pendingCodes||{})[0]||'',
      pendingCodes: JSON.stringify(st.pendingCodes||{}),
      isBlocked: st.isBlocked ? 'TRUE' : 'FALSE',
      blockedIP: st.isBlocked ? st.ip : '',
      created: new Date().toLocaleString('ar-EG')
    });
    renderAdmin();
    alert(st.isBlocked ? '🚫 اتبلك '+st.name+' واتسجل في الشيت - هيتحظر من أي جهاز' : '✅ اتفك الحظر عن '+st.name+' من كل الأجهزة'); 
  }catch(e){ alert('خطأ: '+e.message); } 
};
function getLatestCodeInfo(st){
  if(!st||!st.pendingCodes||Object.keys(st.pendingCodes).length===0) return {code:'', info:null};
  let entries=Object.entries(st.pendingCodes);
  // ✅ فلتر: هات الاكواد الغير مستخدمة فقط
  let unused = entries.filter(e=> !e[1].used );
  if(unused.length>0) entries = unused;
  entries.sort((a,b)=>{
    const ta=a[1].createdAt?new Date(a[1].createdAt).getTime():0;
    const tb=b[1].createdAt?new Date(b[1].createdAt).getTime():0;
    return tb-ta;
  });
  return {code: entries[0][0], info: entries[0][1], all: entries};
}
function renderAdmin(){ const db=getDB(); const tbody=document.getElementById('admin-tbody'); if(!tbody) return; const search=(document.getElementById('admin-search')?.value||'').toLowerCase(); tbody.innerHTML=''; let total=0,today=0,unlocked=0; const todayStr=new Date().toDateString(); const entries=Object.entries(db); if(entries.length===0){ tbody.innerHTML='<tr><td colspan="8" style="text-align:center">لا يوجد طلاب</td></tr>'; return; } for(let i=0;i<entries.length;i++){ const dbKey=entries[i][0]; const st=entries[i][1]; if(!st||!st.phone) continue; if(search && !( (st.name+' '+st.phone+' '+st.id+' '+dbKey).toLowerCase().includes(search) )) continue; total++; try{ if(new Date(st.created).toDateString()===todayStr) today++; }catch(e){} if(st.unlockedLevels&&Object.keys(st.unlockedLevels).length>0) unlocked++; let levelsStr=Object.keys(st.unlockedLevels||{}).map(function(l){return 'L'+l;}).join(', ')||'—'; let latestInfo=getLatestCodeInfo(st); let firstCode=latestInfo.code||''; const isBlocked=!!st.isBlocked; let displayPhone=st.phone; const clean=displayPhone.toString().replace(/[^0-9]/g,''); if(clean.length===10 && clean.startsWith('1')) displayPhone='0'+clean; const blockLabel=isBlocked?'فك بلوك':'بلوك'; const blockColor=isBlocked?'#0f9d58':'#d93025'; const codeShow=isBlocked?'مبلك 🚫':(firstCode||'—'); const codeColor=isBlocked?'#d93025':'#1a73e8'; const rowBg=isBlocked?' style="background:#fce8e6"' : ''; tbody.innerHTML += '<tr'+rowBg+'><td>'+st.name+(isBlocked?' 🚫':'')+'</td><td dir="ltr">'+displayPhone+'</td><td dir="ltr">'+st.password+'</td><td>'+st.id+'</td><td dir="ltr">'+(st.ip||'').substring(0,16)+'</td><td>'+levelsStr+'</td><td dir="ltr"><div style="font-weight:bold;color:'+codeColor+'">'+codeShow+'</div></td><td><div style="display:flex;flex-direction:column;gap:4px"><button class="btn btn-small" style="background:#1a73e8" onclick="openEditModal(\''+dbKey+'\')">تعديل</button><button class="btn btn-small" style="background:'+blockColor+';color:#fff" onclick="blockStudent(\''+dbKey+'\')"> '+blockLabel+' </button></div></td></tr>'; } const el1=document.getElementById('stat-total'); if(el1) el1.innerText=total; const el2=document.getElementById('stat-today'); if(el2) el2.innerText=today; const el3=document.getElementById('stat-unlocked'); if(el3) el3.innerText=unlocked; }
function openEditModal(dbKey){ 
  if(window.adminInterval){ clearInterval(window.adminInterval); window.adminInterval=null; }
  window.isEditModalOpen=true;
  const db=getDB(); let st=db[dbKey]; let actualKey=dbKey; if(!st){ const cleaned=searchKey(dbKey); st=db[cleaned]; actualKey=cleaned; } if(!st){alert('مش موجود'); return;} 
  document.getElementById('edit-phone-old').value=actualKey; 
  document.getElementById('edit-name').value=st.name||''; 
  document.getElementById('edit-phone').value=st.phone||''; 
  document.getElementById('edit-pass').value=st.password||''; 
  document.getElementById('edit-id').value=st.id||''; 
  document.getElementById('edit-ip').value=st.ip||''; 
  document.getElementById('edit-levels').value=Object.keys(st.unlockedLevels||{}).join(','); 
  document.getElementById('edit-msg').style.display='none'; 
  try{
    const av=document.getElementById('edit-avatar'); const hn=document.getElementById('edit-header-name'); const hp=document.getElementById('edit-header-phone');
    if(av) av.innerText=(st.name||'Z').trim().charAt(0).toUpperCase();
    if(hn) hn.innerText=st.name||'تعديل الطالب';
    if(hp) hp.innerText=st.phone||actualKey;
  }catch(e){}
  document.getElementById('edit-modal').classList.add('active'); 
  renderPendingCodesList(actualKey); 
  renderLevelsInEdit(actualKey); 
}
function closeEditModal(){ 
  document.getElementById('edit-modal').classList.remove('active'); 
  window.isEditModalOpen=false;
  if(!window.adminInterval){
    window.adminInterval=setInterval(()=>{ const s=document.getElementById('admin-screen'); if(s&&s.classList.contains('active-screen')&&!window.isEditModalOpen) pullFromSheetSilent(); },5000);
  }
}
function applyLevelsFromInput(){
  const raw = document.getElementById('edit-levels').value.trim();
  const phoneRaw = document.getElementById('edit-phone-old').value.trim();
  const db=getDB();
  let st=null, phone=searchKey(phoneRaw)||phoneRaw, actualKey=phone;
  if(db[phone]){ st=db[phone]; actualKey=phone; }
  else { const found=findStudentByPhone(db, phoneRaw); if(found){ st=found.st; actualKey=found.key; } }
  if(!st){ alert('الطالب مش موجود'); return; }
  const levels = raw ? raw.split(',').map(s=>s.trim().replace(/[^0-9]/g,'')).filter(s=>s) : [];
  if(!st.unlockedLevels) st.unlockedLevels={};
  const newObj={};
  levels.forEach(l=>{ newObj[l]= st.unlockedLevels[l] || {code:'MANUAL-INPUT',ip:'admin',at:new Date().toISOString()}; });
  st.unlockedLevels=newObj;
  actualKey = searchKey(st.phone) || actualKey;
  db[actualKey]=st;
  saveDB(db);
  syncToSheet({
    name:st.name,
    phone:st.phone,
    password:st.password,
    id:st.id,
    ip:st.ip,
    levels: levels.join(','),
    code:'MANUAL-INPUT',
    pendingCodes:JSON.stringify(st.pendingCodes||{}),
    forceLevels: 'TRUE',
    isBlocked: st.isBlocked ? 'TRUE' : 'FALSE',
    blockedIP: st.ip||'',
    created:new Date().toLocaleString('ar-EG')
  });
  renderLevelsInEdit(actualKey);
  renderAdmin();
  const msg=document.getElementById('edit-msg');
  if(msg){ 
    msg.innerText='✅ تم تطبيق الليفلات: '+(levels.join(',')||'تم مسح الكل'); 
    msg.style.display='block';
  }
}
function saveEditStudent(){ 
  try{
  const oldKeyRaw=document.getElementById('edit-phone-old').value.trim(); 
  const oldKey=searchKey(oldKeyRaw)||oldKeyRaw; 
  const newName=document.getElementById('edit-name').value.trim(); 
  const newPhoneRaw=document.getElementById('edit-phone').value.trim(); 
  const newPhoneDisplay=keepZeroPhone(newPhoneRaw); 
  const newPhoneKey=searchKey(newPhoneRaw); 
  const newPass=document.getElementById('edit-pass').value.trim(); 
  const newIP=document.getElementById('edit-ip').value.trim(); 
  const newLevels=document.getElementById('edit-levels').value.trim(); 
  if(!newName||!newPhoneKey||!newPass){alert('اكمل البيانات'); return;} 
  const db=getDB(); 
  let st=db[oldKey]; 
  let actualOldKey=oldKey;
  if(!st){ const found=findStudentByPhone(db, oldKey); if(found){ st=found.st; actualOldKey=found.key; } } 
  if(!st){alert('الطالب مش موجود'); return;} 
  if(newPhoneKey!==actualOldKey){ if(db[newPhoneKey]){alert('الرقم الجديد موجود بالفعل'); return;} delete db[actualOldKey]; } 
  st.name=newName; 
  st.phone=newPhoneDisplay; 
  st.password=newPass; 
  st.ip=newIP; 
  if(!st.pendingCodes||Object.keys(st.pendingCodes).length===0){
    const nc=generateRandomCode('ZIAD-');
    st.pendingCodes={};
    st.pendingCodes[nc]={level:'*',generic:true,used:false,createdAt:new Date().toISOString()};
  }
  if(newLevels){ 
    if(!st.unlockedLevels) st.unlockedLevels={}; 
    const keep=st.unlockedLevels; 
    st.unlockedLevels={}; 
    newLevels.split(',').forEach(l=>{ let num=l.replace(/[^0-9]/g,'').trim(); if(num) st.unlockedLevels[num]=keep[num]||{code:'ADMIN-EDIT',ip:'admin',at:new Date().toISOString()}; }); 
  } 
  db[newPhoneKey]=st; 
  saveDB(db); 
  document.getElementById('edit-phone-old').value=newPhoneKey;
  syncToSheet({name:st.name,phone:st.phone,password:st.password,id:st.id,ip:st.ip,levels:newLevels,code:'ADMIN-EDIT',pendingCodes:JSON.stringify(st.pendingCodes||{}),isBlocked: st.isBlocked ? 'TRUE' : 'FALSE', blockedIP: st.isBlocked ? st.ip : '', created:new Date().toLocaleString('ar-EG')}); 
  renderAdmin(); 
  renderPendingCodesList(newPhoneKey);
  renderLevelsInEdit(newPhoneKey);
  const msg=document.getElementById('edit-msg'); 
  msg.innerText='✅ تم الحفظ - سيتم الخروج'; 
  msg.style.display='block'; 
  setTimeout(()=>{ closeEditModal(); }, 900);
} catch(err){
  console.error(err);
  const msg=document.getElementById('edit-msg');
  if(msg){ msg.innerText='❌ خطأ: '+err.message; msg.style.display='block'; }
}
}
function resetStudentIP(){ document.getElementById('edit-ip').value=''; }
function generateCodeForStudent(phone, prefix){ 
  if(!prefix) prefix='ZIAD-'; 
  if(!phone) phone=document.getElementById('edit-phone-old').value.trim(); 
  if(!phone){alert('حدد الطالب'); return;} 
  const db=getDB(); 
  let st=null, actualKey=null;
  let dbKey=searchKey(phone)||phone;
  if(db[dbKey]){ st=db[dbKey]; actualKey=dbKey; }
  else {
    const found=findStudentByPhone(db, phone);
    if(found){ st=found.st; actualKey=found.key; }
  }
  if(!st){ 
    for(let k in db){ if(k.includes(dbKey) || dbKey.includes(k) || db[k].id===phone){ st=db[k]; actualKey=k; break; } }
  }
  if(!st){alert('الطالب مش موجود: '+phone); return;} 
  actualKey = actualKey || searchKey(st.phone) || dbKey;
  const newCode=generateRandomCode(prefix); 
  st.pendingCodes={}; 
  st.pendingCodes[newCode]={level:'*',generic:true,used:false,createdAt:new Date().toISOString(),prefix:prefix}; 
  db[actualKey]=st; 
  saveDB(db); 
  if(window.adminInterval){ clearInterval(window.adminInterval); window.adminInterval=null; }
  syncToSheet({name:st.name,phone:st.phone,password:st.password,id:st.id,ip:st.ip,levels:Object.keys(st.unlockedLevels||{}).join(','),code:newCode,pendingCodes:JSON.stringify(st.pendingCodes),isBlocked: st.isBlocked ? 'TRUE' : 'FALSE', blockedIP: st.ip||'', created:new Date().toLocaleString('ar-EG')}); 
  renderAdmin(); 
  renderPendingCodesList(actualKey); 
  renderLevelsInEdit(actualKey);
  try{navigator.clipboard.writeText(newCode);}catch(e){} 
  const msg=document.getElementById('edit-msg');
  if(msg){ msg.innerText='✅ تم توليد كود جديد: '+newCode+' (تم نسخه)'; msg.style.display='block'; }
  setTimeout(()=>{
    if(!window.adminInterval && !window.isEditModalOpen){
      window.adminInterval=setInterval(()=>{ const s=document.getElementById('admin-screen'); if(s&&s.classList.contains('active-screen')&&!window.isEditModalOpen) pullFromSheetSilent(); },5000);
    }
  },6000);
  return newCode; 
}
function adminOpenLevelDirect(phone,level){ 
  if(!phone){alert('حدد الطالب'); return;} 
  const dbKey=searchKey(phone)||phone; 
  const db=getDB(); 
  let st=db[dbKey]; 
  if(!st){ const found=findStudentByPhone(db, phone); if(found) st=found.st; } 
  if(!st){alert('مش موجود'); return;} 
  if(!level){level=prompt('رقم الليفل اللي عايز تفتحه:','19'); if(!level) return;} 
  level=level.toString().replace(/[^0-9]/g,'').trim(); if(!level) return; 
  if(!st.unlockedLevels) st.unlockedLevels={}; 
  st.unlockedLevels[level]={code:'ADMIN-DIRECT',ip:'admin',at:new Date().toISOString()}; 
  const actualKey=searchKey(st.phone)||dbKey; 
  db[actualKey]=st; 
  saveDB(db); 
  syncToSheet({name:st.name,phone:st.phone,password:st.password,id:st.id,ip:st.ip,levels:Object.keys(st.unlockedLevels).join(','),code:'ADMIN-DIRECT',pendingCodes:JSON.stringify(st.pendingCodes||{}),created:new Date().toLocaleString('ar-EG')}); 
  renderAdmin(); 
  renderLevelsInEdit(actualKey);
  const inp=document.getElementById('edit-levels'); 
  if(inp){ inp.value=Object.keys(st.unlockedLevels).join(','); } 
}
function adminRemoveLevelDirect(phone,level){
  if(!phone){alert('حدد الطالب'); return;}
  const db=getDB();
  let st=null, dbKey=searchKey(phone)||phone, actualKey=dbKey;
  if(db[dbKey]){ st=db[dbKey]; actualKey=dbKey; }
  else {
    const found=findStudentByPhone(db, phone);
    if(found){ st=found.st; actualKey=found.key; }
  }
  if(!st){alert('مش موجود: '+phone); return;}
  if(!level){level=prompt('رقم الليفل اللي عايز تلغيه:',''); if(!level) return;}
  level=level.toString().replace(/[^0-9]/g,'').trim(); if(!level) return;
  if(!st.unlockedLevels || !st.unlockedLevels[level]){ alert('الليفل '+level+' مش مفتوح'); return; }
  if(!confirm('هتلغي الليفل '+level+' للطالب '+st.name+' ؟')) return;
  delete st.unlockedLevels[level];
  actualKey = searchKey(st.phone) || actualKey;
  db[actualKey]=st;
  saveDB(db);
  const remainingLevels = Object.keys(st.unlockedLevels).join(',');
  syncToSheet({
    name:st.name,
    phone:st.phone,
    password:st.password,
    id:st.id,
    ip:st.ip,
    levels: remainingLevels,
    code:'ADMIN-REMOVE-'+level,
    pendingCodes:JSON.stringify(st.pendingCodes||{}),
    forceLevels: 'TRUE',
    isBlocked: st.isBlocked ? 'TRUE' : 'FALSE',
    blockedIP: st.ip||'',
    created:new Date().toLocaleString('ar-EG')
  });
  renderAdmin();
  renderLevelsInEdit(actualKey);
  const inp=document.getElementById('edit-levels');
  if(inp){ inp.value=remainingLevels; }
}
function renderLevelsInEdit(phone){
  const db=getDB();
  let st=db[phone];
  if(!st) st=db[searchKey(phone)];
  const container = document.getElementById('edit-levels-chips');
  if(!container) return;
  if(!st||!st.unlockedLevels||Object.keys(st.unlockedLevels).length===0){
    container.innerHTML='<div style="color:#5f6368;font-size:13px;padding:8px">مفيش ليفلات مفتوحة</div>';
    return;
  }
  let h='';
  Object.keys(st.unlockedLevels).sort((a,b)=>parseInt(a)-parseInt(b)).forEach(l=>{
    h+=`<span style="display:inline-flex;align-items:center;gap:6px;background:#e8f0fe;border:1px solid #1a73e8;color:#1a73e8;padding:6px 10px;border-radius:20px;margin:4px;font-size:13px;font-weight:bold">L${l} <button onclick="adminRemoveLevelDirect('${phone}','${l}')" style="background:#d93025;color:#fff;border:none;width:20px;height:20px;border-radius:50%;cursor:pointer;font-size:12px;line-height:1">✕</button></span>`;
  });
  container.innerHTML=h;
}
function renderPendingCodesList(phone){ 
  const db=getDB(); 
  let st=db[phone]; 
  if(!st) st=db[searchKey(phone)]; 
  const c=document.getElementById('pending-codes-list'); 
  if(!c) return; 
  if(!st||!st.pendingCodes||Object.keys(st.pendingCodes).length===0){ 
    c.innerHTML='<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:10px;text-align:center"><small>⚠ مفيش كود - اعمل كود جديد</small><br><div style="display:flex;gap:8px;margin-top:8px"><button onclick="generateCodeForStudent(\''+phone+'\', \'ZIAD-\')" style="flex:1;background:#1a73e8;color:#fff;border:none;padding:8px;border-radius:6px;cursor:pointer">🎫 ZIAD</button><button onclick="generateCodeForStudent(\''+phone+'\', \'GANGONA-\')" style="flex:1;background:#6f42c1;color:#fff;border:none;padding:8px;border-radius:6px;cursor:pointer">🔥 GANGONA</button></div></div>'; 
    return; 
  } 
  let latestInfo=getLatestCodeInfo(st);
  let code = latestInfo.code;
  if(!code){
    let codes=Object.keys(st.pendingCodes);
    code=codes[codes.length-1];
  }
  const isGangona=code.startsWith('GANGONA-'); 
  const color=isGangona?'#6f42c1':'#1a73e8'; 
  const label=isGangona?'كود GANGONA الحالي:':'الكود الحالي (ZIAD):'; 
  let html='<div style="border:2px solid '+color+';border-radius:10px;padding:8px;background:#e8f0fe">';
  html+='<div style="background:#fff;border-radius:8px;padding:12px;text-align:center;margin-bottom:8px"><div style="font-size:10px;color:#5f6368">'+label+'</div><div dir="ltr" style="direction:ltr;font-weight:bold;font-size:18px;color:'+color+';background:#f1f3f4;padding:10px;border-radius:8px;border:2px dashed '+color+';word-break:break-all">'+code+'</div><div style="display:flex;gap:8px;margin-top:10px"><button data-old-bg="'+color+'" onclick="copyCode(\''+code+'\', event)" style="flex:1;background:'+color+';color:#fff;border:none;padding:8px;border-radius:6px;cursor:pointer">نسخ</button><button onclick="generateCodeForStudent(\''+phone+'\', \''+(isGangona?'GANGONA-':'ZIAD-')+'\')" style="flex:1;background:#fbbc04;color:#000;border:none;padding:8px;border-radius:6px;cursor:pointer">🔄 غيره</button></div></div>';
  html+='<div style="display:flex;gap:8px;margin-top:10px"><button onclick="generateCodeForStudent(\''+phone+'\', \'ZIAD-\')" style="flex:1;background:#1a73e8;color:#fff;border:none;padding:10px;border-radius:8px;cursor:pointer;font-weight:bold">🎫 كود ZIAD جديد</button><button onclick="generateCodeForStudent(\''+phone+'\', \'GANGONA-\')" style="flex:1;background:#6f42c1;color:#fff;border:none;padding:10px;border-radius:8px;cursor:pointer;font-weight:bold">🔥 كود GANGONA جديد</button></div></div>';
  c.innerHTML=html; 
}
function copyCode(code, evt){
  if(!code) return;
  try{
    const ta=document.createElement('textarea'); 
    ta.value=code; 
    ta.style.position='fixed'; 
    ta.style.top='0'; 
    ta.style.left='0';
    ta.style.opacity='0';
    document.body.appendChild(ta); 
    ta.focus();
    ta.select(); 
    document.execCommand('copy');
    document.body.removeChild(ta);
  }catch(e){}
  const b = (evt && evt.target) ? evt.target : null;
  if(b){
    if(!b.dataset.oldBg) b.dataset.oldBg = b.style.background || '';
    if(!b.dataset.oldText) b.dataset.oldText = b.innerText;
    const originalText = b.dataset.oldText;
    const originalBg = b.dataset.oldBg;
    b.innerText='✅ تم النسخ';
    b.style.background='#0f9d58';
    setTimeout(()=>{ b.innerText=originalText; b.style.background=originalBg; },1200);
  }
}
function fallbackCopyCode(text, callback){ const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); if(callback) callback(); }catch(e){ prompt('انسخ الكود:', text); } document.body.removeChild(ta); }
function clearAllData(){ if(!confirm('تمسح المحلي؟ الشيت هيفضل')) return; localStorage.removeItem('students_db_final'); renderAdmin(); autoLoadSheet(true); }
function toggleForm(){ 
  const typeSelect = document.getElementById('type-select');
  const formGroup = document.getElementById('form-group');
  const formSelect = document.getElementById('form-select');
  if(!typeSelect || !formGroup || !formSelect) return;
  const isListening = typeSelect.value === 'listening';
  formGroup.style.display = isListening ? 'block' : 'none';
  if(!isListening) return;
  try{
    const lvlData = (typeof levelsData !== 'undefined' && levelsData[selectedLevel]) ? levelsData[selectedLevel] : null;
    const hasA = !!(lvlData && lvlData.listening && lvlData.listening.A && lvlData.listening.A.length > 0);
    const hasB = !!(lvlData && lvlData.listening && lvlData.listening.B && lvlData.listening.B.length > 0);
    const optA = formSelect.querySelector('option[value="A"]');
    const optB = formSelect.querySelector('option[value="B"]');
    if(optA){ optA.hidden = !hasA; optA.disabled = !hasA; optA.style.display = hasA ? '' : 'none'; }
    if(optB){ optB.hidden = !hasB; optB.disabled = !hasB; optB.style.display = hasB ? '' : 'none'; }
    // لو نموذج B مش موجود اخفيه واختار A تلقائي
    if(!hasB && hasA){
      formSelect.value = 'A';
    } else if(!hasA && hasB){
      formSelect.value = 'B';
    } else if(!hasA && !hasB){
      formGroup.style.display = 'none';
    } else {
      // الاتنين موجودين - لو اللي مختار حاليا مخفي بدله
      if(formSelect.value === 'B' && !hasB) formSelect.value = 'A';
      if(formSelect.value === 'A' && !hasA) formSelect.value = 'B';
    }
  }catch(e){ console.log('toggleForm error', e); }
}
async function startExam(){ 
  setExamStudentName(); 
  currentSkill=document.getElementById('type-select').value; 
  selectedForm=document.getElementById('form-select').value;

  // لو الليفل مش متحمل، حمله
  if(!window.levelsData[selectedLevel]){
    try{
      showAudioLoading('جاري تحميل Level '+selectedLevel+'...');
      await loadLevelScript(selectedLevel);
      hideAudioLoading();
    }catch(e){
      hideAudioLoading();
      alert('فشل تحميل الليفل');
      return;
    }
  }

  // لو listening - حمل الصوت كامل وخزنه
  if(currentSkill==='listening'){
    try{
      const cached = await isLevelAudioCached(selectedLevel);
      if(!cached){
        await preloadAudiosForLevel(selectedLevel);
      } else {
        // حتى لو متخزن، اعرض لودنج سريع
        showAudioLoading('جاري فتح الامتحان...');
        await new Promise(r=>setTimeout(r, 400));
      }
      hideAudioLoading();
    }catch(e){
      hideAudioLoading();
      console.error(e);
      alert('حصل مشكلة في تجهيز الصوت، حاول تاني');
      return;
    }
  }
 
  // لو نموذج واحد بس متظهرش كلمة نموذج فوق
  try{
    const lvlData = (typeof levelsData !== 'undefined' && levelsData[selectedLevel]) ? levelsData[selectedLevel] : null;
    if(currentSkill==='listening' && lvlData && lvlData.listening){
      const hasA = !!(lvlData.listening.A && lvlData.listening.A.length>0);
      const hasB = !!(lvlData.listening.B && lvlData.listening.B.length>0);
      const count = (hasA?1:0)+(hasB?1:0);
      if(count===1){
        document.getElementById('info-badge').innerText=`[Level ${selectedLevel} - ${currentPhone}]`;
      } else {
        document.getElementById('info-badge').innerText=`[Level ${selectedLevel}${currentSkill==='listening'?' - نموذج '+selectedForm:''} - ${currentPhone}]`;
      }
    } else {
      document.getElementById('info-badge').innerText=`[Level ${selectedLevel}${currentSkill==='listening'?' - نموذج '+selectedForm:''} - ${currentPhone}]`;
    }
  }catch(e){
    document.getElementById('info-badge').innerText=`[Level ${selectedLevel}${currentSkill==='listening'?' - نموذج '+selectedForm:''} - ${currentPhone}]`;
  } if(currentSkill==='listening') currentQuestions=levelsData[selectedLevel].listening[selectedForm]; else currentQuestions=levelsData[selectedLevel].reading; userAnswers=new Array(currentQuestions.length).fill(undefined); switchScreen('exam-screen'); if(currentSkill==='listening'){ setupListeningUI(); } else { setupReadingUI(); } playQuestion(0); }
function setupListeningUI(){ document.getElementById('timer-text').style.display='inline'; document.getElementById('gear-btn').style.display='none'; document.getElementById('unit-bar').style.display='none'; }
function setupReadingUI(){ document.getElementById('timer-text').style.display='none'; document.getElementById('gear-btn').style.display='inline-block'; document.getElementById('unit-bar').style.display='flex'; const unitBar=document.getElementById('unit-bar'); unitBar.innerHTML=''; // DYNAMIC - يقرأ الـ tags من الأسئلة نفسها، مش ثابت
    const uniqueTags = [...new Set(currentQuestions.map(q=>q.tag).filter(t=>t))];
    const tags = uniqueTags.map(key=>{
      let label = key;
      if(key.includes('_G')) label = key.replace('_G',' Grammar');
      else if(key.includes('_V')) label = key.replace('_V',' Vocab');
      return {key, label};
    }); tags.forEach(t=>{ const btn=document.createElement('button'); btn.className='unit-btn'; btn.innerText=t.label; btn.onclick=()=>filterByUnitTag(t.key); unitBar.appendChild(btn); }); }
function playQuestion(index){ if(index>=currentQuestions.length){ showResults(); return; } currentIndex=index; const q=currentQuestions[index]; let displayPartName = q.partName||getTagTitle(q.tag);
  try{
    const lvlData = (typeof levelsData !== 'undefined' && levelsData[selectedLevel]) ? levelsData[selectedLevel] : null;
    if(currentSkill==='listening' && lvlData && lvlData.listening){
      const hasA = !!(lvlData.listening.A && lvlData.listening.A.length>0);
      const hasB = !!(lvlData.listening.B && lvlData.listening.B.length>0);
      const count = (hasA?1:0)+(hasB?1:0);
      if(count===1){
        // شيل (نموذج A) او (نموذج B) من العنوان
        displayPartName = displayPartName.replace(/\(نموذج\s*[AB]\)/g, '').replace(/\(\s*نموذج\s*[AB]\s*\)/g, '').trim();
      }
    }
  }catch(e){}
  document.getElementById('part-title').innerText=displayPartName; document.getElementById('speaker-name').innerText=`${q.speaker||'سؤال '+(index+1)} من ${currentQuestions.length}`; document.getElementById('question-text').innerHTML=`<bdi dir="ltr" style="unicode-bidi:isolate;text-align:left;display:inline-block;width:100%;">${q.question}</bdi>`; document.getElementById('timer-text').innerText=""; const expBox=document.getElementById('explanation-box'); expBox.style.display='none'; const box=document.getElementById('options-box'); box.innerHTML=''; q.options.forEach((opt,i)=>{ const btn=document.createElement('button'); btn.className='opt-btn'; btn.innerHTML=`<bdi dir="ltr" style="unicode-bidi:isolate;text-align:left;display:inline-block;width:100%;">${opt}</bdi>`; if(userAnswers[currentIndex]!==undefined){ if(currentSkill==='reading'){ if(i===q.correct) btn.classList.add('correct'); if(userAnswers[currentIndex]===i&&i!==q.correct) btn.classList.add('wrong'); btn.disabled=true; } else if(userAnswers[currentIndex]===i) btn.classList.add('selected'); } btn.onclick=()=>selectOption(i); box.appendChild(btn); });   if(currentSkill==='reading'&&userAnswers[currentIndex]!==undefined) showExplanation(q); 
  if(currentSkill==='listening'){ 
    const newSrc = q.audioSrc;
    if(audio.dataset.src !== newSrc){
      audio.dataset.src = newSrc;
      audio.src = newSrc;
      audio.load();
      audio.onloadedmetadata = ()=>{ 
        audio.currentTime = q.startTime; 
        audio.play().catch(()=>{}); 
      };
    } else {
      try{
        audio.currentTime = q.startTime; 
        audio.play().catch(()=>{});
      }catch(e){}
    }
  } }
function selectOption(idx){ const q=currentQuestions[currentIndex]; userAnswers[currentIndex]=idx; const btns=document.querySelectorAll('.opt-btn'); if(currentSkill==='reading'){ btns.forEach((b,i)=>{ b.disabled=true; if(i===q.correct) b.classList.add('correct'); if(i===idx&&idx!==q.correct) b.classList.add('wrong'); }); showExplanation(q); } else { btns.forEach((b,i)=>b.classList.toggle('selected',i===idx)); } }
function showExplanation(q){ const box=document.getElementById('explanation-box'); const ok=userAnswers[currentIndex]===q.correct; box.className=`explanation-box ${ok?'correct':'wrong'}`; box.style.display='block'; box.innerHTML=`<strong>${ok?'إجابة صحيحة! 🎉 (+1 درجة)':'إجابة خاطئة! ❌'}</strong><br>${ok?'':`الإجابة الصحيحة هي: <strong><bdi dir="ltr" style="unicode-bidi:isolate;display:inline-block;text-align:left;">${q.options[q.correct]}</bdi></strong><br>`}<strong>السبب:</strong> <span dir="rtl">${q.exp||''}</span>`; }
function getTagTitle(tag){ const titles={"U6_G":"Unit 6 - Grammar","U6_V":"Unit 6 - Vocabulary","U7_G":"Unit 7 - Grammar","U7_V":"Unit 7 - Vocabulary","U8_G":"Unit 8 - Grammar","U8_V":"Unit 8 - Vocabulary"}; return titles[tag]||tag; }
audio.ontimeupdate=function(){ if(currentSkill!=='listening'||currentIndex>=currentQuestions.length) return; const currentQ=currentQuestions[currentIndex]; if(audio.currentTime>=currentQ.endTime&&!isTimerRunning){ audio.pause(); startTimer(); } };
function startTimer(){ isTimerRunning=true; timeLeft=17; document.getElementById('timer-text').innerText=`المتبقي: ${timeLeft}ث`; timerInterval=setInterval(()=>{ timeLeft--; document.getElementById('timer-text').innerText=`المتبقي: ${timeLeft}ث`; if(timeLeft<=0){ clearInterval(timerInterval); moveToNextQuestion(); } },1000); }
function manualNext(){ clearInterval(timerInterval); if(currentSkill==='listening') audio.pause(); moveToNextQuestion(); }
function moveToNextQuestion(){ isTimerRunning=false; clearInterval(timerInterval); if(userAnswers[currentIndex]===undefined){ userAnswers[currentIndex]=-1; } currentIndex++; if(currentIndex<currentQuestions.length){ playQuestion(currentIndex); } else { showResults(); } }
function copyID(){
  const idEl = document.getElementById('welcome-id');
  if(!idEl) return;
  const id = idEl.innerText.trim();
  if(!id) { alert('مفيش ID'); return; }
  const btn = document.getElementById('copy-id-btn');
  const doSuccess = ()=>{
    if(btn){ 
      if(!btn.dataset.oldBg) btn.dataset.oldBg = btn.style.background;
      const old=btn.innerText; 
      btn.innerText='تم النسخ ✓'; 
      btn.style.background='#0f9d58';
      setTimeout(()=>{ btn.innerText=old; btn.style.background=btn.dataset.oldBg || '#1a73e8'; },1500); 
    }
  };
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(id).then(doSuccess).catch(()=>{ fallbackCopy(id); doSuccess(); });
  } else {
    fallbackCopy(id); doSuccess();
  }
}
function fallbackCopy(text){ const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); }catch(e){ prompt('انسخ الـ ID:', text); } document.body.removeChild(ta); }
function goBackFromExam(){ clearInterval(timerInterval); if(audio) audio.pause(); isTimerRunning=false; switchScreen('levels-screen'); renderLevels(); }
function filterByUnitTag(tagKey){ const targetIdx=currentQuestions.findIndex(q=>q.tag===tagKey); if(targetIdx!==-1){ playQuestion(targetIdx); } }
function openNavModal(){ const modal=document.getElementById('nav-modal'); const container=document.getElementById('grid-container'); container.innerHTML=''; const titleEl=document.getElementById('modal-title'); if(titleEl){ titleEl.innerText=`⚙ التنقل السريع (${currentQuestions.length} سؤال)`; } currentQuestions.forEach((q,i)=>{ const item=document.createElement('div'); item.className='grid-item'; if(userAnswers[i]!==undefined&&userAnswers[i]!==-1) item.classList.add('solved'); if(i===currentIndex) item.classList.add('active-q'); item.innerText=i+1; item.onclick=()=>{ closeNavModal(); playQuestion(i); }; container.appendChild(item); }); modal.style.display='block'; }
function closeNavModal(){ document.getElementById('nav-modal').style.display='none'; }
function showResults(){ if(currentSkill==='listening') audio.pause(); switchScreen('result-screen'); document.getElementById('result-student-name').innerText=studentName; document.getElementById('result-phone').innerText=currentPhone; document.getElementById('result-exam-info').innerText=`Level ${selectedLevel} ${currentSkill==='listening'?'- نموذج '+selectedForm:`- (${currentQuestions.length} سؤال)`}`; let score=0; let detailsHTML=''; currentQuestions.forEach((q,i)=>{ const userSelectedIdx=userAnswers[i]; const isCorrect=userSelectedIdx===q.correct; if(isCorrect) score++; const userChoiceText=(userSelectedIdx!==undefined&&userSelectedIdx!==-1&&q.options[userSelectedIdx])?q.options[userSelectedIdx]:"لم يتم الإجابة"; const correctChoiceText=q.options[q.correct]; detailsHTML+=`<div class="result-item"><strong>سؤال ${i+1}:</strong> ${isCorrect?'<span class="correct-text">إجابة صحيحة ✓</span>':'<span class="wrong-text">إجابة خاطئة ✗</span>'}<div class="answer-detail"><div>• إجابتك: <bdi dir="ltr" style="unicode-bidi:isolate;">${userChoiceText}</bdi></div>${!isCorrect?`<div style="color:#137333;font-weight:bold;">• الصح: <bdi dir="ltr" style="unicode-bidi:isolate;">${correctChoiceText}</bdi></div>`:''}</div></div>`; }); document.getElementById('score-text').innerText=`${score} / ${currentQuestions.length}`; document.getElementById('result-details').innerHTML=detailsHTML; const feedback=document.getElementById('feedback-text'); const percent=(score/currentQuestions.length)*100; if(percent===100) feedback.innerText="ممتاز جدا! اداء رائع - استمر في التفوق!"; else if(percent>=75) feedback.innerText="اداء رائع! انت على الطريق الصحيح - واصل التقدم!"; else if(percent>=50) feedback.innerText="عمل ممتاز! كل سؤال بيقربك اكتر - استمر!"; else feedback.innerText="بداية رائعة! كل محاولة بتخليك اقوى - كمل!"; }



(function(){
  function instantAutoLogin(){
    try{
      const saved = localStorage.getItem('currentSessionPhone');
      const card = document.querySelector('.card');
      if(card) card.classList.add('ready');
      if(saved){
        const db = JSON.parse(localStorage.getItem('students_db_final')||'{}');
        let found=null, key=saved;
        if(db[saved]) found=db[saved];
        else if(db['0'+saved]) { found=db['0'+saved]; key='0'+saved; }
        else if(db[saved.replace(/^0/, '')]) { found=db[saved.replace(/^0/, '')]; key=saved.replace(/^0/, ''); }
        else { const sk = saved.replace(/[^0-9]/g,'').replace(/^0+/,''); for(let k in db){ if(k.replace(/[^0-9]/g,'').replace(/^0+/,'')===sk){ found=db[k]; key=k; break; } } }
        if(found){
          currentPhone=key;
          const setIfExists = (id,val)=>{ const el=document.getElementById(id); if(el) el.innerText=val||''; };
          setIfExists('welcome-name', found.name);
          setIfExists('welcome-phone', found.phone);
          setIfExists('welcome-id', found.id);
          setIfExists('display-student-name', found.name);
          setIfExists('result-student-name', found.name);
          document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active-screen'));
          const levelsScreen = document.getElementById('levels-screen');
          if(levelsScreen) levelsScreen.classList.add('active-screen');
          verifyPasswordFromSheet();
          setTimeout(()=>{ if(typeof renderLevels==='function') renderLevels(); if(typeof setExamStudentName==='function') setExamStudentName(); const nameEl = document.getElementById('welcome-name'); const avatarEl = document.getElementById('welcome-avatar'); if(nameEl && avatarEl && nameEl.innerText){ avatarEl.innerText = nameEl.innerText.trim().charAt(0).toUpperCase(); } }, 0);
          return;
        }
      }
      document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active-screen'));
      const loginScreen = document.getElementById('login-screen');
      if(loginScreen) loginScreen.classList.add('active-screen');
    }catch(e){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active-screen')); const loginScreen = document.getElementById('login-screen'); if(loginScreen) loginScreen.classList.add('active-screen'); const card = document.querySelector('.card'); if(card) card.classList.add('ready'); }
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', instantAutoLogin); } else { instantAutoLogin(); }
})();
const _origLoginPhone = window.loginPhone;
window.loginPhone = async function(){ const result = await _origLoginPhone.apply(this, arguments); if(currentPhone) localStorage.setItem('currentSessionPhone', currentPhone); return result; };



const _origRenderLevelsAvatar = window.renderLevels;
window.renderLevels = function(){ const result = _origRenderLevelsAvatar.apply(this, arguments); try{ const nameEl = document.getElementById('welcome-name'); const avatarEl = document.getElementById('welcome-avatar'); if(nameEl && avatarEl && nameEl.innerText){ avatarEl.innerText = nameEl.innerText.trim().charAt(0).toUpperCase(); } }catch(e){} return result; };



setTimeout(()=>{
  const card=document.querySelector('.card');
  if(card && !card.classList.contains('ready')){
    card.classList.add('ready');
    console.log('forced ready');
  }
}, 800);



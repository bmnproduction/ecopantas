import { getSession, STATIONS, isStationUnlocked, remainingSeconds, formatTime, asset, completeStation } from './game-core.js';
export function mountStation(config){
 const root=document.querySelector('#station-root'); const station=STATIONS.find(x=>x.key===config.key); if(!root||!station) return;
 let rootContent='';
 const s0=getSession();
 const titleBits=`<div class="station-topline"><span class="station-step-pill">LANGKAH ${String(STATIONS.findIndex(x=>x.key===config.key)+1).padStart(2,'0')} · ${config.key==='aksi-nyata'?'DI LUAR LAYAR':'PETUALANGAN DIGITAL'}</span><a href="../peta.html">← Kembali ke peta</a></div><header class="station-title"><div class="eyebrow" style="justify-content:center">${config.kicker||station.title.toUpperCase()}</div><h1>${config.title||station.title}</h1><p>${config.subtitle||station.description}</p></header>`;
 function blocked(kind){
   if(kind==='locked') root.innerHTML=`${titleBits}<section class="locked-panel"><div class="locked-emoji">🔒</div><h2>Pelan-pelan, ya!</h2><p>Selesaikan langkah sebelumnya supaya jalan berikutnya terbuka. Kamu bisa melihat peta untuk melanjutkan.</p><a class="button button-primary" href="../peta.html">Kembali ke peta →</a></section>`;
   else root.innerHTML=`${titleBits}<section class="timeout-panel"><div class="timeout-emoji">⏰</div><h2>Waktu digital sudah habis.</h2><p>Bagian digital dibatasi agar anak tidak terlalu lama menatap layar. Kembali ke beranda untuk mengulang sesi bersama pendamping.</p><a class="button button-primary" href="../index.html">Kembali ke beranda →</a></section>`;
 }
 function showTimeout(){const s=getSession();root.innerHTML=`${titleBits}<section class="timeout-panel"><div class="timeout-emoji">⏰</div><h2>Sesi digital selesai</h2><p>Waktu 7 menit sudah habis. Terima kasih sudah belajar! Ajak guru atau orang tua untuk mencoba kembali di sesi baru.</p><a class="button button-primary" href="../index.html">Kembali ke beranda →</a></section>`;}
 const s=getSession();
 const allowed=isStationUnlocked(config.key,s);
 if(config.key!=='aksi-nyata'&&s.status==='timeup'){showTimeout();return;}
 if(!allowed){blocked('locked');return;}
 // Completed stations can be revisited as a review after the shared digital clock stops.
 const canPlayDigital=s.status==='playing'||s.status==='offline'||s.completed[config.key];
 if(config.key!=='aksi-nyata'&&!canPlayDigital){showTimeout();return;}
 const sharedControls=config.localControls?'':`<div class="station-bottom"><button class="hint-button" id="station-hint" type="button">💡 Minta petunjuk</button><a class="button button-soft" href="../peta.html">Peta petualangan ↗</a></div>`;
 root.innerHTML=`${titleBits}<section class="station-content">${config.content(s)}</section>${sharedControls}<div id="station-feedback" aria-live="polite"></div>`;
 const feedback=root.querySelector('#station-feedback');
 const setFeedback=(kind,text)=>{feedback.innerHTML=`<div class="feedback-box ${kind}">${text}</div>`;};
 const hintButton=root.querySelector('#station-hint'); if(hintButton)hintButton.addEventListener('click',()=>{if(config.onHint) config.onHint({root,setFeedback});else setFeedback('neutral','Amati gambar sekali lagi. Pilih jawaban yang membantu lingkungan.');});
 if(config.init) config.init({root,setFeedback,session:getSession(),station,complete:(details)=>{completeStation(config.key,details||{}); const b=root.querySelector('#station-feedback'); if(b) b.innerHTML=`<div class="feedback-box good">Hebat! Langkah <b>${station.title}</b> sudah selesai. Kamu boleh melanjutkan melalui peta petualangan.</div>`; const next=root.querySelector('#station-next'); if(next) next.hidden=false;}});
 // A single deadline is read from storage; this interval never resets it.
 const timer=document.querySelector('#timer-value');
 function tick(){const ss=getSession();if(!timer)return;if(ss.status==='playing'&&config.key!=='aksi-nyata'){const left=remainingSeconds();timer.textContent=formatTime(left);if(left===0&&getSession().status==='timeup'){showTimeout();}}else if(ss.status==='offline')timer.textContent='TUNTAS';else if(ss.status==='completed')timer.textContent='SELESAI';else if(ss.status==='timeup')timer.textContent='HABIS';else timer.textContent='07:00';}
 tick();setInterval(tick,1000);
}
export function choiceRoundMarkup({round,total,prompt,choices,showImages=true}){
 return `<div class="round-status"><span>Putaran ${round+1} dari ${total}</span><span class="round-dots">${Array.from({length:total},(_,i)=>`<span class="${i<round?'done':i===round?'active':''}"></span>`).join('')}</span></div><h2>${prompt}</h2><p class="activity-prompt">Pilih satu yang menurutmu paling tepat.</p><div class="choice-grid">${choices.map((c,i)=>`<button type="button" class="choice-card" data-choice="${i}">${showImages&&c.image?`<img src="${asset(c.image)}" alt="">`:`<span class="choice-emoji" aria-hidden="true">${c.emoji||'🌿'}</span>`}<strong>${c.label}</strong></button>`).join('')}</div>`;
}
export function renderFinishPanel(root,{title,detail,buttonLabel='Lanjut ke peta petualangan'}){
 root.querySelector('.station-content').innerHTML=`<div class="reward-panel"><div class="locked-emoji">🌟</div><h2>${title}</h2><p class="activity-prompt">${detail}</p><a class="button button-primary" href="../peta.html">${buttonLabel} →</a></div>`;
}

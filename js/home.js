import { getSession, startNewJourney } from './game-core.js';
const main=document.querySelector('#main-action'); const restart=document.querySelector('#restart-action'); const note=document.querySelector('#home-session-note');
function refresh(){const s=getSession();
 if(s.status==='playing'){main.innerHTML='Lanjutkan petualangan <span aria-hidden="true">→</span>';note.textContent='Petualanganmu masih berjalan. Timer tetap sama saat berpindah halaman.';restart.hidden=false;}
 else if(s.status==='offline'){main.innerHTML='Lanjutkan aksi nyata <span aria-hidden="true">→</span>';note.textContent='Tiga stasiun digital selesai. Sekarang lakukan aksi bersama orang dewasa.';restart.hidden=false;}
 else if(s.status==='completed'){main.innerHTML='Lihat hasil petualangan <span aria-hidden="true">→</span>';note.textContent='Hebat! Kamu sudah menyelesaikan petualangan dan aksi nyata.';restart.hidden=false;}
 else if(s.status==='timeup'){main.innerHTML='Mulai sesi baru <span aria-hidden="true">→</span>';note.textContent='Sesi digital selesai karena waktu habis. Kamu boleh mencoba kembali bersama pendamping.';restart.hidden=false;}
 else{main.innerHTML='Mulai petualangan <span aria-hidden="true">→</span>';note.textContent='Sesi digital singkat • sekitar 5–7 menit • didampingi guru/orang tua';restart.hidden=true;}
}
main.addEventListener('click',()=>{const s=getSession(); if(s.status==='playing'||s.status==='offline') {location.href='./peta.html';return;} if(s.status==='completed'){location.href='./peta.html';return;} startNewJourney(s.childName||'');location.href='./peta.html';});
restart.addEventListener('click',()=>{if(window.confirm('Mulai dari awal? Progres sesi ECO PANTAS saat ini akan diganti.')){startNewJourney('');location.href='./peta.html';}});
const dialog=document.querySelector('#creator-dialog');document.querySelector('#creator-open').addEventListener('click',()=>dialog.showModal());document.querySelector('#creator-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
refresh();window.addEventListener('eco:sessionchange',refresh);

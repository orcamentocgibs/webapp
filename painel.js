(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fmt(n,dec){ return n.toLocaleString('pt-BR',{minimumFractionDigits:dec,maximumFractionDigits:dec}); }
  function countUp(el){
    if(el.dataset.done) return; el.dataset.done="1";
    var to=parseFloat(el.dataset.to), dec=parseInt(el.dataset.dec||"0"),
        pre=el.dataset.prefix||"", suf=el.dataset.suffix||"", dur=1300;
    if(reduce){ el.textContent=pre+fmt(to,dec)+suf; return; }
    var t0=null;
    function step(t){ if(!t0)t0=t; var p=Math.min((t-t0)/dur,1), e=1-Math.pow(1-p,3);
      el.textContent=pre+fmt(to*e,dec)+suf; if(p<1)requestAnimationFrame(step); else el.textContent=pre+fmt(to,dec)+suf; }
    requestAnimationFrame(step);
  }

  // hero conta imediatamente
  document.querySelectorAll('.hero .num').forEach(countUp);

  // revela seções + dispara contadores/gráficos conforme entram na tela (via evento de rolagem)
  function reveal(el){ if(el.classList.contains('in')) return; el.classList.add('in'); el.querySelectorAll('.num').forEach(countUp); }
  var revs=[].slice.call(document.querySelectorAll('.reveal'));
  function vph(){ return window.innerHeight || document.documentElement.clientHeight; }
  function checkReveals(){
    var h=vph();
    for(var i=0;i<revs.length;i++){
      var el=revs[i];
      if(el.classList.contains('in')) continue;
      var r=el.getBoundingClientRect();
      if(r.top < h*0.88 && r.bottom > 0) reveal(el);
    }
  }
  window.addEventListener('scroll', checkReveals, {passive:true});
  window.addEventListener('resize', checkReveals);
  checkReveals();
  setTimeout(checkReveals,120); setTimeout(checkReveals,500); setTimeout(checkReveals,1200);

  // nav ativa + barra de progresso + tabs (mobile)
  var prog=document.getElementById('prog');
  var links=[].slice.call(document.querySelectorAll('.nlinks a'));
  var secs=links.map(function(a){ return document.querySelector(a.getAttribute('href')); });
  var tabs=[].slice.call(document.querySelectorAll('.tabbar a'));
  var tabSecs=tabs.map(function(a){ return document.getElementById(a.dataset.sec); });
  function activeIdx(list){ var idx=0; for(var i=0;i<list.length;i++){ if(list[i] && list[i].getBoundingClientRect().top<=130) idx=i; } return idx; }
  function onScroll(){
    var h=document.documentElement, sc=h.scrollTop, max=h.scrollHeight-h.clientHeight;
    if(prog) prog.style.width=(max>0?(sc/max*100):0)+'%';
    var ni=activeIdx(secs); links.forEach(function(a,i){ a.classList.toggle('on', i===ni); });
    var ti=activeIdx(tabSecs); tabs.forEach(function(a,i){ a.classList.toggle('on', i===ti); });
  }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // compartilhar (Web Share API com fallback de copiar link)
  var sh=document.getElementById('share');
  if(sh){
    sh.addEventListener('click', function(){
      var data={title:'Orçamento CGIBS', text:'Orçamento CGIBS', url:location.href};
      if(navigator.share){ navigator.share(data).catch(function(){}); return; }
      var done=function(){ sh.classList.add('copied'); var t=sh.querySelector('span'); var old=t?t.textContent:''; if(t)t.textContent='Link copiado'; setTimeout(function(){ sh.classList.remove('copied'); if(t)t.textContent=old; },2000); };
      if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(location.href).then(done).catch(function(){ prompt('Copie o link:',location.href); }); }
      else { prompt('Copie o link:',location.href); }
    });
  }

  // service worker (offline + carregamento instantâneo)
  if('serviceWorker' in navigator){ window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); }); }

  // sobreposições (modais): Equipe e Conselheiros
  function openModal(m){ if(!m) return; m.classList.add('open'); document.body.style.overflow='hidden'; var c=m.querySelector('[data-close]'); if(c) c.focus(); }
  function closeModal(m){ m.classList.remove('open'); document.body.style.overflow=''; }
  [].slice.call(document.querySelectorAll('[data-modal]')).forEach(function(btn){
    btn.addEventListener('click', function(){ openModal(document.getElementById(btn.getAttribute('data-modal'))); });
  });
  [].slice.call(document.querySelectorAll('.modal-backdrop')).forEach(function(bd){
    bd.addEventListener('click', function(e){ if(e.target===bd || (e.target.closest && e.target.closest('[data-close]'))) closeModal(bd); });
  });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ [].slice.call(document.querySelectorAll('.modal-backdrop.open')).forEach(closeModal); } });

})();

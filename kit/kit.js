/* =============================================================================
   KIT RUNTIME  (classic script — attaches window.Kit; no build step, no modules)
   Screen registry + router that mounts screens into #app with an iOS slide.
   The onboarding flow itself lives in flow/ (data in flow.js, logic in engine.js).
   ============================================================================= */
window.Kit = (function(){
  const sections = {};
  const screens  = {};
  let currentFq  = null;
  const stack    = [];

  function register(id, def){
    sections[id] = def;
    Object.keys(def.screens||{}).forEach(k=>{ screens[id+'.'+k] = def.screens[k]; });
  }
  function el(tag, cls, html){
    const e=document.createElement(tag);
    if(cls) e.className=cls;
    if(html!=null) e.innerHTML=html;
    return e;
  }
  function app(){ return document.getElementById('app'); }
  function current(){ return currentFq; }

  function render(fq, data){
    const fn = screens[fq];
    const host = app();
    host.innerHTML='';
    document.querySelectorAll('.sheet-scrim').forEach(n=>n.remove());
    if(!fn){ host.appendChild(el('div','kit-empty','Screen not found: <b>'+fq+'</b>')); return; }
    currentFq = fq;
    statusBar('light');
    document.querySelector('.screen').classList.remove('dark-bg');
    host.appendChild(fn(data||{}));
    host.scrollTop = 0;
    document.dispatchEvent(new CustomEvent('kit:render',{detail:{fq,data}}));
  }
  function statusBar(bg){
    const sb=document.getElementById('statusbar');
    if(sb) sb.classList.toggle('on-dark', bg==='dark');
    document.querySelector('.screen').classList.toggle('dark-bg', bg==='dark');
  }
  function nav(fq, data){
    if(currentFq) stack.push({fq:currentFq, data:currentData});
    currentData = data;
    slide(()=>render(fq,data),'fwd');
  }
  let currentData = null;
  function back(){
    const prev = stack.pop();
    if(prev){ currentData = prev.data; slide(()=>render(prev.fq, prev.data),'back'); }
  }
  function replace(fq, data){ currentData = data; render(fq, data); }
  function reset(){ stack.length=0; currentFq=null; currentData=null; }
  function depth(){ return stack.length; }
  function slide(paint, dir){
    const host = app();
    host.style.transition='none';
    host.style.transform = dir==='back' ? 'translateX(-14px)' : 'translateX(14px)';
    host.style.opacity='0';
    paint();
    requestAnimationFrame(()=>{
      host.style.transition='transform var(--dur) var(--ease-ios),opacity var(--dur)';
      host.style.transform='translateX(0)';
      host.style.opacity='1';
    });
  }

  /* ---- DS toolbar: circular back/close button, centered title, optional right pill */
  function toolbar(opts){
    opts=opts||{};
    const bar=el('div','toolbar');
    const left=el('div');
    if(opts.back || opts.close){
      const b=el('button','icon-btn');
      b.setAttribute('aria-label', opts.close ? 'Close' : 'Back');
      b.innerHTML=icon(opts.close?'close':'chevron-left', opts.close?22:20);
      b.onclick=opts.onBack||back; left.appendChild(b);
    }
    bar.appendChild(left);
    if(opts.title) bar.appendChild(el('div','title', opts.title));
    const right=el('div');
    if(opts.right){ right.appendChild(opts.right); }
    bar.appendChild(right);
    return bar;
  }
  function sheet(node){
    const scr=el('div','sheet-scrim'), s=el('div','sheet');
    s.appendChild(el('div','grabber'));
    s.appendChild(node);
    scr.appendChild(s);
    document.querySelector('.screen').appendChild(scr);
    requestAnimationFrame(()=>{scr.classList.add('show');s.classList.add('show');});
    function close(){ scr.classList.remove('show');s.classList.remove('show'); setTimeout(()=>scr.remove(),420); }
    scr.onclick=e=>{ if(e.target===scr) close(); };
    return {close, el:s};
  }

  /* ---- icons (stroke, 24px grid) ----------------------------------------- */
  const P = {
    'chevron-left':'<path d="M15 5l-7 7 7 7"/>',
    'chevron-right':'<path d="M9 5l7 7-7 7"/>',
    'chevron-down':'<path d="M6 9l6 6 6-6"/>',
    'close':'<path d="M6 6l12 12M18 6L6 18"/>',
    'check':'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    'plus':'<path d="M12 5v14M5 12h14"/>',
    'calendar':'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    'search':'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
    'lock':'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>',
    'eye':'<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/>',
    'shuffle':'<path d="M3 7h3c4 0 5 10 9 10h3M3 17h3c1.6 0 2.6-1.4 3.6-3M14 8c.6-.6 1.2-1 2-1h2"/><path d="M16 4l3 3-3 3M16 14l3 3-3 3"/>',
    'tools':'<path d="M14 6a4 4 0 005 5l-9 9a2.1 2.1 0 01-3-3z"/><path d="M5 4l3 3M7 2l-2 2"/>',
    'sparkle':'<path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15l-1.8-4.2L5.5 9l4.7-1.3z"/>',
    'home':'<path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/>',
    'clock':'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    'inbox':'<path d="M4 13l2-7h12l2 7v6H4z"/><path d="M4 13h5l1 2h4l1-2h5"/>',
    'sales':'<rect x="5" y="4" width="14" height="12" rx="2"/><path d="M9 20h6M12 16v4"/>',
    'asterisk':'<path d="M12 4v16M5 8l14 8M19 8L5 16"/>',
    'user':'<circle cx="12" cy="9" r="3.5"/><path d="M5 20c1-4 4-5 7-5s6 1 7 5"/>',
    'dots':'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    'share':'<path d="M12 15V4M8 8l4-4 4 4"/><path d="M6 12v7h12v-7"/>',
    'alert':'<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.2v.1"/>',
    'cash':'<rect x="3" y="6.5" width="18" height="11" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9.5v.1M17.5 14.5v.1"/>',
    'refresh':'<path d="M20 12a8 8 0 11-3-6.2M20 4v5h-5"/>'
  };
  function icon(name, size){
    size=size||24;
    const d=P[name]||'';
    return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" '+
      'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>';
  }

  return { register, el, icon, nav, back, replace, render, toolbar, sheet, statusBar, reset, depth, current,
           sections, screens };
})();

/* =============================================================================
   VALUE-PROP MOTION — recreated from the Figma "Motion" frame (node 197:31350).
   Timeline: 14.8 s loop. Keyframes (percent of the loop), easing and values
   come straight from Figma's motion data; layer positions are the t=0 positions
   in the 402×874 frame. Animated with the Web Animations API on the individual
   CSS properties `translate`, `rotate`, `scale`, `filter`.

   Story: layers start soft (blurred), fly out to the sides (0.25–1.35 s), the
   Invoices then Cash-flow cards take the centre (1.3–6 s), and everything
   returns to its place at ~6–6.8 s, snapping into focus, then gently floats.

   Options (edit here):
     SMOOTH_LOOP  true  = ease blur/numbers back to the start state before the loop
                          restarts (Figma hard-cuts). false = exactly as Figma.
     Reduced-motion users get the settled composition with no animation.
   ============================================================================= */
window.Motion = (function(){
  const DUR = 14800;
  const SMOOTH_LOOP = true;
  const E = 'ease-in-out';

  /* [percent, value, easing-of-segment-starting-here] — values per Figma export */
  const L = {
    receipts: {
      translate:[[0,[0,0]],[1.689,[0,0],E],[9.122,[-168,0]],[40.541,[-168,0],E],[45.946,[0,0],E],[55.068,[3,-7],E],[65.878,[-1.35,-1.4],E],[78.041,[-3,5.25],E],[89.527,[1.2,2.45],E],[100,[0,0]]],
      rotate:[[0,0],[45.946,0,E],[55.068,-0.016,E],[65.878,0.005,E],[78.041,0.016,E],[89.527,-0.005,E],[100,0]],
      blur:[[0,4],[40.541,4,E],[45.946,0],[100,0]]
    },
    spreadsheet: {
      translate:[[0,[0,0]],[1.689,[0,0],E],[9.122,[111,0]],[40.541,[111,0],E],[45.946,[0,0],E],[55.878,[-4,-9],E],[66.689,[1.8,-1.8],E],[78.851,[4,6.75],E],[90.338,[-1.6,3.15],E],[100,[0,0]]],
      rotate:[[0,0],[45.946,0,E],[55.878,0.019,E],[66.689,-0.006,E],[78.851,-0.019,E],[90.338,0.007,E],[100,0]],
      blur:[[0,4],[40.541,4,E],[45.946,0],[100,0]]
    },
    invoices: {
      translate:[[0,[0,0]],[1.689,[0,0],E],[9.122,[209,236]],[21.284,[209,236],E],[26.351,[-122,0]],[40.541,[-122,0],E],[45.946,[0,0],E],[57.5,[-3,-7],E],[68.311,[1.35,-1.4],E],[80.473,[3,5.25],E],[91.959,[-1.2,2.45],E],[100,[0,0]]],
      rotate:[[0,0],[45.946,0,E],[57.5,0.016,E],[68.311,-0.005,E],[80.473,-0.016,E],[91.959,0.005,E],[100,0]],
      scale:[[0,1],[1.689,1,E],[9.122,1.414],[19.257,1.414,E],[21.284,1],[100,1]],
      blur:[[0,0],[19.257,0,E],[21.284,1.5,E],[26.351,4],[40.541,4,E],[45.946,0],[100,0]]
    },
    cashflow: {
      translate:[[0,[0,0]],[1.689,[0,0],E],[9.122,[135,0]],[19.257,[135,0],E],[27.703,[-192,31]],[40.541,[-192,31],E],[45.946,[0,0],E],[55.068,[4,-9],E],[65.878,[-1.8,-1.8],'cubic-bezier(0.84,0.005,0.616,1.003)'],[78.041,[-4,6.75],E],[89.527,[1.6,3.15],E],[100,[0,0]]],
      rotate:[[0,0],[45.946,0,E],[55.068,-0.019,E],[65.878,0.006,E],[78.041,0.019,E],[89.527,-0.007,E],[100,0]],
      scale:[[0,1],[19.257,1,E],[27.703,1.455],[40.541,1.455,E],[45.946,1],[100,1]],
      blur:[[0,4],[19.257,4,E],[27.703,0],[100,0]]
    },
    logo: {
      translate:[[0,[0,0]],[1.689,[0,0],E],[9.122,[102,0]],[40.541,[102,0],E],[45.946,[0,0],E],[55.878,[-5,-11],E],[66.689,[2.25,-2.2],E],[78.851,[5,8.25],E],[90.338,[-2,3.85],E],[100,[0,0]]],
      rotate:[[0,0],[45.946,0,E],[55.878,0.023,E],[66.689,-0.007,E],[78.851,-0.023,E],[90.338,0.008,E],[100,0]],
      blur:[[0,2],[40.541,2,E],[45.946,0],[100,0]]
    },
    card: {
      translate:[[0,[0,0]],[1.689,[0,0],E],[9.122,[-122,0]],[40.541,[-122,0],E],[45.946,[0,0],E],[56.689,[3,-7],E],[67.5,[-1.35,-1.4],E],[79.662,[-3,5.25],E],[91.149,[1.2,2.45],E],[100,[0,0]]],
      rotate:[[0,0],[45.946,0,E],[56.689,-0.016,E],[67.5,0.005,E],[79.662,0.016,E],[91.149,-0.005,E],[100,0]],
      blur:[[0,4],[40.541,4,E],[45.946,0],[100,0]]
    }
  };
  /* Line on the Cash-flow card draws in between 28.65% and 34.38% (path trim). */
  const LINE = { start:28.654, end:34.378 };
  /* Number text: per-character "in" (rise 22px + fade), right→left, bezier(0,0,.58,1). */
  const TEXT = { easing:'cubic-bezier(0,0,0.58,1)', groupMs:203.704, stepMs:112.037, rise:22 };

  const reduce = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || typeof Element.prototype.animate !== 'function';

  function kf(pts, fmt){
    return pts.map(p=>({ offset:p[0]/100, ...fmt(p[1]), easing:p[2]||'linear' }));
  }
  function smooth(blurPts){
    if(!SMOOTH_LOOP) return blurPts;
    const first = blurPts[0][1];
    return blurPts.filter(p=>p[0] < 94).concat([[94,0,E],[100,first]]);
  }
  function animate(el, t){
    if(reduce) return;
    const opt = { duration:DUR, iterations:Infinity, fill:'both' };
    el.animate(kf(t.translate, v=>({translate:v[0]+'px '+v[1]+'px'})), opt);
    el.animate(kf(t.rotate,    v=>({rotate:v+'rad'})), opt);
    if(t.scale) el.animate(kf(t.scale, v=>({scale:String(v)})), opt);
    el.animate(kf(smooth(t.blur), v=>({filter:'blur('+v+'px)'})), opt);
  }

  function layer(cls, html, x, y, w, h){
    const d = document.createElement('div');
    d.className = 'mo '+cls;
    d.style.cssText = 'left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px';
    d.innerHTML = html;
    return d;
  }

  /* wrap each character of `el` in a span and animate it in (right to left) */
  function splitIn(el, startMs){
    const txt = el.textContent; el.textContent = '';
    const chars = [...txt].map(ch=>{ const s = document.createElement('span'); s.className='ch'; s.textContent = ch; el.appendChild(s); return s; });
    if(reduce) return;
    const n = chars.length;
    chars.forEach((s, idx)=>{
      const k = n - 1 - idx;                              // 0 = rightmost
      const a = startMs + k*TEXT.stepMs, b = a + TEXT.groupMs;
      const fa = a/DUR, fb = b/DUR, out0 = SMOOTH_LOOP ? 0.955 : 0.9999;
      s.animate([
        { offset:0,   opacity:0, transform:'translateY('+TEXT.rise+'px)', easing:TEXT.easing },
        { offset:fa,  opacity:0, transform:'translateY('+TEXT.rise+'px)', easing:TEXT.easing },
        { offset:fb,  opacity:1, transform:'translateY(0)', easing:'linear' },
        { offset:out0,opacity:1, transform:'translateY(0)', easing:'ease-in-out' },
        { offset:1,   opacity:SMOOTH_LOOP?0:1, transform:'translateY(0)' }
      ], { duration:DUR, iterations:Infinity, fill:'both' });
    });
  }

  /* Build the artwork into `host` (a 402×874 positioned container). Returns a stop(). */
  function mount(host){
    const A = 'assets/motion/';
    const rec = layer('l-receipts','<img alt="" src="'+A+'receipts.svg">',44,287,109,89);
    const spr = layer('l-spreadsheet','<img alt="" src="'+A+'spreadsheet.svg">',307,551,90,81);
    const inv = layer('l-invoices',
      '<p class="iv-t">Invoices</p>'+
      '<div class="iv-n l"><b id="iv1">$1,203.11</b><small>Not deposited</small></div>'+
      '<div class="iv-n r"><b id="iv2">$3,202.33</b><small>Deposited</small></div>'+
      '<i class="iv-bar a"></i><i class="iv-bar b"></i>', -118,90,220,134);
    const cf  = layer('l-cashflow', window.MOTION_SVG.cashflow, 283,263,220,198);
    const logo= layer('l-logo','<img alt="" src="'+A+'quickbooks.svg">',318,81,65,65);
    const card= layer('l-card','<img alt="" src="'+A+'credit-card.png">',-8,513,110,69);
    [rec, spr, inv, cf, logo, card].forEach(n=>host.appendChild(n));

    animate(rec, L.receipts); animate(spr, L.spreadsheet); animate(inv, L.invoices);
    animate(cf, L.cashflow);  animate(logo, L.logo);       animate(card, L.card);

    /* line draw-in on the Cash flow card (needs pathLength=1 on the path) */
    const path = cf.querySelector('path[pathLength]');
    if(path && !reduce){
      path.style.visibility = 'hidden';
      path.animate([
        { offset:0, strokeDasharray:'0 1', visibility:'hidden' },
        { offset:LINE.start/100, strokeDasharray:'0 1', visibility:'hidden', easing:E },
        { offset:LINE.end/100, strokeDasharray:'1 1', visibility:'visible' },
        { offset:SMOOTH_LOOP ? .94 : 1, strokeDasharray:'1 1', visibility:'visible', easing:E },
        { offset:1, strokeDasharray:SMOOTH_LOOP ? '0 1' : '1 1', visibility:SMOOTH_LOOP ? 'hidden' : 'visible' }
      ], { duration:DUR, iterations:Infinity, fill:'both' });
    }
    splitIn(inv.querySelector('#iv1'), 1400);
    splitIn(inv.querySelector('#iv2'), 1550);
    return function stop(){ host.querySelectorAll('.mo').forEach(n=>{ n.getAnimations({subtree:true}).forEach(a=>a.cancel()); }); };
  }

  return { mount };
})();

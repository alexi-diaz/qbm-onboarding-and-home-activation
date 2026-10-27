/* =============================================================================
   FLOW ENGINE — reads FLOW (flow.js), holds participant state, resolves the
   next screen (including branches), auto-advances transition screens, and
   renders the optional dev jump panel.
   ============================================================================= */
window.Flow = (function(){
  const params = new URLSearchParams(location.search);
  const state = {
    comingle: params.get('path') === 'h2',   // false = Hypothesis 1, true = Hypothesis 2A
    answers: {},                             // GTKM selections
    reviewIndex: 0,                          // current card in the 12-card review loop
    handled: []                              // ids of transactions confirmed/posted/excluded in the review flow
  };
  let autoTimer = null;

  function resolveNext(id){
    const def = FLOW.screens[id];
    if(!def) return null;
    const n = def.next;
    if(n == null) return null;
    if(typeof n === 'string') return n;
    return n.map[String(state[n.by])] || null;
  }
  function go(id, data){ clearTimeout(autoTimer); Kit.nav('flow.'+id, data); }
  function next(fromId, data){
    const t = resolveNext(fromId);
    if(t) go(t, data);
  }
  function jump(id, data){            // dev panel: no history
    clearTimeout(autoTimer);
    Kit.reset();
    Kit.replace('flow.'+id, data);
  }
  function restart(){
    state.answers = {}; state.reviewIndex = 0; state.handled = []; state.selected = null;
    state.comingle = params.get('path') === 'h2';
    jump(FLOW.start);
  }
  /* Auto-advance transition screens (spinner → next) */
  function autoAdvance(id){
    const ms = FLOW.screens[id] && FLOW.screens[id].auto;
    if(!ms) return;
    clearTimeout(autoTimer);
    autoTimer = setTimeout(()=>{ if(Kit.current() === 'flow.'+id) next(id); }, ms);
  }
  function back(){ clearTimeout(autoTimer); Kit.back(); }

  /* ---- Dev jump panel (?dev=1) ------------------------------------------- */
  function devPanel(){
    const panel = Kit.el('aside','devpanel');
    panel.innerHTML = '<h2>Prototype controls</h2>'+
      '<p class="hint">Review-only. Not part of the product UI.</p>'+
      '<div class="seg"><button data-p="h1">Hypothesis 1<br><small>doesn’t co-mingle</small></button>'+
      '<button data-p="h2">Hypothesis 2A<br><small>co-mingles</small></button></div>'+
      '<button class="restart">Restart</button><div class="list"></div>';
    const list = panel.querySelector('.list');
    let lastGroup = '';
    Object.keys(FLOW.screens).forEach(id=>{
      const d = FLOW.screens[id];
      if(d.group !== lastGroup){ lastGroup = d.group; list.appendChild(Kit.el('h3',null,d.group)); }
      const b = Kit.el('button',null,d.label); b.dataset.id = id;
      b.onclick = ()=>jump(id, id==='review'?{i:0}:undefined);
      list.appendChild(b);
    });
    panel.querySelectorAll('.seg button').forEach(b=>{
      b.onclick = ()=>{ state.comingle = b.dataset.p === 'h2'; sync(); };
    });
    panel.querySelector('.restart').onclick = restart;
    function sync(){
      panel.querySelectorAll('.seg button').forEach(b=>
        b.classList.toggle('on', (b.dataset.p==='h2') === state.comingle));
    }
    document.addEventListener('kit:render', e=>{
      sync();
      const id = (e.detail.fq||'').replace('flow.','');
      list.querySelectorAll('button').forEach(b=>b.classList.toggle('on', b.dataset.id===id));
    });
    sync();
    document.body.appendChild(panel);
  }

  function boot(){
    const start = params.get('start');
    const first = (start && FLOW.screens[start]) ? start : FLOW.start;
    if(params.get('dev') === '1') devPanel();
    Kit.replace('flow.'+first, first==='review'?{i:0}:undefined);
  }

  return { state, go, next, jump, back, restart, autoAdvance, resolveNext, boot };
})();

/* Post-connection screens: Hypothesis 1 + Hypothesis 2A paths, the shared 12-card
   review loop, edit mode, transition/exit screens and the Home end screen.
   Also registers every screen with the Kit router (this file must load LAST). */
(function(){
  const S = {};
  const el = Kit.el;

  /* ---- review deck: H1 reviews all 20; 2A reviews exactly the ones selected ---- */
  function selectedIds(){
    if(!Flow.state.selected) Flow.state.selected = DATA.txns.map(t=>t.id).filter(id=>DATA.unselectedByDefault.indexOf(id)<0);
    return Flow.state.selected;
  }
  function getDeck(){
    if(!Flow.state.comingle) return DATA.txns;
    const sel = selectedIds();
    return DATA.txns.filter(t=>sel.indexOf(t.id)>=0);
  }
  Flow.deck = getDeck;

  /* date range 10/1 -> today in California (Pacific time) */
  function rangeToday(){
    const p = new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',month:'numeric',day:'numeric'}).formatToParts(new Date());
    const g = t=>p.find(x=>x.type===t).value;
    return '10/1\u2013'+g('month')+'/'+g('day');
  }

  /* ---- dark summary screen: "Categorize October transactions\u2026" (H1 summary, 2A start) ---- */
  function summary(cfg){
    Kit.statusBar('dark');
    const s = el('div','dark-screen pad-dark');
    s.innerHTML =
      (cfg.close?'<button class="sum-x" id="sum-x" aria-label="Close">'+Kit.icon('close',22)+'</button>':'')+
      '<h1 class="t-h3 sum-title" style="margin-top:'+(cfg.close?'var(--space-24)':'var(--space-32)')+'">Categorize October transactions to view your expense breakdown</h1>'+
      '<p class="t-body sum-body">Next, we\u2019ll review some of your transactions to make sure we\u2019re only looking at business only transactions.</p>'+
      '<div class="sum-meta"><div class="row between"><span class="t-body">20 transactions</span><span class="t-small">'+cfg.range+'</span></div><div class="t-small" style="margin-top:var(--space-4)">'+DATA.account.name+'</div></div>'+
      '<div class="est-card"><div class="t-tiny">'+rangeToday()+'</div><div class="t-body" style="margin-top:var(--space-4)">Expenses</div>'+
        '<div class="est-amt">'+cfg.amt+'</div>'+
        '<div class="est-bar"><i style="flex:130;background:var(--proto-chart-lavender)"></i><i style="flex:77;background:var(--proto-chart-navy)"></i><i style="flex:55;background:var(--proto-chart-sky)"></i><i style="flex:55;background:var(--proto-chart-blue)"></i></div>'+
        '<div class="est-row"><span class="sq" style="background:var(--proto-chart-lavender)"></span><span class="grow">Materials and supplies</span><span>--</span></div>'+
        '<div class="est-row"><span class="sq" style="background:var(--proto-chart-navy)"></span><span class="grow">Restaurants and dining</span><span>--</span></div>'+
      '</div>'+
      '<div class="pin-bottom"><div class="stack g8"><button class="btn btn-on-dark" id="go">'+cfg.cta+' <span class="sum-time">(5m)</span></button>'+
      (cfg.later?'<button class="btn btn-plain on-dark" id="later">I\u2019ll do this later</button>':'')+'</div></div>';
    s.querySelector('#go').onclick = cfg.onGo;
    const l = s.querySelector('#later'); if(l) l.onclick = cfg.onLater;
    const x = s.querySelector('#sum-x'); if(x) x.onclick = cfg.onLater;
    return s;
  }

  /* Hypothesis 1 \u2014 business-only: straight to categorization */
  S.h1_summary = ()=>summary({
    range:rangeToday(), amt:'--', cta:'Start categorization', later:true,
    onGo:()=>{ Flow.state.reviewIndex=0; Flow.next('h1_summary',{i:0}); },
    onLater:()=>Flow.go('organizing')
  });

  /* Hypothesis 2A \u2014 co-mingled: confirm which are business first */
  S.h2_start = ()=>summary({
    range:rangeToday(), amt:'$--', cta:'Review October transactions', close:true,
    onGo:()=>Flow.next('h2_start'),
    onLater:()=>Flow.go('organizing')
  });

  S.h2_select = function(){
    const sel = selectedIds();
    const s = el('div','screen-pad');
    s.appendChild(Kit.toolbar({ close:true, title:'Review transactions', onBack:()=>Flow.go('organizing') }));
    s.appendChild(el('h1','t-h5','Select all business transactions.')).style.marginTop='var(--space-16)';
    s.appendChild(el('p','t-small t-secondary','We sorted what we could. De-select non-business transactions. Next, we\u2019ll review suggested categories')).style.marginTop='var(--space-8)';
    const list = el('div'); list.style.margin='var(--space-16) 0 0';
    const b = el('button','btn btn-primary','Continue');
    function draw(){
      list.innerHTML='';
      const all = sel.length===DATA.txns.length;
      const head = el('div','list-item'); head.style.borderTop='0';
      head.innerHTML='<span class="checkbox'+(all?' on':'')+'">'+Kit.icon('check',16)+'</span><div class="meta"><div class="t-body">Select all '+DATA.txns.length+' transactions</div><div class="sub">'+rangeToday()+'</div></div>';
      head.onclick=()=>{ sel.length=0; if(!all) DATA.txns.forEach(t=>sel.push(t.id)); draw(); };
      list.appendChild(head);
      DATA.txns.forEach(t=>{
        const on = sel.indexOf(t.id)>=0;
        const r = el('div','list-item');
        r.innerHTML='<span class="checkbox'+(on?' on':'')+'">'+Kit.icon('check',16)+'</span>'+
          '<div class="meta"><div class="t-body">'+t.short+'</div><div class="sub">'+t.date+'</div></div>'+
          '<div class="t-body">'+money(t.amount,{plus:true})+'</div>';
        r.onclick=()=>{ on ? sel.splice(sel.indexOf(t.id),1) : sel.push(t.id); draw(); };
        list.appendChild(r);
      });
      b.textContent = 'Continue ('+sel.length+')';
    }
    draw();
    s.appendChild(list);
    const fade = el('div','bottom-cta');
    b.onclick=()=>{ Flow.state.reviewIndex=0; Flow.next('h2_select',{i:0}); }; fade.appendChild(b); s.appendChild(fade);
    return s;
  };

  /* ---- Review loop: one card per transaction ------------------------------- */
  S.review = function(d){
    const i = d && d.i || 0;
    Flow.state.reviewIndex = i;
    const D = getDeck(), t = D[i], n = D.length;
    if(!t){ Flow.next('review'); return el('div'); }
    const s = el('div','screen-pad');
    const mixed = !!Flow.state.comingle;   /* heading punctuation differs per Figma (2A has a trailing period) */
    s.appendChild(Kit.toolbar({ close:true, title:'Review transactions', onBack:()=>Flow.next('review') }));   /* X: skip the remaining cards \u2192 loading \u2192 Home */
    const head = el('div','row between'); head.style.alignItems='center'; head.style.marginTop='var(--space-16)';
    head.innerHTML = '<h1 class="t-h5" style="max-width:300px">Review transaction category.</h1><span class="t-small t-tertiary">'+(i+1)+'/'+n+'</span>';
    s.appendChild(head);
    const deck = el('div','deck');
    deck.innerHTML = '<div class="peek"></div>'+
      '<div class="txcard"><p class="t-small t-secondary">'+DATA.account.checking+' · '+t.card+'</p>'+
      '<div class="txmid"><span class="mlogo t'+t.tone+'">'+t.ini+'</span>'+
      '<div class="amt">'+money(t.amount)+'</div><div class="t-body-lg t-secondary">'+t.merchant+'</div>'+
      '<button class="catpill" id="cat" aria-label="Change category">'+Kit.icon('tools',18)+'<span>'+t.category+'</span>'+Kit.icon('cash',20)+'</button></div>'+
      '<button class="btn btn-plain" id="edit">Edit details</button></div>';
    s.appendChild(deck);
    const wrap = el('div','pin-bottom'); wrap.style.paddingBottom='var(--space-24)';
    wrap.innerHTML='<div class="stack g8"><button class="btn btn-primary" id="ok">Confirm and post</button><button class="btn btn-plain" id="later">'+'Skip this one'+'</button></div>';
    s.appendChild(wrap);
    const advance = ()=> i < n-1 ? Flow.go('review',{i:i+1}) : Flow.next('review');
    /* Confirm → check stamp pops on the card, then the card swipes off to the right (Tinder-style) */
    const card = s.querySelector('.txcard'), okBtn = s.querySelector('#ok');
    let swiping = false;
    const markDone = ()=>{ if(Flow.state.handled.indexOf(t.id)<0) Flow.state.handled.push(t.id); };
    okBtn.onclick = ()=>{
      if(swiping) return; swiping = true; markDone();
      s.querySelectorAll('button').forEach(b=>b.disabled=true);
      const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(reduce || !card.animate){ return advance(); }
      const stamp = el('div','swipe-check', Kit.icon('check',44));
      card.appendChild(stamp);
      card.style.willChange = 'transform';
      card.style.zIndex = 3;
      stamp.animate([
        {opacity:0, transform:'translate(-50%,-50%) scale(.4)'},
        {opacity:1, transform:'translate(-50%,-50%) scale(1.12)', offset:.6},
        {opacity:1, transform:'translate(-50%,-50%) scale(1)'}
      ],{duration:320, easing:'cubic-bezier(.2,.8,.2,1)', fill:'forwards'});
      const peeks = deck.querySelectorAll('.peek');
      peeks.forEach(p=>p.animate([{transform:'translateY(0) scale(1)'},{transform:'translateY(8px) scale(1.03)'}],
        {duration:380, delay:340, easing:'ease-out', fill:'forwards'}));
      const fly = card.animate([
        {transform:'translate(0,0) rotate(0deg)', opacity:1},
        {transform:'translate(-10px,0) rotate(-2deg)', opacity:1, offset:.18},
        {transform:'translate(520px,-60px) rotate(18deg)', opacity:1}
      ],{duration:480, delay:380, easing:'cubic-bezier(.5,0,.9,.5)', fill:'forwards'});
      fly.onfinish = advance;
    };
    s.querySelector('#later').onclick = advance;   /* "Skip this one": next card without confirming */
    s.querySelector('#edit').onclick = ()=>Flow.go('edit',{i});
    s.querySelector('#cat').onclick = ()=>{
      const box = el('div');
      ['Materials','Utilities','Supplies','Electronics','Catering service','Bank fees'].forEach(c=>{
        const o = el('div','opt', '<span>'+c+'</span>'+(c===t.category?Kit.icon('check',20):''));
        o.onclick=()=>{ t.category=c; sh.close(); Kit.replace('flow.review',{i}); }; box.appendChild(o);
      });
      const sh = Kit.sheet(box);
    };
    return s;
  };

  /* ---- Edit mode (full-screen, from "Edit details") ------------------------ */
  S.edit = function(d){
    const i = d && d.i || 0, D = getDeck(), t = D[i], n = D.length;
    const s = el('div','edit-screen');
    const top = el('div','edit-top');
    const excl = el('button','pill-btn','Exclude');
    top.appendChild(Kit.toolbar({ close:true, right:excl }));
    top.insertAdjacentHTML('beforeend','<div class="edit-hd"><div class="t-tiny t-secondary">'+t.date.replace(/\/26$/,'/2025')+'</div><div class="t-body">'+t.merchant+'</div><div class="amt">'+money(t.amount)+'</div></div>');
    s.appendChild(top);
    const body = el('div','edit-body');
    body.innerHTML =
      '<div class="segmented"><button class="on">Categorize</button><button>Match</button></div>'+
      '<div class="card" style="margin-top:var(--space-16)">'+
        '<div class="inset-row"><div class="grow"><div class="t-small t-tertiary">Transaction type <b>*</b></div><div class="t-body">'+(t.amount<0?'Expense':'Income')+'</div></div></div>'+
        '<div class="inset-row"><div class="grow"><div class="t-small t-tertiary">Category <b>*</b></div><div class="t-body row" style="gap:var(--space-8)"><span class="ico" style="color:var(--color-icon-action)">'+Kit.icon('sparkle',16)+'</span>'+t.category+'</div></div></div>'+
        '<div class="inset-row" style="min-height:56px"><div class="grow"><div class="t-small t-tertiary">From/to</div></div></div></div>'+
      '<div class="chips" style="margin-top:var(--space-16)"><button class="chip lg">'+Kit.icon('shuffle',18)+' Split</button><button class="chip lg">'+Kit.icon('plus',18)+' Attachment</button><button class="chip lg">'+Kit.icon('plus',18)+' Memo</button></div>'+
      '<p class="t-tiny t-tertiary" style="margin-top:var(--space-16);text-transform:uppercase">TARGET REF:/CHGS/USD27 .INFO WAXX0154 07/03</p>'+
      '<div class="btn-row pin-bottom"><button class="btn btn-tertiary" id="personal">Post as personal</button><button class="btn btn-primary" id="post">Post</button></div>';
    s.appendChild(body);
    const advance = ()=>{ if(Flow.state.handled.indexOf(t.id)<0) Flow.state.handled.push(t.id); return i < n-1 ? Kit.replace('flow.review',{i:i+1}) : Flow.next('review'); };
    const seg = body.querySelectorAll('.segmented button');
    seg.forEach(b=>b.onclick=()=>{ seg.forEach(x=>x.classList.remove('on')); b.classList.add('on'); });
    body.querySelector('#post').onclick = advance;
    body.querySelector('#personal').onclick = advance;
    excl.onclick = advance;
    return s;
  };

  /* ---- Transition / exit screens ------------------------------------------- */
  function spinnerScreen(id, text){
    return function(){
      const s = el('div','center-screen');
      s.innerHTML = '<div class="spinner" role="status" aria-label="Loading"></div><p class="t-body shimmer">'+text+'</p>';
      Flow.autoAdvance(id);
      return s;
    };
  }
  S.homesetup  = spinnerScreen('homesetup','Getting your homepage set up');
  S.organizing = spinnerScreen('organizing','Organizing your finances');

  /* ---- Home (end of flow; static) — matches Figma node 432:46505 ------------ */
  S.home = function(){
    Kit.statusBar('light');
    const s = el('div','home');
    const chev = Kit.icon('chevron-right',16);
    /* H1 home uses the lavender/navy chart palette + \u201cYour business\u201d; 2A keeps teal/green + \u201cBusiness health\u201d (per Figma) */
    const h1 = !Flow.state.comingle;
    const left = Math.max(0, getDeck().length - Flow.state.handled.length);   /* what's left after the review flow (confirmed/posted/excluded cards don't count) */
    const C = h1 ? ['var(--proto-chart-lavender)','var(--proto-chart-navy)','var(--proto-chart-sky)','var(--proto-chart-blue)']
                 : ['var(--color-feedback-info-bold-background)','var(--color-feedback-positive-bold-background)','var(--color-action-primary-background)','var(--color-feedback-warning-bold-background)'];
    s.innerHTML =
      '<div class="home-hd"><div class="t-h5 home-co">North &amp; Main Bakery <span class="t-tertiary">'+Kit.icon('chevron-down',16)+'</span></div>'+
      '<div class="home-actions"><span>'+Kit.icon('inbox',22)+'</span><span>'+Kit.icon('search',22)+'</span></div></div>'+
      '<div class="home-body">'+
        '<div class="row between sec-hd"><span class="t-body-semibold">Your next step</span><span class="t-small t-tertiary">1/3</span></div>'+
        '<div class="steps-row">'+
          '<div class="stepcard"><span>Create an invoice</span>'+chev+'</div>'+
          '<div class="stepcard"><span>Set up payments</span>'+chev+'</div>'+
          '<div class="stepcard"><span class="num">3</span><span>Sort transactions</span></div>'+
        '</div>'+
        '<div class="sec-hd t-body-semibold" style="margin-top:var(--space-8)">'+(h1?'Your business':'Business health')+'</div>'+
        '<div class="hcard"><p class="t-body hc-title">Expenses</p><p class="amt2">$3,283.22</p><span class="pill-warn">'+left+' left to review for October</span>'+
          '<div class="bar"><i style="flex:5;background:'+C[0]+'"></i><i style="flex:5;background:'+C[1]+'"></i><i style="flex:.5;background:'+C[2]+'"></i><i style="flex:.5;background:'+C[3]+'"></i></div>'+
          '<div class="legend"><span class="sq" style="background:'+C[0]+'"></span><span class="grow t-body-medium">Materials and supplies<br><small class="t-small t-tertiary">15%</small></span><span class="t-body-medium">$2,883.29</span></div>'+
          '<div class="legend"><span class="sq" style="background:'+C[1]+'"></span><span class="grow t-body-medium">Restaurants and dining<br><small class="t-small t-tertiary">20%</small></span><span class="t-body-medium">$1,274.50</span></div>'+
          '<div class="dots" aria-hidden="true"><i class="on"></i><i></i></div></div>'+
        '<div class="hcard"><div class="row" style="gap:var(--space-16)">'+(h1?'':'<span class="ico att">'+
          '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M8.5 10.5l1.5 1.5 2.5-3M14 11h2.5M8.5 16.5l1.5 1.5 2.5-3M14 17h2.5"/></svg></span>')+
          '<div><p class="t-body-lg">Needs attention</p><p class="t-small t-tertiary">2 tasks</p></div></div>'+
          '<div class="task"><div class="grow"><p class="t-body-semibold">108 pending transactions</p><p class="t-small t-tertiary">Review and confirm to organize books</p></div>'+Kit.icon('chevron-right',18)+'</div></div>'+
        '<div class="hcard"><p class="t-body hc-title">Bank accounts</p><p class="amt2">$899.00</p><p class="t-small t-tertiary">Total bank balance</p>'+
          '<div class="task" style="margin-top:var(--space-12)"><span class="mlogo t1">WF</span><div class="grow"><p class="t-body-semibold">Checking</p><p class="t-small t-tertiary">Wells Fargo</p></div><span class="t-body-medium">$899.00</span></div></div>'+
        '<button class="restart-link" id="rs">Restart prototype</button>'+
      '</div>'+
      '<div class="home-float">'+
        '<button class="fab" aria-label="Create">'+Kit.icon('plus',32)+'</button>'+
        '<nav class="botnav"><span class="on">'+Kit.icon('home',24)+'<small>Home</small></span><span>'+Kit.icon('sales',24)+'<small>Sales</small></span><span>'+Kit.icon('asterisk',24)+'<small>Intuit AI</small></span><span>'+Kit.icon('user',24)+'<small>Experts</small></span></nav>'+
      '</div>';
    s.querySelector('#rs').onclick = Flow.restart;
    return s;
  };

  window.__screens = Object.assign(window.__screens||{}, S);

  /* ---- register everything with the router ---------------------------------- */
  Kit.register('flow', { title:'QBM Onboarding', screens: window.__screens });
})();

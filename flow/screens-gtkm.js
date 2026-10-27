/* GTKM — "Get to know me" questions. Selections are kept in Flow.state.answers. */
(function(){
  const S = {};   // screens added to the 'flow' section at the bottom of screens-post.js

  /* shared scaffold: toolbar (back + title + Skip) + 4-step progress + title */
  function gtkmShell(id, title, subtitle){
    const s = Kit.el('div','screen-pad');
    const skip = Kit.el('button','pill-btn','Skip');
    /* Research prototype: Skip is shown but intentionally does nothing, so participants can't bypass these screens. */
    skip.onclick = (e)=>{ e.preventDefault(); };
    s.appendChild(Kit.toolbar({ back:true, title:'Get started', right:skip }));
    const steps = Kit.el('div','steps');
    const n = FLOW.gtkmStep[id];
    for(let i=1;i<=4;i++) steps.appendChild(Kit.el('i', i<=n?'on':''));
    s.appendChild(steps);
    s.appendChild(Kit.el('h1','t-h5', title));
    if(subtitle) s.appendChild(Kit.el('p','t-small t-secondary', subtitle)).style.marginTop='var(--space-8)';
    return s;
  }
  function pinNext(s, label, enabled, onClick){
    const wrap = Kit.el('div','pin-bottom');
    const b = Kit.el('button','btn btn-primary', label);
    b.disabled = !enabled; b.onclick = onClick;
    wrap.appendChild(b); s.appendChild(wrap);
    return b;
  }
  function tileCheck(on){ return '<span class="checkbox'+(on?' on':'')+'">'+Kit.icon('check',16)+'</span>'; }

  /* ---- 1. Business name (free text) ----------------------------------------- */
  S.gtkm_name = function(){
    const A = Flow.state.answers;
    const s = gtkmShell('gtkm_name','What\u2019s your business name?');
    const inp = Kit.el('input','field'); inp.type='text'; inp.placeholder='Legal business name';
    inp.value = A.bizName||''; inp.setAttribute('aria-label','Legal business name'); inp.autocomplete='off';
    inp.style.marginTop='var(--space-24)';
    s.appendChild(inp);
    const btn = pinNext(s,'Next',!!(A.bizName||'').trim(),()=>Flow.next('gtkm_name'));
    inp.oninput = ()=>{ A.bizName = inp.value; btn.disabled = !inp.value.trim(); };
    inp.onkeydown = e=>{ if(e.key==='Enter' && !btn.disabled) btn.click(); };
    return s;
  };

  /* ---- 2. Industry (search + single-select chips) ------------------------------ */
  S.gtkm_industry = function(){
    const A = Flow.state.answers;
    const s = gtkmShell('gtkm_industry','What\u2019s your industry?');
    const wrap = Kit.el('div'); wrap.style.cssText='position:relative;margin-top:var(--space-24)';
    const inp = Kit.el('input','field'); inp.type='text'; inp.placeholder='Search industry'; inp.autocomplete='off';
    inp.setAttribute('aria-label','Search industry'); inp.style.paddingRight='calc(var(--space-16) + 22px + var(--space-8))';
    const ic = Kit.el('span',null,Kit.icon('search',22));
    ic.style.cssText='position:absolute;right:var(--space-16);top:50%;transform:translateY(-50%);pointer-events:none';
    wrap.appendChild(inp); wrap.appendChild(ic); s.appendChild(wrap);
    const chips = Kit.el('div','chips'); chips.style.marginTop='var(--space-16)'; s.appendChild(chips);
    let btn;
    function draw(){
      const q = inp.value.trim().toLowerCase();
      const list = q ? DATA.industryAll.filter(x=>x.toLowerCase().includes(q)) : DATA.industryTop;
      chips.innerHTML='';
      list.forEach(o=>{
        const c = Kit.el('button','chip lg'+(A.industry===o?' sel':''), o);
        c.setAttribute('aria-pressed', A.industry===o);
        c.onclick = ()=>{ A.industry=o; draw(); btn.disabled=false; };
        chips.appendChild(c);
      });
      if(!list.length) chips.appendChild(Kit.el('p','t-small t-tertiary','No matches. Try another word, or choose \u201cNot sure yet.\u201d'));
    }
    inp.oninput = draw;
    btn = pinNext(s,'Next',!!A.industry,()=>Flow.next('gtkm_industry'));
    draw();
    return s;
  };

  /* ---- 3. Business type (single select) ------------------------------------- */
  S.gtkm_type = function(){
    const A = Flow.state.answers;
    const s = gtkmShell('gtkm_type','What type of business do you have?','Knowing your business will help us organize your transactions.');
    const list = Kit.el('div','stack g12'); list.style.marginTop='var(--space-24)'; list.style.paddingBottom='var(--space-16)';
    let btn;
    function draw(){
      list.innerHTML='';
      DATA.bizType.forEach(o=>{
        const sel = A.bizType===o;
        const t = Kit.el('button','tile'+(sel?' sel':''), o);
        t.onclick=()=>{ A.bizType=o; draw(); btn.disabled=false; };
        list.appendChild(t);
      });
    }
    const scroller = Kit.el('div','scroll-y'); scroller.appendChild(list);
    s.appendChild(scroller);
    btn = pinNext(s,'Next',!!A.bizType,()=>Flow.next('gtkm_type'));
    btn.parentNode.style.paddingTop='var(--space-12)';
    draw();
    return s;
  };

  /* ---- 4. Main goal (single) + exactly 3 interests (multi) ------------------
     Validation: Confirm is always tappable. If no goal is chosen, or the number of
     interests under it isn't exactly 3, an inline error appears and focus moves to it.
     Errors clear as the user fixes them. A 4th tap is blocked with a message. */
  S.gtkm_goal = function(){
    const A = Flow.state.answers; A.interests = A.interests || [];
    const NEED = 3;
    const s = gtkmShell('gtkm_goal','What\u2019s your main goal for your business?');
    const body = Kit.el('div','stack g12'); body.style.marginTop='var(--space-24)';
    let showErr = false, maxHit = false;

    function errMsg(id, text){
      return '<p class="msg-error" id="'+id+'" role="alert">'+Kit.icon('alert',16)+'<span>'+text+'</span></p>';
    }
    function draw(){
      body.innerHTML='';
      const goalMissing = showErr && !A.goal;
      Object.keys(DATA.goals).forEach(g=>{
        const sel = A.goal===g, other = A.goal && !sel;
        const t = Kit.el('button','tile'+(sel?' sel':'')+(other?' dim':'')+(goalMissing?' error':''), g);
        t.setAttribute('aria-pressed', sel);
        if(goalMissing) t.setAttribute('aria-describedby','err-goal');
        t.onclick=()=>{ if(A.goal!==g){ A.goal=g; A.interests=[]; } showErr=false; maxHit=false; draw(); };
        body.appendChild(t);
        if(sel){
          const n = A.interests.length;
          const short = showErr && n < NEED;
          const hint = Kit.el('p','t-small '+(maxHit||short?'t-negative':'t-tertiary'),
            'Tap your top '+NEED+' interests. <span class="count">'+n+' of '+NEED+' selected</span>');
          hint.id='hint-interests'; body.appendChild(hint);
          const chips = Kit.el('div','chips'); chips.setAttribute('role','group'); chips.setAttribute('aria-labelledby','hint-interests');
          DATA.goals[g].forEach(c=>{
            const on = A.interests.indexOf(c)>=0;
            const ch = Kit.el('button','chip'+(on?' sel':'')+(short&&!on?' error':''), c);
            ch.setAttribute('aria-pressed', on);
            ch.onclick=()=>{
              if(on){ A.interests.splice(A.interests.indexOf(c),1); maxHit=false; }
              else if(A.interests.length<NEED){ A.interests.push(c); maxHit=false; }
              else { maxHit=true; }                       // 4th tap: blocked, explain why
              if(A.interests.length===NEED) showErr=false;
              draw();
              const again=[...body.querySelectorAll('.chip')].find(x=>x.textContent===c); if(again) again.focus();
            };
            chips.appendChild(ch);
          });
          body.appendChild(chips);
          if(maxHit) body.appendChild(Kit.el('div',null,errMsg('err-max','You can choose up to '+NEED+'. Tap a selected interest to swap it.')));
          else if(short) body.appendChild(Kit.el('div',null,errMsg('err-interests','Select '+(NEED-n)+' more interest'+(NEED-n>1?'s':'')+' to continue.')));
        }
      });
      if(goalMissing) body.appendChild(Kit.el('div',null,errMsg('err-goal','Choose a goal to continue.')));
    }
    s.appendChild(body);
    const wrap = Kit.el('div','pin-bottom');
    const btn = Kit.el('button','btn btn-primary','Confirm');
    btn.onclick = ()=>{
      if(A.goal && A.interests.length===NEED) return Flow.next('gtkm_goal');
      showErr = true; maxHit = false; draw();
      const first = body.querySelector('.msg-error'); if(first) first.scrollIntoView({block:'nearest',behavior:'smooth'});
    };
    wrap.appendChild(btn); s.appendChild(wrap);
    draw();
    return s;
  };

  window.__screens = Object.assign(window.__screens||{}, S);
})();

/* Intro + bank connection screens.
   Sign-up and the bank sign-in screens are Intuit identity / IDX-team / bank-owned UI
   and are NOT part of the QBM design system — they are styled in screens.css under
   "OUTSIDE THE DESIGN SYSTEM". */
(function(){
  const S = {};
  const el = Kit.el;

  /* ---- Sign up (native iOS identity screen) ------------------------------- */
  S.signup = function(){
    const s = el('div','screen-pad idv');
    s.innerHTML =
      '<div class="idv-logo">INTUIT</div>'+
      '<h1 class="idv-title">Let’s get you in</h1>'+
      '<div class="idv-field focus"><label>Email address</label><input id="su-email" type="email" autocomplete="off"></div>'+
      '<div class="idv-field"><label>Password</label><input type="password" autocomplete="off"><span class="idv-eye">'+Kit.icon('eye',22)+'</span></div>'+
      '<div class="idv-field sel"><span class="flag">🇺🇸</span> United States <span class="idv-caret">'+Kit.icon('chevron-down',20)+'</span></div>'+
      '<div class="idv-field"><span class="flag">🇺🇸</span> +1 <input class="phone" placeholder="Phone"></div>'+
      '<p class="idv-small">Message, call, or data rates apply.</p>'+
      '<button class="idv-cta" id="su-go">'+Kit.icon('lock',22)+' Create an Intuit Account</button>'+
      '<p class="idv-legal">By selecting Create an <u>Intuit Account</u>, you agree to our <u>Terms</u>. Our <u>Privacy Statement</u> applies to your personal data.</p>'+
      '<p class="idv-signin">Already have an account? <u>Sign in</u></p>';
    s.querySelector('#su-go').onclick = ()=>Flow.next('signup');
    return s;
  };

  /* ---- Value prop (dark, full-bleed, animated — see flow/motion.js) -------- */
  S.valueprop = function(){
    Kit.statusBar('dark');
    const s = el('div','dark-screen vp');
    s.innerHTML =
      '<div class="vp-art" aria-hidden="true"></div>'+
      '<div class="vp-copy"><h1 class="t-h3">Manage your business finances on the go</h1>'+
      '<button class="btn btn-on-dark" id="vp-go">Get started</button></div>';
    Motion.mount(s.querySelector('.vp-art'));
    s.querySelector('#vp-go').onclick = ()=>Flow.next('valueprop');
    return s;
  };

  /* ---- Transition: connect your bank (Figma node 197:31179) ---------------- */
  S.bank_intro = function(){
    Kit.statusBar('dark');
    const s = el('div','dark-screen pad-dark bank-intro');
    s.innerHTML =
      '<div class="bank-icons" aria-hidden="true">'+
        ['chase','wells-fargo','bilt','brex'].map(n=>'<img alt="" src="assets/banks/'+n+'.png">').join('')+
      '</div>'+
      '<h1 class="t-h3-semibold bi-title">Now, connect your bank so we can help you understand your business better.</h1>'+
      '<p class="t-body bi-body">You\u2019ll gain new insights and be able to separate business and personal transactions.</p>'+
      '<div class="pin-bottom bi-actions"><button class="btn btn-on-dark" id="bi-go">Connect bank</button>'+
      '<button class="btn btn-plain on-dark" id="bi-later">Skip</button></div>';
    s.querySelector('#bi-go').onclick = ()=>Flow.next('bank_intro');
    /* Research prototype: Skip is shown but intentionally does nothing. */
    s.querySelector('#bi-later').onclick = e=>e.preventDefault();
    return s;
  };

  /* ---- Bank connection (IDX-owned) ---------------------------------------- */
  /* IDX-owned screens: plain top icons, own font/colors (Part 2 of flow/screens.css) */
  function idxTop(onBack, onClose){
    const t = el('div','idx-top');
    const b = el('button','idx-ic'); b.setAttribute('aria-label','Back'); b.innerHTML = Kit.icon('chevron-left',22); b.onclick = onBack;
    const c = el('button','idx-ic'); c.setAttribute('aria-label','Close'); c.innerHTML = Kit.icon('close',22); c.onclick = onClose||onBack;
    t.appendChild(b); t.appendChild(c); return t;
  }
  function bankMark(b){
    const img = {wf:'wells-fargo', chase:'chase'}[b.cls];
    if(img){ const n = img; return '<img class="bank-logo img" alt="" src="assets/banks/'+n+'.png">'; }
    return '<span class="bank-logo '+b.cls+'">'+b.ini+'</span>';
  }

  S.bank_provider = function(){
    const s = el('div','screen-pad idx-white');
    s.appendChild(idxTop(Flow.back));
    s.appendChild(el('h1','idx-h1','Let\u2019s find your account'));
    s.appendChild(el('p','idx-sub','Look up your provider by name or browse some of our suggestions.'));
    s.appendChild(el('p','idx-label','Recommended'));
    const list = el('div','idx-list scroll-y');
    DATA.banks.forEach(b=>{
      const t = el('button','idx-card'+(b.name==='Wells Fargo'?'':' alt'), bankMark(b)+'<span>'+b.name+'</span>');
      t.onclick = ()=>{ if(b.name==='Wells Fargo') Flow.next('bank_provider'); else t.classList.add('dim'); };
      list.appendChild(t);
    });
    s.appendChild(list);
    const search = el('div','idx-search'); search.innerHTML = Kit.icon('search',20)+'<span>Search</span>';
    s.appendChild(search);
    return s;
  };

  S.bank_signin = function(){
    const s = el('div','screen-pad idx-white');
    s.appendChild(idxTop(Flow.back));
    s.insertAdjacentHTML('beforeend',
      '<div class="idx-pair"><span class="idx-badge intuit">INTUIT</span><span class="idx-arrows">\u21c6</span>'+bankMark({cls:'wf'}).replace('bank-logo img','bank-logo img lg')+'</div>'+
      '<h1 class="idx-h1">Sign in to Wells Fargo</h1>'+
      '<p class="idx-sub">Let\u2019s head over to your provider so you can sign in and authorize this connection.</p>'+
      '<button class="idx-btn solid" id="bs-go">Continue</button><button class="idx-btn outline" id="bs-back">Back</button>');
    s.querySelector('#bs-go').onclick = ()=>Flow.next('bank_signin');
    s.querySelector('#bs-back').onclick = Flow.back;
    return s;
  };

  S.bank_wf_login = function(){
    const s = el('div','wf-page');
    s.innerHTML =
      '<div class="wf-bar"><span class="wf-x">'+Kit.icon('close',18)+'</span><span>connect.secure.wellsfargo.com</span><span class="wf-x sq"></span></div>'+
      '<div class="wf-logo">WELLS FARGO</div>'+
      '<div class="wf-body"><h2>Good afternoon</h2>'+
      '<div class="wf-input"><span>Username</span></div><div class="wf-input"><span>Password</span><b>Show</b></div>'+
      '<label class="wf-chk"><i></i> Save username</label>'+
      '<button class="wf-signon" id="wf-go">Sign on</button><p class="wf-or">or</p><button class="wf-passkey">Use a passkey</button>'+
      '<p class="wf-fine">Don’t have one? Create a passkey after signing on and skip the password next time.</p></div>';
    s.querySelector('#wf-go').onclick = ()=>Flow.next('bank_wf_login');
    return s;
  };

  S.bank_wf_link = function(){
    const s = el('div','wf-page');
    s.innerHTML =
      '<div class="wf-bar"><span class="wf-x">'+Kit.icon('close',18)+'</span><span>connect.secure.wellsfargo.com</span><span class="wf-x sq"></span></div>'+
      '<div class="wf-logo">WELLS FARGO</div>'+
      '<div class="wf-body center"><h2 class="big">Link your account with Intuit</h2>'+
      '<p class="wf-fine">Review the Intuit terms of use and privacy policies to learn how they’ll use your data, or if they plan to share or sell it.</p>'+
      '<div class="idx-pair sm"><span class="idx-badge wf">WF</span><span class="dots">- - - - - - -</span><span class="idx-badge intuit round">I</span></div>'+
      '<h3 class="left">You can manage access in the Wells Fargo app.</h3>'+
      '<ul class="wf-list left"><li>We’ll never share your username or password</li><li>You choose which accounts to share</li><li>You can stop sharing anytime</li></ul>'+
      '<button class="wf-next" id="wf-next">Next</button><button class="wf-cancel" id="wf-cancel">Cancel</button></div>';
    s.querySelector('#wf-next').onclick = ()=>Flow.next('bank_wf_link');
    s.querySelector('#wf-cancel').onclick = Flow.back;
    return s;
  };

  S.bank_connecting = function(){
    const s = el('div','center-screen');
    s.innerHTML = '<div class="spinner" role="status" aria-label="Loading"></div><p class="t-body">Connecting to Wells Fargo</p>';
    Flow.autoAdvance('bank_connecting');
    return s;
  };

  /* ---- Choose accounts — THE BRANCH POINT --------------------------------- */
  S.bank_accounts = function(){
    const s = el('div','screen-pad');
    s.appendChild(Kit.toolbar({ close:true, title:'Connect new account' }));
    s.insertAdjacentHTML('beforeend',
      '<img class="wf-mini" alt="Wells Fargo" src="assets/banks/wells-fargo-logo.png">'+
      '<h1 class="t-h5" style="margin-top:var(--space-16)">Which accounts do you want to bring into QuickBooks?</h1>'+
      '<p class="t-small t-secondary" style="margin-top:var(--space-8)">We mapped each account to a QuickBooks account, so your transactions land in the right place from the start.</p>');
    const card = el('div','card'); card.style.marginTop='var(--space-24)';
    card.innerHTML =
      '<div class="card-row card-sub"><div class="grow"><div class="t-small">'+DATA.account.name+'</div>'+
        '<div class="t-small t-secondary" style="margin-top:var(--space-4)">'+money(DATA.account.balance)+'</div></div>'+
        '<span class="checkbox on">'+Kit.icon('check',16)+'</span></div>'+
      '<div class="inset-row"><div class="grow"><div class="t-small t-secondary">QuickBooks account</div><div class="t-small">'+DATA.account.name+'</div></div>'+Kit.icon('chevron-down',20)+'</div>'+
      '<div class="inset-row"><div class="grow"><div class="t-small t-secondary">Import start</div><div class="t-small">Sep 22, 2026</div></div>'+Kit.icon('calendar',20)+'</div>'+
      '<div class="inset-row"><div class="grow t-small">Does this account include personal transactions?</div>'+
        '<button class="switch'+(Flow.state.comingle?' on':'')+'" role="switch" aria-checked="'+Flow.state.comingle+'" aria-label="Account includes personal transactions" id="sw"></button></div>';
    s.appendChild(card);
    const sw = card.querySelector('#sw');
    sw.onclick = ()=>{ Flow.state.comingle = !Flow.state.comingle;
      sw.classList.toggle('on',Flow.state.comingle); sw.setAttribute('aria-checked',Flow.state.comingle);
      document.dispatchEvent(new CustomEvent('kit:render',{detail:{fq:'flow.bank_accounts'}})); };
    const wrap = el('div','pin-bottom'); const b = el('button','btn btn-primary','Import transactions from 1 account');
    b.onclick = ()=>Flow.next('bank_accounts'); wrap.appendChild(b); s.appendChild(wrap);
    return s;
  };

  window.__screens = Object.assign(window.__screens||{}, S);
})();

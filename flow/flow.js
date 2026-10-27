/* =============================================================================
   FLOW DEFINITION — the single place that says where every screen leads.
   (A .js file, not .json, so the prototype also works when opened by double-
   click from disk, where browsers block fetch() of local JSON.)

   Each screen:  id : { group, label, next }
     next = 'screen_id'                       -> always go there
          = { by:'comingle', map:{...} }      -> branch on Flow.state[by]
          = null                              -> end of flow

   THE RESEARCH BRANCH
     bank_accounts: "Does this account include personal transactions?"
        off (comingle=false) -> Hypothesis 1  (business transactions only)
        on  (comingle=true)  -> Hypothesis 2A (sort business txns first)

   To change a path, edit `next` here — screens don't hardcode destinations.
   URL params:  ?path=h1 | h2  presets the toggle   ?start=<screen id>  jumps in
                ?dev=1         shows the jump panel
   ============================================================================= */
window.FLOW = {
  start: 'signup',

  screens: {
    /* ---- Intro ---------------------------------------------------------- */
    signup:          { group:'Intro',  label:'Sign up',                     next:'valueprop' },
    valueprop:       { group:'Intro',  label:'Value prop',                  next:'gtkm_name' },

    /* ---- Get to know me (GTKM) ----------------------------------------- */
    gtkm_name:       { group:'GTKM',   label:'Business name',               next:'gtkm_industry' },
    gtkm_industry:   { group:'GTKM',   label:'Industry',                    next:'gtkm_type' },
    gtkm_type:       { group:'GTKM',   label:'Business type',               next:'gtkm_goal' },
    gtkm_goal:       { group:'GTKM',   label:'Main goal',                   next:'bank_intro' },

    /* ---- Bank connection (IDX-owned) ----------------------------------- */
    bank_intro:      { group:'Bank',   label:'Transition: connect bank',    next:'bank_provider' },
    bank_provider:   { group:'Bank',   label:'Find your account',           next:'bank_signin' },
    bank_signin:     { group:'Bank',   label:'Sign in to Wells Fargo',      next:'bank_wf_login' },
    bank_wf_login:   { group:'Bank',   label:'Wells Fargo login',           next:'bank_wf_link' },
    bank_wf_link:    { group:'Bank',   label:'Link account with Intuit',    next:'bank_connecting' },
    bank_connecting: { group:'Bank',   label:'Connecting…',                 next:'bank_accounts', auto:1600 },
    bank_accounts:   { group:'Bank',   label:'Choose accounts (BRANCH)',
                       next:{ by:'comingle', map:{ 'false':'h1_summary', 'true':'h2_start' } } },

    /* ---- Hypothesis 1: user does NOT co-mingle -------------------------- */
    h1_summary:      { group:'Hypothesis 1', label:'Estimated expense breakdown',               next:'review' },

    /* ---- Hypothesis 2A: user co-mingles --------------------------------- */
    h2_start:        { group:'Hypothesis 2A', label:'Estimated expense breakdown', next:'h2_select' },
    h2_select:       { group:'Hypothesis 2A', label:'Select business txns', next:'review' },

    /* ---- Shared review loop (12 cards), then branch-specific exit ------- */
    review:          { group:'Review', label:'Review transactions',
                       next:'organizing' },
    edit:            { group:'Review', label:'Edit transaction',            next:null },

    organizing:      { group:'Exit', label:'Organizing your finances', next:'homesetup', auto:2000 },
    homesetup:       { group:'Exit', label:'Getting your homepage set up', next:'home', auto:2000 },

    home:            { group:'End',    label:'Home',                        next:null }
  },

  /* GTKM progress bar: how many of the 4 segments are filled on each step */
  gtkmStep: { gtkm_name:1, gtkm_industry:2, gtkm_type:3, gtkm_goal:4 }
};

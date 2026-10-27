/* Sample data shown in the prototype (fictional). Amounts are numbers; negative = money out. */
window.DATA = {
  account: { name:'Wells Fargo Savings (*7745)', balance:3203.22, checking:'My business checking 9987' },

  /* 12 transactions reviewed one by one. `tone` picks a placeholder logo colour (see screens.css). */
  txns: [
    { id:1,  merchant:'The Home Depot',        short:'Home Depot',            amount:-118.20,  date:'10/14/26', card:'6/7/26',  category:'Materials',        ini:'HD', tone:1 },
    { id:2,  merchant:'Green Valley Utilities',short:'Green Valley Utilities',amount:-1274.50, date:'10/24/26', card:'10/24/26',category:'Utilities',        ini:'GV', tone:2 },
    { id:3,  merchant:'Blue Ridge Bakery',     short:'Blue Ridge Bakery',     amount:-1274.50, date:'10/24/26', card:'10/24/26',category:'Catering service', ini:'BR', tone:3 },
    { id:4,  merchant:'Best Buy',              short:'Best Buy',              amount:-2.75,    date:'10/14/26', card:'10/14/26',category:'Electronics',      ini:'BB', tone:4 },
    { id:5,  merchant:'Lowe’s',           short:'Lowe’s',           amount:-30.00,   date:'10/14/26', card:'10/14/26',category:'Materials',        ini:'LW', tone:5 },
    { id:6,  merchant:'Ace Hardware',          short:'Ace Hardware',          amount:-865.40,  date:'09/12/26', card:'09/12/26',category:'Materials',        ini:'AH', tone:6 },
    { id:7,  merchant:'Menards',               short:'Menards',               amount:865.30,   date:'10/24/26', card:'10/24/26',category:'Refunds',          ini:'MN', tone:7 },
    { id:8,  merchant:'Luxe Beauty Bar',       short:'Luxe Beauty Bar',       amount:-482.75,  date:'10/14/26', card:'10/14/26',category:'Beauty services',  ini:'LB', tone:8 },
    { id:9,  merchant:'Pinnacle Bank',         short:'Pinnacle Bank',         amount:-317.40,  date:'10/14/26', card:'10/14/26',category:'Bank fees',        ini:'PB', tone:9 },
    { id:10, merchant:'Metro Electric',        short:'Metro Electric',        amount:-876.40,  date:'10/14/26', card:'10/14/26',category:'Utilities',        ini:'ME', tone:2 },
    { id:11, merchant:'Glow Cosmetics',        short:'Glow Cosmetics',        amount:-143.50,  date:'10/14/26', card:'10/14/26',category:'Supplies',         ini:'GC', tone:8 },
    { id:12, merchant:'Capital Credit Union',  short:'Capital Credit Union',  amount:-27.85,   date:'10/14/26', card:'10/14/26',category:'Bank fees',        ini:'CC', tone:9 },
    { id:13, merchant:'Staples',            short:'Staples',            amount:-156.30, date:'10/12/26', card:'10/12/26',category:'Supplies',      ini:'ST', tone:3 },
    { id:14, merchant:'Verizon Wireless',   short:'Verizon Wireless',   amount:-189.99, date:'10/15/26', card:'10/15/26',category:'Utilities',     ini:'VZ', tone:6 },
    { id:15, merchant:'Sweet Grain Supply', short:'Sweet Grain Supply', amount:-412.60, date:'10/17/26', card:'10/17/26',category:'Materials',     ini:'SG', tone:7 },
    { id:16, merchant:'Shell',              short:'Shell',              amount:-64.18,  date:'10/18/26', card:'10/18/26',category:'Auto expenses', ini:'SH', tone:1 },
    { id:17, merchant:'Costco',             short:'Costco',             amount:-238.77, date:'10/19/26', card:'10/19/26',category:'Supplies',      ini:'CO', tone:5 },
    { id:18, merchant:'Adobe',              short:'Adobe',              amount:-59.99,  date:'10/20/26', card:'10/20/26',category:'Software',      ini:'AD', tone:4 },
    { id:19, merchant:'Downtown Parking',   short:'Downtown Parking',   amount:-18.00,  date:'10/21/26', card:'10/21/26',category:'Parking',       ini:'DP', tone:9 },
    { id:20, merchant:'Hartley Insurance',  short:'Hartley Insurance',  amount:-325.00, date:'10/23/26', card:'10/23/26',category:'Insurance',     ini:'HI', tone:2 }
  ],

  /* Mixed-path defaults (Figma: 17 of 20 selected; 9 of those arrive auto-categorized, leaving 8 cards to review) */
  unselectedByDefault: [4,5,17],
  autoCategorized:     [2,3,6,7,9,10,12,13,14],

  /* GTKM options */
  industryTop: ['Restaurant and dining','Automotive services','Retail and e-commerce','Healthcare','Creative and design','Not sure yet'],
  industryAll: ['Restaurant and dining','Automotive services','Retail and e-commerce','Healthcare','Creative and design','Construction and trades','Professional services','Real estate','Beauty and wellness','Education and tutoring','Technology','Transportation and delivery','Not sure yet'],
  bizType:['Sole proprietor','S Corp','Partnership','C corp','Non-profit'],
  goals: {
    'Grow my business':     ['Send and track invoices','Create estimates for my customers','Enable to pay','Accept payments','Just exploring'],
    'Organize my finances': ['View profit vs. loss','Manage expenses','Organize my receipts','Track mileage','Separate my business and personal transactions','I’m not sure']
  },
  banks: [
    { name:'Wells Fargo',     ini:'WF', cls:'wf' },
    { name:'Chase',           ini:'CH', cls:'chase' },
    { name:'Capital One',     ini:'C1', cls:'c1' },
    { name:'Bank of America', ini:'BA', cls:'boa' },
    { name:'Citibank',        ini:'ci', cls:'citi' },
    { name:'TD Bank',         ini:'TD', cls:'td' }
  ]
};

/* money formatter: -1274.5 -> "−$1,274.50", 865.3 -> "+$865.30" (sign optional) */
window.money = function(n, opts){
  opts = opts || {};
  const a = Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:2, maximumFractionDigits:2});
  const sign = n < 0 ? '−' : (opts.plus ? '+' : '');
  return sign + '$' + a;
};

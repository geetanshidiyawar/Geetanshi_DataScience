let rows=[],monthlyChart,categoryChart,itemChart;
const chartColors=['#6C5CE7','#00B894','#0984E3','#E17055','#FDCB6E','#A29BFE','#E84393','#00CEC9'];
const money=n=>new Intl.NumberFormat('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const integer=n=>new Intl.NumberFormat('en-IN',{maximumFractionDigits:0}).format(n);
const num=v=>v===''||v==null?null:(Number.isFinite(Number(v))?Number(v):null);
function median(a){a=a.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return 0;let m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2}
function clean(data){
 data.forEach(r=>{r.Item=(r.Item||'').trim()||'Unknown Item';r.Category=(r.Category||'').trim()||'Unknown Category';r.Price=num(r['Price Per Unit']);r.Qty=num(r.Quantity);r.Spent=num(r['Total Spent']);r.date=new Date(r['Transaction Date'])});
 const pm={},qm={};
 [...new Set(data.map(r=>r.Category))].forEach(c=>{pm[c]=median(data.filter(r=>r.Category===c).map(r=>r.Price));qm[c]=median(data.filter(r=>r.Category===c).map(r=>r.Qty))});
 data.forEach(r=>{if(r.Price===null)r.Price=pm[r.Category];if(r.Qty===null)r.Qty=qm[r.Category];if(r.Spent===null)r.Spent=r.Price*r.Qty});
 return data.filter(r=>!isNaN(r.date.getTime()));
}
function filtered(){let c=document.getElementById('category').value,y=document.getElementById('year').value;return rows.filter(r=>(c==='All Categories'||r.Category===c)&&(y==='All Years'||r.date.getFullYear()==Number(y)))}
function total(a,k){return a.reduce((s,r)=>s+(Number(r[k])||0),0)}
function avg(a,k){let v=a.map(r=>Number(r[k])).filter(Number.isFinite);return v.length?v.reduce((x,y)=>x+y,0)/v.length:0}
function group(a,key,val){let o={};a.forEach(r=>o[r[key]]=(o[r[key]]||0)+(Number(r[val])||0));return o}
function update(){
 let a=filtered();document.getElementById('revenue').textContent=money(total(a,'Spent'));document.getElementById('avg').textContent=money(avg(a,'Price'));document.getElementById('transactions').textContent=integer(a.length);document.getElementById('units').textContent=integer(total(a,'Qty'));
 drawMonthly(a);drawCategories(a);drawItems(a);observations(a);
}
function drawMonthly(a){
 let g={};a.forEach(r=>{let k=`${r.date.getFullYear()}-${String(r.date.getMonth()+1).padStart(2,'0')}`;g[k]=(g[k]||0)+r.Spent});let l=Object.keys(g).sort();
 if(monthlyChart)monthlyChart.destroy();monthlyChart=new Chart(document.getElementById('monthly'),{type:'line',data:{labels:l,datasets:[{label:'Revenue',data:l.map(k=>g[k]),tension:.28,fill:true}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{ticks:{callback:v=>v.toLocaleString('en-IN')}}}}});
}
function drawCategories(a){
 let e=Object.entries(group(a,'Category','Spent')).sort((x,y)=>y[1]-x[1]);
 let colors=e.map((_,i)=>chartColors[i%chartColors.length]);
 if(categoryChart)categoryChart.destroy();
 categoryChart=new Chart(document.getElementById('categories'),{type:'bar',data:{labels:e.map(x=>x[0]),datasets:[{label:'Revenue',data:e.map(x=>x[1]),backgroundColor:colors,borderColor:colors,borderWidth:1,barPercentage:.72,categoryPercentage:.8}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}});
}
function drawItems(a){
 let e=Object.entries(group(a,'Item','Qty')).sort((x,y)=>y[1]-x[1]).slice(0,5).reverse();
 let colors=e.map((_,i)=>chartColors[i%chartColors.length]);
 if(itemChart)itemChart.destroy();
 itemChart=new Chart(document.getElementById('items'),{type:'bar',data:{labels:e.map(x=>x[0]),datasets:[{label:'Units Sold',data:e.map(x=>x[1]),backgroundColor:colors,borderColor:colors,borderWidth:1,barPercentage:.72,categoryPercentage:.8}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}});
}
function observations(a){
 let cg=Object.entries(group(a,'Category','Spent')).sort((x,y)=>y[1]-x[1]);let mg={};a.forEach(r=>{let k=`${r.date.getFullYear()}-${String(r.date.getMonth()+1).padStart(2,'0')}`;mg[k]=(mg[k]||0)+r.Spent});let m=Object.entries(mg).sort((x,y)=>y[1]-x[1]);
 document.getElementById('observations').innerHTML=a.length?`<div class="observation"><b>Total revenue:</b> ${money(total(a,'Spent'))}</div><div class="observation"><b>Average price:</b> ${money(avg(a,'Price'))}</div><div class="observation"><b>Top category:</b> ${cg[0][0]} (${money(cg[0][1])})</div><div class="observation"><b>Highest-sales month:</b> ${m[0][0]} (${money(m[0][1])})</div>`:'<div class="observation">No transactions match the selected filters.</div>';
}
Papa.parse('retail_store_sales.csv',{download:true,header:true,skipEmptyLines:true,complete:r=>{rows=clean(r.data);let cs=[...new Set(rows.map(x=>x.Category))].sort(),ys=[...new Set(rows.map(x=>x.date.getFullYear()))].sort();cs.forEach(x=>category.innerHTML+=`<option>${x}</option>`);ys.forEach(x=>year.innerHTML+=`<option>${x}</option>`);category.addEventListener('change',update);year.addEventListener('change',update);update();},error:e=>document.getElementById('observations').innerHTML='<div class="observation">Could not load retail_store_sales.csv. Make sure it is in the same folder as index.html.</div>'});

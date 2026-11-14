const A=[
{n:"Bubble Sort",c:"var(--c0)",o:"O(n²)",d:"Compares neighbours and swaps if out of order",g:bubble},
{n:"Selection Sort",c:"var(--c1)",o:"O(n²)",d:"Finds the minimum and moves it to the front",g:selection},
{n:"Insertion Sort",c:"var(--c2)",o:"O(n²)",d:"Inserts each element into the sorted part",g:insertion},
{n:"Quick Sort",c:"var(--c3)",o:"O(n log n)",d:"Partitions around a pivot, then recurses",g:quick}];
let base=[],busy=false,stop=false;
const $=id=>document.getElementById(id);
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function* bubble(a,s){for(let i=0;i<a.length-1;i++)for(let j=0;j<a.length-1-i;j++){s.cmp++;yield[j,j+1];if(a[j]>a[j+1]){[a[j],a[j+1]]=[a[j+1],a[j]];s.swp++;yield[j,j+1,1]}}}
function* selection(a,s){for(let i=0;i<a.length-1;i++){let m=i;for(let j=i+1;j<a.length;j++){s.cmp++;yield[m,j];if(a[j]<a[m])m=j}if(m!=i){[a[i],a[m]]=[a[m],a[i]];s.swp++;yield[i,m,1]}}}
function* insertion(a,s){for(let i=1;i<a.length;i++){let j=i;while(j>0){s.cmp++;yield[j-1,j];if(a[j-1]>a[j]){[a[j-1],a[j]]=[a[j],a[j-1]];s.swp++;yield[j-1,j,1];j--}else break}}}
function* quick(a,s,lo=0,hi=a.length-1){if(lo>=hi)return;const p=a[hi];let i=lo;for(let j=lo;j<hi;j++){s.cmp++;yield[j,hi];if(a[j]<p){[a[i],a[j]]=[a[j],a[i]];s.swp++;yield[i,j,1];i++}}[a[i],a[hi]]=[a[hi],a[i]];s.swp++;yield[i,hi,1];yield*quick(a,s,lo,i-1);yield*quick(a,s,i+1,hi)}
function draw(cv,arr,hl,done,col){const r=devicePixelRatio||1,w=cv.clientWidth,h=cv.clientHeight;cv.width=w*r;cv.height=h*r;const x=cv.getContext("2d");x.scale(r,r);x.clearRect(0,0,w,h);const bw=w/arr.length,mx=Math.max(...arr,1);
arr.forEach((v,i)=>{x.fillStyle=done?css("--done"):(hl&&hl[i]==2?css("--swp"):hl&&hl[i]==1?css("--cmp"):col||css("--bar"));const bh=v/mx*(h-4);x.fillRect(i*bw+.5,h-bh,Math.max(bw-1,1),bh)})}
const sorted=(a)=>a.every((v,i)=>!i||a[i-1]<=v);
function build(){$("grid").innerHTML=A.map((a,i)=>`<div class="algo"><div class="t" style="background:${a.c}">${a.n}</div><canvas id="c${i}"></canvas><div class="note" id="n${i}">${a.d}</div><div class="stats"><div>Comparisons<b id="cp${i}">0</b></div><div>Swaps<b id="sw${i}">0</b></div><div>Time<b id="tm${i}">0 ms</b></div></div></div>`).join("");
$("tb").innerHTML=A.map((a,i)=>`<tr><td style="background:${a.c}">${a.n}</td><td id="tt${i}">-</td><td id="tc${i}">-</td><td id="ts${i}">-</td><td>${a.o}</td></tr>`).join("")}
function gen(){const n=Math.min(100,Math.max(10,+$("size").value||40));base=Array.from({length:n},()=>5+Math.floor(Math.random()*95));reset()}
function reset(){stop=true;busy=false;$("run").disabled=false;draw($("orig"),base);A.forEach((a,i)=>{draw($("c"+i),base,null,false,css("--ph"));["cp","sw"].forEach(k=>$(k+i).textContent=0);$("tm"+i).textContent="0 ms";["tt","tc","ts"].forEach(k=>$(k+i).textContent="-");$("n"+i).textContent=a.d});drawChart([0,0,0,0])}
function drawChart(v){const cv=$("chart"),r=devicePixelRatio||1,w=cv.clientWidth,h=cv.clientHeight;cv.width=w*r;cv.height=h*r;const x=cv.getContext("2d");x.scale(r,r);const mx=Math.max(...v,1),bw=w/4;x.font="11px sans-serif";x.textAlign="center";
v.forEach((t,i)=>{const bh=t/mx*(h-44);x.fillStyle=getComputedStyle(document.documentElement).getPropertyValue("--c"+i);x.fillStyle=css("--c"+i);x.fillRect(i*bw+bw*.2,h-24-bh,bw*.6,bh);x.fillStyle=css("--ink");x.fillText(t.toFixed(1),i*bw+bw/2,h-28-bh);x.fillText(A[i].n.split(" ")[0],i*bw+bw/2,h-8)})}
async function run(){if(busy)return;reset();await new Promise(r=>setTimeout(r));stop=false;busy=true;$("run").disabled=true;const times=[0,0,0,0];
// real timing (no drawing), then animate
const st=A.map((a,i)=>{const arr=base.slice(),s={cmp:0,swp:0},t0=performance.now();for(const _ of a.g(arr,s));times[i]=performance.now()-t0;return s});
const runs=A.map((a,i)=>({arr:base.slice(),s:{cmp:0,swp:0},it:a.g(base.slice(),{cmp:0,swp:0}),done:false}));
runs.forEach((r,i)=>{r.it=A[i].g(r.arr,r.s)});
const t0=performance.now();
while(!stop&&runs.some(r=>!r.done)){const per=Math.max(1,Math.round(Math.pow(+$("speed").value/100,3)*30));
runs.forEach((r,i)=>{if(r.done)return;let hl;for(let k=0;k<per;k++){const n=r.it.next();if(n.done){r.done=true;break}hl={[n.value[0]]:n.value[2]?2:1,[n.value[1]]:n.value[2]?2:1}}
draw($("c"+i),r.arr,hl,r.done);$("cp"+i).textContent=r.s.cmp;$("sw"+i).textContent=r.s.swp;$("tm"+i).textContent=((performance.now()-t0)/1000).toFixed(1)+" s";
if(r.done){$("n"+i).textContent="Sorted ✓";$("tm"+i).textContent=times[i].toFixed(2)+" ms";$("tt"+i).textContent=times[i].toFixed(2);$("tc"+i).textContent=st[i].cmp;$("ts"+i).textContent=st[i].swp;drawChart(times.map((t,j)=>runs[j].done?t:0))}});
await new Promise(r=>requestAnimationFrame(r))}
busy=false;$("run").disabled=false}
$("gen").onclick=gen;$("run").onclick=run;$("reset").onclick=reset;
addEventListener("resize",()=>{if(!busy){draw($("orig"),base);A.forEach((a,i)=>draw($("c"+i),base,null,false,css("--ph")))}});
build();gen();

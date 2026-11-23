const D=window.DATA,B='#4C78A8',R='#E4572E',LB='#9ecae1',LO='#fdbb84';
const M=Object.fromEntries(D.models.map(m=>[m.Model,m]));
const pct=v=>(v*100).toFixed(1)+'%',f3=v=>v.toFixed(3);
const css=getComputedStyle(document.documentElement);
Chart.defaults.color=css.getPropertyValue('--mut').trim()||'#5b6675';
Chart.defaults.borderColor='rgba(127,127,127,.2)';
Chart.defaults.font.family='system-ui,sans-serif';
const $=id=>document.getElementById(id);
const S=M['SVM tuned + thr'],A=M['ANN tuned + thr'];

$('k-n').textContent=D.n_total.toLocaleString('id-ID');
$('k-prev').textContent=pct(D.prevalence);
$('k-auc').textContent=f3(S.ROC_AUC);
$('k-rec').textContent=pct(S.Recall);

new Chart($('c-target'),{type:'doughnut',data:{labels:['Tidak stroke','Stroke'],datasets:[{data:[D.n_total-D.n_stroke,D.n_stroke],backgroundColor:[B,R],borderWidth:0}]},
 options:{cutout:'62%',plugins:{title:{display:true,text:`${D.n_stroke} dari ${D.n_total} pasien mengalami stroke`}}}});

new Chart($('c-age'),{type:'bar',data:{labels:D.age_groups.labels,datasets:[{data:D.age_groups.rate,backgroundColor:B,borderRadius:6}]},
 options:{plugins:{legend:{display:false},tooltip:{callbacks:{afterLabel:c=>'n = '+D.age_groups.n[c.dataIndex]}}},scales:{y:{title:{display:true,text:'Stroke rate (%)'}}}}});

const cv=Object.entries(D.cat_cramers_v).sort((a,b)=>b[1]-a[1]);
new Chart($('c-cv'),{type:'bar',data:{labels:cv.map(x=>x[0]),datasets:[{data:cv.map(x=>x[1]),backgroundColor:B,borderRadius:6}]},
 options:{indexAxis:'y',plugins:{legend:{display:false}}}});

// Metrik: accuracy vs recall dll.
const mets=['Accuracy','Recall','Precision','F2','ROC_AUC','PR_AUC'];
const series=[['SVM baseline',LB],['SVM tuned + thr',B],['ANN baseline',LO],['ANN tuned + thr',R]];
const cm=new Chart($('c-metrics'),{type:'bar',data:{labels:mets.map(m=>m.replace('_','-')),
 datasets:series.map(([n,c])=>({label:n,data:mets.map(m=>M[n][m]),backgroundColor:c,borderRadius:4}))},
 options:{scales:{y:{min:0,max:1}},plugins:{tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${c.parsed.y.toFixed(3)}`}}}}});

// tabel
const cols=['Accuracy','Precision','Recall','F2','ROC_AUC','PR_AUC','MCC'];
const best={};cols.forEach(c=>best[c]=Math.max(...D.models.map(m=>m[c])));
$('tbl').innerHTML='<tr><th>Model</th>'+cols.map(c=>`<th>${c.replace('_','-')}</th>`).join('')+'</tr>'+
 D.models.map(m=>`<tr class="${m.Model==='SVM tuned + thr'?'hl':''}"><td>${m.Model}</td>`+cols.map(c=>`<td class="${m[c]===best[c]?'best':''}">${f3(m[c])}</td>`).join('')+'</tr>').join('');

// kurva ROC / PR
const keys=['SVM baseline','SVM tuned (thr 0)','ANN baseline','ANN tuned (thr 0.5)'],kc=[LB,B,LO,R];
const mk=k=>({labels:D[k==='roc'?'roc':'pr'][k==='roc'?'fpr':'recall'],
 datasets:keys.map((n,i)=>({label:n,data:D[k][n],borderColor:kc[i],backgroundColor:kc[i],pointRadius:0,borderWidth:2.5,tension:.2}))});
const cc=new Chart($('c-curve'),{type:'line',data:mk('roc'),options:{scales:{x:{title:{display:true,text:'False positive rate'}},y:{min:0,max:1,title:{display:true,text:'True positive rate'}}}}});
$('tabs-curve').onclick=e=>{const k=e.target.dataset.k;if(!k)return;
 [...e.currentTarget.children].forEach(b=>b.classList.toggle('on',b===e.target));
 cc.data=mk(k);cc.options.scales.x.title.text=k==='roc'?'False positive rate':'Recall';cc.options.scales.y.title.text=k==='roc'?'True positive rate':'Precision';cc.update();};

// confusion matrix
$('cms').innerHTML=[['SVM',S],['ANN',A]].map(([n,m])=>`<div class="cm"><b>${n}</b><div>
 <span style="background:${B}">${m.TN}<small>TN</small></span><span style="background:#8a97a8">${m.FP}<small>FP</small></span>
 <span style="background:${R}">${m.FN}<small>FN (terlewat)</small></span><span style="background:#2e8b57">${m.TP}<small>TP (terdeteksi)</small></span></div></div>`).join('');

$('verdict').innerHTML=`<h3>Kesimpulan: SVM lebih baik pada dataset ini</h3>
<p>SVM mendeteksi <b>${S.TP} dari ${S.TP+S.FN}</b> kasus stroke (recall ${pct(S.Recall)}) dengan ROC-AUC ${f3(S.ROC_AUC)}, sedangkan ANN ${A.TP} dari ${A.TP+A.FN} (ROC-AUC ${f3(A.ROC_AUC)}).
Selisih AUC (bootstrap 95% CI): <b>+${D.auc_diff_ci[0].toFixed(3)} sampai +${D.auc_diff_ci[1].toFixed(3)}</b>, konsisten tetapi besarnya belum pasti karena hanya ${S.TP+S.FN} kasus positif di data uji.
Accuracy SVM terbaik justru lebih rendah (${pct(S.Accuracy)}) daripada baseline (${pct(M['SVM baseline'].Accuracy)}), dan itu tidak masalah: baseline tidak menemukan satu pun pasien stroke.</p>`;

// importance
const im=Object.entries(D.importance.SVM).sort((a,b)=>b[1]-a[1]);
new Chart($('c-imp'),{type:'bar',data:{labels:im.map(x=>x[0]),datasets:[{label:'SVM',data:im.map(x=>x[1]),backgroundColor:B},{label:'ANN',data:im.map(x=>D.importance.ANN[x[0]]),backgroundColor:R}]},
 options:{indexAxis:'y',scales:{x:{title:{display:true,text:'Penurunan ROC-AUC saat fitur diacak'}}}}});

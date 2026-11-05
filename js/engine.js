/* engine.js — PROFIT 3.0 */

/* =========================================================
   PROFIT 3.0 — MOTOR NUTRICIONAL + EVOLUÇÃO CORPORAL
   + CONFIGURAÇÃO CENTRALIZADA + ATALHO OPCIONAL
========================================================= */
(function(){
  const $ = id => document.getElementById(id);
  const NKEY = "profit_nutrition_profile_v31";
  const MKEY = "profit_medidas_v31";
  const RKEY = "profit_medidas_lembrete_v31";
  const SKEY = "fitpro_swipe_enabled";

  let nutrition = {};
  let medidas = {};
  try{ nutrition = JSON.parse(localStorage.getItem(NKEY)||"{}"); }catch(e){ nutrition={}; }
  try{ medidas = JSON.parse(localStorage.getItem(MKEY)||"{}"); }catch(e){ medidas={}; }

  function n(v){ const x=Number(String(v??"").replace(",",".")); return Number.isFinite(x)?x:0; }
  function fmt(v,d=0){ return Number(v||0).toLocaleString("pt-BR",{maximumFractionDigits:d}); }
  function saveNutrition(){ try{localStorage.setItem(NKEY,JSON.stringify(nutrition));}catch(e){} }
  function saveMedidas(){ try{localStorage.setItem(MKEY,JSON.stringify(medidas));}catch(e){} }
  function dataISO(d=new Date()){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function dateObj(iso){const p=String(iso).split("-");return new Date(Number(p[0]),Number(p[1])-1,Number(p[2]));}
  function dateBR(iso){if(!iso)return "";const p=iso.split("-");return p[2]+"/"+p[1]+"/"+p[0];}

  function carregarNutritionUI(){
    ["nutSexo","nutIdade","nutAltura","nutPeso","nutAtividade","nutObjetivo"].forEach(id=>{if($(id)&&nutrition[id]!==undefined) $(id).value=nutrition[id];});
    if($("nutPeso") && !$("nutPeso").value){ const p=typeof pesos!=="undefined"?Number(pesos[dataAtual]||0):0; if(p) $("nutPeso").value=p; }
    renderTargets();
  }

  function calcular(){
    const sexo=$("nutSexo")?.value||"", idade=n($("nutIdade")?.value), altura=n($("nutAltura")?.value), peso=n($("nutPeso")?.value), atividade=n($("nutAtividade")?.value)||1.55, objetivo=$("nutObjetivo")?.value||"manter";
    if(!sexo || !idade || !altura || !peso){ toast("Preencha sexo, idade, altura e peso para calcular suas metas."); return; }
    const bmr = sexo==="m" ? (10*peso)+(6.25*altura)-(5*idade)+5 : (10*peso)+(6.25*altura)-(5*idade)-161;
    const tdee = bmr*atividade;
    const ajuste = objetivo==="emagrecer" ? .85 : objetivo==="ganhar" ? 1.10 : 1;
    const kcal = Math.max(1200,Math.round(tdee*ajuste/10)*10);
    const protKg = objetivo==="emagrecer" ? 1.8 : 1.8;
    const proteina = peso*protKg;
    const gordura = peso*.8;
    const carbo = Math.max(0,(kcal-(proteina*4)-(gordura*9))/4);
    const agua = (peso*35)/1000;
    const fibras = kcal/1000*14;
    nutrition={sexo,idade,altura,peso,atividade,objetivo,bmr,tdee,kcal,proteina,gordura,carbo,agua,fibras,atualizado:dataISO()};
    saveNutrition();
    if(typeof meta!=="undefined"){ meta=kcal; localStorage.setItem("nutri_meta",meta); }
    if(typeof metaAgua!=="undefined"){ metaAgua=Math.max(.5,Number(agua.toFixed(1))); localStorage.setItem("nutri_meta_agua",metaAgua); }
    if($("meta")) $("meta").value=Math.round(kcal);
    if($("waterGoalInput")) $("waterGoalInput").value=Number(agua.toFixed(1));
    if(typeof atualizarTudo==="function") atualizarTudo();
    if(typeof renderAgua==="function") renderAgua();
    renderTargets();
    toast("Metas calculadas e salvas. 🎯");
  }

  function renderTargets(){
    const el=$("profitTargetGrid"), note=$("profitNutritionNote"); if(!el)return;
    if(!nutrition.kcal){el.innerHTML="";if(note)note.textContent="";return;}
    const items=[["🔥",fmt(nutrition.kcal),"kcal / dia"],["🥩",fmt(nutrition.proteina,0)+" g","proteína"],["🍚",fmt(nutrition.carbo,0)+" g","carboidratos"],["🥑",fmt(nutrition.gordura,0)+" g","gorduras"],["💧",fmt(nutrition.agua,1)+" L","água"],["🌾",fmt(nutrition.fibras,0)+" g","fibras"]];
    el.innerHTML=items.map(x=>`<div class="profit-target"><span>${x[0]} ${x[2]}</span><b>${x[1]}</b></div>`).join("");
    if(note) note.textContent="Estimativa: BMR " + fmt(nutrition.bmr) + " kcal · TDEE " + fmt(nutrition.tdee) + " kcal. Ajuste por objetivo aplicado. Não substitui avaliação profissional.";
  }

  function preencherMedidas(){
    const d=dataISO(), m=medidas[d]||{};
    const map={medPeso:"peso",medCintura:"cintura",medAbdomen:"abdomen",medPeito:"peito",medBracoD:"bracoD",medBracoE:"bracoE",medQuadril:"quadril",medCoxaD:"coxaD",medCoxaE:"coxaE",medPantD:"pantD",medPantE:"pantE"};
    Object.keys(map).forEach(id=>{if($(id))$(id).value=m[map[id]]??"";});
    renderMedidas();
  }
  function salvarMedidas(){
    const d=dataISO(), map={medPeso:"peso",medCintura:"cintura",medAbdomen:"abdomen",medPeito:"peito",medBracoD:"bracoD",medBracoE:"bracoE",medQuadril:"quadril",medCoxaD:"coxaD",medCoxaE:"coxaE",medPantD:"pantD",medPantE:"pantE"};
    const obj={}; let count=0; Object.keys(map).forEach(id=>{const v=n($(id)?.value);if(v>0){obj[map[id]]=v;count++;}});
    if(!count){toast("Informe pelo menos uma medida.");return;}
    medidas[d]=obj; saveMedidas();
    if(obj.peso && typeof pesos!=="undefined"){pesos[d]=obj.peso; if(typeof salvarPesos==="function") salvarPesos(); if(typeof pesoDaData==="function") pesoDaData();}
    renderMedidas(); atualizarLembrete(); closeMeasurePrompt(); toast("Medidas salvas. 📏");
  }
  function delta(key,currentDate){
    const dates=Object.keys(medidas).filter(d=>d<=currentDate&&medidas[d]&&medidas[d][key]!=null).sort();
    if(dates.length<2)return null; const a=n(medidas[dates[dates.length-2]][key]), b=n(medidas[dates[dates.length-1]][key]); return b-a;
  }
  function renderMedidas(){
    const hist=$("medidasHistorico"), status=$("medidasStatus"); if(!hist)return;
    const dates=Object.keys(medidas).sort().reverse();
    if(status){ status.textContent=dates.length?"Último registro: "+dateBR(dates[0]):"Nenhum registro corporal ainda."; }
    hist.innerHTML=dates.slice(0,5).map(d=>{
      const m=medidas[d], parts=[];
      [["Peso","peso","kg"],["Cintura","cintura","cm"],["Abdômen","abdomen","cm"],["Peito","peito","cm"],["Braço D","bracoD","cm"],["Quadril","quadril","cm"]].forEach(x=>{if(m[x[1]]!=null){let ds=delta(x[1],d);parts.push(`<span>${x[0]}: <strong>${fmt(m[x[1]],1)} ${x[2]}</strong>${ds!==null?` <em class="profit-delta">${ds>0?"+":""}${fmt(ds,1)}</em>`:""}</span>`);}});
      return `<div class="profit-measure-row"><strong>${dateBR(d)}</strong><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:5px">${parts.join("")||"Sem valores"}</div></div>`;
    }).join("") || `<div class="empty">Registre sua primeira avaliação corporal.</div>`;
  }

  function dueDate(){
    const dates=Object.keys(medidas).sort(); if(!dates.length)return true;
    const last=dateObj(dates[dates.length-1]); const freq=localStorage.getItem("profit_medidas_freq")||"15";
    const dias=freq==="30"?30:15; return Math.floor((dateObj(dataISO())-last)/86400000)>=dias;
  }
  function atualizarLembrete(){
    const last=Object.keys(medidas).sort().pop()||""; const snooze=localStorage.getItem(RKEY)||"";
    const hoje=dataISO(); const should=dueDate() && snooze!==hoje;
    if(should)setTimeout(openMeasurePrompt,900);
  }
  function openMeasurePrompt(){if($("medidasReminderModal")){$("medidasReminderModal").classList.add("open");$("medidasReminderModal").setAttribute("aria-hidden","false");}}
  function closeMeasurePrompt(){if($("medidasReminderModal")){$("medidasReminderModal").classList.remove("open");$("medidasReminderModal").setAttribute("aria-hidden","true");}}

  function openConfig(){
    const modal=$("profitConfigModal"), body=$("profitConfigBody"); if(!modal||!body)return;
    ["configuracaoCard","backupCard"].forEach(id=>{const el=$(id);if(el&&!body.contains(el))body.appendChild(el);});
    modal.classList.add("open");modal.setAttribute("aria-hidden","false"); renderShortcutSetting();
  }
  function closeConfig(){const modal=$("profitConfigModal");if(modal){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");}}
  function renderShortcutSetting(){
    const c=$("configuracaoCard"); if(!c)return;
    let row=$("profitShortcutToggleRow"); if(!row){
      row=document.createElement("div");row.id="profitShortcutToggleRow";row.className="switch-row";row.innerHTML=`<div class="switch-copy"><div class="switch-title">Atalhos por gesto</div><div class="switch-sub">Mostra o botão flutuante e permite deslizar para abrir atalhos.</div></div><label class="switch"><input id="profitShortcutToggle" type="checkbox"><span class="slider"></span></label>`;
      c.insertBefore(row,c.firstChild);
      $("profitShortcutToggle").addEventListener("change",e=>{localStorage.setItem(SKEY,e.target.checked?"1":"0");applyShortcutVisibility();toast(e.target.checked?"Atalhos ativados.":"Atalhos desativados.");});
    }
    $("profitShortcutToggle").checked=localStorage.getItem(SKEY)==="1";
    let freq=$("profitMeasureFreqRow");
    if(!freq){
      freq=document.createElement("div");
      freq.id="profitMeasureFreqRow";
      freq.className="switch-row";
      freq.innerHTML=`<div class="switch-copy"><div class="switch-title">Lembrete de medidas</div><div class="switch-sub">Escolha quando o PROFIT deve pedir uma nova avaliação corporal.</div></div><select id="profitMeasureFreq" class="select-small"><option value="15">15 em 15 dias</option><option value="30">Mensal</option></select>`;
      c.appendChild(freq);
      $("profitMeasureFreq").addEventListener("change",e=>{localStorage.setItem("profit_medidas_freq",e.target.value);toast("Frequência das medidas atualizada. 📏");});
    }
    $("profitMeasureFreq").value=localStorage.getItem("profit_medidas_freq")||"15";
  }
  function applyShortcutVisibility(){const box=$("swipeShortcut");if(!box)return;box.classList.toggle("profit-shortcut-disabled",localStorage.getItem(SKEY)!== "1");}

  if($("calcularMetasBtn"))$("calcularMetasBtn").onclick=calcular;
  if($("salvarMedidasBtn"))$("salvarMedidasBtn").onclick=salvarMedidas;
  if($("abrirConfiguracaoBtn"))$("abrirConfiguracaoBtn").onclick=openConfig;
  if($("fecharConfiguracaoBtn"))$("fecharConfiguracaoBtn").onclick=closeConfig;
  document.querySelectorAll("[data-close-config]").forEach(x=>x.addEventListener("click",closeConfig));
  if($("registrarMedidasAgoraBtn"))$("registrarMedidasAgoraBtn").onclick=()=>{closeMeasurePrompt(); if(window.profitIrParaTela)window.profitIrParaTela("evolucao");setTimeout(()=>{$("medidasCard")?.scrollIntoView({behavior:"smooth",block:"start"});},100);};
  if($("adiarMedidasBtn"))$("adiarMedidasBtn").onclick=()=>{localStorage.setItem(RKEY,dataISO());closeMeasurePrompt();toast("Lembrete adiado para depois.");};
  document.querySelectorAll("[data-close-medidas]").forEach(x=>x.addEventListener("click",closeMeasurePrompt));

  carregarNutritionUI(); preencherMedidas(); renderShortcutSetting(); applyShortcutVisibility(); atualizarLembrete();
})();

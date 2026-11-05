/* goals.js — PROFIT 3.0 */

/* =========================================================
   PROFIT 3.0 — PERFIL ORGANIZADO + META KCAL + PESO-ALVO
========================================================= */
(function(){
  const $=id=>document.getElementById(id);
  const KEY="profit_nutrition_profile_v31";
  let profile={};
  try{profile=JSON.parse(localStorage.getItem(KEY)||"{}");}catch(e){profile={};}
  const fmt=v=>Number(v||0).toLocaleString("pt-BR",{maximumFractionDigits:1});

  function carregarPerfil(){
    const map={perfilSexo:"sexo",perfilIdade:"idade",perfilAltura:"altura",perfilPesoAtual:"peso",perfilPesoMeta:"pesoMeta",perfilObjetivo:"objetivo"};
    Object.keys(map).forEach(id=>{if($(id)&&profile[map[id]]!==undefined)$(id).value=profile[map[id]];});
    if($('perfilDadosStatus')) $('perfilDadosStatus').textContent=profile.pesoMeta?"Peso desejado: "+fmt(profile.pesoMeta)+" kg":"Você ainda não definiu seu peso desejado.";
    renderWeightGoal();
  }
  function salvarPerfilDados(){
    const sexo=$("perfilSexo")?.value||"", idade=Number($("perfilIdade")?.value||0), altura=Number($("perfilAltura")?.value||0), peso=Number($("perfilPesoAtual")?.value||0), pesoMeta=Number($("perfilPesoMeta")?.value||0), objetivo=$("perfilObjetivo")?.value||"manter";
    if(!sexo||!idade||!altura||!peso){toast("Preencha sexo, idade, altura e peso atual.");return;}
    profile=Object.assign({},profile,{sexo,idade,altura,peso,pesoMeta,objetivo,pesoInicial:Number(profile.pesoInicial||peso)});
    try{localStorage.setItem(KEY,JSON.stringify(profile));}catch(e){}
    // Mantém a recomendação sincronizada com os dados do perfil.
    ["nutSexo","nutIdade","nutAltura","nutPeso","nutObjetivo"].forEach((id,i)=>{if($(id))$(id).value=[sexo,idade,altura,peso,objetivo][i];});
    if(typeof pesos!=="undefined"&&typeof dataAtual!=="undefined"){pesos[dataAtual]=peso;if(typeof salvarPesos==="function")salvarPesos();}
    renderWeightGoal();
    if($('perfilDadosStatus')) $('perfilDadosStatus').textContent="Informações salvas neste dispositivo. ✓";
    toast("Perfil atualizado. 👤");
  }
  function renderWeightGoal(){
    const box=$("profitWeightGoalBox"); if(!box)return;
    const target=Number(profile.pesoMeta||0);
    const current=Number(profile.peso||0);
    if(!target){box.innerHTML='<strong>🎯 Peso desejado</strong><br><span style="color:var(--muted)">Defina seu peso desejado no Perfil para acompanhar sua evolução.</span>';return;}
    let latest=current;
    try{const arr=typeof pesos!=="undefined"?Object.keys(pesos).sort():[];if(arr.length)latest=Number(pesos[arr[arr.length-1]]||current);}catch(e){}
    const initial=Number(profile.pesoInicial||profile.peso||latest);
    const denom=Math.abs(target-initial)||1;
    let progress= target===initial ? 100 : Math.min(100,Math.max(0,Math.abs(latest-initial)/denom*100));
    if((target<initial&&latest<=target)||(target>initial&&latest>=target))progress=100;
    const diff=latest-target;
    const texto=Math.abs(diff)<0.1?"🎯 Você chegou ao peso desejado!":diff>0?"Faltam "+fmt(Math.abs(diff))+" kg para o objetivo.":"Você está "+fmt(Math.abs(diff))+" kg abaixo do peso desejado.";
    box.innerHTML='<strong>🎯 Peso desejado: '+fmt(target)+' kg</strong><div style="margin-top:3px">Peso atual: <b>'+fmt(latest)+' kg</b> · '+texto+'</div><div class="profit-weight-track"><div class="profit-weight-fill" style="width:'+progress.toFixed(1)+'%"></div></div>';
  }
  const GOAL_MODE_KEY="profit_goal_mode_v33";
  let goalMode=localStorage.getItem(GOAL_MODE_KEY)||profile.objetivo||"perder";
  if(!["perder","manter","ganhar"].includes(goalMode))goalMode="perder";
  function renderGoalMode(){
    document.querySelectorAll("[data-goal-mode]").forEach(btn=>btn.classList.toggle("active",btn.dataset.goalMode===goalMode));
    const help=$("goalModeHelp");if(help)help.textContent=goalMode==="perder"?"Faixa de referência: 90% a 110% da meta. Evite restrições excessivas.":goalMode==="ganhar"?"Faixa de referência: 90% a 110% da meta. O excesso também fica fora da faixa.":"Faixa de referência: 90% a 110% da meta, para cima ou para baixo.";
  }
  function celebrarMeta(){
    const card=$("metaCard"),badge=$("profitGoalBadge"),status=$("goalStatus");if(!card||!badge||!status)return;
    const total=typeof diario==="function"?diario().reduce((s,x)=>s+Number(x.kcal||0),0):0;
    const alvo=Number($("meta")?.value||0);
    const faixa=alvo*.10, minimo=alvo-faixa, maximo=alvo+faixa;
    const restante=alvo-total;
    const pct=alvo>0?Math.min(100,total/alvo*100):0;
    const progress=$("progressBar");if(progress)progress.style.width=pct+"%";
    const used=$("goalUsed"),remain=$("goalRemain");
    if(used)used.textContent=fmt(total)+" kcal consumidas";
    if(remain)remain.textContent=restante>=0?fmt(restante)+" kcal até o centro da meta":fmt(Math.abs(restante))+" kcal acima do centro da meta";
    card.classList.remove("goal-complete");status.className="goal-status";badge.textContent="";
    let achieved=false;
    if(!alvo){status.textContent="Defina uma meta de calorias para começar.";}
    else if(total<=0){status.textContent="Registre suas refeições para comparar seu consumo com a faixa de ±10% da meta.";}
    else if(total<minimo){status.classList.add("status-warn");status.textContent="⚠️ Você está "+fmt(minimo-total)+" kcal abaixo da faixa planejada. Não é preciso comer menos para conquistar resultados; priorize uma meta adequada.";}
    else if(total>maximo){status.classList.add("status-over");status.textContent="⚠️ Você está "+fmt(total-maximo)+" kcal acima da faixa planejada. Observe o dia sem compensações extremas.";}
    else {status.classList.add("status-good");status.textContent="✅ Dentro da faixa de ±10%: "+fmt(minimo)+"–"+fmt(maximo)+" kcal. O dia está dentro do intervalo planejado.";achieved=true;if(alvo<1200)status.textContent+=" Atenção: essa meta pode ser baixa para muitas pessoas; confirme se é adequada para você com um profissional de saúde.";}
    if(achieved){
      card.classList.add("goal-complete");
      badge.textContent=goalMode==="perder"?"💚 Faixa planejada respeitada!":goalMode==="ganhar"?"🎉 Dentro da faixa de consumo!":"⚖️ Dentro da faixa de equilíbrio!";
      if(!card.dataset.celebrated){card.dataset.celebrated="1";const burst=document.createElement("div");burst.className="profit-goal-burst";["🎉","⭐","💚","🔥","🏆","✨"].forEach((e,i)=>{const sp=document.createElement("span");sp.textContent=e;sp.style.setProperty("--x",((i-2.5)*42)+"px");sp.style.setProperty("--y",(-45-Math.abs(i-2.5)*18)+"px");sp.style.setProperty("--r",((i-2.5)*22)+"deg");burst.appendChild(sp);});card.appendChild(burst);setTimeout(()=>burst.remove(),1500);}
    } else delete card.dataset.celebrated;
  }
  document.querySelectorAll("[data-goal-mode]").forEach(btn=>btn.addEventListener("click",()=>{goalMode=btn.dataset.goalMode;localStorage.setItem(GOAL_MODE_KEY,goalMode);profile.objetivo=goalMode;try{localStorage.setItem(KEY,JSON.stringify(profile));}catch(e){};renderGoalMode();celebrarMeta();}));
  renderGoalMode();
  if($("salvarPerfilDadosBtn"))$("salvarPerfilDadosBtn").onclick=salvarPerfilDados;
  // Sincroniza o perfil depois que o app original terminar de carregar.
  setTimeout(carregarPerfil,100);
  // Recalcula a celebração após qualquer atualização visual do diário.
  const originalAtualizarResumo=window.atualizarResumo;
  if(typeof originalAtualizarResumo==="function"){
    window.atualizarResumo=function(){const r=originalAtualizarResumo.apply(this,arguments);setTimeout(celebrarMeta,0);return r;};
  }
  if($("salvarMetaKcalBtn"))$("salvarMetaKcalBtn").addEventListener("click",()=>{setTimeout(celebrarMeta,80);});
  if($("meta"))$("meta").addEventListener("input",celebrarMeta);
  setTimeout(celebrarMeta,250);
  setInterval(celebrarMeta,800);
})();

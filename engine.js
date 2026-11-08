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

  /* ===== RECOMENDAÇÃO (v16) — único cálculo do app ===== */
  const LIMITE_RITMO = 0.75;           // % do peso por semana (ganho e perda)
  function statusRec(tipo, texto){
    const el=$("recStatus"); if(!el) return;
    el.className="rec-status "+tipo; el.textContent=texto;
  }
  function bloquear(msg){
    const note=$("profitNutritionNote"); if(note) note.innerHTML="<b>⛔ "+msg+"</b>";
    statusRec("bloqueado","⛔ "+msg);
  }
  function fmtN(v,d){ return Number(v||0).toLocaleString("pt-BR",{maximumFractionDigits:d==null?0:d}); }

  function calcular(){
    const sexo=$("perfilSexo")?.value||"";
    const idade=n($("perfilIdade")?.value), altura=n($("perfilAltura")?.value), peso=n($("perfilPesoAtual")?.value);
    const pesoMeta=n($("perfilPesoMeta")?.value), meses=n($("perfilPrazoMeses")?.value);
    const atividade=Number($("perfilAtividade")?.value)||1.55;

    if(!sexo||!idade||!altura||!peso){ bloquear("Preencha sexo, idade, altura e peso atual no Perfil."); return; }

    // 1) objetivo automático pelo peso desejado
    const delta = pesoMeta ? pesoMeta-peso : 0;
    const objetivo = Math.abs(delta)<0.05 ? "manter" : (delta>0 ? "ganhar" : "emagrecer");
    if($("perfilObjetivo")) $("perfilObjetivo").value=objetivo;

    // 2) ajuste pelo prazo (com verificação de segurança)
    let ajuste=0;
    if(objetivo!=="manter"){
      if(!meses){ bloquear("Informe o prazo em meses para calcular a meta."); return; }
      const semanas=meses*4.345;
      const pct=(Math.abs(delta)/semanas)/peso*100;
      if(pct>LIMITE_RITMO){
        const minMeses=Math.ceil((Math.abs(delta)/(LIMITE_RITMO/100*peso))/4.345*2)/2;
        bloquear("Plano bloqueado: ritmo de "+fmtN(pct,2)+"% do peso por semana (limite "+fmtN(LIMITE_RITMO,2)+"%). Prazo mínimo seguro: "+fmtN(minMeses,1)+" meses. A meta não foi alterada.");
        return;
      }
      ajuste=Math.round(delta*7700/(meses*30.4));
    }

    // 3) calorias: TDEE (Mifflin-St Jeor × atividade) + ajuste
    const bmr=(10*peso)+(6.25*altura)-(5*idade)+(sexo==="m"?5:-161);
    const tdee=Math.round(bmr*atividade);
    const kcal=tdee+ajuste;
    const minKcal=sexo==="f"?1200:1500;
    if(kcal<minKcal){ bloquear("Calorias ficariam em "+fmtN(kcal)+" kcal, abaixo do mínimo seguro de "+fmtN(minKcal)+" kcal. A meta não foi alterada."); return; }

    // 4) macros
    const kgProt = atividade<=1.375 ? 1.4 : (atividade<=1.55 ? 1.6 : 1.8);
    const proteina = peso*(objetivo==="ganhar" ? Math.max(1.8,kgProt) : kgProt);
    const gordMin = peso*0.8;
    let gordura = Math.max(gordMin, kcal*0.25/9);
    let carbo = (kcal-proteina*4-gordura*9)/4;
    if(carbo<100){
      const alvo=(kcal-proteina*4-400)/9;
      gordura=Math.max(gordMin,Math.min(gordura,alvo));
      carbo=(kcal-proteina*4-gordura*9)/4;
    }
    const agua=peso*35/1000, fibras=kcal/1000*14;

    // 5) guarda sem apagar os dados do Perfil (prazo, plano etc.)
    let base={}; try{ base=JSON.parse(localStorage.getItem(NKEY)||"{}"); }catch(e){}
    nutrition=Object.assign(base,{sexo,idade,altura,peso,atividade,objetivo,meses,bmr,tdee,ajuste,kcal,proteina,gordura,carbo,agua,fibras,atualizado:dataISO()});
    saveNutrition();

    // 6) aplica a meta no app
    meta=kcal; localStorage.setItem("nutri_meta",String(kcal));
    if($("meta")) $("meta").value=kcal;
    const aguaL=Math.max(0.5,Number(agua.toFixed(1)));
    metaAgua=aguaL; localStorage.setItem("nutri_meta_agua",String(aguaL));
    if($("waterGoalInput")) $("waterGoalInput").value=aguaL;
    if(typeof atualizarTudo==="function") atualizarTudo();
    if(typeof renderAgua==="function") renderAgua();
    renderTargets();
    statusRec("ok","✅ Meta atualizada: "+fmtN(kcal)+" kcal/dia"+(pesoMeta?" (peso desejado "+fmtN(pesoMeta,1)+" kg)":"")+".");
    if(typeof toast==="function") toast("Recomendação atualizada. 🎯");
  }

  function renderTargets(){
    const el=$("profitTargetGrid"), note=$("profitNutritionNote");
    if(!el) return;
    if(!nutrition.kcal){ el.innerHTML=""; if(note) note.textContent=""; return; }
    const itens=[
      ["🔥",fmtN(nutrition.kcal)+" kcal","kcal / dia"],
      ["🥩",fmtN(nutrition.proteina)+" g","proteína"],
      ["🍚",fmtN(nutrition.carbo)+" g","carboidratos"],
      ["🥑",fmtN(nutrition.gordura)+" g","gorduras"],
      ["💧",fmtN(nutrition.agua,1)+" L","água"],
      ["🌾",fmtN(nutrition.fibras)+" g","fibras"]
    ];
    el.innerHTML=itens.map(x=>`<div class="profit-target"><span>${x[0]} ${x[2]}</span><b>${x[1]}</b></div>`).join("");
    if(note){
      const niveis={"1.2":"sedentário","1.375":"leve","1.55":"moderado","1.725":"intenso","1.9":"muito intenso"};
      const conta = nutrition.objetivo==="manter"
        ? "Conta: TDEE "+fmtN(nutrition.tdee)+" + ajuste 0 = "+fmtN(nutrition.kcal)+" kcal (manutenção)"
        : "Conta: TDEE "+fmtN(nutrition.tdee)+" "+((nutrition.ajuste>0?"+":"")+fmtN(nutrition.ajuste))+" = "+fmtN(nutrition.kcal)+" kcal";
      note.innerHTML="BMR "+fmtN(nutrition.bmr)+" kcal · TDEE "+fmtN(nutrition.tdee)+" kcal ("+(niveis[String(nutrition.atividade)]||"")+")<br>"+conta+"<br>Estimativa. Não substitui avaliação profissional.";
    }
  }

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

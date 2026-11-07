/* nutrition-ui.js — PROFIT 3.0 */

(function(){
  const box = document.getElementById("nfBox");
  if(!box) return;
  const macro  = document.getElementById("nfMacro");
  const niveis = document.getElementById("nfLevels");
  const info   = document.getElementById("nfInfo");
  const limpar = document.getElementById("nfClear");
  const kcalLevels = document.querySelector("#descubraCard .levels");
  const kcalAviso  = kcalLevels ? kcalLevels.nextElementSibling : null; // faixa "Nível 5" de calorias

  function curto(max,i){
    if(i === 1) return "≤" + max[0] + " g";
    if(i === 5) return ">" + max[3] + " g";
    return max[i-2] + "–" + max[i-1] + " g";
  }
  function longo(max,i){
    if(i === 1) return "até " + max[0] + " g";
    if(i === 5) return "acima de " + max[3] + " g";
    return "acima de " + max[i-2] + " g até " + max[i-1] + " g";
  }

  function montar(){
    const nut = nutrienteFiltro;
    const kcal = nut === "kcal";

    box.querySelectorAll("[data-nf]").forEach(b =>
      b.classList.toggle("active", b.dataset.nf === nut));

    macro.style.display = kcal ? "none" : "block";
    if(kcalLevels) kcalLevels.style.display = kcal ? "" : "none";
    if(kcalAviso)  kcalAviso.style.display  = kcal ? "" : "none";
    if(kcal) return;

    const f = NF_FAIXAS[nut];
    niveis.innerHTML = "";
    for(let i=1;i<=5;i++){
      const b = document.createElement("button");
      b.type = "button";
      b.className = "nf-level" + (nivelNutri === i ? " active" : "");
      b.innerHTML = "<strong>N" + i + "</strong><small>" + curto(f.max,i) + "</small>";
      b.setAttribute("aria-pressed", nivelNutri === i ? "true" : "false");
      b.onclick = () => {
        nivelNutri = (nivelNutri === i) ? null : i; // clicar de novo desmarca
        montar();
        renderAlimentos();
      };
      niveis.appendChild(b);
    }
    info.textContent = nivelNutri
      ? f.nome + " · Nível " + nivelNutri + ": " + longo(f.max,nivelNutri) + " (por 100 g)"
      : f.nome + ": escolha um nível (por 100 g)";
    limpar.style.visibility = nivelNutri ? "visible" : "hidden";
  }

  box.querySelectorAll("[data-nf]").forEach(b => {
    b.onclick = () => {
      nutrienteFiltro = b.dataset.nf;
      nivelNutri = null;
      montar();
      renderAlimentos();
    };
  });

  limpar.onclick = () => {
    nivelNutri = null;
    montar();
    renderAlimentos();
  };

  montar();
})();


/* PROFIT 3.0 — barras finas de proteína, carboidrato e gordura contra a meta */
(function(){
  function metas(){
    try{
      var p=JSON.parse(localStorage.getItem('profit_nutrition_profile_v31')||'{}');
      return {p:Number(p.proteina)||0, c:Number(p.carbo)||0, g:Number(p.gordura)||0};
    }catch(e){ return {p:0,c:0,g:0}; }
  }
  function barra(id,valor,meta){
    var el=document.getElementById(id);
    if(!el) return;
    el.style.width = meta>0 ? Math.min(100, valor/meta*100).toFixed(1)+'%' : '0%';
  }
  function atualizarBarrasMacros(){
    var itens=(typeof diario==='function')?diario():[];
    var t={p:0,c:0,g:0};
    itens.forEach(function(i){ t.p+=Number(i.p||0); t.c+=Number(i.c||0); t.g+=Number(i.g||0); });
    var m=metas();
    barra('barP',t.p,m.p); barra('barC',t.c,m.c); barra('barG',t.g,m.g);
  }
  window.atualizarBarrasMacros=atualizarBarrasMacros;
  var original=window.atualizarResumo;
  if(typeof original==='function'){
    window.atualizarResumo=function(){ var r=original.apply(this,arguments); atualizarBarrasMacros(); return r; };
  }
  atualizarBarrasMacros();
})();


/* PROFIT 3.0 — histórico recolhido atrás de um botão */
(function(){
  var btn=document.getElementById('histToggle');
  var lista=document.getElementById('historico');
  if(!btn||!lista) return;
  lista.style.display='none';
  btn.onclick=function(){
    var aberto=lista.style.display!=='none';
    lista.style.display=aberto?'none':'';
    btn.textContent=aberto?'📅 Ver histórico':'▲ Ocultar histórico';
  };
})();

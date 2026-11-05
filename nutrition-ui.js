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

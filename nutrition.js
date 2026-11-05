/* nutrition.js — PROFIT 3.0 */
/* ===== PATCH 3 — FILTRO NUTRICIONAL POR NÍVEL (por 100g; limite superior incluído) ===== */
const NF_FAIXAS = {
    p:{nome:"Proteína",     max:[5,10,20,30]},
    c:{nome:"Carboidratos", max:[5,15,30,60]},
    g:{nome:"Gorduras",     max:[3,10,20,40]}
};
let nutrienteFiltro = "kcal";
let nivelNutri = null;

function nfNivel(item,nut){
    const bruto = item[nut];
    if(bruto === null || bruto === undefined || bruto === "") return null; // sem dado: não entra
    const v = Number(bruto);
    if(!Number.isFinite(v) || v < 0) return null;
    const max = NF_FAIXAS[nut].max;
    for(let i=0;i<max.length;i++){
        if(v <= max[i]) return i+1;
    }
    return 5;
}

function nfNivelOk(item,nivelKcal){
    if(nutrienteFiltro === "kcal"){
        return nivelAtual === "Todos" || Number(nivelAtual) === nivelKcal; // regra original
    }
    if(nivelNutri === null) return true;
    return nfNivel(item,nutrienteFiltro) === nivelNutri;
}
/* ===== FIM PATCH 3 ===== */

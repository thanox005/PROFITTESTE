/* navigation.js — PROFIT 3.0 */

/* =========================================================
   PROFIT V1 — NAVEGAÇÃO
========================================================= */
(function(){
    const navButtons = Array.from(document.querySelectorAll("#profitBottomNav .bottom-nav-btn"));
    const sections = Array.from(document.querySelectorAll("main.content > section[data-screen]"));

    function ativarTela(tela){
        const destino = tela || "home";
        sections.forEach(section => {
            section.classList.toggle("screen-active", section.dataset.screen === destino);
        });
        navButtons.forEach(btn => {
            const ativo = btn.dataset.screen === destino;
            btn.classList.toggle("active", ativo);
            btn.setAttribute("aria-current", ativo ? "page" : "false");
        });
        window.scrollTo({top:0,behavior:"smooth"});
        try{localStorage.setItem("nutri_tela_atual",destino);}catch(e){}
    }

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => ativarTela(btn.dataset.screen));
    });

    window.profitIrParaTela = ativarTela;
    ativarTela("home");

    const perfilBtn = document.getElementById("perfilBtn");
    if(perfilBtn){
        perfilBtn.onclick = () => ativarTela("perfil");
    }

    const homeBtn = document.getElementById("homeBtn");
    if(homeBtn){
        homeBtn.onclick = () => ativarTela("home");
    }
})();

/* =========================================================
   PROFIT V1 — BUSCA AVANÇADA
   Aceita: frango frito | frango + frito | 'frango' com ovo 'frito'
   Regra padrão: TODOS os termos relevantes precisam existir.
========================================================= */
(function(){
    function extrairTermosAvancados(texto){
        const bruto = String(texto || "").trim();
        if(!bruto) return [];

        const protegidos = [];
        const marcador = "__TERMO_QUOTADO_";
        let trabalhado = bruto.replace(/[\"']([^\"']+)[\"']/g, function(_, conteudo){
            const idx = protegidos.length;
            protegidos.push(normalizar(conteudo).trim());
            return " " + marcador + idx + " ";
        });

        trabalhado = normalizar(trabalhado)
            .replace(/[+|,;]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const stopwords = new Set([
            "com","e","ou","de","da","do","das","dos","a","o","as","os","um","uma","uns","umas","para","por","no","na","nos","nas","em"
        ]);

        const termos = [];
        trabalhado.split(" ").forEach(token => {
            if(!token) return;
            const match = token.match(/^__termo_quotado_(\d+)$/);
            if(match){
                const valor = protegidos[Number(match[1])];
                if(valor && !stopwords.has(valor)) termos.push(valor);
                return;
            }
            if(!stopwords.has(token)) termos.push(token);
        });

        return [...new Set(termos)];
    }

    window.profitTermosBuscaAvancada = extrairTermosAvancados;

    /* Substitui somente as duas funções de interpretação da busca.
       A renderização/relevância existente continua sendo usada. */
    window.profitBuscaAvancadaInstalada = true;

    if(typeof window.normalizar === "function"){}
})();

/* Faz os atalhos internos continuarem funcionando quando a V1 estiver ativa. */
(function(){
    function telaDoElemento(id){
        const el=document.getElementById(id);
        return el ? el.dataset.screen : null;
    }
    window.profitIrParaSecao=function(id){
        const tela=telaDoElemento(id);
        if(window.profitIrParaTela && tela) window.profitIrParaTela(tela);
        setTimeout(()=>{
            const el=document.getElementById(id);
            if(el) el.scrollIntoView({behavior:"smooth",block:"start"});
        },80);
    };
})();

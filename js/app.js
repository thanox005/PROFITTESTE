/* app.js — PROFIT 3.0 */


/* =========================================================
   STORAGE SEGURO — PROFIT 3.0
========================================================= */
function lerJSONStorage(chave,padrao){
    try{
        const bruto = localStorage.getItem(chave);
        if(bruto === null || bruto === "") return padrao;
        const valor = JSON.parse(bruto);
        return valor ?? padrao;
    }catch(e){
        console.warn("PROFIT: dado local inválido em", chave, e);
        return padrao;
    }
}

function salvarJSONStorage(chave,valor){
    try{
        localStorage.setItem(chave,JSON.stringify(valor));
        return true;
    }catch(e){
        console.warn("PROFIT: não foi possível salvar", chave, e);
        return false;
    }
}

/* =========================================================
   ESTADO
========================================================= */

let dataAtual = hoje();

let selecionado = null;

let nivelAtual = "Todos";


let historico =
    lerJSONStorage("nutri_historico",{});

let meta =
    Number(
        localStorage.getItem("nutri_meta") || 2000
    );

/* =========================================================
   ALIMENTOS PERSONALIZADOS
   A base original nunca é removida.
========================================================= */
let alimentosPersonalizados =
    lerJSONStorage("nutri_alimentos_personalizados",[]);

function salvarAlimentosPersonalizados(){
    salvarJSONStorage("nutri_alimentos_personalizados",alimentosPersonalizados);
}

function listaCompletaAlimentos(){
    return alimentos.concat(alimentosPersonalizados);
}



/* =========================================================
   UTILITÁRIOS
========================================================= */

function $(id){
    return document.getElementById(id);
}


function hoje(){

    const d = new Date();

    return (
        d.getFullYear() +
        "-" +
        String(d.getMonth()+1).padStart(2,"0") +
        "-" +
        String(d.getDate()).padStart(2,"0")
    );

}


function formatarData(data){

    if(!data) return "";

    const partes = data.split("-");

    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}


function normalizar(txt){

    return String(txt)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .toLowerCase();

}


function numero(n){

    return Number(n || 0)
        .toLocaleString("pt-BR",{
            maximumFractionDigits:1
        });

}


/* =========================================================
   NOVA REGRA DOS 5 NÍVEIS
========================================================= */

function getNivel(kcal){

    if(kcal <= 20){
        return 1;
    }

    if(kcal <= 60){
        return 2;
    }

    if(kcal <= 100){
        return 3;
    }

    if(kcal <= 200){
        return 4;
    }

    return 5;
}


/* =========================================================
   STORAGE
========================================================= */

function salvarStorage(){

    salvarJSONStorage("nutri_historico",historico);

}


function diario(){

    if(!historico[dataAtual]){
        historico[dataAtual] = [];
    }

    return historico[dataAtual];

}


/* =========================================================
   MENSAGENS MOTIVACIONAIS
========================================================= */

const mensagens = {

    vazio:[

        "Todo começo parece pequeno. Mas é assim que grandes mudanças começam. 🌱",

        "Você não precisa mudar tudo hoje. Só precisa dar o próximo passo. 💚",

        "Cuidar de você também é uma forma de disciplina. Comece pelo que consegue hoje.",

        "Não procure um dia perfeito. Procure um dia um pouco melhor que o anterior.",

        "Você está aqui tentando. E isso já significa que você não desistiu.",

        "Uma escolha melhor hoje já é uma vitória.",

        "Comece simples. Continue amanhã. Depois de amanhã também."

    ],

    progresso:[

        "Boa! Você está cuidando das suas escolhas. Continue no seu ritmo. 💪",

        "Olha só o que você já registrou hoje. Pequenas escolhas constroem grandes resultados.",

        "Disciplina não é nunca falhar. É continuar mesmo depois de falhar. 🔥",

        "Você não precisa ser perfeito. Precisa ser consistente.",

        "Mais uma escolha consciente. É exatamente assim que uma rotina muda.",

        "Você está construindo um hábito. Continue.",

        "Não subestime uma pequena decisão repetida todos os dias."

    ],

    perto:[

        "Você está chegando perto da sua meta. Continue com calma e consciência. 🎯",

        "Muito bem! O importante não é correr, é aprender a manter o caminho.",

        "Você está construindo consistência. Isso vale muito mais que um dia perfeito.",

        "Respira. Observe suas escolhas. Você está no controle.",

        "Você chegou até aqui. Continue mais um pouco.",

        "Seu esforço de hoje pode virar o hábito que muda seu amanhã."

    ],

    passou:[

        "Hoje passou da meta? Tudo bem. Um dia não define sua jornada. Amanhã você continua. 💚",

        "Não transforme um excesso em desistência. Errou? Aprenda, ajuste e siga.",

        "A disciplina também aparece depois da falha. O importante é voltar.",

        "Você não perdeu seu progresso por causa de uma refeição.",

        "Não existe botão de reset na vida. Existe o próximo passo.",

        "Uma refeição fora da meta não apaga todos os dias anteriores.",

        "Não use um erro como desculpa para abandonar seu objetivo.",

        "Falhar faz parte. Permanecer parado é que não precisa fazer."

    ]

};



/* Banco extra PROFIT 3.0: apoio real, redes sociais e humor leve. */
mensagens.vazio.push(
 "Seu plano não precisa ser perfeito. Precisa caber na sua vida. 🌱",
 "Comece pelo próximo passo, não pela cobrança de fazer tudo de uma vez.",
 "Você merece cuidado até nos dias em que a motivação tira folga. 💚",
 "Pequenos registros ajudam você a enxergar padrões sem depender da memória.",
 "Hoje é uma página nova. Não precisa transformar tudo antes do almoço.",
 "Autocuidado não é castigo com embalagem bonita. Vá com gentileza.",
 "Você não está atrasado: está construindo um jeito que funciona para você.",
 "Beba água, respire e faça o que estiver ao seu alcance. Um passo basta.",
 "Seu valor não é medido por uma balança nem por um número de calorias.",
 "A rotina ideal é aquela que você consegue repetir na vida real."
);
mensagens.progresso.push(
 "POV: você começou a se cuidar e dessa vez está indo no seu ritmo. ✨",
 "Plot twist: consistência vale mais que motivação de segunda-feira. 😅",
 "Você apareceu por você hoje. Isso merece reconhecimento. 🏆",
 "Não é sobre controlar cada detalhe; é sobre conhecer melhor seus hábitos.",
 "Seu eu do futuro mandou dizer: obrigado por não desistir hoje. 💚",
 "Um registro de cada vez. O algoritmo da sua vida também aprende por repetição.",
 "Você não precisa postar sua evolução para ela ser real. Mas se quiser, brilhe. ✨",
 "Meta acompanhada, dados anotados, autocuidado em andamento. Isso é progresso.",
 "A consistência não faz barulho todo dia. Às vezes só abre o aplicativo e registra.",
 "Você está montando um hábito, não participando de uma competição."
);
mensagens.perto.push(
 "Tá chegando! Sem sprint maluco: a vida é maratona, não trend de 15 segundos. 🏃",
 "Você está no caminho. Continue com calma, não com cobrança.",
 "Seu progresso não precisa de filtro. Só de tempo e cuidado. ✨",
 "A meta é uma referência, não uma nota sobre quem você é.",
 "Mais perto do plano, sem transformar comida em inimiga. 💚",
 "A vida real tem reunião, sono, fome e imprevistos. Seu plano precisa entender isso.",
 "Hoje você está fazendo a sua parte. O resto se constrói com tempo.",
 "A melhor evolução é aquela que não exige abandonar o bom senso.",
 "Você não precisa compensar ontem. Só cuidar do próximo passo.",
 "Seu ritmo pode ser diferente e ainda assim ser válido."
);
mensagens.passou.push(
 "A meta não é um juiz com martelo. Respira e segue. ⚖️😅",
 "Um dia fora da faixa não cancela o esforço que veio antes. Amanhã tem continuação.",
 "Não transforme uma refeição em uma temporada inteira de drama. 🍝😂",
 "Seu corpo não lê planilhas; use os números como guia, não como sentença.",
 "Sem punição, sem compensação radical. Só observe e retome sua rotina.",
 "Hoje a conta saiu diferente. Você continua sendo a mesma pessoa capaz de aprender.",
 "Plot twist: você não precisa recomeçar do zero. Só continuar de onde está. 🔁",
 "A vida aconteceu. Ajuste o plano com gentileza e siga em frente.",
 "Uma refeição não define sua saúde. O contexto e os hábitos ao longo do tempo importam.",
 "Respira: o aplicativo registra números, não mede seu valor. 💚"
);

function mensagemAleatoria(lista){

    return lista[
        Math.floor(
            Math.random() * lista.length
        )
    ];

}


function atualizarMensagem(){

    const total =
        diario().reduce(
            (s,item) =>
                s + Number(item.kcal || 0),
            0
        );

    let lista =
        mensagens.vazio;

    if(total === 0){

        lista =
            mensagens.vazio;

    }
    else if(total > meta){

        lista =
            mensagens.passou;

    }
    else if(total >= meta * .8){

        lista =
            mensagens.perto;

    }
    else{

        lista =
            mensagens.progresso;

    }

    const nome =
        $("nome").value.trim();

    let texto =
        mensagemAleatoria(lista);

    if(nome){

        texto =
            nome.split(" ")[0] +
            ", " +
            texto.charAt(0).toLowerCase() +
            texto.slice(1);

    }

    $("mensagemMotivacional")
        .textContent = texto;

}


/* =========================================================
   RENDER ALIMENTOS
========================================================= */

function termosDaBusca(texto){

    const bruto = String(texto || "").trim();

    if(!bruto) return [];

    /* Pesquisa avançada: AND entre todos os termos relevantes. */
    const citados = [];
    const marcador = "__termo_citado_";

    let consulta = bruto.replace(/[\"']([^\"']+)[\"']/g, (_,conteudo) => {
        const indice = citados.length;
        citados.push(normalizar(conteudo).trim());
        return " " + marcador + indice + " ";
    });

    consulta = normalizar(consulta)
        .replace(/[+|,;]+/g," ")
        .replace(/\s+/g," ")
        .trim();

    const conectores = new Set([
        "com","e","ou","de","da","do","das","dos",
        "a","o","as","os","um","uma","uns","umas",
        "para","por","no","na","nos","nas","em"
    ]);

    const termos = [];

    consulta.split(" ").forEach(token => {
        if(!token) return;

        const match = token.match(/^__termo_citado_(\d+)$/);
        const termo = match
            ? citados[Number(match[1])]
            : token;

        if(termo && !conectores.has(termo)){
            termos.push(termo);
        }
    });

    return [...new Set(termos)];
}

function nomeCombinaComBusca(nome, termos){
    if(!termos.length) return true;
    const nomeNormalizado = normalizar(nome);
    return termos.every(termo => nomeNormalizado.includes(termo));
}


function pontuacaoRelevanciaAlimento(nome, termos, consulta){
    const n = normalizar(nome);
    const q = normalizar(consulta);
    let pontos = 0;

    if(!termos.length) return 0;

    // Correspondência exata é a mais relevante.
    if(n === q) pontos += 10000;

    // Frase completa dentro do nome.
    if(n.includes(q)) pontos += 3500;
    if(n.startsWith(q)) pontos += 1800;

    const posicoes = [];

    termos.forEach((termo) => {
        const pos = n.indexOf(termo);

        if(pos !== -1){
            pontos += 700;
            posicoes.push(pos);

            if(pos === 0) pontos += 250;

            // Palavra inteira recebe um pequeno bônus.
            const escapado = termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            if(new RegExp("\\b" + escapado + "\\b").test(n)){
                pontos += 180;
            }
        }
    });

    // Quanto mais próximos os termos aparecem, maior a relevância.
    if(posicoes.length > 1){
        const distancia = Math.max(...posicoes) - Math.min(...posicoes);
        pontos += Math.max(0, 900 - distancia * 3);
    }

    // Nomes menores tendem a ser mais específicos quando o restante empata.
    pontos -= Math.min(250, n.length);

    return pontos;
}

function ordenarAlimentosPorRelevancia(lista, consulta){
    const termos = termosDaBusca(consulta);
    const consultaLimpa = termos.join(" ");

    if(!termos.length){
        return lista.slice().sort((a,b) => a.kcal - b.kcal);
    }

    return lista
        .map((item, indice) => ({
            item,
            indice,
            pontos: pontuacaoRelevanciaAlimento(
                item.name,
                termos,
                consultaLimpa
            )
        }))
        .sort((a,b) =>
            b.pontos - a.pontos ||
            a.item.kcal - b.item.kcal ||
            a.indice - b.indice
        )
        .map(item => item.item);
}

function renderAlimentos(){

    const busca =
        normalizar(
            $("busca").value
        );

    const termosBusca = termosDaBusca(busca);

    const lista =
        $("foodList");

    lista.innerHTML = "";

    let filtrados =
        listaCompletaAlimentos().filter(item => {

            const nomeOk =
                nomeCombinaComBusca(
                    item.name,
                    termosBusca
                );

            const nivel =
                getNivel(item.kcal);

            /* PATCH 4 — filtro por nível (calorias original + macros) */
            const nivelOk = nfNivelOk(item, nivel);

            return nomeOk && nivelOk;

        });

    filtrados =
        ordenarAlimentosPorRelevancia(
            filtrados,
            busca
        );

    if(!filtrados.length){

        lista.innerHTML =
            `
            <div class="empty">
                Nenhum alimento encontrado.
            </div>
            `;

        return;

    }

    filtrados.forEach(item => {

        const div =
            document.createElement("div");

        div.className =
            "food appear";

        div.innerHTML = `

            <div class="food-info">

                <div class="food-name">
                    ${item.name}
                    ${item.personalizado ? '<span class="custom-badge">MEU</span>' : ''}
                </div>

                <div class="food-meta">

                    <span class="food-cal">
                        ${numero(item.kcal)} kcal
                    </span>

                    por 100g •
                    ${numero(item.p)}g proteína

                </div>

            </div>

            <div class="food-buttons">
                <button
                    class="add-food"
                    title="Adicionar"
                    type="button"
                >
                    +
                </button>
                ${item.personalizado ? `
                    <button class="custom-food-edit" title="Editar alimento personalizado" type="button">✎</button>
                    <button class="custom-food-delete" title="Excluir alimento personalizado" type="button">×</button>
                ` : ""}
            </div>

        `;

        div
            .querySelector(".add-food")
            .onclick =
            () => selecionar(item);

        const apagarPersonalizado =
            div.querySelector(".custom-food-delete");

        if(apagarPersonalizado){
            apagarPersonalizado.onclick = event => {
                event.stopPropagation();

                const primeira = confirm(
                    "Excluir \"" + item.name + "\" da sua base personalizada?\n\nEssa ação não remove nenhum alimento original do PROFIT."
                );

                if(!primeira) return;

                const segunda = confirm(
                    "CONFIRMAÇÃO FINAL\n\nO alimento \"" + item.name + "\" será apagado da sua base personalizada.\n\nDeseja realmente continuar?"
                );

                if(!segunda) return;

                alimentosPersonalizados = alimentosPersonalizados.filter(
                    alimento => alimento.id !== item.id
                );

                salvarAlimentosPersonalizados();
                renderAlimentos();
                toast("Alimento personalizado removido.");
            };
        }

        const editarPersonalizado =
            div.querySelector(".custom-food-edit");

        if(editarPersonalizado){
            editarPersonalizado.onclick = event => {
                event.stopPropagation();
                abrirEdicaoAlimento(item.id);
            };
        }

        lista.appendChild(div);

    });

}


/* =========================================================
   NÍVEIS
========================================================= */

document
    .querySelectorAll(".level")
    .forEach(btn => {

        btn.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".level")
                    .forEach(b =>
                        b.classList
                         .remove("active")
                    );

                btn.classList
                    .add("active");

                nivelAtual =
                    btn.dataset.level;

                renderAlimentos();

            }
        );

    });


/* =========================================================
   SELECIONAR
========================================================= */

function atualizarPreviaCalorias(){

    const el = $("previaCalorias");

    if(!el) return;

    const peso = Number(
        String($("gramas").value || "").replace(",",".")
    );

    if(!selecionado || !Number.isFinite(peso) || peso <= 0){
        el.textContent = "Digite o peso para ver a prévia das calorias.";
        return;
    }

    const f = peso / 100;

    el.innerHTML =
        "🔥 <b>" + numero(selecionado.kcal * f) + " kcal</b> • " +
        numero(selecionado.p * f) + "g proteína • " +
        numero(selecionado.c * f) + "g carb. • " +
        numero(selecionado.g * f) + "g gord.";

}

$("gramas").addEventListener("input", atualizarPreviaCalorias);

function selecionar(item){

    selecionado =
        item;

    $("selected")
        .style.display =
        "block";

    $("selectedName")
        .textContent =
        item.name;

    $("selectedInfo")
        .textContent =
        numero(item.kcal) +
        " kcal • " +
        numero(item.p) +
        "g proteína • " +
        numero(item.c) +
        "g carboidratos • " +
        numero(item.g) +
        "g gordura / 100g";

    $("gramas").value =
        100;

    atualizarPreviaCalorias();

    $("gramas").focus();

    $("selected")
        .scrollIntoView({
            behavior:"smooth",
            block:"nearest"
        });

}


/* =========================================================
   CANCELAR
========================================================= */

$("cancelarBtn").onclick = () => {

    selecionado =
        null;

    $("selected")
        .style.display =
        "none";

};


/* =========================================================
   ADICIONAR
========================================================= */

$("adicionarBtn").onclick = () => {

    if(!selecionado){

        toast(
            "Escolha um alimento primeiro."
        );

        return;

    }

    const gramas =
        Number(
            $("gramas").value
        );

    if(!gramas || gramas <= 0){

        toast(
            "Informe uma quantidade válida."
        );

        return;

    }

    const fator =
        gramas / 100;

    const item = {

        id:
            Date.now() +
            Math.random(),

        alimento:
            selecionado.name,

        refeicao:
            $("refeicao").value,

        gramas:
            gramas,

        kcal:
            selecionado.kcal *
            fator,

        p:
            selecionado.p *
            fator,

        c:
            selecionado.c *
            fator,

        g:
            selecionado.g *
            fator

    };

    diario().push(item);

    salvarStorage();

    atualizarTudo();

    selecionado =
        null;

    $("selected")
        .style.display =
        "none";

    toast(
        "Alimento adicionado! 💚"
    );

};


/* =========================================================
   REMOVER
========================================================= */

function remover(id){

    const item = diario().find(
        registro => registro.id === id
    );

    if(!item)
        return;

    const confirmar = confirm(
        "Deseja realmente remover \"" +
        item.nome +
        "\" deste dia?\n\nEssa ação não poderá ser desfeita."
    );

    if(!confirmar)
        return;

    historico[dataAtual] =
        diario().filter(
            item =>
                item.id !== id
        );

    salvarStorage();

    atualizarTudo();

    toast(
        "Alimento removido."
    );

}


/* =========================================================
   REFEIÇÕES
========================================================= */

const refeicoes = {

    cafe:{
        nome:"☀️ Café da manhã"
    },

    almoco:{
        nome:"🍛 Almoço"
    },

    lanche:{
        nome:"🍎 Lanche"
    },

    lanche_manha:{
        nome:"🍎 Lanche da manhã"
    },

    lanche_tarde:{
        nome:"🥪 Lanche da tarde"
    },

    jantar:{
        nome:"🌙 Jantar"
    },

    lanche_noite:{
        nome:"🌜 Lanche da noite"
    },

    outros:{
        nome:"🍽️ Outros"
    }

};


/* =========================================================
   DIÁRIO
========================================================= */

let entradaEditandoItem = null;

function fatorPorGramaEntrada(item){

    const gramas = Number(item.gramas);

    if(gramas > 0){
        return {
            kcal:Number(item.kcal || 0) / gramas,
            p:Number(item.p || 0) / gramas,
            c:Number(item.c || 0) / gramas,
            g:Number(item.g || 0) / gramas
        };
    }

    const base = listaCompletaAlimentos().find(
        a => normalizar(a.name) === normalizar(item.alimento)
    );

    if(!base) return null;

    return {
        kcal:base.kcal / 100,
        p:base.p / 100,
        c:base.c / 100,
        g:base.g / 100
    };

}

function montarEdicaoEntrada(entry,item){

    entry.classList.add("entry-editing");

    entry.innerHTML = `
        <div>
            <div class="entry-name">${item.alimento}</div>
            <div class="entry-meta" data-previa></div>
            <div class="entry-edit-row">
                <input class="input" data-peso inputmode="decimal" min="1" step="any" type="number" value="${Number(item.gramas) || ""}" placeholder="Gramas">
                <button class="btn btn-green" data-ok type="button">Salvar</button>
                <button class="btn btn-light" data-cancelar type="button">Cancelar</button>
            </div>
        </div>
    `;

    const input = entry.querySelector("[data-peso]");
    const previa = entry.querySelector("[data-previa]");
    const fator = fatorPorGramaEntrada(item);

    function lerPeso(){
        return Number(String(input.value || "").replace(",","."));
    }

    function atualizarPrevia(){
        const peso = lerPeso();
        if(!fator || !Number.isFinite(peso) || peso <= 0){
            previa.textContent = "Digite o novo peso.";
            return;
        }
        previa.textContent =
            numero(peso) + "g • " +
            numero(fator.kcal * peso) + " kcal • " +
            numero(fator.p * peso) + "g proteína";
    }

    input.addEventListener("input", atualizarPrevia);

    input.addEventListener("keydown", event => {
        if(event.key === "Enter") entry.querySelector("[data-ok]").click();
        if(event.key === "Escape") entry.querySelector("[data-cancelar]").click();
    });

    entry.querySelector("[data-cancelar]").onclick = () => {
        entradaEditandoItem = null;
        renderDiario();
    };

    entry.querySelector("[data-ok]").onclick = () => {

        const peso = lerPeso();

        if(!fator){
            toast("Não foi possível recalcular este item.");
            return;
        }

        if(!Number.isFinite(peso) || peso <= 0){
            toast("Informe uma quantidade válida.");
            return;
        }

        item.gramas = peso;
        item.kcal = fator.kcal * peso;
        item.p = fator.p * peso;
        item.c = fator.c * peso;
        item.g = fator.g * peso;

        entradaEditandoItem = null;

        salvarStorage();
        atualizarTudo();

        toast("Peso atualizado! ✅");

    };

    atualizarPrevia();

    setTimeout(() => {
        input.focus();
        input.select();
    }, 30);

}

function renderDiario(){

    const container =
        $("diario");

    container.innerHTML =
        "";

    const itens =
        diario();

    if(!itens.length){

        container.innerHTML =
            `
            <div class="empty">

                Nenhum alimento registrado hoje.<br>

                Que tal começar com uma
                escolha simples? 🌱

            </div>
            `;

        return;

    }

    Object.keys(refeicoes)
        .forEach(tipo => {

            const lista =
                itens.filter(
                    item =>
                        item.refeicao ===
                        tipo
                );

            if(!lista.length)
                return;

            const bloco =
                document.createElement(
                    "div"
                );

            bloco.className =
                "meal-block appear";

            const total =
                lista.reduce(
                    (s,item) =>
                        s +
                        Number(
                            item.kcal
                        ),
                    0
                );

            bloco.innerHTML = `

                <div class="meal-title">

                    <span>
                        ${refeicoes[tipo].nome}
                    </span>

                    <span class="meal-total">
                        ${numero(total)} kcal
                    </span>

                </div>

            `;

            lista.forEach(item => {

                const entry =
                    document.createElement(
                        "div"
                    );

                entry.className =
                    "entry";

                if(entradaEditandoItem === item){
                    montarEdicaoEntrada(entry,item);
                    bloco.appendChild(entry);
                    return;
                }

                entry.innerHTML = `

                    <div>

                        <div class="entry-name">
                            ${item.alimento}
                        </div>

                        <div class="entry-meta">

                            ${numero(item.gramas)}g •
                            ${numero(item.kcal)} kcal •
                            ${numero(item.p)}g proteína

                        </div>

                    </div>

                    <div class="entry-actions">
                        <button type="button"
                            class="edit-entry"
                            title="Editar peso"
                        >
                            ✎
                        </button>
                        <button type="button"
                            class="remove"
                            title="Remover"
                        >
                            ×
                        </button>
                    </div>

                `;

                entry
                    .querySelector(".edit-entry")
                    .onclick =
                    () => {
                        entradaEditandoItem = item;
                        renderDiario();
                    };

                entry
                    .querySelector(".remove")
                    .onclick =
                    () =>
                        remover(item.id);

                bloco.appendChild(entry);

            });

            container.appendChild(
                bloco
            );

        });

}


/* =========================================================
   RESUMO
========================================================= */

function atualizarResumo(){

    const itens =
        diario();

    const totais =
        itens.reduce(
            (s,item) => {

                s.kcal +=
                    Number(
                        item.kcal || 0
                    );

                s.p +=
                    Number(
                        item.p || 0
                    );

                s.c +=
                    Number(
                        item.c || 0
                    );

                s.g +=
                    Number(
                        item.g || 0
                    );

                return s;

            },
            {
                kcal:0,
                p:0,
                c:0,
                g:0
            }
        );

    $("totalKcal")
        .textContent =
        numero(totais.kcal);

    $("totalP")
        .textContent =
        numero(totais.p);

    $("totalC")
        .textContent =
        numero(totais.c);

    $("totalG")
        .textContent =
        numero(totais.g);

    const porcentagem =
        Math.min(
            (
                totais.kcal /
                meta
            ) * 100,
            100
        );

    $("progressBar")
        .style.width =
        porcentagem + "%";

    $("goalUsed")
        .textContent =
        numero(totais.kcal) +
        " kcal consumidas";

    const restante =
        meta -
        totais.kcal;

    if(restante >= 0){

        $("goalRemain")
            .textContent =
            numero(restante) +
            " kcal restantes";

    }
    else{

        $("goalRemain")
            .textContent =
            numero(
                Math.abs(restante)
            ) +
            " kcal acima da meta";

    }

}


/* =========================================================
   HISTÓRICO
========================================================= */

function renderHistorico(){

    const container =
        $("historico");

    container.innerHTML =
        "";

    const datas =
        Object.keys(historico)
        .filter(
            data =>
                historico[data] &&
                historico[data].length
        )
        .sort(
            (a,b) =>
                b.localeCompare(a)
        );

    if(!datas.length){

        container.innerHTML =
            `
            <div class="empty">
                Seu histórico aparecerá aqui.
            </div>
            `;

        return;

    }

    datas.forEach(data => {

        const itens =
            historico[data];

        const kcal =
            itens.reduce(
                (s,item) =>
                    s +
                    Number(
                        item.kcal || 0
                    ),
                0
            );

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "history-item";

        div.innerHTML = `

            <div class="history-date">
                📅 ${formatarData(data)}
            </div>

            <div class="history-info">

                ${numero(kcal)} kcal<br>

                ${itens.length}
                alimento(s)

            </div>

        `;

        div.onclick = () => {

            dataAtual =
                data;

            $("data").value =
                dataAtual;

            atualizarTudo();

            window.scrollTo({
                top:0,
                behavior:"smooth"
            });

            toast(
                "Dia " +
                formatarData(data) +
                " carregado."
            );

        };

        container.appendChild(
            div
        );

    });

}


/* =========================================================
   TEMA / MODO NOTURNO E DIURNO
========================================================= */

function aplicarTema(){
    const tema = localStorage.getItem("nutri_tema") || "dark";
    const claro = tema === "light";

    // Aplicamos o tema no HTML e no BODY para garantir
    // funcionamento consistente em Chrome, Safari e iPhone.
    document.documentElement.classList.toggle("light", claro);
    document.body.classList.toggle("light", claro);
    document.documentElement.dataset.theme = tema;
    document.body.dataset.theme = tema;

    // Atualiza a cor da barra do navegador/Safari no celular.
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if(metaTheme){
        metaTheme.setAttribute("content", claro ? "#f8fafc" : "#0f172a");
    }

    // Ajuda os controles nativos do iOS/Android a acompanhar o tema.
    document.documentElement.style.colorScheme = claro ? "light" : "dark";

    if($("temaBtn")){
        $("temaBtn").textContent =
            claro ? "🌙" : "☀️";

        $("temaBtn").title =
            claro
            ? "Ativar modo noturno"
            : "Ativar modo diurno";
        $("temaBtn").setAttribute(
            "aria-label",
            claro ? "Ativar modo noturno" : "Ativar modo diurno"
        );
    }
}

if($("temaBtn")){
    $("temaBtn").addEventListener("click", () => {
        const atual = localStorage.getItem("nutri_tema") || "dark";
        localStorage.setItem(
            "nutri_tema",
            atual === "dark" ? "light" : "dark"
        );
        aplicarTema();
    });
}

aplicarTema();


/* =========================================================
   PESO
========================================================= */

let pesos =
    lerJSONStorage("nutri_pesos",{});

function salvarPesos(){
    salvarJSONStorage("nutri_pesos",pesos);
}

function pesoDaData(){
    const valor = pesos[dataAtual];

    $("peso").value =
        valor !== undefined ? valor : "";

    $("pesoStatus").textContent =
        valor !== undefined
        ? "Peso registrado nesta data: " + numero(valor) + " kg."
        : "Nenhum peso registrado nesta data.";
}

function salvarPeso(){
    let valor =
        String($("peso").value)
        .replace(",", ".");

    valor = Number(valor);

    if(!valor || valor <= 0){
        toast("Informe um peso válido.");
        return;
    }

    pesos[dataAtual] = valor;
    salvarPesos();
    atualizarResumoPeriodos();

    $("pesoStatus").textContent =
        "Peso registrado nesta data: " +
        numero(valor) +
        " kg.";

    toast("Peso salvo com sucesso! ⚖️");
}

if($("salvarPesoBtn")){
    $("salvarPesoBtn").onclick =
        salvarPeso;
}


/* =========================================================
   DATAS / RESUMOS SEMANAL E MENSAL
========================================================= */

function dataObj(data){
    const p = data.split("-").map(Number);
    return new Date(p[0], p[1]-1, p[2], 12);
}

function dataISO(obj){
    return (
        obj.getFullYear() +
        "-" +
        String(obj.getMonth()+1).padStart(2,"0") +
        "-" +
        String(obj.getDate()).padStart(2,"0")
    );
}

function diasDaSemana(data){
    const base = dataObj(data);
    const dia = base.getDay();
    const deslocamento =
        dia === 0 ? -6 : 1 - dia;

    base.setDate(
        base.getDate() + deslocamento
    );

    const dias = [];

    for(let i=0;i<7;i++){
        const d = new Date(base);
        d.setDate(base.getDate()+i);
        dias.push(dataISO(d));
    }

    return dias;
}

function totaisDosDias(datas){
    const registros = [];
    let kcal = 0;
    let p = 0;

    datas.forEach(data => {
        const itens =
            Array.isArray(historico[data])
            ? historico[data]
            : [];

        if(!itens.length)
            return;

        let diaKcal = 0;
        let diaP = 0;

        itens.forEach(item => {
            diaKcal += Number(item.kcal || 0);
            diaP += Number(item.p || 0);
        });

        kcal += diaKcal;
        p += diaP;

        registros.push({
            data,
            kcal:diaKcal,
            p:diaP
        });
    });

    return {
        kcal,
        p,
        registros,
        dias:registros.length
    };
}

function atualizarResumoPeriodos(){

    const semana =
        diasDaSemana(dataAtual);

    const sem =
        totaisDosDias(semana);

    $("semanaPeriodo").textContent =
        formatarData(semana[0]) +
        " — " +
        formatarData(semana[6]);

    $("semDias").textContent =
        sem.dias;

    $("semKcal").textContent =
        sem.dias
        ? numero(sem.kcal / sem.dias)
        : "0";

    $("semP").textContent =
        (sem.dias
        ? numero(sem.p / sem.dias)
        : "0") + " g";

    $("semTotalKcal").textContent =
        numero(sem.kcal);


    const prefixo =
        dataAtual.slice(0,7);

    const mesDatas =
        Object.keys(historico)
        .filter(data =>
            data.startsWith(prefixo) &&
            Array.isArray(historico[data]) &&
            historico[data].length
        );

    const mes =
        totaisDosDias(mesDatas);

    $("mesPeriodo").textContent =
        dataAtual.slice(5,7) +
        "/" +
        dataAtual.slice(0,4);

    $("mesDias").textContent =
        mes.dias;

    $("mesKcal").textContent =
        mes.dias
        ? numero(mes.kcal / mes.dias)
        : "0";

    $("mesP").textContent =
        (mes.dias
        ? numero(mes.p / mes.dias)
        : "0") + " g";

    $("mesTotalKcal").textContent =
        numero(mes.kcal);


    /* COMPARAÇÃO DE PESO */

    const pesosMes =
        Object.keys(pesos)
        .filter(data =>
            data.startsWith(prefixo) &&
            Number(pesos[data]) > 0
        )
        .sort();

    if(!pesosMes.length){

        $("pesoInicial").textContent = "—";
        $("pesoFinal").textContent = "—";

        $("pesoInicialData").textContent =
            "sem registro";

        $("pesoFinalData").textContent =
            "sem registro";

        $("pesoVariacao").textContent = "—";

        $("pesoMensagem").textContent =
            "Registre seu peso para acompanhar o mês.";

    }else{

        const primeira =
            pesosMes[0];

        const ultima =
            pesosMes[pesosMes.length-1];

        const pesoInicial =
            Number(pesos[primeira]);

        const pesoFinal =
            Number(pesos[ultima]);

        const variacao =
            pesoFinal - pesoInicial;

        $("pesoInicial").textContent =
            numero(pesoInicial) + " kg";

        $("pesoFinal").textContent =
            numero(pesoFinal) + " kg";

        $("pesoInicialData").textContent =
            formatarData(primeira);

        $("pesoFinalData").textContent =
            formatarData(ultima);

        if(pesosMes.length === 1){

            $("pesoVariacao").textContent =
                "—";

            $("pesoMensagem").textContent =
                "Apenas um registro neste mês. Adicione outro para comparar.";

        }else if(Math.abs(variacao) < 0.05){

            $("pesoVariacao").textContent =
                "0 kg";

            $("pesoMensagem").textContent =
                "Sem alteração entre o primeiro e o último registro.";

        }else{

            const sinal =
                variacao > 0 ? "+" : "";

            $("pesoVariacao").textContent =
                sinal +
                numero(variacao) +
                " kg";

            $("pesoMensagem").textContent =
                variacao > 0
                ? "Houve aumento entre os registros do mês."
                : "Houve redução entre os registros do mês.";
        }
    }

    pesoDaData();
}


/* =========================================================
   ATUALIZAÇÃO GERAL
========================================================= */

function atualizarTudo(){

    renderAlimentos();

    renderDiario();

    atualizarResumo();

    renderHistorico();

    atualizarMensagem();

    atualizarResumoPeriodos();

}


/* =========================================================
   DATA
========================================================= */

$("data").value =
    dataAtual;

$("data").addEventListener(
    "change",
    () => {

        dataAtual =
            $("data").value;

        atualizarTudo();

    }
);


/* =========================================================
   HOJE
========================================================= */

$("hojeBtn").onclick = () => {

    dataAtual =
        hoje();

    $("data").value =
        dataAtual;

    atualizarTudo();

    toast(
        "Você está olhando para hoje. ☀️"
    );

};


/* =========================================================
   NOME
========================================================= */

$("nome").value = localStorage.getItem("nutri_nome") || "";
if($("nome").value.trim()){
    if(!localStorage.getItem("nutri_perfil_id")){
        localStorage.setItem("nutri_perfil_id",gerarIdPerfil($("nome").value.trim()));
    }
    localStorage.setItem("nutri_perfil_nome_base",$("nome").value.trim());
}
atualizarPerfilUI();

$("nome").addEventListener(
    "input",
    () => {
        const nomeAtual = $("nome").value.trim();
        const nomeIdBase = localStorage.getItem("nutri_perfil_nome_base") || "";
        localStorage.setItem("nutri_nome",$("nome").value);

        if(nomeAtual){
            if(!localStorage.getItem("nutri_perfil_id") || nomeIdBase !== nomeAtual){
                localStorage.setItem("nutri_perfil_id",gerarIdPerfil(nomeAtual));
                localStorage.setItem("nutri_perfil_nome_base",nomeAtual);
            }
        }else{
            localStorage.removeItem("nutri_perfil_id");
            localStorage.removeItem("nutri_perfil_nome_base");
        }

        atualizarPerfilUI();
        atualizarMensagem();
    }
);


/* =========================================================
   META
========================================================= */

$("meta").value =
    meta;

if($("salvarMetaKcalBtn")) $("salvarMetaKcalBtn").onclick = () => {
    const valor = Number($("meta")?.value || 0);
    if(valor <= 0){ toast("Informe uma meta de kcal válida."); return; }
    meta = Math.round(valor);
    localStorage.setItem("nutri_meta",meta);
    atualizarTudo();
    toast("Meta de kcal salva. 🎯");
};


/* =========================================================
   BUSCA
========================================================= */

$("busca").addEventListener(
    "input",
    renderAlimentos
);


/* =========================================================
   ENTER NA BUSCA
========================================================= */

$("busca").addEventListener(
    "keydown",
    e => {

        if(e.key === "Enter"){

            const primeiro =
                $("foodList")
                .querySelector(
                    ".food"
                );

            if(primeiro){

                primeiro
                    .querySelector(
                        ".add-food"
                    )
                    .click();

            }

        }

    }
);


/* =========================================================
   SALVAR + LEMBRETE DE BACKUP
========================================================= */

$("salvarBtn").onclick = () => {

    salvarStorage();
    toast("Dia salvo com sucesso! 💾");

    // O salvamento continua normal; o backup só é criado com autorização.
    const hojeChave = new Date().getFullYear() + "-" +
        String(new Date().getMonth()+1).padStart(2,"0") + "-" +
        String(new Date().getDate()).padStart(2,"0");
    try { localStorage.setItem("profit_backup_prompted_" + hojeChave, "1"); } catch(e) {}

    setTimeout(() => {
        const desejaBackup = confirm(
            "💾 DIA SALVO COM SEGURANÇA\n\n" +
            "Quer exportar agora uma cópia de segurança dos seus dados do PROFIT?\n\n" +
            "O backup inclui histórico alimentar, perfil, metas, alimentos personalizados, evolução e conquistas.\n\n" +
            "Recomendamos guardar o arquivo JSON fora do navegador."
        );
        if(desejaBackup) exportarDados();
    }, 180);
};


/* =========================================================
   LIMPAR
========================================================= */

$("limparBtn").onclick = () => {

    if(!diario().length){

        toast(
            "Não há alimentos para apagar."
        );

        return;

    }

    const confirmar =
        confirm(
            "Deseja realmente limpar todos os alimentos deste dia?"
        );

    if(!confirmar)
        return;

    historico[dataAtual] =
        [];

    salvarStorage();

    atualizarTudo();

    toast(
        "Dia limpo. Amanhã é uma nova oportunidade. 💚"
    );

};


/* =========================================================
   TOAST
========================================================= */

let toastTimer;

function toast(texto){

    const el =
        $("toast");

    el.textContent =
        texto;

    el.classList.add(
        "show"
    );

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            () => {

                el.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* =========================================================
   HOME / TOPO
========================================================= */

if($("homeBtn")){
    $("homeBtn").onclick = () => {
        if(window.profitIrParaTela){
            window.profitIrParaTela("home");
        }else{
            window.scrollTo({top:0,behavior:"smooth"});
        }
    };
}


/* =========================================================
   EXPORTAR / IMPORTAR BACKUP JSON
========================================================= */

function exportarDados(){

    const dados = {};

    for(let i=0;i<localStorage.length;i++){

        const chave =
            localStorage.key(i);

        // PROFIT usa chaves nutri_ (dados históricos) e profit_ (módulos recentes).
        // Incluímos ambas para não deixar perfil, medidas ou conquistas de fora.
        if(chave && !chave.startsWith("profit_backup_prompted_") &&
           (chave.startsWith("nutri_") || chave.startsWith("profit_"))){
            dados[chave] = localStorage.getItem(chave);
        }
    }

    const backup = {
        app:"PROFIT",
        formato:"JSON",
        versao:3,
        exportadoEm:new Date().toISOString(),
        dados:dados
    };

    const blob = new Blob(
        [JSON.stringify(backup,null,2)],
        {type:"application/json;charset=utf-8"}
    );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    const agora =
        new Date();

    const nomeArquivo =
        "PROFIT_Backup_" +
        agora.getFullYear() + "-" +
        String(agora.getMonth()+1).padStart(2,"0") + "-" +
        String(agora.getDate()).padStart(2,"0") +
        ".json";

    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(
        () => URL.revokeObjectURL(url),
        1000
    );

    toast("Backup do PROFIT exportado com sucesso! 📦");
}

window.exportarDados = exportarDados;

function importarDados(arquivo){

    if(!arquivo)
        return;

    const leitor =
        new FileReader();

    leitor.onload = event => {

        try{

            const backup =
                JSON.parse(event.target.result);

            if(
                !backup ||
                ![ "PROFIT", "NutriTrack" ].includes(backup.app) ||
                !backup.dados ||
                typeof backup.dados !== "object"
            ){
                throw new Error("Arquivo inválido.");
            }

            const confirmar = confirm(
                "ATENÇÃO!\n\n" +
                "A importação substituirá os dados atuais do PROFIT pelos dados do backup.\n\n" +
                "Deseja continuar?"
            );

            if(!confirmar)
                return;

            const confirmarFinal = confirm(
                "Última confirmação.\n\n" +
                "Os dados atuais serão substituídos.\n" +
                "Recomenda-se exportar um backup antes de continuar.\n\n" +
                "Continuar a importação?"
            );

            if(!confirmarFinal)
                return;

            const chavesAtuais = [];

            for(let i=0;i<localStorage.length;i++){
                const chave = localStorage.key(i);
                if(chave && (chave.startsWith("nutri_") || chave.startsWith("profit_"))){
                    chavesAtuais.push(chave);
                }
            }

            chavesAtuais.forEach(
                chave => localStorage.removeItem(chave)
            );

            Object.keys(backup.dados).forEach(chave => {

                if(!chave.startsWith("nutri_") && !chave.startsWith("profit_"))
                    return;

                const valor = backup.dados[chave];

                if(typeof valor === "string"){
                    localStorage.setItem(chave,valor);
                }else{
                    localStorage.setItem(
                        chave,
                        JSON.stringify(valor)
                    );
                }
            });

            toast("Dados importados! O PROFIT será atualizado.");

            setTimeout(
                () => location.reload(),
                700
            );

        }catch(erro){

            toast("Não foi possível importar este JSON.");
            console.error(erro);
        }
    };

    leitor.onerror = () => {
        toast("Erro ao ler o arquivo de backup.");
    };

    leitor.readAsText(arquivo,"UTF-8");
}

if($("exportarBtn")){
    $("exportarBtn").onclick =
        exportarDados;
}

if($("importarBtn") && $("arquivoImportacao")){

    $("importarBtn").onclick = () => {
        $("arquivoImportacao").click();
    };

    $("arquivoImportacao").addEventListener(
        "change",
        event => {
            const arquivo =
                event.target.files[0];

            importarDados(arquivo);

            event.target.value = "";
        }
    );
}



/* =========================================================
   RESUMO PARA COMPARTILHAR / IA
========================================================= */

let modoResumoCompartilhamento = "dia";
let ultimoResumoCompartilhamento = "";

function totaisDeItens(itens){
    return (itens || []).reduce(
        (s,item) => {
            s.kcal += Number(item.kcal || 0);
            s.p += Number(item.p || 0);
            s.c += Number(item.c || 0);
            s.g += Number(item.g || 0);
            return s;
        },
        {kcal:0,p:0,c:0,g:0}
    );
}

function dataEntre(inicio,fim){
    const datas = [];
    let atual = dataObj(inicio);
    const final = dataObj(fim);

    while(atual <= final){
        datas.push(dataISO(atual));
        atual.setDate(atual.getDate()+1);
    }

    return datas;
}

function formatarDataCurta(data){
    if(!data) return "";
    const p = data.split("-");
    return p[2] + "/" + p[1];
}

function montarResumoDia(data){
    const itens =
        Array.isArray(historico[data])
        ? historico[data]
        : [];

    const totais = totaisDeItens(itens);
    const nome = ($("nome")?.value || "").trim();
    const peso = pesos[data];

    let texto =
        "PROFIT 3.0 — RESUMO DIÁRIO\n" +
        "📅 " + formatarData(data) + "\n";

    if(nome)
        texto += "👤 " + nome + "\n";

    if(peso !== undefined)
        texto += "⚖️ Peso: " + numero(peso) + " kg\n";

    texto +=
        "\n🔥 CALORIAS\n" +
        "Consumidas: " + numero(totais.kcal) + " kcal\n" +
        "Meta: " + numero(meta) + " kcal\n" +
        (totais.kcal <= meta
            ? "Restante: " + numero(meta - totais.kcal) + " kcal\n"
            : "Acima da meta: " + numero(totais.kcal - meta) + " kcal\n") +
        "\n🥩 PROTEÍNAS\n" +
        numero(totais.p) + " g\n" +
        "\n🍚 CARBOIDRATOS\n" +
        numero(totais.c) + " g\n" +
        "\n🥑 GORDURAS\n" +
        numero(totais.g) + " g\n" +
        "\n🍽️ ALIMENTOS\n";

    if(!itens.length){
        texto += "Nenhum alimento registrado.\n";
    }else{
        itens.forEach(item => {
            texto +=
                "• " + item.alimento +
                " — " + numero(item.gramas) + "g — " +
                numero(item.kcal) + " kcal — " +
                numero(item.p) + "g proteína\n";
        });
    }

    texto += "\nGerado pelo PROFIT 3.0.";
    return texto;
}

function montarResumoPeriodo(inicio,fim){
    const datas = dataEntre(inicio,fim);
    const diasRegistrados = [];
    let total = {kcal:0,p:0,c:0,g:0};
    let metaAcumulada = 0;

    datas.forEach(data => {
        const itens =
            Array.isArray(historico[data])
            ? historico[data]
            : [];

        if(!itens.length)
            return;

        const t = totaisDeItens(itens);

        total.kcal += t.kcal;
        total.p += t.p;
        total.c += t.c;
        total.g += t.g;
        metaAcumulada += meta;

        diasRegistrados.push({
            data,
            itens,
            totais:t
        });
    });

    const dias = diasRegistrados.length;
    let texto =
        "PROFIT 3.0 — RESUMO DO PERÍODO\n" +
        "📅 " + formatarData(inicio) +
        " → " + formatarData(fim) + "\n";

    const nome = ($("nome")?.value || "").trim();

    if(nome)
        texto += "👤 " + nome + "\n";

    texto +=
        "\n📊 RESUMO GERAL\n" +
        "Dias registrados: " + dias + " de " + datas.length + "\n" +
        "Calorias totais: " + numero(total.kcal) + " kcal\n" +
        "Média diária: " + (dias ? numero(total.kcal / dias) : "0") + " kcal\n" +
        "Proteínas totais: " + numero(total.p) + " g\n" +
        "Proteína média: " + (dias ? numero(total.p / dias) : "0") + " g/dia\n" +
        "Carboidratos totais: " + numero(total.c) + " g\n" +
        "Gorduras totais: " + numero(total.g) + " g\n" +
        "Meta acumulada dos dias registrados: " + numero(metaAcumulada) + " kcal\n";

    const dentroMeta =
        diasRegistrados.filter(d => d.totais.kcal <= meta).length;

    texto +=
        "Dias dentro da meta: " + dentroMeta + "/" + dias + "\n" +
        "Dias acima da meta: " + (dias - dentroMeta) + "/" + dias + "\n";

    const pesosPeriodo =
        Object.keys(pesos)
        .filter(data =>
            data >= inicio &&
            data <= fim &&
            Number(pesos[data]) > 0
        )
        .sort();

    if(pesosPeriodo.length){
        const primeiro = Number(pesos[pesosPeriodo[0]]);
        const ultimo = Number(pesos[pesosPeriodo[pesosPeriodo.length-1]]);
        const variacao = ultimo - primeiro;

        texto +=
            "\n⚖️ PESO\n" +
            "Inicial: " + numero(primeiro) + " kg (" + formatarData(pesosPeriodo[0]) + ")\n" +
            "Final: " + numero(ultimo) + " kg (" + formatarData(pesosPeriodo[pesosPeriodo.length-1]) + ")\n" +
            "Variação: " + (variacao > 0 ? "+" : "") + numero(variacao) + " kg\n";
    }

    texto += "\n📅 RESUMO DIÁRIO\n";

    if(!diasRegistrados.length){
        texto += "Nenhum dia com alimentação registrada neste período.\n";
    }else{
        diasRegistrados.forEach(dia => {
            texto +=
                "\n" + formatarData(dia.data) +
                " — " + numero(dia.totais.kcal) + " kcal — " +
                numero(dia.totais.p) + " g proteína\n";

            dia.itens.forEach(item => {
                texto +=
                    "• " + item.alimento +
                    " — " + numero(item.gramas) + "g — " +
                    numero(item.kcal) + " kcal — " +
                    numero(item.p) + "g proteína\n";
            });
        });
    }

    texto += "\nGerado pelo PROFIT 3.0.";
    return texto;
}

function gerarResumoCompartilhamento(){
    let texto = "";

    if(modoResumoCompartilhamento === "dia"){
        texto = montarResumoDia(dataAtual);
    }else{
        const inicio = $("resumoDataInicio").value;
        const fim = $("resumoDataFim").value;

        if(!inicio || !fim){
            toast("Escolha a data inicial e a data final.");
            return "";
        }

        if(inicio > fim){
            toast("A data inicial não pode ser maior que a final.");
            return "";
        }

        texto = montarResumoPeriodo(inicio,fim);
    }

    ultimoResumoCompartilhamento = texto;

    $("resumoOutput").value = texto;
    $("resumoPreview").classList.add("show");

    return texto;
}

async function copiarResumoCompartilhamento(){
    const texto =
        ultimoResumoCompartilhamento ||
        gerarResumoCompartilhamento();

    if(!texto)
        return;

    try{
        await navigator.clipboard.writeText(texto);
        toast("Resumo copiado! 📋");
    }catch(erro){
        const campo = $("resumoOutput");
        campo.focus();
        campo.select();

        try{
            document.execCommand("copy");
            toast("Resumo copiado! 📋");
        }catch(e){
            toast("Selecione o texto e copie manualmente.");
        }
    }
}

async function compartilharResumoCompartilhamento(){
    const texto =
        ultimoResumoCompartilhamento ||
        gerarResumoCompartilhamento();

    if(!texto)
        return;

    if(navigator.share){
        try{
            await navigator.share({
                title:"Resumo PROFIT 3.0",
                text:texto
            });
            return;
        }catch(erro){
            if(erro && erro.name === "AbortError")
                return;
        }
    }

    await copiarResumoCompartilhamento();
    toast("Seu aparelho não oferece compartilhamento direto. O resumo foi copiado.");
}

function atualizarModoResumoUI(){
    const dia = $("resumoDiaBtn");
    const periodo = $("resumoPeriodoBtn");
    const campos = $("periodoResumoCampos");

    if(dia) dia.classList.toggle("active",modoResumoCompartilhamento === "dia");
    if(periodo) periodo.classList.toggle("active",modoResumoCompartilhamento === "periodo");

    if(campos)
        campos.style.display =
            modoResumoCompartilhamento === "periodo"
            ? "block"
            : "none";

    if(modoResumoCompartilhamento === "periodo"){
        if(!$("resumoDataInicio").value)
            $("resumoDataInicio").value = dataAtual;

        if(!$("resumoDataFim").value)
            $("resumoDataFim").value = dataAtual;
    }

    ultimoResumoCompartilhamento = "";
    if($("resumoPreview"))
        $("resumoPreview").classList.remove("show");
}

if($("resumoDiaBtn")){
    $("resumoDiaBtn").onclick = () => {
        modoResumoCompartilhamento = "dia";
        atualizarModoResumoUI();
    };
}

if($("resumoPeriodoBtn")){
    $("resumoPeriodoBtn").onclick = () => {
        modoResumoCompartilhamento = "periodo";
        atualizarModoResumoUI();
    };
}

if($("gerarResumoBtn")){
    $("gerarResumoBtn").onclick =
        gerarResumoCompartilhamento;
}

if($("copiarResumoBtn")){
    $("copiarResumoBtn").onclick =
        copiarResumoCompartilhamento;
}

if($("compartilharResumoBtn")){
    $("compartilharResumoBtn").onclick =
        compartilharResumoCompartilhamento;
}

atualizarModoResumoUI();


/* =========================================================
   ADICIONAR ALIMENTO PERSONALIZADO
========================================================= */

let alimentoEditandoId = null;

function abrirEdicaoAlimento(id){

    const alvo = alimentosPersonalizados.find(a => a.id === id);

    if(!alvo) return;

    alimentoEditandoId = id;

    $("novoAlimentoNome").value = alvo.name;
    $("novoAlimentoKcal").value = alvo.kcal;
    $("novoAlimentoProteina").value = alvo.p;
    $("novoAlimentoCarbo").value = alvo.c;
    $("novoAlimentoGordura").value = alvo.g;

    $("modalAlimentoTitulo").textContent = "✏️ Editar alimento";
    $("salvarNovoAlimentoBtn").textContent = "💾 Salvar alterações";

    abrirModalAlimento();

}

function abrirModalAlimento(){
    const modal = $("alimentoModal");
    if(!modal) return;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden","false");
    setTimeout(() => $("novoAlimentoNome").focus(), 80);
}

function fecharModalAlimento(){
    const modal = $("alimentoModal");
    if(!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden","true");

    alimentoEditandoId = null;
    if($("modalAlimentoTitulo")) $("modalAlimentoTitulo").textContent = "🥗 Novo alimento";
    if($("salvarNovoAlimentoBtn")) $("salvarNovoAlimentoBtn").textContent = "💾 Salvar alimento";
}

function limparFormularioNovoAlimento(){
    [
        "novoAlimentoNome",
        "novoAlimentoKcal",
        "novoAlimentoProteina",
        "novoAlimentoCarbo",
        "novoAlimentoGordura"
    ].forEach(id => {
        if($(id)) $(id).value = "";
    });
}

function numeroFormulario(id){
    const valor = String($(id).value || "").replace(",",".").trim();
    return valor === "" ? 0 : Number(valor);
}

function salvarNovoAlimento(){

    const nome = $("novoAlimentoNome").value.trim();
    const kcal = numeroFormulario("novoAlimentoKcal");
    const p = numeroFormulario("novoAlimentoProteina");
    const c = numeroFormulario("novoAlimentoCarbo");
    const g = numeroFormulario("novoAlimentoGordura");

    if(!nome){
        toast("Informe o nome do alimento.");
        $("novoAlimentoNome").focus();
        return;
    }

    if(!Number.isFinite(kcal) || kcal < 0){
        toast("Informe uma caloria válida.");
        return;
    }

    if(!Number.isFinite(p) || p < 0){
        toast("Informe uma proteína válida.");
        return;
    }

    if(!Number.isFinite(c) || c < 0 || !Number.isFinite(g) || g < 0){
        toast("Revise carboidratos e gorduras.");
        return;
    }

    const existe = listaCompletaAlimentos().some(
        alimento =>
            alimento.id !== alimentoEditandoId &&
            normalizar(alimento.name) === normalizar(nome)
    );

    if(existe){
        toast("Esse alimento já existe na base.");
        return;
    }

    if(alimentoEditandoId){

        const alvo = alimentosPersonalizados.find(
            a => a.id === alimentoEditandoId
        );

        if(alvo){

            alvo.name = nome;
            alvo.kcal = kcal;
            alvo.p = p;
            alvo.c = c;
            alvo.g = g;

            salvarAlimentosPersonalizados();

            if(selecionado && selecionado.id === alvo.id){
                selecionado = null;
                $("selected").style.display = "none";
            }

            limparFormularioNovoAlimento();
            fecharModalAlimento();
            renderAlimentos();
            toast("Alimento atualizado! ✅");
            return;

        }

    }

    const novo = {
        id:"custom_" + Date.now() + "_" + Math.random().toString(36).slice(2,8),
        name:nome,
        kcal:kcal,
        p:p,
        c:c,
        g:g,
        personalizado:true
    };

    alimentosPersonalizados.push(novo);
    salvarAlimentosPersonalizados();
    limparFormularioNovoAlimento();
    fecharModalAlimento();
    renderAlimentos();
    toast("Alimento salvo na sua base! 🥗");

}

if($("abrirAdicionarAlimentoBtn")){
    $("abrirAdicionarAlimentoBtn").onclick = abrirModalAlimento;
}

if($("fecharAlimentoModalBtn")){
    $("fecharAlimentoModalBtn").onclick = fecharModalAlimento;
}

if($("cancelarNovoAlimentoBtn")){
    $("cancelarNovoAlimentoBtn").onclick = () => {
        limparFormularioNovoAlimento();
        fecharModalAlimento();
    };
}

if($("salvarNovoAlimentoBtn")){
    $("salvarNovoAlimentoBtn").onclick = salvarNovoAlimento;
}

if($("alimentoModal")){
    $("alimentoModal").addEventListener("click", event => {
        if(event.target === $("alimentoModal")){
            fecharModalAlimento();
        }
    });
}

document.addEventListener("keydown", event => {
    if(event.key !== "Escape") return;
    if($("alimentoModal")?.classList.contains("show")){
        fecharModalAlimento();
    }
    if($("perfilModal")?.classList.contains("show")){
        fecharPerfil();
    }
});



/* =========================================================
   PROFIT 3.0 — PERFIL LOCAL
========================================================= */
function gerarIdPerfil(nome){
    const texto = normalizar(String(nome || "").trim()) || "usuario";
    let hash = 2166136261;
    for(let i=0;i<texto.length;i++){
        hash ^= texto.charCodeAt(i);
        hash = Math.imul(hash,16777619);
    }
    hash >>>= 0;
    return "FP-" + String(hash % 1000000).padStart(6,"0");
}

function perfilAtual(){
    const nome = (localStorage.getItem("nutri_nome") || "").trim();
    const id = localStorage.getItem("nutri_perfil_id") || (nome ? gerarIdPerfil(nome) : "");
    if(nome && !localStorage.getItem("nutri_perfil_id")){
        localStorage.setItem("nutri_perfil_id",id);
    }
    return {nome,id};
}

function atualizarPerfilUI(){
    const perfil = perfilAtual();
    const nome = perfil.nome || "Usuário PROFIT";
    const inicial = normalizar(nome).replace(/[^a-z0-9]/g,"").charAt(0).toUpperCase() || "?";

    if($("perfilAvatar")) $("perfilAvatar").textContent = inicial;
    if($("perfilNomeMini")) $("perfilNomeMini").textContent = nome;
    if($("perfilIdMini")) $("perfilIdMini").textContent = "ID: " + (perfil.id || "—");
    if($("perfilNomeInput")) $("perfilNomeInput").value = perfil.nome;
    if($("perfilIdBig")) $("perfilIdBig").textContent = perfil.id || "FP-000000";
}

function salvarPerfil(nome){
    nome = String(nome || "").trim();

    if(!nome){
        toast("Informe um nome para criar o perfil.");
        return false;
    }

    const idAnterior = localStorage.getItem("nutri_perfil_id");
    const idNovo = idAnterior && localStorage.getItem("nutri_nome") === nome
        ? idAnterior
        : gerarIdPerfil(nome);

    localStorage.setItem("nutri_nome",nome);
    localStorage.setItem("nutri_perfil_id",idNovo);
    localStorage.setItem("nutri_perfil_nome_base",nome);

    $("nome").value = nome;
    atualizarPerfilUI();
    atualizarMensagem();
    toast("Perfil salvo! 👤 " + idNovo);
    return true;
}

function abrirPerfil(){
    atualizarPerfilUI();
    const modal = $("perfilModal");
    if(!modal) return;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden","false");
    setTimeout(() => $("perfilNomeInput")?.focus(),80);
}

function fecharPerfil(){
    const modal = $("perfilModal");
    if(!modal) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden","true");
}

function sairPerfil(){
    const nomeAtual = (localStorage.getItem("nutri_nome") || "").trim();
    if(nomeAtual && !confirm("Sair do perfil \"" + nomeAtual + "\"? Seus dados locais não serão apagados.")) return;

    localStorage.removeItem("nutri_nome");
    localStorage.removeItem("nutri_perfil_id");
    localStorage.removeItem("nutri_perfil_nome_base");
    $("nome").value = "";
    atualizarPerfilUI();
    atualizarMensagem();
    fecharPerfil();
    toast("Perfil encerrado. Os dados do dispositivo continuam salvos.");
    setTimeout(() => abrirPerfil(),250);
}

if($("perfilBtn")) $("perfilBtn").onclick = abrirPerfil;
if($("sairBtn")) $("sairBtn").onclick = sairPerfil;
if($("fecharPerfilModalBtn")) $("fecharPerfilModalBtn").onclick = fecharPerfil;
if($("salvarPerfilBtn")) $("salvarPerfilBtn").onclick = () => {
    if(salvarPerfil($("perfilNomeInput").value)) fecharPerfil();
};
if($("sairPerfilModalBtn")) $("sairPerfilModalBtn").onclick = sairPerfil;
if($("perfilModal")){
    $("perfilModal").addEventListener("click",e => {
        if(e.target === $("perfilModal")) fecharPerfil();
    });
}

/* =========================================================
   PROFIT 3.0 — ÁGUA
========================================================= */
let agua = lerJSONStorage("nutri_agua",{});
let metaAgua = Number(localStorage.getItem("nutri_meta_agua") || 2);

function aguaDoDia(){
    const valor = Number(agua[dataAtual] || 0);
    return Number.isFinite(valor) ? Math.max(0,valor) : 0;
}

function salvarAgua(){
    salvarJSONStorage("nutri_agua",agua);
}

function renderAgua(){
    const total = aguaDoDia();
    const metaMl = Math.max(500,Math.round(metaAgua * 1000));
    const copos = Math.max(1,Math.ceil(metaMl / 250));
    const cheios = Math.min(copos,Math.floor(total / 250));

    const container = $("waterGlasses");
    if(container){
        container.innerHTML = "";
        for(let i=0;i<Math.min(copos,24);i++){
            const div = document.createElement("div");
            div.className = "water-glass" + (i < cheios ? " filled" : "");
            div.textContent = i < cheios ? "💧" : "○";
            container.appendChild(div);
        }
    }

    if($("waterStatus")){
        $("waterStatus").textContent =
            numero(total/1000) + " / " + numero(metaAgua) + " L";
    }
    if($("waterGoalInput") && document.activeElement !== $("waterGoalInput")){
        $("waterGoalInput").value = metaAgua;
    }
}

function adicionarAgua(delta){
    agua[dataAtual] = Math.max(0,aguaDoDia()+delta);
    salvarAgua();
    renderAgua();
    atualizarGamificacao();
    if(aguaDoDia() >= metaAgua*1000 && aguaDoDia()-delta < metaAgua*1000){
        toast("Meta de água concluída! 💧 +30 XP");
    }
}

if($("addWaterBtn")) $("addWaterBtn").onclick = () => adicionarAgua(250);
if($("removeWaterBtn")) $("removeWaterBtn").onclick = () => adicionarAgua(-250);
if($("saveWaterGoalBtn")) $("saveWaterGoalBtn").onclick = () => {
    const valor = Number(String($("waterGoalInput").value || "").replace(",","."));
    if(!Number.isFinite(valor) || valor < 0.5){
        toast("Informe uma meta de água de pelo menos 0,5 L.");
        return;
    }
    metaAgua = valor;
    localStorage.setItem("nutri_meta_agua",metaAgua);
    renderAgua();
    atualizarGamificacao();
    toast("Meta de água atualizada! 💧");
};

/* =========================================================
   PROFIT 3.0 — XP / STREAK / MISSÕES / CONQUISTAS
========================================================= */
function diasRegistrados(){
    return Object.keys(historico)
        .filter(d => Array.isArray(historico[d]) && historico[d].length)
        .sort();
}

function calcularStreak(){
    let data = dataObj(dataAtual);
    let streak = 0;

    while(true){
        const iso = dataISO(data);
        const itens = Array.isArray(historico[iso]) ? historico[iso] : [];
        if(!itens.length) break;
        streak++;
        data.setDate(data.getDate()-1);
    }
    return streak;
}

function calcularXP(){
    let xp = 0;
    const dias = diasRegistrados();

    xp += dias.length * 40;
    xp += Math.min(500, Object.values(agua).reduce((s,v)=>s+Math.max(0,Number(v)||0)/250,0) * 3);

    dias.forEach(d => {
        const itens = historico[d] || [];
        xp += Math.min(30,itens.length*5);
        const kcal = itens.reduce((s,i)=>s+Number(i.kcal||0),0);
        if(kcal > 0 && kcal <= meta) xp += 20;
    });

    xp += calcularStreak() * 10;
    if(aguaDoDia() >= metaAgua*1000) xp += 30;

    return Math.floor(xp);
}

function atualizarGamificacao(){
    const streak = calcularStreak();
    const xp = calcularXP();
    const nivel = Math.max(1,Math.floor(xp/100)+1);
    const dentro = xp % 100;
    const proximo = 100;

    if($("streakValue")) $("streakValue").textContent = streak + (streak===1 ? " dia" : " dias");
    if($("streakSub")) $("streakSub").textContent = streak ? "Continue amanhã para manter a sequência." : "Comece registrando hoje.";
    if($("nivelValue")) $("nivelValue").textContent = nivel;
    if($("nivelSub")) $("nivelSub").textContent = xp + " XP acumulados";
    if($("xpNumbers")) $("xpNumbers").textContent = dentro + " / " + proximo + " XP";
    if($("xpFill")) $("xpFill").style.width = dentro + "%";

    renderMissoes(streak);
    renderConquistas(streak,xp);
    renderAnaliseInteligente(streak);
}

function montarMissoes(streak){
    const itens = diario();
    const total = itens.reduce((s,i)=>s+Number(i.kcal||0),0);
    const aguaOk = aguaDoDia() >= metaAgua*1000;
    return [
        {texto:"Registrar pelo menos 1 alimento",done:itens.length>0,xp:20},
        {texto:"Registrar 3 ou mais alimentos",done:itens.length>=3,xp:30},
        {texto:"Ficar dentro da meta de calorias",done:total>0 && total<=meta,xp:40},
        {texto:"Completar a meta de água",done:aguaOk,xp:30},
        {texto:"Manter a sequência ativa",done:streak>0,xp:20}
    ];
}

function renderMissoes(streak){
    const lista = montarMissoes(streak);
    const el = $("missionList");
    if(!el) return;
    el.innerHTML = "";
    let totalXp = 0;

    lista.forEach(m => {
        if(m.done) totalXp += m.xp;
        const row = document.createElement("div");
        row.className = "mission" + (m.done ? " done" : "");
        row.innerHTML =
            '<div class="mission-check">' + (m.done ? "✓" : "○") + '</div>' +
            '<div class="mission-text">' + m.texto + '</div>' +
            '<div class="mission-xp">+' + m.xp + ' XP</div>';
        el.appendChild(row);
    });

    if($("missionXp")) $("missionXp").textContent = "+" + totalXp + " XP";
}

function renderConquistas(streak,xp){
    const dias = diasRegistrados().length;
    const conquistas = [
        ["🌱","Primeiro registro","Registrar sua primeira refeição",dias>=1],
        ["🔥","7 dias","Manter 7 dias de registros",streak>=7],
        ["💧","Hidratação","Completar a meta de água",aguaDoDia()>=metaAgua*1000],
        ["🥗","50 refeições","Registrar 50 alimentos",Object.values(historico).flat().length>=50],
        ["⚖️","Primeiro peso","Registrar o primeiro peso",Object.keys(pesos).length>=1],
        ["⭐","1.000 XP","Alcançar 1.000 XP",xp>=1000]
    ];
    const el = $("achievementGrid");
    if(!el) return;
    el.innerHTML = "";
    let desbloqueadas = 0;

    conquistas.forEach(c => {
        if(c[3]) desbloqueadas++;
        const div = document.createElement("div");
        div.className = "achievement" + (c[3] ? " unlocked" : "");
        div.innerHTML =
            '<div class="achievement-icon">' + c[0] + '</div>' +
            '<div class="achievement-title">' + c[1] + '</div>' +
            '<div class="achievement-sub">' + c[2] + '</div>';
        el.appendChild(div);
    });

    if($("achievementCount")){
        $("achievementCount").textContent =
            desbloqueadas + " desbloqueada" + (desbloqueadas===1 ? "" : "s");
    }
}

function renderAnaliseInteligente(streak){
    const el = $("analiseInteligente");
    if(!el) return;

    const itens = diario();
    const t = totaisDeItens(itens);
    const frases = [];

    if(!itens.length){
        el.textContent = "Registre uma refeição para receber uma análise rápida do seu dia.";
        return;
    }

    if(t.kcal <= meta) frases.push("Você está dentro da meta de calorias.");
    else frases.push("Hoje você está " + numero(t.kcal-meta) + " kcal acima da meta.");

    if(t.p < 50) frases.push("A proteína registrada ainda está baixa.");
    else if(t.p >= 100) frases.push("Boa quantidade de proteína registrada.");

    if(aguaDoDia() >= metaAgua*1000) frases.push("Sua meta de água foi atingida. 💧");
    else frases.push("Faltam " + numero((metaAgua*1000-aguaDoDia())/1000) + " L para sua meta de água.");

    if(streak>=3) frases.push("Sua consistência está forte: " + streak + " dias seguidos. 🔥");

    el.textContent = frases.join(" ");
}

/* =========================================================
   PROFIT 3.0 — NOTIFICAÇÕES
========================================================= */
let notificacoesAtivas = localStorage.getItem("nutri_notificacoes") === "1";
let horarioNotificacao = localStorage.getItem("nutri_notificacao_horario") || "12:30";
let notifTimer = null;

function atualizarNotifUI(){
    if($("notifToggle")) $("notifToggle").checked = notificacoesAtivas;
    if($("notifTime")) $("notifTime").value = horarioNotificacao;

    const permitido = ("Notification" in window) && Notification.permission === "granted";
    if($("notifStatus")){
        $("notifStatus").textContent =
            notificacoesAtivas && permitido ? "Ativo" :
            ("Notification" in window ? "Desativado" : "Indisponível");
    }
}

async function pedirPermissaoNotificacao(){
    if(!("Notification" in window)){
        toast("Este navegador não oferece notificações.");
        notificacoesAtivas = false;
        atualizarNotifUI();
        return false;
    }

    if(Notification.permission === "denied"){
        toast("As notificações estão bloqueadas pelo navegador.");
        notificacoesAtivas = false;
        atualizarNotifUI();
        return false;
    }

    try{
        const permissao = Notification.permission === "granted"
            ? "granted"
            : await Notification.requestPermission();

        if(permissao !== "granted"){
            notificacoesAtivas = false;
            atualizarNotifUI();
            toast("Permissão de notificação não concedida.");
            return false;
        }

        notificacoesAtivas = true;
        localStorage.setItem("nutri_notificacoes","1");
        atualizarNotifUI();
        toast("Notificações ativadas! 🔔");
        agendarLembreteNotificacao();
        return true;
    }catch(e){
        notificacoesAtivas = false;
        atualizarNotifUI();
        toast("Não foi possível ativar notificações neste ambiente.");
        return false;
    }
}

function mostrarNotificacao(titulo,texto){
    if(!("Notification" in window) || Notification.permission !== "granted"){
        toast(texto);
        return;
    }

    try{
        new Notification(titulo,{
            body:texto,
            tag:"fitpro-lembrete",
            icon:"icon.svg"
        });
    }catch(e){
        toast(texto);
    }
}

function agendarLembreteNotificacao(){
    clearTimeout(notifTimer);
    if(!notificacoesAtivas) return;
    if(!("Notification" in window) || Notification.permission !== "granted") return;

    const partes = String(horarioNotificacao || "12:30").split(":").map(Number);
    const h = Number.isFinite(partes[0]) ? partes[0] : 12;
    const m = Number.isFinite(partes[1]) ? partes[1] : 30;
    const agora = new Date();
    let alvo = new Date(agora);
    alvo.setHours(h,m,0,0);

    if(alvo <= agora) alvo.setDate(alvo.getDate()+1);

    notifTimer = setTimeout(() => {
        mostrarNotificacao("PROFIT 🌱","Está na hora de registrar sua alimentação de hoje.");
        agendarLembreteNotificacao();
    }, Math.min(alvo-agora,2147483647));
}

if($("notifToggle")){
    $("notifToggle").addEventListener("change",async e => {
        if(e.target.checked){
            await pedirPermissaoNotificacao();
        }else{
            notificacoesAtivas = false;
            localStorage.setItem("nutri_notificacoes","0");
            clearTimeout(notifTimer);
            atualizarNotifUI();
            toast("Notificações desativadas.");
        }
    });
}
if($("notifTime")){
    $("notifTime").addEventListener("change",e => {
        horarioNotificacao = e.target.value || "12:30";
        localStorage.setItem("nutri_notificacao_horario",horarioNotificacao);
        agendarLembreteNotificacao();
        toast("Horário do lembrete atualizado. ⏰");
    });
}
if($("testNotifBtn")){
    $("testNotifBtn").onclick = async () => {
        if(!notificacoesAtivas){
            const ok = await pedirPermissaoNotificacao();
            if(!ok) return;
        }
        mostrarNotificacao("PROFIT 🌱","Notificação de teste funcionando! 🔔");
        toast("Teste enviado.");
    };
}

/* Atualiza as novas áreas sem tocar na lógica original. */
const atualizarTudoOriginal = atualizarTudo;
atualizarTudo = function(){
    atualizarTudoOriginal();
    renderAgua();
    atualizarGamificacao();
    atualizarNotifUI();
    atualizarPerfilUI();
};


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

aplicarTema();
atualizarTudo();
renderAgua();
atualizarGamificacao();
atualizarNotifUI();
atualizarPerfilUI();
agendarLembreteNotificacao();




/* PROFIT 3.0 — Service Worker / PWA */
if("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")){
    window.addEventListener("load",() => {
        navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
}


/* =========================================================
   PROFIT — SWIPE DE ATALHOS (4 DIREÇÕES)
   Movimento suave + atalhos sem ocultar nenhuma seção.
========================================================= */
(function(){
    const box = document.getElementById("swipeShortcut");
    const handle = document.getElementById("swipeHandle");
    const preview = document.getElementById("swipePreview");

    const selects = {
        left: document.getElementById("swipeLeftSelect"),
        right: document.getElementById("swipeRightSelect"),
        up: document.getElementById("swipeUpSelect"),
        down: document.getElementById("swipeDownSelect")
    };

    const icons = {
        left: document.getElementById("swipeLeftIcon"),
        right: document.getElementById("swipeRightIcon"),
        up: document.getElementById("swipeUpIcon"),
        down: document.getElementById("swipeDownIcon")
    };

    if(!box || !handle || !preview ||
       Object.values(selects).some(el => !el)) return;

    const data = {
        interativoCard:["📈","Progresso"],
        configuracaoCard:["🔔","Configuração"],
        conquistasCard:["🏆","Conquistas"],
        analiseDiaCard:["🧠","Análise do dia"],
        descubraCard:["🥗","Descubra alimentos"]
    };

    const storageKey = "fitpro_swipe_shortcuts";
    const defaults = {
        left:"interativoCard",
        right:"descubraCard",
        up:"conquistasCard",
        down:"analiseDiaCard"
    };

    function load(){
        let saved = {};
        try{
            saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
        }catch(e){}

        Object.keys(selects).forEach(dir=>{
            selects[dir].value =
                saved[dir] && data[saved[dir]]
                    ? saved[dir]
                    : defaults[dir];
        });
    }

    function save(){
        const value = {};
        Object.keys(selects).forEach(dir=>{
            value[dir] = selects[dir].value;
        });

        try{
            localStorage.setItem(storageKey, JSON.stringify(value));
        }catch(e){}

        updateIcons();
    }

    function updateIcons(){
        Object.keys(icons).forEach(dir=>{
            const item = data[selects[dir].value];
            if(item) icons[dir].textContent = item[0];
        });
    }

    Object.values(selects).forEach(select=>{
        select.addEventListener("change", save);
    });

    load();
    updateIcons();

    let active = false;
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dy = 0;
    let done = false;
    let raf = 0;

    const threshold = 62;
    const maxMove = 46;

    function clearActive(){
        Object.values(icons).forEach(icon=>{
            icon.classList.remove("active");
        });
    }

    function previewDirection(direction){
        clearActive();
        icons[direction].classList.add("active");

        const item = data[selects[direction].value];
        preview.textContent = item ? item[0] : "";
        preview.style.opacity = "1";
    }

    function animateHandle(x,y){
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function(){
            handle.style.transform =
                "translate3d(" + x + "px," + y + "px,0)";
        });
    }

    function reset(){
        active = false;
        dx = 0;
        dy = 0;
        done = false;

        cancelAnimationFrame(raf);

        box.classList.remove("dragging");
        handle.style.transition = "transform .28s cubic-bezier(.22,.61,.36,1)";
        handle.style.transform = "translate3d(0,0,0)";

        clearActive();
        preview.style.opacity = "0";
    }

    function execute(direction){
        if(done) return;
        done = true;

        const target = selects[direction].value;
        const el = document.getElementById(target);

        if(el){
            /* V1: abre a tela correspondente antes de posicionar no cartão. */
            const tela = el.dataset.screen;
            if(window.profitIrParaTela && tela){
                window.profitIrParaTela(tela);
                setTimeout(() => {
                    const atual = document.getElementById(target);
                    if(atual) atual.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"});
                },90);
            }else{
                el.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"});
            }
        }

        /* Retorna o botão sem interferir no deslocamento da página. */
        setTimeout(reset, 320);
    }

    function start(e){
        if(e.pointerType === "mouse" && e.button !== 0) return;

        active = true;
        done = false;
        startX = e.clientX;
        startY = e.clientY;
        dx = 0;
        dy = 0;

        box.classList.add("dragging");
        handle.style.transition = "none";

        if(box.setPointerCapture){
            try{
                box.setPointerCapture(e.pointerId);
            }catch(err){}
        }

        if(e.preventDefault) e.preventDefault();
    }

    function move(e){
        if(!active || done) return;

        dx = e.clientX - startX;
        dy = e.clientY - startY;

        const horizontal = Math.abs(dx) >= Math.abs(dy);
        const direction = horizontal
            ? (dx < 0 ? "left" : "right")
            : (dy < 0 ? "up" : "down");

        const amount = horizontal ? Math.abs(dx) : Math.abs(dy);

        const moveX = horizontal
            ? Math.max(-maxMove, Math.min(maxMove, dx))
            : 0;

        const moveY = horizontal
            ? 0
            : Math.max(-maxMove, Math.min(maxMove, dy));

        animateHandle(moveX, moveY);

        if(amount > 7){
            previewDirection(direction);
        }

        if(amount >= threshold){
            execute(direction);
        }

        if(e.preventDefault) e.preventDefault();
    }

    function end(){
        if(!active) return;
        reset();
    }

    box.addEventListener("pointerdown", start, {passive:false});
    box.addEventListener("pointermove", move, {passive:false});
    box.addEventListener("pointerup", end);
    box.addEventListener("pointercancel", reset);
    box.addEventListener("lostpointercapture", function(){
        if(active && !done) end();
    });

    box.addEventListener("keydown", function(e){
        if(e.key === "ArrowLeft") execute("left");
        else if(e.key === "ArrowRight") execute("right");
        else if(e.key === "ArrowUp") execute("up");
        else if(e.key === "ArrowDown") execute("down");
    });
})();

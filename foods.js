/* foods.js — PROFIT 3.0 */
/* =========================================================
   BANCO DE ALIMENTOS
   VALORES APROXIMADOS POR 100g OU 100ml
   p = proteína
   c = carboidratos
   g = gorduras
========================================================= */

const alimentos = [

/* VEGETAIS */

{name:"Pepino",kcal:15,p:.7,c:3.6,g:.1},
{name:"Alface",kcal:14,p:1.4,c:2.9,g:.2},
{name:"Rúcula",kcal:25,p:2.6,c:3.7,g:.7},
{name:"Agrião",kcal:17,p:2.3,c:1.3,g:.1},
{name:"Tomate",kcal:18,p:.9,c:3.9,g:.2},
{name:"Abobrinha",kcal:17,p:1.2,c:3.1,g:.3},
{name:"Chuchu",kcal:19,p:.7,c:4.1,g:.1},
{name:"Repolho",kcal:25,p:1.3,c:5.8,g:.1},
{name:"Couve-flor",kcal:25,p:1.9,c:5,g:.3},
{name:"Brócolis",kcal:34,p:2.8,c:6.6,g:.4},
{name:"Espinafre",kcal:23,p:2.9,c:3.6,g:.4},
{name:"Couve",kcal:49,p:4.3,c:8.8,g:.9},
{name:"Berinjela",kcal:25,p:1,c:6,g:.2},
{name:"Pimentão",kcal:31,p:1,c:6,g:.3},
{name:"Vagem",kcal:31,p:1.8,c:7,g:.1},
{name:"Aspargos",kcal:20,p:2.2,c:3.9,g:.1},
{name:"Cogumelo",kcal:22,p:3.1,c:3.3,g:.3},
{name:"Rabanete",kcal:16,p:.7,c:3.4,g:.1},
{name:"Cenoura",kcal:41,p:.9,c:9.6,g:.2},
{name:"Abóbora",kcal:26,p:1,c:6.5,g:.1},
{name:"Palmito",kcal:28,p:2.5,c:4.6,g:.6},
{name:"Cebola",kcal:40,p:1.1,c:9.3,g:.1},
{name:"Quiabo",kcal:33,p:1.9,c:7.5,g:.2},
{name:"Acelga",kcal:19,p:1.8,c:3.7,g:.2},
{name:"Nabo",kcal:28,p:.9,c:6.4,g:.1},
{name:"Pepino japonês",kcal:15,p:.7,c:3.6,g:.1},

/* FRUTAS */

{name:"Morango",kcal:32,p:.7,c:7.7,g:.3},
{name:"Melancia",kcal:30,p:.6,c:7.6,g:.2},
{name:"Melão",kcal:34,p:.8,c:8.2,g:.2},
{name:"Mamão",kcal:43,p:.5,c:10.8,g:.3},
{name:"Abacaxi",kcal:50,p:.5,c:13.1,g:.1},
{name:"Laranja",kcal:47,p:.9,c:11.8,g:.1},
{name:"Tangerina",kcal:53,p:.8,c:13.3,g:.3},
{name:"Kiwi",kcal:61,p:1.1,c:14.7,g:.5},
{name:"Maçã",kcal:52,p:.3,c:13.8,g:.2},
{name:"Pera",kcal:57,p:.4,c:15.2,g:.1},
{name:"Pêssego",kcal:39,p:.9,c:9.5,g:.3},
{name:"Ameixa",kcal:46,p:.7,c:11.4,g:.3},
{name:"Maracujá",kcal:97,p:2.2,c:23.4,g:.7},
{name:"Goiaba",kcal:68,p:2.6,c:14.3,g:1},
{name:"Mirtilo",kcal:57,p:.7,c:14.5,g:.3},
{name:"Framboesa",kcal:52,p:1.2,c:11.9,g:.7},
{name:"Amora",kcal:43,p:1.4,c:9.6,g:.5},
{name:"Carambola",kcal:31,p:1,c:6.7,g:.3},
{name:"Pitaya",kcal:50,p:1.1,c:11,g:.4},
{name:"Acerola",kcal:32,p:.4,c:7.7,g:.3},
{name:"Banana",kcal:89,p:1.1,c:22.8,g:.3},
{name:"Uva",kcal:69,p:.7,c:18.1,g:.2},
{name:"Manga",kcal:60,p:.8,c:15,g:.4},
{name:"Abacate",kcal:160,p:2,c:8.5,g:14.7},
{name:"Coco fresco",kcal:354,p:3.3,c:15.2,g:33.5},
{name:"Caqui",kcal:70,p:.6,c:18.6,g:.2},
{name:"Figo",kcal:74,p:.8,c:19.2,g:.3},

/* BOVINAS */

{name:"Patinho",kcal:219,p:35,c:0,g:8},
{name:"Coxão mole",kcal:219,p:32,c:0,g:9},
{name:"Coxão duro",kcal:210,p:31,c:0,g:8},
{name:"Acém",kcal:250,p:27,c:0,g:15},
{name:"Alcatra",kcal:220,p:31,c:0,g:10},
{name:"Contrafilé",kcal:250,p:29,c:0,g:15},
{name:"Filé mignon",kcal:220,p:32,c:0,g:9},
{name:"Maminha",kcal:250,p:28,c:0,g:15},
{name:"Fraldinha",kcal:220,p:29,c:0,g:11},
{name:"Lagarto",kcal:190,p:31,c:0,g:7},
{name:"Carne moída magra",kcal:215,p:28,c:0,g:11},
{name:"Carne moída comum",kcal:260,p:26,c:0,g:18},
{name:"Picanha",kcal:290,p:26,c:0,g:21},
{name:"Cupim",kcal:330,p:27,c:0,g:25},
{name:"Costela bovina",kcal:350,p:25,c:0,g:28},
{name:"Fígado bovino",kcal:175,p:26,c:4,g:5},
{name:"Bife acebolado",kcal:220,p:27,c:5,g:10},
{name:"Bife grelhado",kcal:220,p:30,c:0,g:10},
{name:"Carne de panela",kcal:210,p:26,c:5,g:9},
{name:"Carne assada",kcal:250,p:29,c:2,g:14},
{name:"Espetinho de carne",kcal:240,p:28,c:2,g:13},
{name:"Kafta bovina",kcal:250,p:20,c:5,g:17},
{name:"Hambúrguer bovino caseiro",kcal:250,p:25,c:4,g:15},

/* SUÍNAS */

{name:"Lombo suíno",kcal:190,p:27,c:0,g:8},
{name:"Pernil suíno",kcal:210,p:27,c:0,g:10},
{name:"Filé mignon suíno",kcal:143,p:26,c:0,g:4},
{name:"Copa-lombo",kcal:270,p:25,c:0,g:19},
{name:"Costela suína",kcal:320,p:25,c:0,g:24},
{name:"Carne suína moída",kcal:250,p:26,c:0,g:17},
{name:"Bisteca suína",kcal:230,p:27,c:0,g:13},
{name:"Linguiça suína",kcal:300,p:16,c:2,g:25},
{name:"Bacon",kcal:541,p:37,c:1,g:42},

/* FRANGO */

{name:"Peito de frango sem pele",kcal:165,p:31,c:0,g:3.6},
{name:"Peito de frango cozido",kcal:165,p:31,c:0,g:3.6},
{name:"Peito de frango grelhado",kcal:190,p:31,c:0,g:7},
{name:"Peito de frango assado",kcal:195,p:30,c:0,g:8},
{name:"Coxa de frango sem pele",kcal:175,p:26,c:0,g:7},
{name:"Sobrecoxa sem pele",kcal:180,p:25,c:0,g:8},
{name:"Asa de frango sem pele",kcal:170,p:30,c:0,g:6},
{name:"Fígado de frango",kcal:167,p:24,c:1,g:6},
{name:"Coração de frango",kcal:185,p:26,c:0,g:8},
{name:"Frango desfiado",kcal:165,p:31,c:0,g:4},
{name:"Frango ao molho",kcal:170,p:25,c:5,g:5},
{name:"Frango empanado",kcal:250,p:18,c:15,g:13},
{name:"Nuggets de frango",kcal:270,p:15,c:16,g:17},
{name:"Espetinho de frango",kcal:180,p:28,c:2,g:6},
{name:"Hambúrguer de frango",kcal:190,p:18,c:8,g:9},

/* AVES */

{name:"Peito de peru",kcal:135,p:29,c:1,g:2},
{name:"Pernil de peru",kcal:150,p:29,c:0,g:3},
{name:"Peito de pato",kcal:200,p:24,c:0,g:11},
{name:"Chester",kcal:170,p:28,c:0,g:6},
{name:"Peru assado",kcal:150,p:29,c:0,g:3},

/* PEIXES */

{name:"Tilápia",kcal:128,p:26,c:0,g:2.7},
{name:"Merluza",kcal:90,p:18,c:0,g:2},
{name:"Pescada",kcal:100,p:20,c:0,g:2},
{name:"Atum em água",kcal:116,p:26,c:0,g:1},
{name:"Sardinha",kcal:208,p:25,c:0,g:11},
{name:"Bacalhau",kcal:105,p:23,c:0,g:1},
{name:"Salmão",kcal:208,p:20,c:0,g:13},
{name:"Truta",kcal:148,p:21,c:0,g:6},
{name:"Atum fresco",kcal:132,p:29,c:0,g:1},
{name:"Peixe grelhado",kcal:140,p:25,c:0,g:4},
{name:"Peixe empanado",kcal:220,p:17,c:15,g:10},

/* FRUTOS DO MAR */

{name:"Camarão",kcal:99,p:24,c:.2,g:.3},
{name:"Lula",kcal:92,p:15.6,c:3.1,g:1.4},
{name:"Polvo",kcal:82,p:14.9,c:2.2,g:1},
{name:"Mexilhão",kcal:86,p:12,c:3.7,g:2.2},
{name:"Caranguejo",kcal:97,p:20,c:0,g:1.5},

/* OVOS */

{name:"Ovo inteiro",kcal:143,p:12.6,c:.7,g:9.5},
{name:"Clara de ovo",kcal:52,p:10.9,c:.7,g:.2},
{name:"Gema de ovo",kcal:322,p:15.9,c:3.6,g:26.5},
{name:"Ovo mexido",kcal:166,p:10,c:1,g:13},
{name:"Omelete simples",kcal:160,p:11,c:2,g:11},
{name:"Omelete com frango",kcal:180,p:20,c:2,g:9},

/* LATICÍNIOS */

{name:"Iogurte natural desnatado",kcal:41,p:3.5,c:5.9,g:.1},
{name:"Iogurte grego zero",kcal:59,p:10,c:3.6,g:.2},
{name:"Cottage",kcal:98,p:11,c:3.4,g:4.3},
{name:"Ricota",kcal:174,p:11.3,c:3,g:12.7},
{name:"Leite desnatado",kcal:35,p:3.4,c:5,g:.1},
{name:"Leite semidesnatado",kcal:46,p:3.2,c:4.8,g:1.5},
{name:"Leite integral",kcal:61,p:3.2,c:4.8,g:3.3},
{name:"Kefir",kcal:41,p:3.3,c:4.8,g:1},
{name:"Queijo minas light",kcal:200,p:20,c:3,g:12},
{name:"Queijo minas frescal",kcal:264,p:17,c:3,g:20},
{name:"Mussarela",kcal:300,p:22,c:3,g:22},
{name:"Presunto",kcal:145,p:16,c:2,g:8},
{name:"Peito de peru fatiado",kcal:104,p:18,c:3,g:2},
{name:"Cream cheese",kcal:342,p:6,c:4,g:34},
{name:"Requeijão",kcal:250,p:7,c:3,g:23},

/* LEGUMINOSAS / PROTEÍNAS */

{name:"Feijão cozido",kcal:76,p:4.8,c:13.6,g:.5},
{name:"Feijão preto",kcal:77,p:4.5,c:14,g:.5},
{name:"Feijão carioca",kcal:76,p:4.8,c:13.6,g:.5},
{name:"Lentilha cozida",kcal:116,p:9,c:20,g:.4},
{name:"Grão-de-bico cozido",kcal:164,p:8.9,c:27.4,g:2.6},
{name:"Ervilha",kcal:81,p:5.4,c:14.5,g:.4},
{name:"Edamame",kcal:121,p:11,c:9,g:5},
{name:"Proteína de soja texturizada",kcal:330,p:50,c:30,g:.5},
{name:"Proteína de soja hidratada",kcal:120,p:16,c:8,g:2},
{name:"Soja cozida",kcal:173,p:17,c:10,g:9},
{name:"Tofu",kcal:76,p:8,c:1.9,g:4.8},
{name:"Tempeh",kcal:195,p:20,c:8,g:11},

/* ARROZ / CEREAIS */

{name:"Arroz branco cozido",kcal:130,p:2.7,c:28.2,g:.3},
{name:"Arroz integral cozido",kcal:123,p:2.7,c:25.6,g:1},
{name:"Arroz parboilizado cozido",kcal:123,p:2.9,c:26,g:.4},
{name:"Arroz parboilizado",kcal:123,p:2.9,c:26,g:.4},
{name:"Arroz à grega",kcal:145,p:3,c:28,g:2},
{name:"Arroz com legumes",kcal:125,p:2.5,c:25,g:1},
{name:"Arroz carreteiro",kcal:170,p:8,c:25,g:5},
{name:"Aveia",kcal:389,p:16.9,c:66.3,g:6.9},
{name:"Quinoa cozida",kcal:120,p:4.4,c:21.3,g:1.9},
{name:"Cuscuz de milho cozido",kcal:112,p:2.2,c:25,g:.7},
{name:"Cuscuz nordestino",kcal:112,p:2.2,c:25,g:.7},
{name:"Cuscuz com ovo",kcal:145,p:6,c:24,g:3},
{name:"Tapioca",kcal:230,p:.2,c:57,g:0},
{name:"Goma de tapioca",kcal:230,p:.2,c:57,g:0},
{name:"Tapioca com queijo",kcal:280,p:7,c:45,g:8},
{name:"Tapioca com frango",kcal:220,p:15,c:40,g:2},
{name:"Pipoca sem óleo",kcal:387,p:12.9,c:77.8,g:4.5},
{name:"Macarrão cozido",kcal:157,p:5.8,c:30.9,g:.9},
{name:"Macarrão integral cozido",kcal:149,p:5.5,c:30,g:1.7},
{name:"Macarrão instantâneo",kcal:450,p:9,c:60,g:18},
{name:"Farofa",kcal:350,p:3,c:80,g:3},
{name:"Farinha de mandioca",kcal:365,p:1.6,c:89,g:.3},
{name:"Farinha de milho",kcal:360,p:7,c:80,g:2},
{name:"Farinha láctea",kcal:400,p:13,c:70,g:7},
{name:"Neston cereais",kcal:380,p:8,c:78,g:3},

/* PÃES */

{name:"Pão francês",kcal:300,p:9,c:58,g:3},
{name:"Pão de sal",kcal:300,p:9,c:58,g:3},
{name:"Pão de forma",kcal:265,p:9,c:49,g:3},
{name:"Pão integral",kcal:247,p:13,c:41,g:4},
{name:"Pão de hambúrguer",kcal:280,p:9,c:52,g:5},
{name:"Pão de hot dog",kcal:280,p:8,c:52,g:4},
{name:"Pão de leite",kcal:310,p:9,c:53,g:7},
{name:"Pão sírio",kcal:275,p:9,c:56,g:1.2},
{name:"Torrada",kcal:400,p:11,c:75,g:6},
{name:"Bisnaguinha",kcal:300,p:8,c:55,g:6},
{name:"Pão de queijo",kcal:350,p:8,c:40,g:17},

/* TUBÉRCULOS */

{name:"Batata inglesa cozida",kcal:87,p:1.9,c:20,g:.1},
{name:"Batata inglesa assada",kcal:93,p:2.5,c:21,g:.1},
{name:"Batata-doce cozida",kcal:86,p:1.6,c:20,g:.1},
{name:"Batata-doce assada",kcal:90,p:2,c:21,g:.2},
{name:"Mandioca cozida",kcal:125,p:1,c:30,g:.3},
{name:"Inhame cozido",kcal:118,p:1.5,c:28,g:.2},
{name:"Batata frita",kcal:312,p:3.4,c:41,g:15},
{name:"Purê de batata",kcal:110,p:2,c:18,g:4},

/* CARNES PREPARADAS */

{name:"Torta de carne",kcal:250,p:12,c:25,g:12},
{name:"Torta de frango",kcal:240,p:13,c:24,g:11},
{name:"Torta salgada de carne",kcal:260,p:12,c:25,g:14},
{name:"Torta salgada de frango",kcal:245,p:14,c:25,g:11},
{name:"Escondidinho de carne",kcal:180,p:10,c:20,g:7},
{name:"Escondidinho de frango",kcal:170,p:13,c:19,g:5},
{name:"Lasanha de carne",kcal:180,p:10,c:18,g:8},
{name:"Lasanha de frango",kcal:170,p:11,c:18,g:7},
{name:"Strogonoff de carne",kcal:190,p:15,c:8,g:11},
{name:"Strogonoff de frango",kcal:170,p:17,c:7,g:8},
{name:"Estrogonofe com arroz",kcal:190,p:10,c:25,g:6},
{name:"Almôndega bovina",kcal:220,p:18,c:8,g:12},
{name:"Almôndega de frango",kcal:190,p:18,c:8,g:9},
{name:"Carne seca",kcal:250,p:40,c:0,g:9},

/* COMIDA DO DIA A DIA */

{name:"Cachorro-quente simples",kcal:280,p:10,c:30,g:13},
{name:"Cachorro-quente completo",kcal:330,p:12,c:35,g:17},
{name:"Hambúrguer simples",kcal:290,p:14,c:30,g:14},
{name:"Hambúrguer completo",kcal:300,p:15,c:32,g:15},
{name:"X-burguer",kcal:290,p:14,c:30,g:14},
{name:"X-salada",kcal:270,p:15,c:28,g:12},
{name:"X-frango",kcal:260,p:18,c:28,g:10},
{name:"X-bacon",kcal:320,p:16,c:28,g:18},
{name:"Pizza de queijo",kcal:266,p:12,c:33,g:10},
{name:"Pizza de frango",kcal:240,p:13,c:30,g:8},
{name:"Pizza calabresa",kcal:290,p:13,c:30,g:13},
{name:"Pastel de carne",kcal:300,p:11,c:32,g:15},
{name:"Pastel de frango",kcal:285,p:12,c:32,g:13},
{name:"Coxinha de frango",kcal:300,p:10,c:30,g:17},
{name:"Risole de carne",kcal:290,p:9,c:32,g:15},
{name:"Empada de frango",kcal:300,p:10,c:28,g:18},
{name:"Enroladinho de salsicha",kcal:290,p:9,c:30,g:16},
{name:"Kibe frito",kcal:270,p:12,c:20,g:16},
{name:"Kibe assado",kcal:210,p:14,c:18,g:10},
{name:"Salgado assado de frango",kcal:230,p:12,c:28,g:8},
{name:"Esfiha de carne",kcal:230,p:10,c:28,g:8},
{name:"Esfiha de frango",kcal:220,p:11,c:28,g:7},

/* CAFÉS / BEBIDAS */

{name:"Café sem açúcar",kcal:2,p:.3,c:0,g:0},
{name:"Café descafeinado",kcal:2,p:.3,c:0,g:0},
{name:"Café com leite desnatado",kcal:35,p:2.5,c:4,g:1},
{name:"Café com leite integral",kcal:40,p:2.2,c:4,g:2},
{name:"Café com açúcar",kcal:35,p:.2,c:8,g:0},
{name:"Café preto",kcal:2,p:.3,c:0,g:0},
{name:"Chá verde sem açúcar",kcal:1,p:0,c:0,g:0},
{name:"Chá preto sem açúcar",kcal:1,p:0,c:0,g:0},
{name:"Chá de camomila",kcal:1,p:0,c:0,g:0},
{name:"Água",kcal:0,p:0,c:0,g:0},

/* REFRIGERANTES */

{name:"Coca-Cola",kcal:42,p:0,c:10.6,g:0},
{name:"Coca-Cola Zero",kcal:0,p:0,c:0,g:0},
{name:"Pepsi",kcal:43,p:0,c:10.7,g:0},
{name:"Guaraná",kcal:40,p:0,c:10,g:0},
{name:"Guaraná Zero",kcal:0,p:0,c:0,g:0},
{name:"Fanta Laranja",kcal:40,p:0,c:10,g:0},
{name:"Sprite",kcal:40,p:0,c:10,g:0},
{name:"Sprite Zero",kcal:0,p:0,c:0,g:0},

/* SUCOS */

{name:"Suco em pó preparado",kcal:20,p:0,c:5,g:0},
{name:"Suco em pó com açúcar",kcal:40,p:0,c:10,g:0},
{name:"Suco de polpa de maracujá",kcal:35,p:.5,c:8,g:.1},
{name:"Suco de polpa de acerola",kcal:30,p:.5,c:7,g:.1},
{name:"Suco de polpa de goiaba",kcal:45,p:.5,c:10,g:.1},
{name:"Suco de polpa de morango",kcal:35,p:.5,c:8,g:.1},
{name:"Suco de polpa de caju",kcal:40,p:.5,c:9,g:.1},
{name:"Suco natural de laranja",kcal:45,p:.7,c:10,g:.2},
{name:"Suco natural de limão",kcal:25,p:.4,c:6,g:.1},
{name:"Suco natural de abacaxi",kcal:50,p:.4,c:12,g:.1},
{name:"Suco natural de melancia",kcal:30,p:.6,c:7,g:.1},
{name:"Suco natural de maracujá",kcal:39,p:.7,c:9,g:.2},

/* DOCES / SOBREMESAS */

{name:"Gelatina zero",kcal:10,p:1.5,c:.5,g:0},
{name:"Gelatina comum",kcal:60,p:1.5,c:14,g:0},
{name:"Pudim",kcal:150,p:4,c:25,g:4},
{name:"Brigadeiro",kcal:330,p:4,c:55,g:11},
{name:"Beijinho",kcal:350,p:3,c:50,g:16},
{name:"Doce de leite",kcal:315,p:5.5,c:58,g:7},
{name:"Geleia",kcal:250,p:.4,c:65,g:.1},
{name:"Sorvete",kcal:200,p:3.5,c:25,g:10},
{name:"Açaí com xarope",kcal:110,p:1,c:25,g:1},
{name:"Açaí natural",kcal:70,p:1,c:7,g:4},

/* SEMENTES / CASTANHAS */

{name:"Chia",kcal:486,p:16.5,c:42.1,g:30.7},
{name:"Linhaça",kcal:534,p:18.3,c:28.9,g:42.2},
{name:"Psyllium",kcal:200,p:2,c:88,g:.6},
{name:"Amendoim",kcal:567,p:25.8,c:16.1,g:49.2},
{name:"Pasta de amendoim",kcal:588,p:25,c:20,g:50},
{name:"Castanha de caju",kcal:553,p:18,c:30,g:44},
{name:"Castanha-do-pará",kcal:659,p:14,c:12,g:67},
{name:"Amêndoas",kcal:579,p:21,c:21.6,g:49.9},
{name:"Nozes",kcal:654,p:15,c:14,g:65},

/* ÓLEOS / ALIMENTOS CALÓRICOS */

{name:"Azeite de oliva",kcal:884,p:0,c:0,g:100},
{name:"Óleo de soja",kcal:884,p:0,c:0,g:100},
{name:"Manteiga",kcal:717,p:.9,c:.1,g:81},
{name:"Margarina",kcal:717,p:.2,c:.7,g:81},
{name:"Maionese",kcal:680,p:1,c:1,g:75},
{name:"Chocolate ao leite",kcal:535,p:7.5,c:59,g:30},
{name:"Chocolate amargo",kcal:598,p:7.8,c:45.9,g:42.6},
{name:"Mel",kcal:304,p:.3,c:82.4,g:0},

/* MAIS ALIMENTOS */

{name:"Ovo cozido",kcal:155,p:12.6,c:1.1,g:10.6},
{name:"Ovo pochê",kcal:143,p:12.6,c:1.1,g:9.5},
{name:"Feijão branco cozido",kcal:139,p:9.7,c:25.1,g:.4},
{name:"Feijão fradinho cozido",kcal:116,p:7.7,c:20.7,g:.5},
{name:"Soja cozida",kcal:173,p:16.6,c:9.9,g:9},
{name:"Batata-baroa cozida",kcal:80,p:.9,c:18.9,g:.2},
{name:"Mandioquinha cozida",kcal:80,p:.9,c:18.9,g:.2},
{name:"Cará cozido",kcal:118,p:1.5,c:27.5,g:.2},
{name:"Batata yacon",kcal:33,p:.5,c:8.4,g:.1},
{name:"Arroz vermelho cozido",kcal:123,p:2.7,c:25.6,g:1},
{name:"Arroz negro cozido",kcal:145,p:3.5,c:31,g:1},
{name:"Trigo para quibe cozido",kcal:83,p:3.1,c:18.6,g:.2},
{name:"Pão sírio",kcal:275,p:9.1,c:55,g:1.2},
{name:"Pão de hambúrguer",kcal:275,p:9,c:51,g:4.5},
{name:"Pão de forma light",kcal:230,p:10,c:43,g:2.8},
{name:"Crepioca",kcal:180,p:8,c:22,g:7},
{name:"Panqueca de banana",kcal:170,p:6,c:24,g:5},
{name:"Mingau de aveia",kcal:95,p:3.2,c:14,g:3},
{name:"Barra de cereal",kcal:380,p:6,c:72,g:8},
{name:"Queijo minas frescal",kcal:264,p:17,c:3,g:20},
{name:"Queijo coalho",kcal:330,p:23,c:3,g:25},
{name:"Iogurte skyr",kcal:63,p:11,c:4,g:.2},
{name:"Leite de amêndoas sem açúcar",kcal:15,p:.6,c:.3,g:1.2},
{name:"Tapioca com ovo",kcal:180,p:6,c:30,g:5},
{name:"Carne de panela",kcal:220,p:27,c:5,g:10},
{name:"Bife acebolado",kcal:240,p:29,c:4,g:11},
{name:"Peixe assado",kcal:150,p:27,c:0,g:5},
{name:"Frango com legumes",kcal:135,p:18,c:7,g:4},
{name:"Salada de atum",kcal:120,p:18,c:5,g:3},
{name:"Cuscuz paulista",kcal:180,p:6,c:25,g:6},

];



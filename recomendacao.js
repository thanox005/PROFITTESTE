/* PROFIT 3.0 — recomendação de calorias e macros (nível de atividade, prazo e alertas) */
(function () {
  'use strict';
  var KEY = 'profit_nutrition_profile_v31';
  var CARB_MIN = 100, GORD_MIN_KG = 0.8, GORD_PCT = 0.25;
  var NIVEIS = { '1.2': 'Sedentário', '1.375': 'Leve', '1.55': 'Moderado', '1.725': 'Intenso', '1.9': 'Muito intenso' };
  var CORES = { verde: '#22c55e', amarelo: '#f59e0b', vermelho: '#ef4444' };

  function $(id) { return document.getElementById(id); }
  function num(id) { var v = Number(String(($(id) || {}).value || '').replace(',', '.')); return isFinite(v) ? v : 0; }
  function fmt(v, d) { return Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: d == null ? 0 : d }); }
  function lerPerfil() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function salvarPerfil(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function nivelNome(a) { return NIVEIS[String(a)] || 'Personalizado'; }

  /* Proteína por kg conforme a atividade; ganho de massa usa no mínimo 1,8 g/kg. */
  function proteinaKg(atividade, objetivo) {
    var k = atividade <= 1.375 ? 1.4 : (atividade <= 1.55 ? 1.6 : 1.8);
    if (objetivo === 'ganhar') k = Math.max(k, 1.8);
    return k;
  }

  /* Cálculo puro (sem tela). d.ajuste = ajuste do prazo em kcal/dia, ou null. */
  function calcularPuro(d) {
    var bmr = (10 * d.peso) + (6.25 * d.altura) - (5 * d.idade) + (d.sexo === 'm' ? 5 : -161);
    var tdee = bmr * d.atividade;
    var origem, kcal;
    if (d.ajuste !== null && d.ajuste !== undefined) {
      kcal = tdee + d.ajuste;
      origem = 'prazo de ' + fmt(d.meses, 1) + ' mês(es)';
    } else {
      var fator = d.objetivo === 'emagrecer' ? 0.85 : (d.objetivo === 'ganhar' ? 1.10 : 1);
      kcal = tdee * fator;
      origem = d.objetivo === 'manter' ? 'manutenção' : 'ajuste padrão do objetivo';
    }
    kcal = Math.round(kcal / 10) * 10;

    var avisos = [];
    var min = d.sexo === 'f' ? 1200 : 1500;
    if (kcal < min) {
      avisos.push('Calorias abaixo do mínimo seguro (' + fmt(min) + ' kcal). Ajustamos para o mínimo; revise o prazo.');
      kcal = min;
    }

    var prot = d.peso * proteinaKg(d.atividade, d.objetivo);
    var gordMin = d.peso * GORD_MIN_KG;
    var gord = Math.max(gordMin, kcal * GORD_PCT / 9);
    var carb = (kcal - prot * 4 - gord * 9) / 4;
    if (carb < CARB_MIN) {
      var gordAlvo = (kcal - prot * 4 - CARB_MIN * 4) / 9;
      var nova = Math.max(gordMin, Math.min(gord, gordAlvo));
      if (nova < gord - 0.05) avisos.push('Gordura reduzida para ' + fmt(nova) + ' g para proteger o carboidrato.');
      gord = nova;
      carb = (kcal - prot * 4 - gord * 9) / 4;
    }
    if (carb < CARB_MIN) {
      avisos.push('Carboidrato em ' + fmt(Math.max(0, carb)) + ' g/dia, abaixo do piso de ' + CARB_MIN + ' g. Considere aumentar as calorias ou revisar o prazo.');
    }

    return {
      bmr: bmr, tdee: tdee, kcal: kcal, proteina: prot, gordura: gord, carbo: carb,
      agua: d.peso * 35 / 1000, fibras: kcal / 1000 * 14,
      origem: origem, avisos: avisos, atividade: d.atividade
    };
  }

  /* Ajuste de calorias vindo do prazo, só se for viável e no sentido do objetivo. */
  function ajustePrazo(d) {
    if (!window.PROFIT_ESTIMATIVA || d.objetivo === 'manter') return null;
    var pesoMeta = num('perfilPesoMeta'), meses = num('perfilPrazoMeses');
    if (!pesoMeta || !meses) return null;
    var r = window.PROFIT_ESTIMATIVA.avaliar({
      pesoAtual: d.peso, pesoMeta: pesoMeta, meses: meses,
      sexo: d.sexo, idade: d.idade, altura: d.altura, atividade: d.atividade, perfil: {}
    });
    if (!r || r.status === 'bloqueado' || r.status === 'incompleto' || typeof r.ajusteDia !== 'number') return null;
    if (d.objetivo === 'emagrecer' && r.ajusteDia >= 0) return null;
    if (d.objetivo === 'ganhar' && r.ajusteDia <= 0) return null;
    return r.ajusteDia;
  }

  function renderTargets(r) {
    var el = $('profitTargetGrid'), note = $('profitNutritionNote');
    if (!el) return;
    var itens = [
      ['🔥', fmt(r.kcal) + ' kcal', 'kcal / dia'],
      ['🥩', fmt(r.proteina) + ' g', 'proteína'],
      ['🍚', fmt(r.carbo) + ' g', 'carboidratos'],
      ['🥑', fmt(r.gordura) + ' g', 'gorduras'],
      ['💧', fmt(r.agua, 1) + ' L', 'água'],
      ['🌾', fmt(r.fibras) + ' g', 'fibras']
    ];
    el.innerHTML = itens.map(function (x) {
      return '<div class="profit-target"><span>' + x[0] + ' ' + x[2] + '</span><b>' + x[1] + '</b></div>';
    }).join('');
    if (note) {
      var txt = 'BMR ' + fmt(r.bmr) + ' kcal · TDEE ' + fmt(r.tdee) + ' kcal (' + nivelNome(r.atividade).toLowerCase() + ') · ' + r.origem;
      if (r.avisos && r.avisos.length) txt += '<br><b>⚠️ ' + r.avisos.join('<br>⚠️ ') + '</b>';
      txt += '<br>Estimativa. Não substitui avaliação profissional.';
      note.innerHTML = txt;
    }
  }

  function calcularUI() {
    var d = {
      sexo: ($('perfilSexo') || {}).value || '',
      idade: num('perfilIdade'), altura: num('perfilAltura'), peso: num('perfilPesoAtual'),
      objetivo: ($('perfilObjetivo') || {}).value || 'manter',
      atividade: Number(($('perfilAtividade') || {}).value) || 1.55
    };
    if (!d.sexo || !d.idade || !d.altura || !d.peso) {
      if (typeof toast === 'function') toast('Preencha sexo, idade, altura e peso atual no Perfil.');
      return;
    }
    d.ajuste = ajustePrazo(d);
    d.meses = num('perfilPrazoMeses');
    var r = calcularPuro(d);

    var p = lerPerfil();
    Object.assign(p, {
      sexo: d.sexo, idade: d.idade, altura: d.altura, peso: d.peso, atividade: d.atividade, objetivo: d.objetivo,
      bmr: r.bmr, tdee: r.tdee, kcal: r.kcal, proteina: r.proteina, gordura: r.gordura, carbo: r.carbo,
      agua: r.agua, fibras: r.fibras, origem: r.origem, atualizado: new Date().toISOString().slice(0, 10)
    });
    salvarPerfil(p);

    meta = r.kcal;
    try { localStorage.setItem('nutri_meta', String(r.kcal)); } catch (e) {}
    if ($('meta')) $('meta').value = r.kcal;
    var aguaL = Math.max(0.5, Number(r.agua.toFixed(1)));
    metaAgua = aguaL;
    try { localStorage.setItem('nutri_meta_agua', String(aguaL)); } catch (e) {}
    if ($('waterGoalInput')) $('waterGoalInput').value = aguaL;

    if (typeof atualizarTudo === 'function') atualizarTudo();
    if (typeof renderAgua === 'function') renderAgua();
    renderTargets(r);
    atualizarAlertas();
    if (typeof toast === 'function') toast('Recomendação atualizada. 🎯');
  }

  /* Alertas coloridos no "Seu dia" */
  function cor(valor, meta, tipo) {
    if (!valor || !meta) return null;
    var r = valor / meta;
    if (tipo === 'p') {
      if (r < 0.70) return 'vermelho';
      if (r < 0.85) return 'amarelo';
    } else {
      if (r < 0.75) return 'vermelho';
      if (r < 0.90) return 'amarelo';
    }
    if (r <= 1.10) return 'verde';
    if (r <= 1.25) return 'amarelo';
    return 'vermelho';
  }

  function aplicar(valId, barId, nome, valor, meta, tipo) {
    var c = cor(valor, meta, tipo);
    var hex = c ? CORES[c] : '';
    var v = $(valId);
    if (v) v.style.color = hex;
    if (barId) { var b = $(barId); if (b) b.style.background = hex; }
  }

  function atualizarAlertas() {
    var perfil = lerPerfil();
    var itens = typeof diario === 'function' ? diario() : [];
    var t = { kcal: 0, p: 0, c: 0, g: 0 };
    itens.forEach(function (i) {
      t.kcal += Number(i.kcal || 0); t.p += Number(i.p || 0); t.c += Number(i.c || 0); t.g += Number(i.g || 0);
    });
    var semBase = !perfil.kcal;
    var aviso = $('alertaMetas');
    if (aviso) {
      aviso.style.display = semBase ? 'block' : 'none';
      aviso.textContent = 'Calcule sua recomendação no Perfil para ver os alertas de cada nutriente.';
    }
    if (semBase) {
      ['totalKcal', 'totalP', 'totalC', 'totalG'].forEach(function (id) { if ($(id)) $(id).style.color = ''; });
      ['barP', 'barC', 'barG', 'progressBar'].forEach(function (id) { if ($(id)) $(id).style.background = ''; });
      return;
    }
    aplicar('totalKcal', 'progressBar', 'kcal', t.kcal, Number(meta) || 0, 'kcal');
    aplicar('totalP', 'barP', 'p', t.p, Number(perfil.proteina) || 0, 'p');
    aplicar('totalC', 'barC', 'c', t.c, Number(perfil.carbo) || 0, 'c');
    aplicar('totalG', 'barG', 'g', t.g, Number(perfil.gordura) || 0, 'g');
  }

  /* Ao salvar as informações: guarda o nível de atividade e preserva o prazo. */
  function ligarSalvar() {
    var s = $('salvarPerfilDadosBtn');
    if (!s) return;
    var antes = null;
    s.addEventListener('click', function () {
      var q = lerPerfil();
      antes = { prazoMeses: q.prazoMeses, planoStatus: q.planoStatus };
    }, true);
    s.addEventListener('click', function () {
      var q = lerPerfil();
      if (antes) Object.keys(antes).forEach(function (k) { if (antes[k] !== undefined) q[k] = antes[k]; });
      var sel = $('perfilAtividade');
      if (sel) q.atividade = Number(sel.value) || 1.55;
      salvarPerfil(q);
      antes = null;
    }, false);
  }

  function iniciar() {
    var p = lerPerfil();
    var sel = $('perfilAtividade');
    if (sel && p.atividade) sel.value = String(p.atividade);
    var b = $('calcularMetasBtn');
    if (b) b.onclick = calcularUI;
    ligarSalvar();
    if (p.kcal) renderTargets({
      bmr: p.bmr, tdee: p.tdee, kcal: p.kcal, proteina: p.proteina, carbo: p.carbo,
      gordura: p.gordura, agua: p.agua, fibras: p.fibras, origem: p.origem || '', atividade: p.atividade || 1.55, avisos: []
    });
    var original = window.atualizarResumo;
    if (typeof original === 'function') {
      window.atualizarResumo = function () { var r = original.apply(this, arguments); atualizarAlertas(); return r; };
    }
    atualizarAlertas();
  }

  window.PROFIT_RECOMENDACAO = { calcular: calcularPuro, cor: cor };
  setTimeout(iniciar, 300);
})();

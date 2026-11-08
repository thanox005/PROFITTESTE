/* PROFIT 3.0 — recomendação de calorias e macros (v15)
   Objetivo automático pelo peso desejado; kcal = TDEE + ajuste do prazo; alertas coloridos. */
(function () {
  'use strict';
  var KEY = 'profit_nutrition_profile_v31';
  var CARB_MIN = 100, GORD_MIN_KG = 0.8, GORD_PCT = 0.25, KCAL_KG = 7700, DIAS_MES = 30.4;
  var NIVEIS = { '1.2': 'Sedentário', '1.375': 'Leve', '1.55': 'Moderado', '1.725': 'Intenso', '1.9': 'Muito intenso' };
  var CORES = { verde: '#22c55e', amarelo: '#f59e0b', vermelho: '#ef4444' };

  function $(id) { return document.getElementById(id); }
  function num(id) { var v = Number(String(($(id) || {}).value || '').replace(',', '.')); return isFinite(v) ? v : 0; }
  function fmt(v, d) { return Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: d == null ? 0 : d }); }
  function fmtSinal(v) { return (v > 0 ? '+' : '') + fmt(v); }
  function lerPerfil() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function salvarPerfil(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function nivelNome(a) { return NIVEIS[String(a)] || 'Personalizado'; }

  function proteinaKg(atividade, objetivo) {
    var k = atividade <= 1.375 ? 1.4 : (atividade <= 1.55 ? 1.6 : 1.8);
    if (objetivo === 'ganhar') k = Math.max(k, 1.8);
    return k;
  }

  /* Objetivo automático + ajuste do prazo (refaz a verificação de viabilidade). */
  function planoPrazo(d) {
    var delta = d.pesoMeta ? d.pesoMeta - d.peso : 0;
    var objetivo = Math.abs(delta) < 0.05 ? 'manter' : (delta > 0 ? 'ganhar' : 'emagrecer');
    if (objetivo === 'manter') return { objetivo: 'manter', ajuste: 0, bloqueio: null, delta: 0 };
    if (!d.meses) return { objetivo: objetivo, ajuste: 0, bloqueio: 'Informe o prazo em meses para calcular a meta.', delta: delta };

    var r = window.PROFIT_ESTIMATIVA
      ? window.PROFIT_ESTIMATIVA.avaliar({ pesoAtual: d.peso, pesoMeta: d.pesoMeta, meses: d.meses, sexo: d.sexo, idade: d.idade, altura: d.altura, atividade: d.atividade, perfil: {} })
      : { status: 'ok', msgs: [] };
    if (r.status === 'bloqueado') {
      return {
        objetivo: objetivo, ajuste: 0, delta: delta,
        bloqueio: 'Plano bloqueado: ' + r.msgs.join(' ') + ' Prazo mínimo seguro: ' + fmt(r.mesesMin, 1) + ' meses. A meta não foi alterada.'
      };
    }
    return { objetivo: objetivo, ajuste: Math.round(delta * KCAL_KG / (d.meses * DIAS_MES)), bloqueio: null, delta: delta };
  }

  function calcularPuro(d) {
    var bmr = (10 * d.peso) + (6.25 * d.altura) - (5 * d.idade) + (d.sexo === 'm' ? 5 : -161);
    var tdee = Math.round(bmr * d.atividade);
    var ajuste = d.ajuste || 0;
    var kcal = tdee + ajuste;
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
      bmr: bmr, tdee: tdee, ajuste: ajuste, kcal: kcal, objetivo: d.objetivo, meses: d.meses, atividade: d.atividade,
      proteina: prot, gordura: gord, carbo: carb, agua: d.peso * 35 / 1000, fibras: kcal / 1000 * 14, avisos: avisos
    };
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
      var linhas = [
        'BMR ' + fmt(r.bmr) + ' kcal · TDEE ' + fmt(r.tdee) + ' kcal (' + nivelNome(r.atividade).toLowerCase() + ')',
        r.objetivo === 'manter'
          ? 'Conta: TDEE ' + fmt(r.tdee) + ' + ajuste 0 = ' + fmt(r.kcal) + ' kcal (manutenção)'
          : 'Conta: TDEE ' + fmt(r.tdee) + ' ' + fmtSinal(r.ajuste) + ' = ' + fmt(r.kcal) + ' kcal (' + (r.objetivo === 'ganhar' ? 'ganhar' : 'emagrecer') + ' em ' + fmt(r.meses, 1) + ' mês(es))'
      ];
      r.avisos.forEach(function (a) { linhas.push('⚠️ ' + a); });
      linhas.push('Estimativa. Não substitui avaliação profissional.');
      note.innerHTML = linhas.join('<br>');
    }
  }

  function mostrarBloqueio(msg) {
    var note = $('profitNutritionNote');
    if (note) note.innerHTML = '<b>⛔ ' + msg + '</b>';
    statusRec('bloqueado', '⛔ ' + msg);
  }

  function statusRec(tipo, texto) {
    var el = $('recStatus');
    if (!el) return;
    el.className = 'rec-status ' + tipo;
    el.textContent = texto;
    try { el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
  }

  function calcularUI() {
    var d = {
      sexo: ($('perfilSexo') || {}).value || '',
      idade: num('perfilIdade'), altura: num('perfilAltura'), peso: num('perfilPesoAtual'),
      pesoMeta: num('perfilPesoMeta'), meses: num('perfilPrazoMeses'),
      atividade: Number(($('perfilAtividade') || {}).value) || 1.55
    };
    if (!d.sexo || !d.idade || !d.altura || !d.peso) {
      statusRec('bloqueado', '⛔ Preencha sexo, idade, altura e peso atual no Perfil.');
      if (typeof toast === 'function') toast('Preencha sexo, idade, altura e peso atual no Perfil.');
      return;
    }
    var plano = planoPrazo(d);
    var sel = $('perfilObjetivo');
    if (sel) sel.value = plano.objetivo;

    if (plano.bloqueio) {
      mostrarBloqueio(plano.bloqueio);
      if (typeof toast === 'function') toast('Plano bloqueado. Veja o motivo.');
      return;
    }

    var r = calcularPuro({
      sexo: d.sexo, idade: d.idade, altura: d.altura, peso: d.peso, atividade: d.atividade,
      objetivo: plano.objetivo, ajuste: plano.ajuste, meses: d.meses
    });

    var p = lerPerfil();
    Object.assign(p, {
      sexo: d.sexo, idade: d.idade, altura: d.altura, peso: d.peso, atividade: d.atividade, objetivo: plano.objetivo,
      bmr: r.bmr, tdee: r.tdee, ajuste: r.ajuste, kcal: r.kcal, proteina: r.proteina, gordura: r.gordura, carbo: r.carbo,
      agua: r.agua, fibras: r.fibras, atualizado: new Date().toISOString().slice(0, 10)
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
    statusRec('ok', '✅ Meta atualizada: ' + fmt(r.kcal) + ' kcal/dia' + (d.pesoMeta ? ' (peso desejado ' + fmt(d.pesoMeta, 1) + ' kg)' : '') + '.');
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

  function aplicar(valId, barId, valor, meta, tipo) {
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
    aplicar('totalKcal', 'progressBar', t.kcal, Number(meta) || 0, 'kcal');
    aplicar('totalP', 'barP', t.p, Number(perfil.proteina) || 0, 'p');
    aplicar('totalC', 'barC', t.c, Number(perfil.carbo) || 0, 'c');
    aplicar('totalG', 'barG', t.g, Number(perfil.gordura) || 0, 'g');
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
      bmr: p.bmr, tdee: p.tdee, ajuste: p.ajuste || 0, kcal: p.kcal, objetivo: p.objetivo || 'manter',
      meses: p.prazoMeses || 0, proteina: p.proteina, carbo: p.carbo, gordura: p.gordura, agua: p.agua,
      fibras: p.fibras, atividade: p.atividade || 1.55, avisos: []
    });
    var original = window.atualizarResumo;
    if (typeof original === 'function') {
      window.atualizarResumo = function () { var r = original.apply(this, arguments); atualizarAlertas(); return r; };
    }
    atualizarAlertas();
  }

  window.PROFIT_RECOMENDACAO = { calcular: calcularPuro, plano: planoPrazo, cor: cor };
  setTimeout(iniciar, 300);
})();

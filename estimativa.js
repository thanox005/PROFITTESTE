/* PROFIT 3.0 — estimativa de prazo para o peso desejado, com limites de segurança */
(function () {
  'use strict';
  var KEY = 'profit_nutrition_profile_v31';
  var LIMITE = { ganhar: 0.75, perder: 0.75 };   // % do peso por semana
  var MESES_SEMANA = 4.345;
  var KCAL_KG = 7700;
  var SUPERAVIT_MAX = 800;
  var KCAL_MIN = { m: 1500, f: 1200 };

  function $(id) { return document.getElementById(id); }
  function num(id) { var v = Number(String(($(id) || {}).value || '').replace(',', '.')); return isFinite(v) ? v : 0; }
  function fmt(v, d) { return Number(v).toLocaleString('pt-BR', { maximumFractionDigits: d == null ? 1 : d }); }
  function lerPerfil() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function gravarPerfil(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }

  function tdeeEstimado(d) {
    if (!d.sexo || !d.idade || !d.altura || !d.pesoAtual) return 0;
    var bmr = (10 * d.pesoAtual) + (6.25 * d.altura) - (5 * d.idade) + (d.sexo === 'm' ? 5 : -161);
    return bmr * (d.atividade || 1.55);
  }

  /* Regra central: retorna status 'ok' | 'atencao' | 'bloqueado' | 'incompleto' */
  function avaliar(d) {
    var r = { status: 'incompleto', msgs: [], delta: 0, meses: d.meses, pesoAtual: d.pesoAtual, pesoMeta: d.pesoMeta };
    if (!d.pesoAtual || !d.pesoMeta || !d.meses) return r;
    r.delta = d.pesoMeta - d.pesoAtual;
    if (Math.abs(r.delta) < 0.05) { r.status = 'ok'; r.msgs.push('Você já está no peso desejado. Use a meta de manutenção.'); return r; }

    var tipo = r.delta > 0 ? 'ganhar' : 'perder';
    var semanas = d.meses * MESES_SEMANA;
    r.tipo = tipo;
    r.ritmo = Math.abs(r.delta) / semanas;                 // kg por semana
    r.pct = r.ritmo / d.pesoAtual * 100;                   // % do peso por semana
    r.limite = LIMITE[tipo];
    r.ajusteDia = Math.round(r.ritmo * KCAL_KG / 7) * (tipo === 'ganhar' ? 1 : -1);
    r.mesesMin = Math.ceil((Math.abs(r.delta) / (r.limite / 100 * d.pesoAtual)) / MESES_SEMANA * 2) / 2;

    var tdee = tdeeEstimado(d);
    var ingestao = tdee + r.ajusteDia;
    r.ingestao = Math.round(ingestao);

    var bloqueios = [], avisos = [];
    if (r.pct > r.limite) {
      bloqueios.push('Ritmo de ' + fmt(r.pct, 2) + '% do peso por semana. O limite seguro é ' + fmt(r.limite, 2) + '%.');
    }
    if (tipo === 'ganhar' && r.ajusteDia > SUPERAVIT_MAX) {
      bloqueios.push('Superávit de ~' + fmt(r.ajusteDia, 0) + ' kcal/dia. O máximo seguro é ' + SUPERAVIT_MAX + ' kcal/dia.');
    }
    if (tdee && ingestao < (KCAL_MIN[d.sexo] || 1200)) {
      bloqueios.push('A ingestão ficaria em ~' + fmt(ingestao, 0) + ' kcal/dia, abaixo do mínimo seguro de ' + fmt(KCAL_MIN[d.sexo] || 1200, 0) + ' kcal.');
    }
    if (!bloqueios.length && r.pct > r.limite * 0.8) {
      avisos.push('Ritmo perto do limite. Qualquer ajuste extra pode passar do seguro.');
    }

    if (bloqueios.length) { r.status = 'bloqueado'; r.msgs = bloqueios; }
    else if (avisos.length) { r.status = 'atencao'; r.msgs = avisos; }
    else { r.status = 'ok'; r.msgs = []; }
    return r;
  }

  function riscos(tipo) {
    return tipo === 'ganhar'
      ? 'Ganhar rápido demais tende a aumentar gordura corporal, retenção de líquido e desconforto digestivo.'
      : 'Perder rápido demais pode causar perda de massa muscular, cansaço, queda de cabelo e efeito sanfona.';
  }

  function textoResultado(r) {
    if (r.status === 'incompleto') return { classe: '', html: 'Preencha peso atual, peso desejado e prazo em meses para verificar.' };
    if (r.status === 'ok' && Math.abs(r.delta) < 0.05) return { classe: 'ok', html: r.msgs[0] };
    var titulo = { ok: '✅ Viável', atencao: '⚠️ Atenção', bloqueado: '⛔ Bloqueado' }[r.status];
    var linhas = [
      '<b>' + titulo + '</b>',
      (r.tipo === 'ganhar' ? 'Ganho' : 'Perda') + ' de ' + fmt(Math.abs(r.delta)) + ' kg em ' + fmt(r.meses, 1) + ' mês(es).',
      'Ritmo: ' + fmt(r.ritmo, 2) + ' kg/sem (' + fmt(r.pct, 2) + '% do peso).'
    ];
    if (r.status === 'bloqueado') {
      r.msgs.forEach(function (m) { linhas.push('• ' + m); });
      linhas.push('<b>Prazo mínimo seguro: ' + fmt(r.mesesMin, 1) + ' meses.</b>');
    }
    if (r.status === 'atencao') r.msgs.forEach(function (m) { linhas.push('• ' + m); });
    if (r.status !== 'ok') linhas.push('Risco: ' + riscos(r.tipo));
    if (r.status === 'ok') linhas.push('Ajuste sugerido: ' + (r.ajusteDia > 0 ? '+' : '') + fmt(r.ajusteDia, 0) + ' kcal/dia.');
    return { classe: r.status, html: linhas.join('<br>') };
  }

  function dadosAtuais() {
    var perfil = lerPerfil();
    return {
      pesoAtual: num('perfilPesoAtual'),
      pesoMeta: num('perfilPesoMeta'),
      meses: num('perfilPrazoMeses'),
      sexo: ($('perfilSexo') || {}).value || perfil.sexo || '',
      idade: num('perfilIdade') || Number(perfil.idade || 0),
      altura: num('perfilAltura') || Number(perfil.altura || 0),
      atividade: Number(($('perfilAtividade') || {}).value) || Number(perfil.atividade) || 1.55,
      perfil: perfil
    };
  }

  function mostrar(r) {
    var box = $('prazoResultado');
    if (!box) return;
    var t = textoResultado(r);
    box.className = 'prazo-resultado ' + t.classe;
    box.innerHTML = t.html;
  }

  function verificar() {
    var d = dadosAtuais();
    var r = avaliar(d);
    mostrar(r);
    if (r.status === 'ok' || r.status === 'atencao') {
      var perfil = lerPerfil();
      perfil.prazoMeses = d.meses;
      perfil.pesoMeta = d.pesoMeta;
      perfil.planoStatus = r.status;
      gravarPerfil(perfil);
    }
    return r;
  }

  /* Bloqueia o "Salvar informações" quando o plano atual não é viável. */
  function bloquearSeNecessario(ev) {
    var d = dadosAtuais();
    if (!d.meses || !d.pesoMeta || !d.pesoAtual) return;
    var r = avaliar(d);
    if (r.status === 'bloqueado') {
      ev.stopImmediatePropagation();
      ev.preventDefault();
      mostrar(r);
      if (typeof toast === 'function') toast('Plano bloqueado: ajuste o prazo antes de salvar.');
    }
  }

  function iniciar() {
    var prazo = $('perfilPrazoMeses');
    var perfil = lerPerfil();
    if (prazo && perfil.prazoMeses && !prazo.value) prazo.value = perfil.prazoMeses;
    var b = $('verificarPrazoBtn');
    if (b) b.onclick = verificar;
    var s = $('salvarPerfilDadosBtn');
    if (s) s.addEventListener('click', bloquearSeNecessario, true);
  }

  window.PROFIT_ESTIMATIVA = { avaliar: avaliar };
  setTimeout(iniciar, 250);
})();

/* PROFIT 3.0 — recomendação nutricional baseada nos dados do Perfil. */
(function () {
  'use strict';

  var KEY = 'profit_nutrition_profile_v31';
  var CALORIE_PER_KG = 7700;
  var DAYS_PER_MONTH = 30.4;
  var WEEKS_PER_MONTH = 4.345;
  var MIN_WEEKLY_CHANGE_PERCENT = 0.75;
  var MIN_KCAL = { m: 1500, f: 1200 };

  function $(id) { return document.getElementById(id); }
  function readNumber(id) {
    var el = $(id);
    var value = el ? String(el.value || '').trim().replace(',', '.') : '';
    return value === '' ? 0 : Number(value);
  }
  function readProfile() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function saveProfile(profile) {
    try { localStorage.setItem(KEY, JSON.stringify(profile)); return true; }
    catch (e) { return false; }
  }
  function fmt(value, digits) {
    return Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: digits == null ? 0 : digits });
  }
  function setStatus(kind, text) {
    var el = $('recStatus');
    if (!el) return;
    el.className = 'rec-status ' + kind;
    el.textContent = text;
  }
  function notify(text) {
    if (typeof window.toast === 'function') window.toast(text);
  }

  function getProfileData() {
    var saved = readProfile();
    var value = function (id, fallback) {
      var field = $(id);
      if (field && String(field.value || '').trim() !== '') return field.value;
      return fallback == null ? '' : fallback;
    };
    var activityValue = value('perfilAtividade', saved.atividade || 1.55);
    return {
      sexo: String(value('perfilSexo', saved.sexo || '')).trim(),
      idade: Number(String(value('perfilIdade', saved.idade || '')).replace(',', '.')),
      altura: Number(String(value('perfilAltura', saved.altura || '')).replace(',', '.')),
      peso: Number(String(value('perfilPesoAtual', saved.peso || '')).replace(',', '.')),
      pesoMeta: Number(String(value('perfilPesoMeta', saved.pesoMeta || '')).replace(',', '.')),
      meses: Number(String(value('perfilPrazoMeses', saved.prazoMeses || '')).replace(',', '.')),
      atividade: Number(activityValue),
      objetivoEscolhido: String(value('perfilObjetivo', saved.objetivo || 'emagrecer'))
    };
  }

  function validate(data) {
    if (!['m', 'f'].includes(data.sexo)) return 'Selecione o sexo no Perfil.';
    if (!Number.isFinite(data.idade) || data.idade < 13 || data.idade > 100) return 'Informe uma idade válida (13 a 100 anos).';
    if (!Number.isFinite(data.altura) || data.altura < 100 || data.altura > 230) return 'Informe uma altura válida (100 a 230 cm).';
    if (!Number.isFinite(data.peso) || data.peso < 30 || data.peso > 300) return 'Informe um peso atual válido (30 a 300 kg).';
    if (!Number.isFinite(data.atividade) || data.atividade < 1.2 || data.atividade > 1.9) return 'Selecione um nível de atividade válido.';
    if (data.pesoMeta && (data.pesoMeta < 30 || data.pesoMeta > 300)) return 'Informe um peso desejado válido (30 a 300 kg).';
    if (data.meses && (data.meses < 0.5 || data.meses > 24)) return 'O prazo deve ser de 0,5 a 24 meses.';
    return '';
  }

  function calculate(data) {
    var bmr = (10 * data.peso) + (6.25 * data.altura) - (5 * data.idade) + (data.sexo === 'm' ? 5 : -161);
    var tdee = Math.round(bmr * data.atividade);
    var delta = data.pesoMeta ? data.pesoMeta - data.peso : 0;
    var goal = Math.abs(delta) < 0.05
      ? (data.pesoMeta ? 'manter' : data.objetivoEscolhido)
      : (delta < 0 ? 'emagrecer' : 'ganhar');
    var adjustment = 0;
    var warnings = [];

    if (goal !== 'manter' && data.pesoMeta && Math.abs(delta) >= 0.05 && data.meses) {
      var weeklyPercent = Math.abs(delta) / (data.meses * WEEKS_PER_MONTH) / data.peso * 100;
      if (weeklyPercent > MIN_WEEKLY_CHANGE_PERCENT) {
        var minMonths = Math.ceil((Math.abs(delta) / (data.peso * MIN_WEEKLY_CHANGE_PERCENT / 100)) / WEEKS_PER_MONTH * 2) / 2;
        throw new Error('Prazo muito agressivo: ' + fmt(weeklyPercent, 2) + '% do peso por semana. Para um ritmo mais seguro, aumente o prazo para pelo menos ' + fmt(minMonths, 1) + ' meses.');
      }
      adjustment = Math.round(delta * CALORIE_PER_KG / (data.meses * DAYS_PER_MONTH));
    } else if (goal === 'emagrecer') {
      adjustment = -Math.round(tdee * 0.15);
    } else if (goal === 'ganhar') {
      adjustment = Math.round(tdee * 0.10);
    }

    if (goal === 'ganhar' && adjustment > 800) {
      throw new Error('O superávit calculado excede 800 kcal/dia. Revise o prazo e o peso desejado.');
    }

    var minimum = MIN_KCAL[data.sexo];
    var kcal = Math.round(tdee + adjustment);
    if (kcal < minimum) {
      if (data.pesoMeta && data.meses && goal === 'emagrecer') {
        throw new Error('O plano resultaria em menos de ' + minimum + ' kcal/dia. Aumente o prazo ou revise o peso desejado.');
      }
      kcal = minimum;
      adjustment = kcal - tdee;
      warnings.push('A meta foi ajustada ao piso de referência de ' + minimum + ' kcal/dia; confirme sua necessidade com um profissional.');
    }

    var proteinPerKg = data.atividade <= 1.375 ? 1.4 : (data.atividade <= 1.55 ? 1.6 : 1.8);
    if (goal === 'emagrecer' || goal === 'ganhar') proteinPerKg = Math.max(proteinPerKg, 1.8);
    var protein = data.peso * proteinPerKg;
    var fat = Math.max(data.peso * 0.8, kcal * 0.25 / 9);
    var carbs = (kcal - protein * 4 - fat * 9) / 4;
    if (carbs < 0) {
      fat = Math.max(0, (kcal - protein * 4) / 9);
      carbs = Math.max(0, (kcal - protein * 4 - fat * 9) / 4);
      warnings.push('A distribuição de macros foi ajustada para caber na meta calórica. Peça orientação individualizada se necessário.');
    } else if (carbs < 100) {
      warnings.push('Carboidratos abaixo de 100 g/dia; a distribuição de macros pode precisar de avaliação profissional.');
    }

    return {
      bmr: bmr, tdee: tdee, ajuste: adjustment, kcal: kcal, objetivo: goal,
      proteina: protein, gordura: fat, carbo: carbs,
      agua: data.peso * 35 / 1000, fibras: kcal / 1000 * 14,
      avisos: warnings
    };
  }

  function render(result, data) {
    var grid = $('profitTargetGrid');
    var note = $('profitNutritionNote');
    if (grid) {
      var targets = [
        ['🔥', fmt(result.kcal) + ' kcal', 'kcal / dia'],
        ['🥩', fmt(result.proteina) + ' g', 'proteína'],
        ['🍚', fmt(result.carbo) + ' g', 'carboidratos'],
        ['🥑', fmt(result.gordura) + ' g', 'gorduras'],
        ['💧', fmt(result.agua, 1) + ' L', 'água'],
        ['🌾', fmt(result.fibras) + ' g', 'fibras']
      ];
      grid.textContent = '';
      targets.forEach(function (item) {
        var card = document.createElement('div');
        card.className = 'profit-target';
        var label = document.createElement('span');
        label.textContent = item[0] + ' ' + item[2];
        var value = document.createElement('b');
        value.textContent = item[1];
        card.appendChild(label);
        card.appendChild(value);
        grid.appendChild(card);
      });
    }
    if (note) {
      var lines = [
        'Cálculo: Mifflin–St Jeor; BMR ' + fmt(result.bmr) + ' kcal × fator de atividade ' + data.atividade + ' = TDEE ' + fmt(result.tdee) + ' kcal.',
        'Meta: TDEE ' + (result.ajuste > 0 ? '+ ' : result.ajuste < 0 ? '− ' : '+ ') + fmt(Math.abs(result.ajuste)) + ' = ' + fmt(result.kcal) + ' kcal/dia (' + (result.objetivo === 'emagrecer' ? 'emagrecimento' : result.objetivo === 'ganhar' ? 'ganho de peso' : 'manutenção') + ').',
        'Estimativa geral; não substitui avaliação de nutricionista ou médico.'
      ].concat(result.avisos.map(function (warning) { return '⚠️ ' + warning; }));
      note.textContent = lines.join('\n');
    }
  }

  function updateRecommendation() {
    var data = getProfileData();
    var error = validate(data);
    if (error) {
      setStatus('bloqueado', '⛔ ' + error);
      notify(error);
      return;
    }

    try {
      var result = calculate(data);
      var profile = readProfile();
      Object.assign(profile, {
        sexo: data.sexo, idade: data.idade, altura: data.altura, peso: data.peso,
        pesoMeta: data.pesoMeta || null, prazoMeses: data.meses || null,
        atividade: data.atividade, objetivo: result.objetivo,
        bmr: result.bmr, tdee: result.tdee, ajuste: result.ajuste,
        kcal: result.kcal, proteina: result.proteina, gordura: result.gordura,
        carbo: result.carbo, agua: result.agua, fibras: result.fibras,
        atualizado: new Date().toISOString().slice(0, 10)
      });
      if (!saveProfile(profile)) throw new Error('Não foi possível salvar o perfil neste dispositivo. Verifique o espaço disponível.');

      var goal = $('perfilObjetivo');
      if (goal) goal.value = result.objetivo;
      ['nutSexo', 'nutIdade', 'nutAltura', 'nutPeso', 'nutAtividade', 'nutObjetivo'].forEach(function (id, index) {
        var field = $(id);
        if (field) field.value = [data.sexo, data.idade, data.altura, data.peso, data.atividade, result.objetivo][index];
      });

      if (typeof window.meta !== 'undefined') window.meta = result.kcal;
      localStorage.setItem('nutri_meta', String(result.kcal));
      if ($('meta')) $('meta').value = result.kcal;
      var waterGoal = Math.max(0.5, Number(result.agua.toFixed(1)));
      localStorage.setItem('nutri_meta_agua', String(waterGoal));
      if (typeof window.metaAgua !== 'undefined') window.metaAgua = waterGoal;
      if ($('waterGoalInput')) $('waterGoalInput').value = waterGoal;

      render(result, data);
      if (typeof window.atualizarTudo === 'function') window.atualizarTudo();
      if (typeof window.renderAgua === 'function') window.renderAgua();
      setStatus('ok', '✅ Recomendação atualizada com os dados do Perfil: ' + fmt(result.kcal) + ' kcal/dia.');
      notify('Recomendação atualizada. 🎯');
    } catch (error) {
      setStatus('bloqueado', '⛔ ' + error.message);
      notify(error.message);
    }
  }

  function init() {
    var button = $('calcularMetasBtn');
    if (button) button.onclick = updateRecommendation;

    var profile = readProfile();
    if (profile.kcal) {
      var data = {
        atividade: Number(profile.atividade) || 1.55
      };
      render({
        bmr: Number(profile.bmr) || 0, tdee: Number(profile.tdee) || 0,
        ajuste: Number(profile.ajuste) || 0, kcal: Number(profile.kcal) || 0,
        objetivo: profile.objetivo || 'manter', proteina: Number(profile.proteina) || 0,
        carbo: Number(profile.carbo) || 0, gordura: Number(profile.gordura) || 0,
        agua: Number(profile.agua) || 0, fibras: Number(profile.fibras) || 0,
        avisos: []
      }, data);
    }
  }

  window.PROFIT_RECOMENDACAO = { calcular: calculate };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

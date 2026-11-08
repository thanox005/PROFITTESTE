/* altura.js — PROFIT 4.0: se a altura vier em metros (ex.: 1,74), converte para cm (174). */
(function () {
  'use strict';
  var IDS = ['perfilAltura', 'nutAltura'];

  function corrigir(el) {
    if (!el) return;
    var v = parseFloat(String(el.value).replace(',', '.'));
    if (!isNaN(v) && v > 0 && v < 3) {
      el.value = String(Math.round(v * 100));
      try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
    }
  }
  function corrigirTodos() { IDS.forEach(function (id) { corrigir(document.getElementById(id)); }); }

  IDS.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', function () { corrigir(el); });
    el.addEventListener('blur', function () { corrigir(el); });
  });

  /* Garante a correção antes de salvar, verificar prazo ou atualizar recomendação. */
  var BOTOES = ['salvarPerfilDadosBtn', 'verificarPrazoBtn', 'calcularMetasBtn', 'salvarPerfilBtn'];
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('button') : null;
    if (b && BOTOES.indexOf(b.id) >= 0) corrigirTodos();
  }, true);
})();

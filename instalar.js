/* instalar.js — PROFIT 4.0: convite para instalar o app (tela de entrada).
   Android/Chrome/Edge: botão "Instalar" (usa o aviso oficial do navegador).
   iPhone/Safari: instrução curta (o iOS não permite botão de instalar).
   Regras: se o app já está instalado, não aparece. Se a pessoa fechar no ×,
   aparece de novo na próxima vez que abrir. Chaves "pfinstall_*" NÃO entram
   no backup nem na sincronização. */
(function () {
  'use strict';

  var CHAVE_INSTALADO = 'pfinstall_instalado';

  function lerFlag(k) { try { return localStorage.getItem(k) === '1'; } catch (e) { return false; } }
  function gravarFlag(k) { try { localStorage.setItem(k, '1'); } catch (e) {} }

  function emModoApp() {
    try {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
      if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) return true;
    } catch (e) {}
    return window.navigator.standalone === true; // iOS
  }
  function jaInstalado() {
    if (emModoApp()) { gravarFlag(CHAVE_INSTALADO); return true; }
    return lerFlag(CHAVE_INSTALADO);
  }
  function ehIOS() {
    var ua = navigator.userAgent || '';
    var iPad13 = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return /iPhone|iPad|iPod/i.test(ua) || iPad13;
  }

  var fechadoNestaAbertura = false;
  var card = null;

  function css() {
    if (document.getElementById('pfInstallCss')) return;
    var s = document.createElement('style');
    s.id = 'pfInstallCss';
    s.textContent =
      '#pfInstallCard{position:relative;width:100%;border:1px solid var(--border);border-radius:16px;padding:12px 34px 12px 14px;margin-top:12px;background:var(--soft);text-align:left;display:none}' +
      '#pfInstallCard .pfi-t{font-size:14px;font-weight:bold;color:var(--text)}' +
      '#pfInstallCard .pfi-d{font-size:12px;color:var(--muted);line-height:1.45;margin-top:4px}' +
      '#pfInstallCard .pfi-x{position:absolute;top:6px;right:8px;width:28px;height:28px;border:0;background:transparent;color:var(--muted);font-size:20px;line-height:1;cursor:pointer}' +
      '#pfInstallCard .btn{width:100%;margin-top:10px}' +
      '#pfInstallCard .pfi-ja{display:block;margin-top:8px;border:0;background:transparent;color:var(--muted);font-size:12px;text-decoration:underline;cursor:pointer;padding:0}';
    document.head.appendChild(s);
  }

  function montar() {
    if (card) return card;
    var box = document.querySelector('#loginGate .gate-box');
    if (!box) return null;
    css();
    card = document.createElement('div');
    card.id = 'pfInstallCard';
    card.innerHTML =
      '<button class="pfi-x" type="button" aria-label="Fechar">×</button>' +
      '<div class="pfi-t">📲 Instale o app</div>' +
      '<div class="pfi-d" id="pfiTexto"></div>' +
      '<button class="btn btn-dark" id="pfiBtn" type="button" style="display:none">Instalar app</button>' +
      '<button class="pfi-ja" id="pfiJa" type="button" style="display:none">Já instalei</button>';
    var ref = document.getElementById('gateBackup');
    if (ref && ref.parentNode === box) box.insertBefore(card, ref); else box.appendChild(card);

    card.querySelector('.pfi-x').addEventListener('click', function () {
      fechadoNestaAbertura = true; // sem salvar: volta na próxima abertura
      atualizar();
    });
    document.getElementById('pfiJa').addEventListener('click', function () {
      gravarFlag(CHAVE_INSTALADO);
      atualizar();
    });
    document.getElementById('pfiBtn').addEventListener('click', function () {
      var ev = window.__pfInstall;
      if (!ev) return;
      window.__pfInstall = null;
      try {
        ev.prompt();
        if (ev.userChoice && ev.userChoice.then) {
          ev.userChoice.then(function (r) {
            if (r && r.outcome === 'accepted') gravarFlag(CHAVE_INSTALADO);
            atualizar();
          });
        }
      } catch (e) {}
      atualizar();
    });
    return card;
  }

  function atualizar() {
    var c = montar();
    if (!c) return;
    var mostrar = false;
    var btn = document.getElementById('pfiBtn');
    var ja = document.getElementById('pfiJa');
    var txt = document.getElementById('pfiTexto');

    if (!jaInstalado() && !fechadoNestaAbertura) {
      if (window.__pfInstall) {
        mostrar = true;
        txt.textContent = 'Abra o PROFIT direto da tela inicial do celular, como um app, e use mesmo sem internet.';
        btn.style.display = 'block';
        ja.style.display = 'none';
      } else if (ehIOS()) {
        mostrar = true;
        txt.innerHTML = 'Toque em <b>Compartilhar</b> (□↑) e depois em <b>Adicionar à Tela de Início</b>.';
        btn.style.display = 'none';
        ja.style.display = 'block';
      }
    }
    c.style.display = mostrar ? 'block' : 'none';
  }

  window.addEventListener('appinstalled', function () {
    gravarFlag(CHAVE_INSTALADO);
    window.__pfInstall = null;
    atualizar();
  });
  document.addEventListener('pfinstall:pronto', atualizar);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', atualizar);
  else atualizar();
})();

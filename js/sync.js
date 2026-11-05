/* PROFIT — Login Google + sincronização com o Apps Script.
   O app continua salvando no localStorage (funciona offline); a nuvem é cópia/sincronização. */
(function () {
  'use strict';

  var CFG = window.PROFIT_CLOUD || {};
  var LS = window.localStorage;
  var setOrig = Storage.prototype.setItem;
  var removeOrig = Storage.prototype.removeItem;

  function q(id) { return document.getElementById(id); }
  function aviso(t) { try { if (typeof window.toast === 'function') window.toast(t); } catch (e) {} }
  function get(k) { try { return LS.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { setOrig.call(LS, k, String(v)); } catch (e) {} }
  function del(k) { try { removeOrig.call(LS, k); } catch (e) {} }

  var ESTADO = ['pfsync_session', 'pfsync_exp', 'pfsync_user', 'pfsync_base', 'pfsync_hash', 'pfsync_last'];
  var EXCLUI = [/^profit_backup_prompted_/, /^nutri_tela_atual$/];

  function deveSincronizar(k) {
    return typeof k === 'string' && (k.indexOf('nutri_') === 0 || k.indexOf('profit_') === 0) &&
      !EXCLUI.some(function (r) { return r.test(k); });
  }
  function configOk() {
    return !!CFG.apiUrl && /^https:\/\/script\.google\.com\//.test(CFG.apiUrl) &&
      !!CFG.clientId && CFG.clientId.indexOf('COLE') !== 0;
  }
  function logado() { return !!get('pfsync_session') && Number(get('pfsync_exp') || 0) > Date.now(); }

  function snapshot() {
    var o = {};
    for (var i = 0; i < LS.length; i++) {
      var k = LS.key(i);
      if (deveSincronizar(k)) o[k] = LS.getItem(k);
    }
    return o;
  }
  function hash(o) {
    var s = Object.keys(o).sort().map(function (k) { return k + '=' + o[k]; }).join('\u0001');
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return h + ':' + s.length;
  }
  function sanear(o) {
    var out = {};
    if (!o || typeof o !== 'object') return out;
    Object.keys(o).forEach(function (k) {
      if (deveSincronizar(k) && typeof o[k] === 'string') out[k] = o[k];
    });
    return out;
  }

  /* ---------- Mesclagem (nunca apaga: junta os dois lados) ---------- */
  function parse(v) { try { return JSON.parse(v); } catch (e) { return undefined; } }
  function isObj(x) { return !!x && typeof x === 'object' && !Array.isArray(x); }
  function cmp(a, b) {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    a = String(a); b = String(b);
    return a < b ? -1 : a > b ? 1 : 0;
  }
  function primitivos(arr) { return arr.every(function (e) { return e === null || typeof e !== 'object'; }); }

  function mergeValor(cloud, local, prefLocal) {
    var pa = parse(cloud), pb = parse(local);
    if (isObj(pa) && isObj(pb)) {
      var out = Object.assign({}, pa);
      Object.keys(pb).forEach(function (k) {
        var x = pa[k], y = pb[k];
        if (Array.isArray(x) && Array.isArray(y) && primitivos(x.concat(y))) {
          out[k] = Array.from(new Set(x.concat(y))).sort(cmp);
        } else if (k in pa) {
          out[k] = prefLocal ? y : x;
        } else {
          out[k] = y;
        }
      });
      return JSON.stringify(out);
    }
    if (Array.isArray(pa) && Array.isArray(pb)) {
      var vistos = {}, res = [];
      (prefLocal ? pb.concat(pa) : pa.concat(pb)).forEach(function (e) {
        var id = (e && typeof e === 'object' && e.id !== undefined) ? 'id:' + e.id : 'js:' + JSON.stringify(e);
        if (!vistos[id]) { vistos[id] = 1; res.push(e); }
      });
      return JSON.stringify(res);
    }
    return prefLocal ? local : cloud;
  }
  function mesclar(cloud, local, prefLocal) {
    var out = {};
    var chaves = Object.keys(cloud).concat(Object.keys(local));
    chaves.forEach(function (k) {
      if (k in out) return;
      if (!(k in local)) out[k] = cloud[k];
      else if (!(k in cloud)) out[k] = local[k];
      else out[k] = cloud[k] === local[k] ? local[k] : mergeValor(cloud[k], local[k], prefLocal);
    });
    return out;
  }
  function aplicarLocal(obj) {
    Object.keys(obj).forEach(function (k) {
      if (deveSincronizar(k) && typeof obj[k] === 'string') setOrig.call(LS, k, obj[k]);
    });
  }

  /* ---------- Rede ---------- */
  function api(action, payload) {
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var t = ctrl ? setTimeout(function () { ctrl.abort(); }, 30000) : null;
    return fetch(CFG.apiUrl, {
      method: 'POST',                       // sem cabeçalhos: evita o preflight do CORS
      body: JSON.stringify(Object.assign({ action: action }, payload || {})),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) { return r.json(); })
      .then(function (j) { if (t) clearTimeout(t); return j; },
            function (e) { if (t) clearTimeout(t); throw e; });
  }

  /* ---------- Sincronização ---------- */
  var timer = null, andando = false, repetir = false;

  function agendar(ms, motivo) {
    if (!configOk() || !logado()) return;
    clearTimeout(timer);
    timer = setTimeout(function () { sincronizar(motivo || 'auto'); }, ms || 4000);
  }
  function marcar(base, h) { put('pfsync_base', base); put('pfsync_hash', h); }

  function enviar(obj, base) {
    return api('push', { session: get('pfsync_session'), data: obj, base: base }).then(function (r) {
      if (r.error === 'unauthorized') { sessaoExpirada(); throw new Error('unauthorized'); }
      if (r.error === 'conflict') { repetir = true; return; }
      if (!r.ok) throw new Error(r.error || 'falha_envio');
      marcar(r.updatedAt, hash(obj));
    });
  }

  async function sincronizar(motivo) {
    if (!configOk() || !logado()) return;
    if (andando) { repetir = true; return; }
    if (motivo === 'auto' && get('pfsync_base') !== null && hash(snapshot()) === get('pfsync_hash')) return;

    andando = true;
    setStatus('Sincronizando…');
    var recarregar = false;
    try {
      var pull = await api('pull', { session: get('pfsync_session') });
      if (pull.error === 'unauthorized') { sessaoExpirada(); return; }
      if (!pull.ok) throw new Error(pull.error || 'falha');

      var local = snapshot();
      var hLocal = hash(local);
      var base = get('pfsync_base');
      var temLocal = Object.keys(local).length > 0;

      if (!pull.exists) {
        if (temLocal) await enviar(local, 0); else marcar(0, hLocal);
      } else {
        var cloud = sanear(JSON.parse(pull.data));
        if (base !== null && Number(base) === Number(pull.updatedAt)) {
          if (hLocal !== get('pfsync_hash')) await enviar(local, pull.updatedAt);
          else marcar(pull.updatedAt, hLocal);
        } else {
          var merged;
          if (!temLocal) merged = cloud;
          else {
            var primeiro = (base === null);
            if (primeiro && !confirm('Encontramos dados desta conta na nuvem e também dados neste aparelho.\n\nOK = juntar os dois (nada será apagado)\nCancelar = não entrar agora')) {
              await sairLocal(false);
              return;
            }
            merged = mesclar(cloud, local, !primeiro);
          }
          if (hash(merged) !== hLocal) { aplicarLocal(merged); recarregar = true; }
          local = snapshot();
          if (hash(local) !== hash(cloud)) await enviar(local, pull.updatedAt);
          else marcar(pull.updatedAt, hash(local));
        }
      }
      put('pfsync_last', Date.now());
      setStatus();
      if (recarregar) { aviso('Dados atualizados da nuvem. ☁️'); setTimeout(function () { location.reload(); }, 700); }
    } catch (e) {
      if (!e || e.message !== 'unauthorized') {
        console.warn('PROFIT sync:', e);
        setStatus('Sem conexão ou falha ao sincronizar. Seus dados continuam salvos neste aparelho.');
      }
    } finally {
      andando = false;
      if (repetir) { repetir = false; agendar(1500, 'retry'); }
    }
  }

  /* ---------- Sessão / login ---------- */
  function limparSessaoLocal() { ESTADO.forEach(del); }
  function removerDadosLocais() {
    Object.keys(snapshot()).forEach(function (k) { removeOrig.call(LS, k); });
    del('pfsync_owner');
  }
  function sessaoExpirada() {
    limparSessaoLocal();
    aviso('Sua sessão expirou. Entre novamente.');
    renderUI();
    iniciarGoogle(0);
  }
  async function sairLocal(removerDados) {
    try { if (get('pfsync_session')) await api('logout', { session: get('pfsync_session') }); } catch (e) {}
    limparSessaoLocal();
    if (removerDados) removerDadosLocais();
    renderUI();
    iniciarGoogle(0);
    if (removerDados) setTimeout(function () { location.reload(); }, 500);
  }

  async function aoReceberCredencial(resp) {
    if (!resp || !resp.credential) return;
    setAviso('Entrando…');
    try {
      var r = await api('login', { idToken: resp.credential });
      if (!r.ok) { setAviso('Não foi possível entrar. Tente novamente.'); return; }

      var email = (r.user && r.user.email) || '';
      var dono = get('pfsync_owner');
      if (dono && dono !== email && Object.keys(snapshot()).length) {
        if (!confirm('Este aparelho tem dados de outra conta (' + dono + ').\n\nOK = remover esses dados deste aparelho e entrar com a nova conta\nCancelar = não entrar')) {
          try { await api('logout', { session: r.session }); } catch (e) {}
          setAviso(''); return;
        }
        removerDadosLocais();
      }
      put('pfsync_session', r.session);
      put('pfsync_exp', r.exp);
      put('pfsync_user', JSON.stringify(r.user || {}));
      put('pfsync_owner', email);
      del('pfsync_base'); del('pfsync_hash');
      renderUI();
      await sincronizar('login');
    } catch (e) {
      setAviso('Sem conexão. Tente novamente.');
    }
  }

  var gsiIniciado = false;
  function iniciarGoogle(tentativas) {
    if (logado() || !configOk()) return;
    var box = q('googleBtn');
    if (!box) return;
    if (!(window.google && google.accounts && google.accounts.id)) {
      if (tentativas < 40) { setTimeout(function () { iniciarGoogle(tentativas + 1); }, 500); }
      else setAviso('Não foi possível carregar o login do Google. Verifique a internet.');
      return;
    }
    if (!gsiIniciado) {
      google.accounts.id.initialize({ client_id: CFG.clientId, callback: aoReceberCredencial, auto_select: false });
      gsiIniciado = true;
    }
    // Se a aba Perfil estiver oculta, o Google não consegue desenhar o botão.
    // Ele é desenhado quando a aba for aberta (ver ligarAbaPerfil).
    if (box.offsetParent === null) return;
    box.innerHTML = '';
    google.accounts.id.renderButton(box, { theme: 'filled_blue', size: 'large', text: 'signin_with', shape: 'pill', locale: 'pt-BR' });
    setTimeout(function () {
      if (!box.querySelector('iframe') && !logado()) {
        setAviso('Não foi possível mostrar o botão de login. Confira se o endereço do site está autorizado no Google Cloud e tente de novo.');
        console.warn('PROFIT: botão do Google não apareceu. Origem atual:', location.origin);
      }
    }, 2500);
  }

  function ligarAbaPerfil() {
    var abas = document.querySelectorAll('#profitBottomNav .bottom-nav-btn');
    Array.prototype.forEach.call(abas, function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.screen === 'perfil') setTimeout(function () { iniciarGoogle(0); }, 350);
      });
    });
    var pb = q('perfilBtn');
    if (pb) pb.addEventListener('click', function () { setTimeout(function () { iniciarGoogle(0); }, 350); });
  }

  /* ---------- Interface ---------- */
  var AVISO_PADRAO = 'Ao entrar, seus dados (alimentação, peso e medidas) são enviados e guardados em uma planilha Google controlada pelo responsável pelo app. Você pode excluir tudo a qualquer momento.';
  function setAviso(t) { var el = q('syncAviso'); if (el) el.textContent = t || AVISO_PADRAO; }
  function setStatus(t) {
    var el = q('syncStatus');
    if (!el) return;
    if (t) { el.textContent = t; return; }
    var ult = Number(get('pfsync_last') || 0);
    el.textContent = ult
      ? '☁️ Última sincronização: ' + new Date(ult).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
      : '☁️ Ainda não sincronizado.';
  }
  function renderUI() {
    var off = q('syncDeslogado'), on = q('syncLogado'), cfg = q('syncSemConfig');
    if (!off || !on) return;
    if (!configOk()) { off.style.display = 'none'; on.style.display = 'none'; if (cfg) cfg.style.display = 'block'; return; }
    if (cfg) cfg.style.display = 'none';
    if (logado()) {
      var u = {}; try { u = JSON.parse(get('pfsync_user') || '{}'); } catch (e) {}
      var nome = u.nome || u.email || 'Conta Google';
      q('syncNome').textContent = nome;
      q('syncEmail').textContent = u.email || '';
      q('syncAvatar').textContent = (nome.trim().charAt(0) || '?').toUpperCase();
      off.style.display = 'none'; on.style.display = 'block';
      setStatus();
    } else {
      on.style.display = 'none'; off.style.display = 'block';
      setAviso();
    }
  }

  function ligarBotoes() {
    var b;
    if ((b = q('syncAgoraBtn'))) b.onclick = function () { sincronizar('manual'); };
    if ((b = q('syncSairBtn'))) b.onclick = async function () {
      if (!confirm('Sair da conta? Seus dados continuam salvos na nuvem.')) return;
      await sincronizar('manual');
      var apagar = confirm('Remover também os dados deste aparelho?\n\nEscolha OK se este aparelho é compartilhado (seus dados continuam na nuvem).\nCancelar = manter os dados aqui.');
      if (apagar && hash(snapshot()) !== get('pfsync_hash') &&
          !confirm('Atenção: há alterações ainda não sincronizadas que serão perdidas. Continuar mesmo assim?')) return;
      await sairLocal(apagar);
    };
    if ((b = q('syncExcluirBtn'))) b.onclick = async function () {
      if (!confirm('Excluir sua conta e TODOS os seus dados da nuvem?\n\nEssa ação não pode ser desfeita.')) return;
      if (!confirm('Confirmação final: apagar definitivamente seus dados da nuvem?')) return;
      try {
        var r = await api('delete', { session: get('pfsync_session'), confirmar: true });
        if (r.error === 'unauthorized') { sessaoExpirada(); return; }
        if (!r.ok) { aviso('Não foi possível excluir agora. Tente novamente.'); return; }
        limparSessaoLocal();
        del('pfsync_owner');
        aviso('Conta e dados da nuvem excluídos. Os dados deste aparelho foram mantidos.');
        renderUI();
        iniciarGoogle(0);
      } catch (e) { aviso('Sem conexão. Tente novamente.'); }
    };
  }

  /* ---------- Gatilhos ---------- */
  Storage.prototype.setItem = function (k, v) {
    setOrig.call(this, k, v);
    if (this === LS && deveSincronizar(k)) agendar();
  };
  Storage.prototype.removeItem = function (k) {
    removeOrig.call(this, k);
    if (this === LS && deveSincronizar(k)) agendar();
  };

  document.addEventListener('visibilitychange', function () {
    if (!logado()) return;
    if (document.visibilityState === 'hidden') { clearTimeout(timer); sincronizar('auto'); }
    else if (Date.now() - Number(get('pfsync_last') || 0) > 60000) sincronizar('abrir');
  });
  window.addEventListener('online', function () { sincronizar('abrir'); });

  window.PROFIT_SYNC = { sincronizar: sincronizar, logado: logado };

  ligarBotoes();
  ligarAbaPerfil();
  renderUI();
  if (logado()) setTimeout(function () { sincronizar('abrir'); }, 1200);
  else iniciarGoogle(0);
})();

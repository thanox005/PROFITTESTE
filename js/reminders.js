/* reminders.js — PROFIT 3.0 */

(function(){
  "use strict";
  const PREFIXES = ["nutri_", "profit_"];
  function localDateKey(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
  }
  function hasSavedUserData(){
    try {
      return Object.keys(localStorage).some(k => {
        if(!PREFIXES.some(prefix => k.startsWith(prefix))) return false;
        if(k.startsWith("profit_backup_prompted_")) return false;
        const v = localStorage.getItem(k);
        return !!v && v !== "{}" && v !== "[]" && v !== '""';
      });
    } catch(e) { return false; }
  }
  function eveningReminder(){
    if (document.body && document.body.classList.contains('tela-entrada')) {
      document.addEventListener('profit:entrada-liberada', eveningReminder, {once:true});
      return;
    }
    if(new Date().getHours() < 20 || !hasSavedUserData()) return;
    const key = "profit_backup_prompted_" + localDateKey();
    try { if(localStorage.getItem(key) === "1") return; } catch(e) {}
    // Recheck after the interface is ready. Never downloads without user confirmation.
    setTimeout(() => {
      try { if(localStorage.getItem(key) === "1") return; } catch(e) {}
      const wantsBackup = confirm(
        "🌙 LEMBRETE NOTURNO DO PROFIT\n\n" +
        "Antes de encerrar o dia, que tal guardar uma cópia dos seus dados?\n\n" +
        "O navegador pode apagar dados locais se os dados do site forem limpos, se você usar navegação privada ou trocar de navegador/aparelho.\n\n" +
        "Deseja exportar seu backup JSON agora?"
      );
      try { localStorage.setItem(key, "1"); } catch(e) {}
      if(wantsBackup && typeof window.exportarDados === "function") window.exportarDados();
    }, 1600);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", eveningReminder, {once:true});
  else eveningReminder();
  document.addEventListener("visibilitychange", () => {
    if(document.visibilityState === "visible") eveningReminder();
  });
})();

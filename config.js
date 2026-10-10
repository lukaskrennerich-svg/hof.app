// Verbindung zur Datenbank. Die beiden Werte findest du in Supabase unter
// Project Settings → API Keys ("Project URL" und "Publishable key").
// Der Publishable key ist öffentlich und darf hier stehen – geschützt wird über die Datenbank-Regeln.
window.HOF_CONFIG = {
  supabaseUrl: "https://qckcvqzgafmeljgrvqrk.supabase.co",
  supabaseAnonKey: "sb_publishable_3QcG21u9w4ZKX3ruDj4HCw_F9Fn7g_U",
  // Optional: sofortige KI-Auswertung über die kostenpflichtige Supabase-Funktion "ki" (API-Schlüssel nötig).
  // Standard: aus – Sprache wertet die App selbst aus, Fotos gehen in den Eingangskorb für Claude.
  kiFunktion: false,
  // Optional: Startpunkt der Karte, solange noch keine Schlaggrenzen da sind
  mapCenter: null // z. B. { lat: 48.70, lng: 9.65 }
};

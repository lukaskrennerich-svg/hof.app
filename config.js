// Verbindung zur Datenbank. Die beiden Werte findest du in Supabase unter
// Project Settings → API ("Project URL" und "anon public" Key).
// Der anon-Key ist öffentlich und darf hier stehen – geschützt wird über die Datenbank-Regeln.
window.HOF_CONFIG = {
  supabaseUrl: "https://qckcvqzgafmeljgrvqrk.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFja2N2cXpnYWZtZWxqZ3J2cXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MTgzNzIsImV4cCI6MjEwNzE5NDM3Mn0.xR5NZ-Ao2bvEYzFL_BL7Cj4aI3YfIwMUHbc_eICUhi0",
  // Optional: sofortige KI-Auswertung über die kostenpflichtige Supabase-Funktion "ki" (API-Schlüssel nötig).
  // Standard: aus – Sprache wertet die App selbst aus, Fotos gehen in den Eingangskorb für Claude.
  kiFunktion: false,
  // Optional: Startpunkt der Karte, solange noch keine Schlaggrenzen da sind
  mapCenter: null // z. B. { lat: 48.70, lng: 9.65 }
};

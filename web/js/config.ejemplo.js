/* Plantilla de configuración de Supabase (se sube al repo, sin valores).
   La configuración real va en web/js/config.local.js, que git ignora.
   Se genera con: powershell -File web/tools/generar-config.ps1
   Solo clave publishable/anon. NUNCA service_role ni sb_secret_. */
window.RB_CONFIG = { supabaseUrl: '', supabaseKey: '' };

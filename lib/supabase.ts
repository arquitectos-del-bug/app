import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Inicializar el cliente únicamente si las variables de entorno están presentes.
// Esto previene que Next.js falle en tiempo de compilación (build) cuando
// las credenciales aún no han sido configuradas.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

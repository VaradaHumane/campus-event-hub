import { supabase } from "../services/supabase"

export default function Login() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { queryParams: { prompt: "consent" } },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige">
      <div className="bg-white border border-border rounded-2xl p-10 w-[360px] text-center">
        <h1 className="text-2xl font-semibold text-brown mb-2">
          Campus Event Hub
        </h1>

        <p className="text-sm text-muted mb-8">
          Organize campus events calmly and clearly
        </p>

        <button
          onClick={handleLogin}
          className="w-full rounded-xl bg-brown text-black py-3 hover:opacity-90 transition"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}

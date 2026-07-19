import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/store"
import { api } from "@/lib/api"

export function LoginPage() {
  const { setCurrentUser, setCurrentPage } = useApp()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    setLoading(true)
    setError("")

    try {
      const { data: user, error: apiError } = await api.login(email.trim(), password)
      if (apiError || !user) {
        setError(apiError || "Invalid email or password.")
        setLoading(false)
        return
      }

      setCurrentUser(user)
      setCurrentPage("dashboard")
      localStorage.setItem("crm_user", JSON.stringify(user))
    } catch {
      setError("Connection failed. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="size-12 rounded-xl bg-foreground text-background flex items-center justify-center mx-auto mb-4">
              <span className="text-lg font-bold">S</span>
            </div>
            <h1 className="text-xl font-semibold">Strucureo CRM</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ceo@strucureo.com"
                autoFocus
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
              />
            </div>

            {error && (
              <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg p-2.5">{error}</p>
            )}

            <Button type="submit" disabled={loading || !email.trim() || !password} className="w-full h-9 text-sm gap-1.5">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
              Sign In
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

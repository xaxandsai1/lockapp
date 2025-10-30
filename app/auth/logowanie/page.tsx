"use client"

import type React from "react"
import { PublicNavigation } from "@/components/public-navigation"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LogowaniePage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Wystąpił błąd")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <PublicNavigation />
      <div className="flex min-h-svh w-full items-center justify-center p-4 pb-24 md:pb-10 md:pt-20 bg-white/[0.02]">
        <div className="w-full max-w-sm">
          <Card className="border-white/5 bg-white/[0.02]/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-100">Logowanie</CardTitle>
              <CardDescription className="text-slate-400">Wprowadź swoje dane, aby się zalogować</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-slate-200">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="twoj@email.pl"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/[0.02] border-white/5-700 text-slate-100"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-slate-200">
                      Hasło
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/[0.02] border-white/5-700 text-slate-100"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-400 bg-red-950/30 p-3 rounded-md border border-red-900">{error}</p>
                  )}
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? "Logowanie..." : "Zaloguj się"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-slate-400">
                  Nie masz konta?{" "}
                  <Link
                    href="/auth/rejestracja"
                    className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
                  >
                    Zarejestruj się
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

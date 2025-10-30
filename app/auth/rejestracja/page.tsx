"use client"

import type React from "react"
 import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function RejestracyjaPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [role, setRole] = useState<"SUB" | "KEYHOLDER">("SUB")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [country, setCountry] = useState("PL")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Hasła nie są identyczne")
      setIsLoading(false)
      return
    }

    // Validate age (must be 18+)
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    const isOldEnough = age > 18 || (age === 18 && monthDiff >= 0)

    if (!isOldEnough) {
      setError("Musisz mieć ukończone 18 lat, aby się zarejestrować")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            display_name: displayName,
            role: role,
            date_of_birth: dateOfBirth,
            country: country,
          },
        },
      })
      if (error) throw error
      router.push("/auth/potwierdzenie")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Wystąpił błąd")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
       
      <div className="flex min-h-svh w-full items-center justify-center p-4 pb-24 md:pb-10 md:pt-20 bg-white/[0.02]">
        <div className="w-full max-w-md">
          <Card className="border-white/5 bg-white/[0.02]/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-100">Rejestracja w ChasteGlass</CardTitle>
              <CardDescription className="text-slate-400">Utwórz nowe konto, aby rozpocząć</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
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
                    <Label htmlFor="displayName" className="text-slate-200">
                      Nazwa wyświetlana
                    </Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Twoja nazwa"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-white/[0.02] border-white/5-700 text-slate-100"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="role" className="text-slate-200">
                      Rola
                    </Label>
                    <Select value={role} onValueChange={(value) => setRole(value as "SUB" | "KEYHOLDER")}>
                      <SelectTrigger className="bg-white/[0.02] border-white/5-700 text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SUB">SUB (Osoba zamknięta)</SelectItem>
                        <SelectItem value="KEYHOLDER">KEYHOLDER (Posiadacz klucza)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="dateOfBirth" className="text-slate-200">
                      Data urodzenia (18+)
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      required
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="bg-white/[0.02] border-white/5-700 text-slate-100"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="country" className="text-slate-200">
                      Kraj
                    </Label>
                    <Input
                      id="country"
                      type="text"
                      placeholder="PL"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
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

                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password" className="text-slate-200">
                      Powtórz hasło
                    </Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="bg-white/[0.02] border-white/5-700 text-slate-100"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 bg-red-950/30 p-3 rounded-md border border-red-900">{error}</p>
                  )}

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? "Tworzenie konta..." : "Zarejestruj się"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-slate-400">
                  Masz już konto?{" "}
                  <Link
                    href="/auth/logowanie"
                    className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
                  >
                    Zaloguj się
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

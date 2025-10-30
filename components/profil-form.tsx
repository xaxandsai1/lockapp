"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AvatarUpload } from "@/components/avatar-upload"

interface Profile {
  id: string
  display_name: string
  role: string
  bio: string | null
  avatar_url: string | null
  date_of_birth: string
  country: string | null
  language: string
}

export function ProfilForm({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [bio, setBio] = useState(profile.bio || "")
  const [country, setCountry] = useState(profile.country || "")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          bio: bio || null,
          country: country || null,
        })
        .eq("id", profile.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Wystąpił błąd")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/logowanie")
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-slate-100">Edytuj profil</CardTitle>
        <CardDescription className="text-slate-400">Zaktualizuj swoje informacje</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 pb-6 border-b border-slate-800">
          <AvatarUpload userId={profile.id} currentAvatarUrl={profile.avatar_url} displayName={profile.display_name} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName" className="text-slate-200">
                Nazwa wyświetlana
              </Label>
              <Input
                id="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-slate-100"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role" className="text-slate-200">
                Rola
              </Label>
              <Input
                id="role"
                type="text"
                disabled
                value={profile.role}
                className="bg-slate-800/30 border-slate-700 text-slate-400"
              />
              <p className="text-xs text-slate-500">Roli nie można zmienić po rejestracji</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio" className="text-slate-200">
                Bio
              </Label>
              <Textarea
                id="bio"
                placeholder="Opowiedz coś o sobie..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-slate-100 min-h-24"
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
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-slate-100"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/30 p-3 rounded-md border border-red-900">{error}</p>
            )}

            {success && (
              <p className="text-sm text-green-400 bg-green-950/30 p-3 rounded-md border border-green-900">
                Profil zaktualizowany pomyślnie!
              </p>
            )}

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                Anuluj
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <Button type="button" variant="destructive" onClick={handleLogout} className="w-full">
                Wyloguj się
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

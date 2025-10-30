"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl: string | null
  displayName: string
}

export function AvatarUpload({ userId, currentAvatarUrl, displayName }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)
  const router = useRouter()

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const filePath = `${userId}/avatar.${fileExt}`

      const supabase = createClient()

      // Upload to storage
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
        upsert: true,
      })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath)

      // Update profile
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Błąd przesyłania zdjęcia")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-32 w-32 border-4 border-slate-700">
        <AvatarImage src={avatarUrl || undefined} alt={displayName} />
        <AvatarFallback className="text-4xl bg-slate-800 text-slate-200">
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <label htmlFor="avatar-upload">
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          className="border-slate-700 text-slate-200 hover:bg-slate-800 cursor-pointer bg-transparent"
          onClick={() => document.getElementById("avatar-upload")?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Przesyłanie...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Zmień zdjęcie
            </>
          )}
        </Button>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  )
}

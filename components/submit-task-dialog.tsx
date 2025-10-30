"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Send, Upload, Loader2 } from "lucide-react" // ⟵ NOWE ikony

interface Task {
  id: string
  title: string
  task_type: string
  quiz_data: any
  requires_photo: boolean
  requires_text: boolean
}

export function SubmitTaskDialog({ task, currentUserId }: { task: Task; currentUserId: string }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [submissionText, setSubmissionText] = useState("")
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)

  // ⟵ STAN dla zdjęcia dowodu
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  const router = useRouter()

  // ⟵ Funkcja uploadu zdjęcia inspirowana AvatarUpload
  const uploadProofPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setPhotoUploading(true)
      setError(null)

      if (!event.target.files || event.target.files.length === 0) return

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const filePath = `${currentUserId}/${task.id}-${Date.now()}.${fileExt}`

      const supabase = createClient()

      // wrzuć do bucketa (np. "task-proofs")
      const { error: uploadError } = await supabase.storage
        .from("task-proofs")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // pobierz publiczny URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("task-proofs").getPublicUrl(filePath)

      setPhotoUrl(publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd przesyłania zdjęcia")
    } finally {
      setPhotoUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const updateData: any = {
        status: "submitted",
        submitted_at: new Date().toISOString(),
      }

      if (task.task_type === "check_in") {
        // Check-in just needs submission
      } else if (task.task_type === "quiz") {
        if (quizAnswer === null) throw new Error("Wybierz odpowiedź")
        updateData.quiz_answer = quizAnswer
      } else if (task.task_type === "proof") {
        if (task.requires_text && !submissionText) {
          throw new Error("Opis tekstowy jest wymagany")
        }
        if (task.requires_photo && !photoUrl) {
          throw new Error("Zdjęcie jest wymagane")
        }
        updateData.submission_text = submissionText || null
        updateData.submission_photo_url = photoUrl || null // ⟵ dopisz właściwą kolumnę, jeśli używasz innej
      }

      const { error: updateError } = await supabase.from("tasks").update(updateData).eq("id", task.id)
      if (updateError) throw updateError

      // Create notification for KEYHOLDER
      await supabase.from("notifications").insert({
        user_id: currentUserId,
        type: "task_submitted",
        title: "Zadanie przesłane",
        message: `Zadanie "${task.title}" zostało przesłane do weryfikacji`,
        link: "/zadania",
      })

      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd przesyłania zadania")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          <Send className="h-4 w-4 mr-2" />
          Prześlij zadanie
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle>Prześlij zadanie</DialogTitle>
          <DialogDescription className="text-slate-400">{task.title}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {task.task_type === "check_in" && (
            <p className="text-sm text-slate-400">Kliknij "Prześlij", aby potwierdzić wykonanie zadania.</p>
          )}

          {task.task_type === "quiz" && task.quiz_data && (
            <div className="space-y-3">
              <p className="text-sm text-slate-300 font-medium">{task.quiz_data.question}</p>
              <RadioGroup value={quizAnswer?.toString()} onValueChange={(v) => setQuizAnswer(Number.parseInt(v))}>
                {task.quiz_data.options.map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="text-slate-300 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {task.task_type === "proof" && (
            <div className="space-y-4">
              {task.requires_text && (
                <div className="grid gap-2">
                  <Label htmlFor="submissionText">Opis wykonania zadania</Label>
                  <Textarea
                    id="submissionText"
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    required={task.requires_text}
                    className="bg-slate-800/50 border-slate-700"
                    placeholder="Opisz, jak wykonałeś zadanie..."
                  />
                </div>
              )}

              {/* ⟵ NOWY BLOK: upload zdjęcia dowodu */}
              {task.requires_photo && (
                <div className="grid gap-2">
                  <Label>Zdjęcie (dowód wykonania)</Label>

                  {photoUrl ? (
                    <div className="space-y-2">
                      <img
                        src={photoUrl}
                        alt="Podgląd zdjęcia"
                        className="rounded-lg border border-slate-700 max-h-56 object-contain"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-700 text-slate-200 hover:bg-slate-800"
                          onClick={() => setPhotoUrl(null)}
                        >
                          Zmień zdjęcie
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="proof-photo-upload" className="w-full">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={photoUploading}
                        className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 cursor-pointer bg-transparent"
                        onClick={() => document.getElementById("proof-photo-upload")?.click()}
                      >
                        {photoUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Przesyłanie...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Dodaj zdjęcie
                          </>
                        )}
                      </Button>
                      <input
                        id="proof-photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={uploadProofPhoto}
                        disabled={photoUploading}
                        className="hidden"
                      />
                    </label>
                  )}
                  {!photoUrl && <p className="text-xs text-slate-500">Dodaj co najmniej jedno zdjęcie.</p>}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-400 bg-red-950/30 p-3 rounded-md border border-red-900">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Przesyłanie..." : "Prześlij"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              Anuluj
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

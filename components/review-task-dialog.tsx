"use client"

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
import { CheckCircle, XCircle, ExternalLink, Download, Image as ImageIcon, Loader2 } from "lucide-react"

interface Task {
  id: string
  relationship_id: string
  lock_id: string | null
  title: string
  task_type: string
  quiz_data: any
  quiz_answer: number | null
  submission_text: string | null
  /** Publiczny URL zdjęcia dowodu przesłany w SubmitTaskDialog */
  submission_photo_url: string | null
  time_reward_seconds: number
  time_penalty_seconds: number
}

export function ReviewTaskDialog({ task, currentUserId }: { task: Task; currentUserId: string }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [imgLoading, setImgLoading] = useState(true)

  const router = useRouter()

  const handleReview = async (approved: boolean) => {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Update task status
      const { error: updateError } = await supabase
        .from("tasks")
        .update({
          status: approved ? "approved" : "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: currentUserId,
          review_notes: reviewNotes || null,
        })
        .eq("id", task.id)

      if (updateError) throw updateError

      // If task has a lock, apply time reward/penalty
      if (task.lock_id) {
        const timeChange = approved ? -task.time_reward_seconds : task.time_penalty_seconds

        if (timeChange !== 0) {
          // Get current lock
          const { data: lock } = await supabase
            .from("locks")
            .select("remaining_seconds")
            .eq("id", task.lock_id)
            .single()

          if (lock) {
            const newRemaining = Math.max(0, lock.remaining_seconds + timeChange)

            await supabase
              .from("locks")
              .update({
                remaining_seconds: newRemaining,
              })
              .eq("id", task.lock_id)

            // Create lock history entry
            await supabase.from("lock_history").insert({
              lock_id: task.lock_id,
              action: timeChange > 0 ? "time_added" : "time_removed",
              performed_by: currentUserId,
              time_change_seconds: timeChange,
              reason: `Zadanie ${approved ? "zatwierdzone" : "odrzucone"}: ${task.title}`,
            })
          }
        }
      }

      // Create notification
      await supabase.from("notifications").insert({
        user_id: currentUserId,
        type: "task_reviewed",
        title: approved ? "Zadanie zatwierdzone" : "Zadanie odrzucone",
        message: `Zadanie "${task.title}" zostało ${approved ? "zatwierdzone" : "odrzucone"}`,
        link: "/zadania",
      })

      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd weryfikacji zadania")
    } finally {
      setIsLoading(false)
    }
  }

  const isQuizCorrect = task.task_type === "quiz" && task.quiz_answer === task.quiz_data?.correctAnswer

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-purple-600 hover:bg-purple-700">Zweryfikuj zadanie</Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle>Weryfikuj zadanie</DialogTitle>
          <DialogDescription className="text-slate-400">{task.title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {task.task_type === "quiz" && (
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-300 mb-2">Odpowiedź: {task.quiz_data?.options[task.quiz_answer || 0]}</p>
              <p className={`text-sm ${isQuizCorrect ? "text-green-400" : "text-red-400"}`}>
                {isQuizCorrect ? "✓ Poprawna odpowiedź" : "✗ Niepoprawna odpowiedź"}
              </p>
            </div>
          )}

          {task.submission_text && (
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Przesłany opis:</p>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{task.submission_text}</p>
            </div>
          )}

          {/* PODGLĄD ZDJĘCIA DOWODU */}
          {task.submission_photo_url && (
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <ImageIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Załączone zdjęcie</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={task.submission_photo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex"
                    aria-label="Otwórz w nowej karcie"
                  >
                    <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 h-8 px-2">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Otwórz
                    </Button>
                  </a>
                  <a href={task.submission_photo_url} download className="inline-flex" aria-label="Pobierz">
                    <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 h-8 px-2">
                      <Download className="h-4 w-4 mr-1" />
                      Pobierz
                    </Button>
                  </a>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-lg border border-slate-700 bg-slate-900/40">
                {imgLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={task.submission_photo_url}
                  alt="Dowód wykonania"
                  className={`w-full max-h-80 object-contain transition-opacity ${imgLoading ? "opacity-0" : "opacity-100"}`}
                  onLoad={() => setImgLoading(false)}
                  onError={() => setImgLoading(false)}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Podgląd jest skalowany. Użyj „Otwórz” aby zobaczyć w pełnej rozdzielczości.
              </p>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="reviewNotes">Notatki (opcjonalnie)</Label>
            <Textarea
              id="reviewNotes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="bg-slate-800/50 border-slate-700"
              placeholder="Dodaj komentarz do weryfikacji..."
            />
          </div>

          {error && <p className="text-sm text-red-400 bg-red-950/30 p-3 rounded-md border border-red-900">{error}</p>}

          <div className="flex gap-3">
            <Button
              onClick={() => handleReview(true)}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Zatwierdź
            </Button>
            <Button onClick={() => handleReview(false)} disabled={isLoading} variant="destructive" className="flex-1">
              <XCircle className="h-4 w-4 mr-2" />
              Odrzuć
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

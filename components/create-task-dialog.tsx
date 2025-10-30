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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus } from "lucide-react"

interface Relationship {
  id: string
  userRole: "sub" | "keyholder"
  partner: {
    id: string
    display_name: string
  }
}

export function CreateTaskDialog({ relationships }: { relationships: Relationship[] }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [relationshipId, setRelationshipId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [taskType, setTaskType] = useState<"check_in" | "quiz" | "proof">("check_in")
  const [timeReward, setTimeReward] = useState("0")
  const [timePenalty, setTimePenalty] = useState("0")
  const [requiresPhoto, setRequiresPhoto] = useState(false)
  const [requiresText, setRequiresText] = useState(true)

  // Quiz fields
  const [quizQuestion, setQuizQuestion] = useState("")
  const [quizOptions, setQuizOptions] = useState(["", "", "", ""])
  const [correctAnswer, setCorrectAnswer] = useState(0)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const taskData: any = {
        relationship_id: relationshipId,
        title,
        description: description || null,
        task_type: taskType,
        time_reward_seconds: Number.parseInt(timeReward) * 3600,
        time_penalty_seconds: Number.parseInt(timePenalty) * 3600,
        status: "pending",
      }

      if (taskType === "quiz") {
        taskData.quiz_data = {
          question: quizQuestion,
          options: quizOptions.filter((o) => o.trim() !== ""),
          correctAnswer,
        }
      }

      if (taskType === "proof") {
        taskData.requires_photo = requiresPhoto
        taskData.requires_text = requiresText
      }

      const { error: insertError } = await supabase.from("tasks").insert(taskData)

      if (insertError) throw insertError

      // Get the SUB user ID from the relationship
      const relationship = relationships.find((r) => r.id === relationshipId)
      if (relationship) {
        const subId = relationship.userRole === "keyholder" ? relationship.partner.id : null

        if (subId) {
          // Create notification for SUB
          await supabase.from("notifications").insert({
            user_id: subId,
            type: "task_assigned",
            title: "Nowe zadanie",
            message: `Otrzymałeś nowe zadanie: "${title}"`,
            link: "/zadania",
          })
        }
      }

      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd tworzenia zadania")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Utwórz nowe zadanie
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Utwórz nowe zadanie</DialogTitle>
          <DialogDescription className="text-slate-400">Przypisz zadanie dla SUB</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="relationship">Relacja</Label>
            <Select value={relationshipId} onValueChange={setRelationshipId} required>
              <SelectTrigger className="bg-slate-800/50 border-slate-700">
                <SelectValue placeholder="Wybierz relację" />
              </SelectTrigger>
              <SelectContent>
                {relationships.map((rel) => (
                  <SelectItem key={rel.id} value={rel.id}>
                    {rel.partner.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="taskType">Typ zadania</Label>
            <Select value={taskType} onValueChange={(v) => setTaskType(v as any)} required>
              <SelectTrigger className="bg-slate-800/50 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="check_in">Check-in (proste potwierdzenie)</SelectItem>
                <SelectItem value="quiz">Quiz (pytanie z odpowiedziami)</SelectItem>
                <SelectItem value="proof">Proof (dowód z foto/tekstem)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Tytuł zadania</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-slate-800/50 border-slate-700"
              placeholder="np. Poranna medytacja"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-800/50 border-slate-700"
              placeholder="Szczegóły zadania..."
            />
          </div>

          {taskType === "quiz" && (
            <div className="space-y-3 border-t border-slate-800 pt-4">
              <h4 className="text-sm font-medium text-slate-200">Konfiguracja quizu</h4>

              <div className="grid gap-2">
                <Label htmlFor="quizQuestion">Pytanie</Label>
                <Input
                  id="quizQuestion"
                  value={quizQuestion}
                  onChange={(e) => setQuizQuestion(e.target.value)}
                  required
                  className="bg-slate-800/50 border-slate-700"
                  placeholder="Jakie jest pytanie?"
                />
              </div>

              {quizOptions.map((option, index) => (
                <div key={index} className="grid gap-2">
                  <Label htmlFor={`option-${index}`}>Odpowiedź {index + 1}</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`option-${index}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...quizOptions]
                        newOptions[index] = e.target.value
                        setQuizOptions(newOptions)
                      }}
                      className="bg-slate-800/50 border-slate-700 flex-1"
                      placeholder={`Opcja ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant={correctAnswer === index ? "default" : "outline"}
                      onClick={() => setCorrectAnswer(index)}
                      className={correctAnswer === index ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {correctAnswer === index ? "Poprawna" : "Ustaw"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {taskType === "proof" && (
            <div className="space-y-3 border-t border-slate-800 pt-4">
              <h4 className="text-sm font-medium text-slate-200">Wymagania dowodu</h4>

              <div className="flex items-center justify-between">
                <Label htmlFor="requiresPhoto" className="text-sm">
                  Wymagane zdjęcie
                </Label>
                <Switch id="requiresPhoto" checked={requiresPhoto} onCheckedChange={setRequiresPhoto} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="requiresText" className="text-sm">
                  Wymagany opis tekstowy
                </Label>
                <Switch id="requiresText" checked={requiresText} onCheckedChange={setRequiresText} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="timeReward">Nagroda (godziny)</Label>
              <Input
                id="timeReward"
                type="number"
                min="0"
                value={timeReward}
                onChange={(e) => setTimeReward(e.target.value)}
                className="bg-slate-800/50 border-slate-700"
              />
              <p className="text-xs text-slate-500">Czas odjęty od locka przy zatwierdzeniu</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timePenalty">Kara (godziny)</Label>
              <Input
                id="timePenalty"
                type="number"
                min="0"
                value={timePenalty}
                onChange={(e) => setTimePenalty(e.target.value)}
                className="bg-slate-800/50 border-slate-700"
              />
              <p className="text-xs text-slate-500">Czas dodany do locka przy odrzuceniu</p>
            </div>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-950/30 p-3 rounded-md border border-red-900">{error}</p>}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Tworzenie..." : "Utwórz zadanie"}
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

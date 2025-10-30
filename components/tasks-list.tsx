"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SubmitTaskDialog } from "@/components/submit-task-dialog"
import { ReviewTaskDialog } from "@/components/review-task-dialog"
import { CheckCircle, XCircle } from "lucide-react"

interface Task {
  id: string
  relationship_id: string
  title: string
  description: string | null
  task_type: string
  status: string
  time_reward_seconds: number
  time_penalty_seconds: number
  quiz_data: any
  requires_photo: boolean
  requires_text: boolean
  submitted_at: string | null
  submission_text: string | null
  submission_photo_url: string | null
  quiz_answer: number | null
  reviewed_at: string | null
  review_notes: string | null
  due_date: string | null
  created_at: string
}

interface Relationship {
  id: string
  userRole: "sub" | "keyholder"
  partner: {
    id: string
    display_name: string
  }
}

export function TasksList({
  tasks,
  relationships,
  currentUserId,
  currentUserRole,
}: {
  tasks: Task[]
  relationships: Relationship[]
  currentUserId: string
  currentUserRole: string
}) {
  const router = useRouter()

  const getTaskTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      check_in: "Check-in",
      quiz: "Quiz",
      proof: "Proof",
    }
    return types[type] || type
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    return `${hours}h`
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Brak zadań w tej kategorii</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {tasks.map((task) => {
        const relationship = relationships.find((r) => r.id === task.relationship_id)
        const isSub = currentUserRole === "SUB"
        const canSubmit = isSub && task.status === "pending"
        const canReview = !isSub && task.status === "submitted"

        return (
          <Card key={task.id} className="border-slate-800 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-slate-100">{task.title}</CardTitle>
                  <CardDescription className="text-slate-400 mt-1">
                    {relationship?.partner.display_name}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                    {getTaskTypeLabel(task.task_type)}
                  </Badge>
                  <Badge
                    variant={
                      task.status === "approved" ? "default" : task.status === "rejected" ? "destructive" : "secondary"
                    }
                    className={
                      task.status === "approved"
                        ? "bg-green-600"
                        : task.status === "rejected"
                          ? "bg-red-600"
                          : task.status === "submitted"
                            ? "bg-yellow-600"
                            : "bg-slate-700"
                    }
                  >
                    {task.status === "pending"
                      ? "Oczekujące"
                      : task.status === "submitted"
                        ? "Przesłane"
                        : task.status === "approved"
                          ? "Zatwierdzone"
                          : "Odrzucone"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.description && <p className="text-sm text-slate-400">{task.description}</p>}

              <div className="flex gap-4 text-sm">
                {task.time_reward_seconds > 0 && (
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>Nagroda: {formatTime(task.time_reward_seconds)}</span>
                  </div>
                )}
                {task.time_penalty_seconds > 0 && (
                  <div className="flex items-center gap-1 text-red-400">
                    <XCircle className="h-4 w-4" />
                    <span>Kara: {formatTime(task.time_penalty_seconds)}</span>
                  </div>
                )}
              </div>

              {task.task_type === "quiz" && task.quiz_data && (
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-sm text-slate-300 font-medium mb-2">{task.quiz_data.question}</p>
                  <div className="space-y-1">
                    {task.quiz_data.options.map((option: string, index: number) => (
                      <p key={index} className="text-xs text-slate-400">
                        {index + 1}. {option}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {task.status === "submitted" && (
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 mb-2">Przesłano:</p>
                  {task.submission_text && <p className="text-sm text-slate-300">{task.submission_text}</p>}
                  {task.quiz_answer !== null && (
                    <p className="text-sm text-slate-300">Odpowiedź: {task.quiz_answer + 1}</p>
                  )}
                </div>
              )}

              {task.status === "approved" && task.review_notes && (
                <div className="p-3 bg-green-950/30 rounded-lg border border-green-900">
                  <p className="text-xs text-green-400 mb-1">Zatwierdzono:</p>
                  <p className="text-sm text-slate-300">{task.review_notes}</p>
                </div>
              )}

              {task.status === "rejected" && task.review_notes && (
                <div className="p-3 bg-red-950/30 rounded-lg border border-red-900">
                  <p className="text-xs text-red-400 mb-1">Odrzucono:</p>
                  <p className="text-sm text-slate-300">{task.review_notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                {canSubmit && <SubmitTaskDialog task={task} currentUserId={currentUserId} />}
                {canReview && <ReviewTaskDialog task={task} currentUserId={currentUserId} />}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

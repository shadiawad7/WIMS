"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, CircleAlert, Plus, Save, Trash2 } from "lucide-react"
import type { UserRole } from "@/lib/auth"
import type { VideoQuiz, VideoQuizResult } from "@/lib/video-quiz"

type EditableAnswer = {
  id: string
  text: string
  isCorrect: boolean
}

type EditableQuestion = {
  id: string
  prompt: string
  answers: EditableAnswer[]
}

type VideoQuizPanelProps = {
  moduleId: string
  videoId: string
  role: UserRole | null
  initialQuiz: VideoQuiz | null
  initialResult: VideoQuizResult | null
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createEmptyAnswer(): EditableAnswer {
  return {
    id: createId("answer"),
    text: "",
    isCorrect: false,
  }
}

function createEmptyQuestion(): EditableQuestion {
  return {
    id: createId("question"),
    prompt: "",
    answers: [
      { ...createEmptyAnswer(), isCorrect: true },
      createEmptyAnswer(),
    ],
  }
}

function toEditableQuestions(quiz: VideoQuiz | null) {
  if (!quiz) {
    return []
  }

  return quiz.questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    answers: question.answers.map((answer, index) => ({
      id: answer.id,
      text: answer.text,
      isCorrect:
        Boolean(answer.isCorrect) || (index === 0 && !question.answers.some((candidate) => candidate.isCorrect)),
    })),
  }))
}

export function VideoQuizPanel({ moduleId, videoId, role, initialQuiz, initialResult }: VideoQuizPanelProps) {
  const [questions, setQuestions] = useState<EditableQuestion[]>(toEditableQuestions(initialQuiz))
  const [result, setResult] = useState<VideoQuizResult | null>(initialResult)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isExamOpen, setIsExamOpen] = useState(false)

  const safeQuestionIndex = Math.min(currentQuestionIndex, Math.max(questions.length - 1, 0))
  const currentQuestion = questions[safeQuestionIndex] || null

  useEffect(() => {
    setQuestions(toEditableQuestions(initialQuiz))
    setResult(initialResult)
    setSelectedAnswers({})
    setCurrentQuestionIndex(0)
    setIsExamOpen(false)
  }, [initialQuiz, initialResult])

  const playerCanSubmit = useMemo(
    () => questions.length > 0 && questions.every((question) => Boolean(selectedAnswers[question.id])),
    [questions, selectedAnswers],
  )

  const addQuestion = () => {
    setQuestions((previous) => {
      const next = [...previous, createEmptyQuestion()]
      setCurrentQuestionIndex(next.length - 1)
      return next
    })
  }

  const updateQuestionPrompt = (questionId: string, prompt: string) => {
    setQuestions((previous) =>
      previous.map((question) => (question.id === questionId ? { ...question, prompt } : question)),
    )
  }

  const addAnswer = (questionId: string) => {
    setQuestions((previous) =>
      previous.map((question) =>
        question.id === questionId
          ? {
              ...question,
              answers: [...question.answers, createEmptyAnswer()],
            }
          : question,
      ),
    )
  }

  const updateAnswer = (questionId: string, answerId: string, text: string) => {
    setQuestions((previous) =>
      previous.map((question) =>
        question.id === questionId
          ? {
              ...question,
              answers: question.answers.map((answer) => (answer.id === answerId ? { ...answer, text } : answer)),
            }
          : question,
      ),
    )
  }

  const setCorrectAnswer = (questionId: string, answerId: string) => {
    setQuestions((previous) =>
      previous.map((question) =>
        question.id === questionId
          ? {
              ...question,
              answers: question.answers.map((answer) => ({ ...answer, isCorrect: answer.id === answerId })),
            }
          : question,
      ),
    )
  }

  const removeQuestion = (questionId: string) => {
    setQuestions((previous) => {
      const next = previous.filter((question) => question.id !== questionId)
      setCurrentQuestionIndex((index) => Math.min(index, Math.max(next.length - 1, 0)))
      return next
    })
  }

  const removeAnswer = (questionId: string, answerId: string) => {
    setQuestions((previous) =>
      previous.map((question) => {
        if (question.id !== questionId) {
          return question
        }

        const answers = question.answers.filter((answer) => answer.id !== answerId)
        if (answers.length > 0 && !answers.some((answer) => answer.isCorrect)) {
          answers[0] = { ...answers[0], isCorrect: true }
        }

        return {
          ...question,
          answers,
        }
      }),
    )
  }

  const saveQuiz = async () => {
    setIsSaving(true)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch(`/api/modules/${moduleId}/videos/${videoId}/quiz`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: initialQuiz?.title || "VIDEO EXAM",
          questions: questions.map((question) => ({
            prompt: question.prompt,
            answers: question.answers.map((answer) => ({
              text: answer.text,
              isCorrect: answer.isCorrect,
            })),
          })),
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || "Could not save video exam")
      }

      setQuestions(toEditableQuestions(payload.quiz || null))
      setCurrentQuestionIndex(0)
      setNotice("Exam saved correctly.")
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save video exam")
    } finally {
      setIsSaving(false)
    }
  }

  const submitQuiz = async () => {
    setIsSaving(true)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch(`/api/modules/${moduleId}/videos/${videoId}/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionIds: questions.map((question) => question.id),
          answers: selectedAnswers,
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || "Could not submit video exam")
      }

      setResult(payload.result)
      if (payload.result?.passed) {
        setNotice("Exam passed. Video marked as completed.")
        setIsExamOpen(false)
      } else {
        setQuestions(toEditableQuestions(payload.nextQuiz || null))
        setSelectedAnswers({})
        setCurrentQuestionIndex(0)
        setNotice("At least 1 answer was wrong. A new random set of 3 questions has been loaded.")
        setIsExamOpen(true)
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit video exam")
    } finally {
      setIsSaving(false)
    }
  }

  if (!role) {
    return null
  }

  if (role === "admin") {
    return (
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">VIDEO EXAM</h3>
            <p className="text-sm text-muted-foreground">
              Create, edit or remove the questions for this exact module/video pair.
            </p>
          </div>
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 bg-black/10 p-4 text-sm text-muted-foreground">
            No questions yet. Add the first one and save.
          </div>
        ) : null}

        {currentQuestion ? (
          <>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              <span>
                Question {safeQuestionIndex + 1} / {questions.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((index) => Math.max(index - 1, 0))}
                  disabled={safeQuestionIndex === 0}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((index) => Math.min(index + 1, questions.length - 1))}
                  disabled={safeQuestionIndex >= questions.length - 1}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>

            <div key={currentQuestion.id} className="rounded-xl border border-white/10 bg-black/10 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-primary/90">
                    Question {safeQuestionIndex + 1}
                  </label>
                  <input
                    value={currentQuestion.prompt}
                    onChange={(event) => updateQuestionPrompt(currentQuestion.id, event.target.value)}
                    placeholder="Write the question"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition-colors placeholder:text-white/35 focus:border-primary/60"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(currentQuestion.id)}
                  className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/25 bg-red-500/10 text-red-200 transition-colors hover:bg-red-500/20"
                  aria-label={`Delete question ${safeQuestionIndex + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {currentQuestion.answers.map((answer, answerIndex) => (
                  <div key={answer.id} className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={answer.isCorrect}
                      onChange={() => setCorrectAnswer(currentQuestion.id, answer.id)}
                      name={`correct-${currentQuestion.id}`}
                      className="h-4 w-4 accent-primary"
                      aria-label={`Mark answer ${answerIndex + 1} as correct`}
                    />
                    <input
                      value={answer.text}
                      onChange={(event) => updateAnswer(currentQuestion.id, answer.id, event.target.value)}
                      placeholder={`Answer ${answerIndex + 1}`}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition-colors placeholder:text-white/35 focus:border-primary/60"
                    />
                    <button
                      type="button"
                      onClick={() => removeAnswer(currentQuestion.id, answer.id)}
                      disabled={currentQuestion.answers.length <= 2}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Delete answer ${answerIndex + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addAnswer(currentQuestion.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
                Add Answer
              </button>
            </div>
          </>
        ) : null}

        {error ? <p className="text-sm text-red-200">{error}</p> : null}
        {notice ? <p className="text-sm text-emerald-200">{notice}</p> : null}

        <button
          type="button"
          onClick={saveQuiz}
          disabled={isSaving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Exam"}
        </button>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-lg font-semibold text-foreground">VIDEO EXAM</h3>
        <p className="mt-2 text-sm text-muted-foreground">This video has no exam yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">VIDEO EXAM</h3>
            <p className="text-sm text-muted-foreground">Answer 3 random questions correctly to complete this video.</p>
          </div>
          {result ? (
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
                result.passed ? "bg-emerald-500/15 text-emerald-200" : "bg-orange-500/15 text-orange-100"
              }`}
            >
              {result.passed ? <CheckCircle2 className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
              {result.correctAnswers}/{result.totalQuestions}
            </div>
          ) : null}
        </div>

        {result ? (
          <div
            className={`rounded-xl border p-3 text-sm ${
              result.passed
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                : "border-orange-500/25 bg-orange-500/10 text-orange-50"
            }`}
          >
            {result.passed
              ? "Exam passed. This video is completed for this player."
              : `Last score: ${result.correctAnswers}/${result.totalQuestions}.`}
          </div>
        ) : null}

        {error ? <p className="text-sm text-red-200">{error}</p> : null}
        {notice ? <p className="text-sm text-emerald-200">{notice}</p> : null}

        <button
          type="button"
          onClick={() => {
            setError(null)
            setNotice(null)
            setIsExamOpen(true)
          }}
          className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Start Exam
        </button>
      </div>

      {isExamOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close exam"
            onClick={() => setIsExamOpen(false)}
            className="absolute inset-0 bg-black/55 backdrop-blur-md"
          />

          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/15 bg-[rgba(28,20,17,0.92)] p-5 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">VIDEO EXAM</h3>
                <p className="text-sm text-white/60">Focus on the exam. The rest of the page is paused behind this window.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsExamOpen(false)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
              >
                Close
              </button>
            </div>

            {currentQuestion ? (
              <>
                <div className="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                  <span>
                    Question {safeQuestionIndex + 1} / {questions.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex((index) => Math.max(index - 1, 0))}
                      disabled={safeQuestionIndex === 0}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex((index) => Math.min(index + 1, questions.length - 1))}
                      disabled={safeQuestionIndex >= questions.length - 1}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div key={currentQuestion.id} className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary/90">
                    Question {safeQuestionIndex + 1}
                  </p>
                  <p className="mb-3 text-base font-medium text-white">{currentQuestion.prompt}</p>
                  <div className="space-y-2">
                    {currentQuestion.answers.map((answer) => (
                      <label
                        key={answer.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                          selectedAnswers[currentQuestion.id] === answer.id
                            ? "border-primary/60 bg-primary/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          checked={selectedAnswers[currentQuestion.id] === answer.id}
                          onChange={() =>
                            setSelectedAnswers((previous) => ({
                              ...previous,
                              [currentQuestion.id]: answer.id,
                            }))
                          }
                          className="h-4 w-4 accent-primary"
                        />
                        <span className="text-sm text-white/90">{answer.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {error ? <p className="mt-4 text-sm text-red-200">{error}</p> : null}
            {notice ? <p className="mt-4 text-sm text-emerald-200">{notice}</p> : null}

            <button
              type="button"
              onClick={submitQuiz}
              disabled={!playerCanSubmit || isSaving}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Submit Exam"}
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionFromCookies } from "@/lib/auth"
import { getQuizForVideo, saveQuizForVideo, submitQuizAttempt } from "@/lib/video-quiz"

type SaveQuizPayload = {
  title?: string
  questions?: Array<{
    prompt?: string
    answers?: Array<{
      text?: string
      isCorrect?: boolean
    }>
  }>
}

type SubmitQuizPayload = {
  answers?: Record<string, string>
  questionIds?: string[]
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ moduleId: string; videoId: string }> },
) {
  try {
    const session = getSessionFromCookies(await cookies())
    const { moduleId, videoId } = await params
    const includeCorrectAnswers = session?.role === "admin"
    const playerUserId = session?.role === "player" ? session.id : undefined
    const url = new URL(request.url)
    const excludeQuestionIds =
      url.searchParams
        .get("exclude")
        ?.split(",")
        .map((value) => value.trim())
        .filter(Boolean) || []
    const payload = await getQuizForVideo(moduleId, videoId, {
      includeCorrectAnswers,
      userId: playerUserId,
      questionCount: session?.role === "player" ? 3 : undefined,
      excludeQuestionIds: session?.role === "player" ? excludeQuestionIds : undefined,
    })

    return NextResponse.json(payload)
  } catch (error) {
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "Could not load video exam"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ moduleId: string; videoId: string }> },
) {
  try {
    const session = getSessionFromCookies(await cookies())
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Only administrators can update the exam." }, { status: 403 })
    }

    const { moduleId, videoId } = await params
    const body = (await request.json()) as SaveQuizPayload

    const questions =
      body.questions?.map((question) => ({
        prompt: question.prompt?.trim() || "",
        answers:
          question.answers?.map((answer) => ({
            text: answer.text?.trim() || "",
            isCorrect: Boolean(answer.isCorrect),
          })) || [],
      })) || []

    const payload = await saveQuizForVideo(moduleId, videoId, {
      title: body.title,
      questions,
    })

    return NextResponse.json(payload)
  } catch (error) {
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "Could not save video exam"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ moduleId: string; videoId: string }> },
) {
  try {
    const session = getSessionFromCookies(await cookies())
    if (!session || session.role !== "player") {
      return NextResponse.json({ error: "Only players can submit the exam." }, { status: 403 })
    }

    const { moduleId, videoId } = await params
    const body = (await request.json()) as SubmitQuizPayload
    const questionIds = body.questionIds?.map((value) => value.trim()).filter(Boolean) || []
    const result = await submitQuizAttempt(session.id, moduleId, videoId, body.answers || {}, questionIds)
    const nextQuiz =
      result.passed
        ? null
        : (
            await getQuizForVideo(moduleId, videoId, {
              includeCorrectAnswers: false,
              userId: session.id,
              questionCount: 3,
              excludeQuestionIds: questionIds,
            })
          ).quiz

    return NextResponse.json({ result, nextQuiz })
  } catch (error) {
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "Could not submit video exam"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

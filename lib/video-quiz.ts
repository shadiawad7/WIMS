import { pool, query } from "@/lib/db"

export type VideoQuizAnswer = {
  id: string
  text: string
  isCorrect?: boolean
}

export type VideoQuizQuestion = {
  id: string
  prompt: string
  answers: VideoQuizAnswer[]
}

export type VideoQuiz = {
  id: string
  moduleId: string
  videoId: string
  title: string
  questions: VideoQuizQuestion[]
}

export type VideoQuizResult = {
  totalQuestions: number
  correctAnswers: number
  passed: boolean
  submittedAt: string | null
}

export type SaveQuizInput = {
  title?: string
  questions: Array<{
    prompt: string
    answers: Array<{
      text: string
      isCorrect: boolean
    }>
  }>
}

type QuizRow = {
  id: number
  module_id: string
  video_id: string
  title: string
}

type QuizQuestionRow = {
  question_id: number
  prompt: string
  question_sort_order: number
  answer_id: number
  answer_text: string
  is_correct: boolean
  answer_sort_order: number
}

type QuizResultRow = {
  total_questions: number
  correct_answers: number
  passed: boolean
  submitted_at: Date | string | null
}

const MISSING_VIDEO_QUIZ_TABLES_MESSAGE =
  'Missing quiz tables. Run migration 20260328_create_video_quiz_tables.sql first.'

function isMissingQuizTables(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "42P01"
}

function normalizeSaveInput(input: SaveQuizInput) {
  return {
    title: input.title?.trim() || "VIDEO EXAM",
    questions: input.questions.map((question) => ({
      prompt: question.prompt.trim(),
      answers: question.answers.map((answer) => ({
        text: answer.text.trim(),
        isCorrect: Boolean(answer.isCorrect),
      })),
    })),
  }
}

function validateQuizInput(input: SaveQuizInput) {
  const normalized = normalizeSaveInput(input)

  normalized.questions.forEach((question, index) => {
    if (!question.prompt) {
      throw new Error(`Question ${index + 1} needs a prompt.`)
    }

    const nonEmptyAnswers = question.answers.filter((answer) => answer.text.length > 0)
    if (nonEmptyAnswers.length < 2) {
      throw new Error(`Question ${index + 1} needs at least 2 answers.`)
    }

    const correctAnswers = nonEmptyAnswers.filter((answer) => answer.isCorrect)
    if (correctAnswers.length !== 1) {
      throw new Error(`Question ${index + 1} must have exactly 1 correct answer.`)
    }

    question.answers = nonEmptyAnswers
  })

  return normalized
}

function shuffleItems<T>(items: T[]) {
  const clone = [...items]
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[clone[index], clone[randomIndex]] = [clone[randomIndex], clone[index]]
  }
  return clone
}

function pickRandomQuestions(questions: VideoQuizQuestion[], count: number, excludeQuestionIds?: string[]) {
  if (questions.length === 0 || count <= 0) {
    return []
  }

  const maxCount = Math.min(count, questions.length)
  const excluded = new Set(excludeQuestionIds || [])
  const remaining = questions.filter((question) => !excluded.has(question.id))
  const source = remaining.length >= maxCount ? remaining : questions
  return shuffleItems(source).slice(0, maxCount)
}

async function getQuizDefinition(moduleId: string, videoId: string, includeCorrectAnswers: boolean) {
  const quizResult = await query<QuizRow>(
    `
    SELECT id, module_id, video_id, title
    FROM video_quizzes
    WHERE module_id = $1 AND video_id = $2
    LIMIT 1
    `,
    [moduleId, videoId],
  )

  const quizRow = quizResult.rows[0]
  if (!quizRow) {
    return null
  }

  const questionResult = await query<QuizQuestionRow>(
    `
    SELECT
      q.id AS question_id,
      q.prompt,
      q.sort_order AS question_sort_order,
      a.id AS answer_id,
      a.answer_text,
      a.is_correct,
      a.sort_order AS answer_sort_order
    FROM video_quiz_questions q
    JOIN video_quiz_answers a ON a.question_id = q.id
    WHERE q.quiz_id = $1
    ORDER BY q.sort_order ASC, q.id ASC, a.sort_order ASC, a.id ASC
    `,
    [quizRow.id],
  )

  const questionMap = new Map<string, VideoQuizQuestion>()
  for (const row of questionResult.rows) {
    const questionId = String(row.question_id)
    if (!questionMap.has(questionId)) {
      questionMap.set(questionId, {
        id: questionId,
        prompt: row.prompt,
        answers: [],
      })
    }

    questionMap.get(questionId)?.answers.push({
      id: String(row.answer_id),
      text: row.answer_text,
      ...(includeCorrectAnswers ? { isCorrect: row.is_correct } : {}),
    })
  }

  return {
    id: String(quizRow.id),
    moduleId: quizRow.module_id,
    videoId: quizRow.video_id,
    title: quizRow.title,
    questions: Array.from(questionMap.values()),
  } satisfies VideoQuiz
}

export async function getQuizResultForUser(userId: number, moduleId: string, videoId: string) {
  try {
    const { rows } = await query<QuizResultRow>(
      `
      SELECT total_questions, correct_answers, passed, submitted_at
      FROM player_video_quiz_results
      WHERE user_id = $1 AND module_id = $2 AND video_id = $3
      LIMIT 1
      `,
      [userId, moduleId, videoId],
    )

    const row = rows[0]
    if (!row) {
      return null
    }

    return {
      totalQuestions: row.total_questions,
      correctAnswers: row.correct_answers,
      passed: row.passed,
      submittedAt: row.submitted_at ? new Date(row.submitted_at).toISOString() : null,
    } satisfies VideoQuizResult
  } catch (error) {
    if (isMissingQuizTables(error)) {
      return null
    }
    throw error
  }
}

export async function getQuizForVideo(
  moduleId: string,
  videoId: string,
  options?: { includeCorrectAnswers?: boolean; userId?: number; questionCount?: number; excludeQuestionIds?: string[] },
) {
  try {
    const quizDefinition = await getQuizDefinition(moduleId, videoId, options?.includeCorrectAnswers ?? false)
    const quiz =
      quizDefinition && options?.questionCount
        ? {
            ...quizDefinition,
            questions: pickRandomQuestions(quizDefinition.questions, options.questionCount, options.excludeQuestionIds),
          }
        : quizDefinition
    const result = options?.userId ? await getQuizResultForUser(options.userId, moduleId, videoId) : null
    return { quiz, result }
  } catch (error) {
    if (isMissingQuizTables(error)) {
      return { quiz: null, result: null }
    }
    throw error
  }
}

export async function saveQuizForVideo(moduleId: string, videoId: string, input: SaveQuizInput) {
  const normalized = validateQuizInput(input)
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    if (normalized.questions.length === 0) {
      await client.query(
        `
        DELETE FROM player_video_quiz_results
        WHERE module_id = $1 AND video_id = $2
        `,
        [moduleId, videoId],
      )
      await client.query(
        `
        DELETE FROM video_quizzes
        WHERE module_id = $1 AND video_id = $2
        `,
        [moduleId, videoId],
      )

      await client.query("COMMIT")
      return { quiz: null }
    }

    const quizInsert = await client.query<QuizRow>(
      `
      INSERT INTO video_quizzes (module_id, video_id, title, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (module_id, video_id) DO UPDATE SET
        title = EXCLUDED.title,
        updated_at = NOW()
      RETURNING id, module_id, video_id, title
      `,
      [moduleId, videoId, normalized.title],
    )

    const quizId = quizInsert.rows[0].id

    await client.query(
      `
      DELETE FROM video_quiz_answers
      WHERE question_id IN (
        SELECT id
        FROM video_quiz_questions
        WHERE quiz_id = $1
      )
      `,
      [quizId],
    )

    await client.query(
      `
      DELETE FROM video_quiz_questions
      WHERE quiz_id = $1
      `,
      [quizId],
    )

    for (const [questionIndex, question] of normalized.questions.entries()) {
      const questionInsert = await client.query<{ id: number }>(
        `
        INSERT INTO video_quiz_questions (quiz_id, prompt, sort_order)
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [quizId, question.prompt, questionIndex],
      )

      const questionId = questionInsert.rows[0].id
      for (const [answerIndex, answer] of question.answers.entries()) {
        await client.query(
          `
          INSERT INTO video_quiz_answers (question_id, answer_text, is_correct, sort_order)
          VALUES ($1, $2, $3, $4)
          `,
          [questionId, answer.text, answer.isCorrect, answerIndex],
        )
      }
    }

    await client.query("COMMIT")

    const { quiz } = await getQuizForVideo(moduleId, videoId, { includeCorrectAnswers: true })
    return { quiz }
  } catch (error) {
    await client.query("ROLLBACK")
    if (isMissingQuizTables(error)) {
      throw new Error(MISSING_VIDEO_QUIZ_TABLES_MESSAGE)
    }
    throw error
  } finally {
    client.release()
  }
}

export async function submitQuizAttempt(
  userId: number,
  moduleId: string,
  videoId: string,
  selectedAnswers: Record<string, string>,
  questionIds?: string[],
) {
  try {
    const quiz = await getQuizDefinition(moduleId, videoId, true)
    if (!quiz || quiz.questions.length === 0) {
      throw new Error("No exam available for this video.")
    }

    const activeQuestions =
      questionIds && questionIds.length > 0
        ? quiz.questions.filter((question) => questionIds.includes(question.id))
        : quiz.questions

    if (activeQuestions.length === 0) {
      throw new Error("No valid exam questions were submitted.")
    }

    const totalQuestions = activeQuestions.length
    const correctAnswers = activeQuestions.reduce((score, question) => {
      const chosenAnswerId = selectedAnswers[question.id]
      const correctAnswer = question.answers.find((answer) => answer.isCorrect)
      return score + (correctAnswer && chosenAnswerId === correctAnswer.id ? 1 : 0)
    }, 0)
    const passed = totalQuestions > 0 && correctAnswers === totalQuestions

    const persistedAnswers = activeQuestions.map((question) => ({
      questionId: question.id,
      answerId: selectedAnswers[question.id] || null,
    }))

    const { rows } = await query<QuizResultRow>(
      `
      INSERT INTO player_video_quiz_results (
        user_id,
        module_id,
        video_id,
        total_questions,
        correct_answers,
        passed,
        answers,
        submitted_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())
      ON CONFLICT (user_id, module_id, video_id) DO UPDATE SET
        total_questions = EXCLUDED.total_questions,
        correct_answers = EXCLUDED.correct_answers,
        passed = EXCLUDED.passed,
        answers = EXCLUDED.answers,
        submitted_at = NOW()
      RETURNING total_questions, correct_answers, passed, submitted_at
      `,
      [userId, moduleId, videoId, totalQuestions, correctAnswers, passed, JSON.stringify(persistedAnswers)],
    )

    const row = rows[0]
    return {
      totalQuestions: row.total_questions,
      correctAnswers: row.correct_answers,
      passed: row.passed,
      submittedAt: row.submitted_at ? new Date(row.submitted_at).toISOString() : null,
    } satisfies VideoQuizResult
  } catch (error) {
    if (isMissingQuizTables(error)) {
      throw new Error(MISSING_VIDEO_QUIZ_TABLES_MESSAGE)
    }
    throw error
  }
}

export async function getPassedVideoIdsForUser(userId: number, moduleId: string) {
  try {
    const { rows } = await query<{ video_id: string }>(
      `
      SELECT video_id
      FROM player_video_quiz_results
      WHERE user_id = $1 AND module_id = $2 AND passed = TRUE
      `,
      [userId, moduleId],
    )

    return new Set(rows.map((row) => row.video_id))
  } catch (error) {
    if (isMissingQuizTables(error)) {
      return new Set<string>()
    }
    throw error
  }
}

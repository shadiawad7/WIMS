import { query } from "@/lib/db"
import { getDefaultModuleMeta, type ModuleMeta, type ModuleRouteId } from "@/lib/module-metadata"
import type { VimeoMetadata } from "@/lib/vimeo"

export type Highlight = {
  id: string
  time: number
  user: string
  note?: string
}

export type ModuleVideo = {
  id: string
  title: string
  coach: string
  duration: string
  durationSeconds: number
  popularity: number
  views: number
  beneficialRatio: number
  status: "completed" | "in-progress" | "start"
  thumbnail: string
  previewVideo?: string
  progress?: number
  videoSrc?: string
  description: string
  highlights: Highlight[]
}

type DbRow = Record<string, unknown>

const safeIdentifier = /^[a-zA-Z_][a-zA-Z0-9_]*$/

function quoteIdentifier(value: string) {
  if (!safeIdentifier.test(value)) {
    throw new Error(`Invalid SQL identifier: ${value}`)
  }
  return `"${value}"`
}

function parseModuleRouteId(value: string): ModuleRouteId | null {
  const normalized = value.trim().toLowerCase().replaceAll("_", "-")
  if (normalized in {
    methodology: true,
    "modern-footy": true,
    "physical-prep": true,
    positions: true,
    "video-analysis": true,
  }) {
    return normalized as ModuleRouteId
  }
  return null
}

function firstString(row: DbRow, keys: string[], fallback = "") {
  for (const key of keys) {
    const candidate = row[key]
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim()
    }
    if (Array.isArray(candidate)) {
      const first = candidate.find((value) => typeof value === "string" && value.trim().length > 0)
      if (typeof first === "string") {
        return first.trim()
      }
    }
  }
  return fallback
}

function firstNumber(row: DbRow, keys: string[], fallback = 0) {
  for (const key of keys) {
    const candidate = row[key]
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate
    }
    if (typeof candidate === "string") {
      const parsed = Number(candidate)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }
  return fallback
}

function parseDurationSeconds(row: DbRow) {
  const fromSeconds = firstNumber(row, ["duration_seconds"], 0)
  if (fromSeconds > 0) {
    return Math.floor(fromSeconds)
  }

  const durationText = firstString(row, ["duration"], "")
  if (!durationText) {
    return 0
  }

  const parts = durationText.split(":").map((part) => Number(part))
  if (parts.length === 2 && parts.every((value) => Number.isFinite(value))) {
    return parts[0] * 60 + parts[1]
  }
  if (parts.length === 3 && parts.every((value) => Number.isFinite(value))) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  return 0
}

function formatDuration(durationSeconds: number, rawDuration?: string) {
  if (rawDuration && rawDuration.trim()) {
    return rawDuration
  }
  if (!durationSeconds) {
    return "0:00"
  }
  const mins = Math.floor(durationSeconds / 60)
  const secs = durationSeconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function extractRemoteVideoId(url?: string) {
  if (!url) {
    return ""
  }
  try {
    const parsed = new URL(url)
    const queryId = parsed.searchParams.get("v")
    if (queryId) {
      return queryId
    }
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "")
    }
    const segments = parsed.pathname.split("/").filter(Boolean)
    for (let index = segments.length - 1; index >= 0; index -= 1) {
      if (/^\d+$/.test(segments[index])) {
        return segments[index]
      }
    }
    if (parsed.pathname.includes("/shorts/")) {
      return parsed.pathname.split("/shorts/")[1]?.split("/")[0] || ""
    }
  } catch {
    return ""
  }
  return ""
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function deriveVideoId(row: DbRow, videoSrc: string, fallbackTitle: string) {
  const fromId = row.id
  if (typeof fromId === "number" || typeof fromId === "string") {
    return String(fromId)
  }

  const fromSlug = firstString(row, ["slug", "video_id"], "")
  if (fromSlug) {
    return fromSlug
  }

  const remoteId = extractRemoteVideoId(videoSrc)
  if (remoteId) {
    return `remote-${remoteId}`
  }

  const fromTitle = slugify(fallbackTitle)
  if (fromTitle) {
    return fromTitle
  }

  return `video-${Date.now()}`
}

function mapRowToVideo(row: DbRow, meta: ModuleMeta): ModuleVideo {
  const videoSrc = firstString(row, ["video_url", "videos", "video_src", "youtube_url", "url", "link"], "")
  const title = firstString(row, ["title", "name"], "Untitled Video")
  const coach = firstString(row, ["video_director", "coach", "director", "author"], meta.director)
  const durationSeconds = parseDurationSeconds(row)
  const duration = formatDuration(durationSeconds, firstString(row, ["duration"], ""))
  const popularity = firstNumber(row, ["popularity"], 0)
  const views = firstNumber(row, ["views"], 0)
  const beneficialRatio = firstNumber(row, ["beneficial_ratio", "beneficialratio"], 0)
  const progress = firstNumber(row, ["progress"], 0)
  const rawStatus = firstString(row, ["status"], "").toLowerCase()
  const status: ModuleVideo["status"] =
    rawStatus === "completed" || rawStatus === "in-progress" || rawStatus === "start"
      ? rawStatus
      : progress > 0
        ? "in-progress"
        : "start"

  return {
    id: deriveVideoId(row, videoSrc, title),
    title,
    coach,
    duration,
    durationSeconds,
    popularity,
    views,
    beneficialRatio,
    status,
    thumbnail: firstString(row, ["thumbnail", "thumbnail_url", "cover", "image"], meta.thumbnail) || meta.thumbnail,
    previewVideo: firstString(row, ["preview_video", "preview_url"], ""),
    progress: progress > 0 ? Math.min(progress, 100) : undefined,
    videoSrc: videoSrc || undefined,
    description: firstString(row, ["description"], ""),
    highlights: [],
  }
}

type TableColumn = {
  column_name: string
  data_type: string
  udt_name: string
  is_nullable: "YES" | "NO"
  column_default: string | null
  is_identity: "YES" | "NO"
  is_generated: "NEVER" | "ALWAYS"
}

async function getTableColumns(table: string) {
  const { rows } = await query<TableColumn>(
    `
    SELECT
      column_name,
      data_type,
      udt_name,
      is_nullable,
      column_default,
      is_identity,
      is_generated
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
    `,
    [table],
  )
  return rows
}

function buildOrderBy(columns: string[]) {
  if (columns.includes("created_at")) {
    if (columns.includes("id")) {
      return `ORDER BY ${quoteIdentifier("created_at")} DESC NULLS LAST, ${quoteIdentifier("id")} DESC`
    }
    return `ORDER BY ${quoteIdentifier("created_at")} DESC NULLS LAST`
  }
  if (columns.includes("id")) {
    return `ORDER BY ${quoteIdentifier("id")} DESC`
  }
  return ""
}

export function getModuleMeta(moduleId: string) {
  const parsed = parseModuleRouteId(moduleId)
  if (!parsed) {
    return null
  }
  return getDefaultModuleMeta(parsed)
}

export async function getModuleVideos(moduleId: string) {
  const meta = getModuleMeta(moduleId)
  if (!meta?.table) {
    return []
  }

  const columns = await getTableColumns(meta.table)
  if (columns.length === 0) {
    return []
  }

  const columnNames = columns.map((column) => column.column_name)
  const sql = `SELECT * FROM ${quoteIdentifier(meta.table)} ${buildOrderBy(columnNames)}`
  const { rows } = await query<DbRow>(sql)
  return rows.map((row) => mapRowToVideo(row, meta))
}

type AddVideoResult =
  | { ok: true; video: ModuleVideo }
  | { ok: false; error: string; status: number }

export async function addVideoUrlToModule(
  moduleId: string,
  videoUrl: string,
  metadata?: Partial<VimeoMetadata>,
): Promise<AddVideoResult> {
  const meta = getModuleMeta(moduleId)
  if (!meta) {
    return { ok: false, error: "Module not found", status: 404 }
  }

  const columns = await getTableColumns(meta.table)
  if (columns.length === 0) {
    return { ok: false, error: `Table "${meta.table}" does not exist or has no columns`, status: 500 }
  }
  const columnsByName = new Map(columns.map((column) => [column.column_name, column]))

  const isArrayColumn = (column?: TableColumn) => column?.data_type === "ARRAY" || column?.udt_name.startsWith("_")
  const isJsonColumn = (column?: TableColumn) => column?.data_type === "json" || column?.data_type === "jsonb"
  const isBooleanColumn = (column?: TableColumn) => column?.data_type === "boolean"
  const isNumericColumn = (column?: TableColumn) =>
    column?.data_type === "smallint" ||
    column?.data_type === "integer" ||
    column?.data_type === "bigint" ||
    column?.data_type === "numeric" ||
    column?.data_type === "real" ||
    column?.data_type === "double precision"

  const asJsonValue = (value: unknown) => JSON.stringify(value)

  const now = new Date()
  const generatedTitle = metadata?.title || `Video ${now.toISOString().slice(0, 16).replace("T", " ")}`
  const generatedSlug = metadata?.videoId || extractRemoteVideoId(videoUrl) || `video-${now.getTime()}`
  const videosColumn = columnsByName.get("videos")
  const videoUrlColumn = columnsByName.get("video_url")
  const videoDirectorColumn = columnsByName.get("video_director")
  const directoColumn = columnsByName.get("directo")
  const continuoWatchingColumn = columnsByName.get("continuo_watching")

  const adaptedVideosValue = isArrayColumn(videosColumn)
    ? [videoUrl]
    : isJsonColumn(videosColumn)
      ? asJsonValue([{ url: videoUrl }])
      : videoUrl
  const adaptedVideoUrlValue = isArrayColumn(videoUrlColumn)
    ? [videoUrl]
    : isJsonColumn(videoUrlColumn)
      ? asJsonValue({ url: videoUrl })
      : videoUrl
  const adaptedContinuoWatching = isArrayColumn(continuoWatchingColumn)
    ? []
    : isJsonColumn(continuoWatchingColumn)
      ? asJsonValue([])
      : isBooleanColumn(continuoWatchingColumn)
        ? false
        : isNumericColumn(continuoWatchingColumn)
          ? 0
          : ""
  const adaptedVideoDirector = isArrayColumn(videoDirectorColumn)
    ? []
    : isJsonColumn(videoDirectorColumn)
      ? asJsonValue(null)
      : null

  const generatedValues: Record<string, unknown> = {
    video_url: adaptedVideoUrlValue,
    videos: adaptedVideosValue,
    video_src: videoUrl,
    youtube_url: videoUrl,
    url: videoUrl,
    link: videoUrl,
    video_director: adaptedVideoDirector,
    directo: isBooleanColumn(directoColumn) ? false : 0,
    continuo_watching: adaptedContinuoWatching,
    title: generatedTitle,
    name: generatedTitle,
    slug: generatedSlug,
    video_id: generatedSlug,
    coach: metadata?.coach || meta.director,
    director: metadata?.coach || meta.director,
    author: metadata?.coach || meta.director,
    duration: metadata?.duration || "0:00",
    duration_seconds: metadata?.durationSeconds ?? 0,
    popularity: 0,
    views: metadata?.views ?? 0,
    beneficial_ratio: 0,
    beneficialratio: 0,
    status: "start",
    thumbnail: metadata?.thumbnail || meta.thumbnail,
    thumbnail_url: metadata?.thumbnail || meta.thumbnail,
    cover: metadata?.thumbnail || meta.thumbnail,
    image: metadata?.thumbnail || meta.thumbnail,
    description: metadata?.description || "",
    progress: 0,
  }

  const chosenColumns = columns
    .map((column) => column.column_name)
    .filter((column) => column in generatedValues)
  if (chosenColumns.length === 0) {
    return {
      ok: false,
      error: `No compatible columns found in table "${meta.table}" to store the video URL`,
      status: 500,
    }
  }

  const requiredColumns = columns
    .filter(
      (column) =>
        column.is_nullable === "NO" &&
        column.column_default === null &&
        column.is_identity === "NO" &&
        column.is_generated === "NEVER",
    )
    .map((column) => column.column_name)
  const missingRequired = requiredColumns.filter((column) => !chosenColumns.includes(column))
  if (missingRequired.length > 0) {
    return {
      ok: false,
      error: `Cannot insert into "${meta.table}". Missing required columns: ${missingRequired.join(", ")}`,
      status: 500,
    }
  }

  const placeholders = chosenColumns.map((_, index) => `$${index + 1}`)
  const values = chosenColumns.map((column) => generatedValues[column])

  const sql = `
    INSERT INTO ${quoteIdentifier(meta.table)} (${chosenColumns.map((column) => quoteIdentifier(column)).join(", ")})
    VALUES (${placeholders.join(", ")})
    RETURNING *
  `

  const { rows } = await query<DbRow>(sql, values)
  const created = rows[0]
  if (!created) {
    return { ok: false, error: "Video insert failed", status: 500 }
  }

  return { ok: true, video: mapRowToVideo(created, meta) }
}

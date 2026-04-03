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
  const extractString = (candidate: unknown): string | null => {
    if (typeof candidate === "string") {
      const trimmed = candidate.trim()
      if (!trimmed) {
        return null
      }

      if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
        try {
          return extractString(JSON.parse(trimmed))
        } catch {
          return trimmed
        }
      }

      return trimmed
    }

    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        const nested = extractString(item)
        if (nested) {
          return nested
        }
      }
      return null
    }

    if (candidate && typeof candidate === "object") {
      const record = candidate as Record<string, unknown>
      for (const key of ["url", "src", "value", "text", "name", "title"]) {
        const nested = extractString(record[key])
        if (nested) {
          return nested
        }
      }
      return null
    }

    return null
  }

  for (const key of keys) {
    const extracted = extractString(row[key])
    if (extracted) {
      return extracted
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

type UpdateVideoPayload = {
  title?: string
  coach?: string
  duration?: string
  popularity?: number
  views?: number
  beneficialRatio?: number
  description?: string
  videoUrl?: string
  thumbnail?: string
}

function parseDurationTextToSeconds(duration: string) {
  const parts = duration.split(":").map((part) => Number(part))
  if (parts.some((value) => !Number.isFinite(value))) {
    return 0
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  return 0
}

function normalizeValueForColumn(value: unknown, column?: TableColumn) {
  if (!column) {
    return value
  }

  if (column.data_type === "ARRAY" || column.udt_name.startsWith("_")) {
    if (Array.isArray(value)) {
      return value
    }
    return value === null || value === undefined || value === "" ? [] : [value]
  }

  if (column.data_type === "json" || column.data_type === "jsonb") {
    return JSON.stringify(value)
  }

  if (column.data_type === "boolean") {
    return Boolean(value)
  }

  if (
    column.data_type === "smallint" ||
    column.data_type === "integer" ||
    column.data_type === "bigint" ||
    column.data_type === "numeric" ||
    column.data_type === "real" ||
    column.data_type === "double precision"
  ) {
    const numeric = typeof value === "number" ? value : Number(value)
    return Number.isFinite(numeric) ? numeric : 0
  }

  return value
}

function buildVideoLookup(columnNames: string[]) {
  if (columnNames.includes("id")) {
    return `${quoteIdentifier("id")}::text = $1`
  }
  if (columnNames.includes("video_id")) {
    return `${quoteIdentifier("video_id")} = $1`
  }
  if (columnNames.includes("slug")) {
    return `${quoteIdentifier("slug")} = $1`
  }
  return ""
}

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

export async function updateModuleVideo(
  moduleId: string,
  videoId: string,
  values: UpdateVideoPayload,
  metadata?: Partial<VimeoMetadata>,
): Promise<AddVideoResult> {
  const meta = getModuleMeta(moduleId)
  if (!meta?.table) {
    return { ok: false, error: "Module not found", status: 404 }
  }

  const columns = await getTableColumns(meta.table)
  if (columns.length === 0) {
    return { ok: false, error: `Table "${meta.table}" does not exist or has no columns`, status: 500 }
  }

  const columnNames = columns.map((column) => column.column_name)
  const whereClause = buildVideoLookup(columnNames)
  if (!whereClause) {
    return { ok: false, error: `No unique identifier found in table "${meta.table}"`, status: 500 }
  }

  const { rows: currentRows } = await query<DbRow>(
    `SELECT * FROM ${quoteIdentifier(meta.table)} WHERE ${whereClause} LIMIT 1`,
    [videoId],
  )
  const currentRow = currentRows[0]
  if (!currentRow) {
    return { ok: false, error: "Video not found", status: 404 }
  }

  const currentVideo = mapRowToVideo(currentRow, meta)
  const columnsByName = new Map(columns.map((column) => [column.column_name, column]))
  const isArrayColumn = (column?: TableColumn) => column?.data_type === "ARRAY" || column?.udt_name.startsWith("_")
  const isJsonColumn = (column?: TableColumn) => column?.data_type === "json" || column?.data_type === "jsonb"
  const effectiveVideoUrl = values.videoUrl?.trim() || currentVideo.videoSrc || ""
  const effectiveTitle = values.title?.trim() || metadata?.title || currentVideo.title
  const effectiveCoach = values.coach?.trim() || metadata?.coach || currentVideo.coach
  const effectiveDuration = values.duration?.trim() || metadata?.duration || currentVideo.duration
  const effectiveDurationSeconds =
    metadata?.durationSeconds || parseDurationTextToSeconds(effectiveDuration) || currentVideo.durationSeconds
  const effectiveThumbnail = values.thumbnail?.trim() || metadata?.thumbnail || currentVideo.thumbnail
  const effectiveDescription = values.description?.trim() ?? metadata?.description ?? currentVideo.description
  const effectivePopularity =
    typeof values.popularity === "number" ? Math.max(0, Math.min(100, values.popularity)) : currentVideo.popularity
  const effectiveViews = typeof values.views === "number" ? Math.max(0, values.views) : currentVideo.views
  const effectiveBeneficial =
    typeof values.beneficialRatio === "number"
      ? Math.max(0, Math.min(100, values.beneficialRatio))
      : currentVideo.beneficialRatio

  const videosColumn = columnsByName.get("videos")
  const videoUrlColumn = columnsByName.get("video_url")

  const generatedValues: Record<string, unknown> = {
    video_url: isArrayColumn(videoUrlColumn)
      ? (effectiveVideoUrl ? [effectiveVideoUrl] : [])
      : isJsonColumn(videoUrlColumn)
        ? (effectiveVideoUrl ? { url: effectiveVideoUrl } : null)
        : effectiveVideoUrl,
    videos: isArrayColumn(videosColumn)
      ? (effectiveVideoUrl ? [effectiveVideoUrl] : [])
      : isJsonColumn(videosColumn)
        ? (effectiveVideoUrl ? [{ url: effectiveVideoUrl }] : [])
        : effectiveVideoUrl,
    video_src: effectiveVideoUrl,
    youtube_url: effectiveVideoUrl,
    url: effectiveVideoUrl,
    link: effectiveVideoUrl,
    title: effectiveTitle,
    name: effectiveTitle,
    coach: effectiveCoach,
    director: effectiveCoach,
    author: effectiveCoach,
    duration: effectiveDuration,
    duration_seconds: effectiveDurationSeconds,
    popularity: effectivePopularity,
    views: effectiveViews,
    beneficial_ratio: effectiveBeneficial,
    beneficialratio: effectiveBeneficial,
    thumbnail: effectiveThumbnail,
    thumbnail_url: effectiveThumbnail,
    cover: effectiveThumbnail,
    image: effectiveThumbnail,
    description: effectiveDescription,
  }

  const selectedEntries = Object.entries(generatedValues).filter(([column]) => columnNames.includes(column))
  if (selectedEntries.length === 0) {
    return { ok: false, error: `No editable columns found in table "${meta.table}"`, status: 500 }
  }

  const setClauses = selectedEntries.map(
    ([column], index) => `${quoteIdentifier(column)} = $${index + 2}`,
  )
  const params = [
    videoId,
    ...selectedEntries.map(([column, value]) => normalizeValueForColumn(value, columnsByName.get(column))),
  ]

  const { rows } = await query<DbRow>(
    `
    UPDATE ${quoteIdentifier(meta.table)}
    SET ${setClauses.join(", ")}
    WHERE ${whereClause}
    RETURNING *
    `,
    params,
  )

  const updated = rows[0]
  if (!updated) {
    return { ok: false, error: "Video update failed", status: 500 }
  }

  return { ok: true, video: mapRowToVideo(updated, meta) }
}

export async function deleteModuleVideo(moduleId: string, videoId: string) {
  const meta = getModuleMeta(moduleId)
  if (!meta?.table) {
    return { ok: false as const, error: "Module not found", status: 404 }
  }

  const columns = await getTableColumns(meta.table)
  if (columns.length === 0) {
    return { ok: false as const, error: `Table "${meta.table}" does not exist or has no columns`, status: 500 }
  }

  const whereClause = buildVideoLookup(columns.map((column) => column.column_name))
  if (!whereClause) {
    return { ok: false as const, error: `No unique identifier found in table "${meta.table}"`, status: 500 }
  }

  const { rowCount } = await query(
    `DELETE FROM ${quoteIdentifier(meta.table)} WHERE ${whereClause}`,
    [videoId],
  )

  if (!rowCount) {
    return { ok: false as const, error: "Video not found", status: 404 }
  }

  await query(`DELETE FROM player_video_quiz_results WHERE module_id = $1 AND video_id = $2`, [moduleId, videoId]).catch(
    () => undefined,
  )
  await query(`DELETE FROM video_quizzes WHERE module_id = $1 AND video_id = $2`, [moduleId, videoId]).catch(
    () => undefined,
  )

  return { ok: true as const }
}

export async function recordVideoView(moduleId: string, videoId: string, userId: number) {
  const meta = getModuleMeta(moduleId)
  if (!meta?.table) {
    return { ok: false as const, error: "Module not found", status: 404 }
  }

  const columns = await getTableColumns(meta.table)
  if (columns.length === 0) {
    return { ok: false as const, error: `Table "${meta.table}" does not exist or has no columns`, status: 500 }
  }

  const columnNames = columns.map((column) => column.column_name)
  const whereClause = buildVideoLookup(columnNames)
  if (!whereClause) {
    return { ok: false as const, error: `No unique identifier found in table "${meta.table}"`, status: 500 }
  }

  await query(
    `
    INSERT INTO video_views (user_id, module_id, video_id)
    VALUES ($1, $2, $3)
    `,
    [userId, moduleId, videoId],
  )

  const totalViewsResult = await query<{ count: string }>(
    `
    SELECT COUNT(*)::text AS count
    FROM video_views
    WHERE module_id = $1 AND video_id = $2
    `,
    [moduleId, videoId],
  )

  const totalViews = Number(totalViewsResult.rows[0]?.count ?? 0)

  if (columnNames.includes("views")) {
    await query(
      `
      UPDATE ${quoteIdentifier(meta.table)}
      SET ${quoteIdentifier("views")} = $2
      WHERE ${whereClause}
      `,
      [videoId, totalViews],
    )
  }

  return { ok: true as const, counted: true, views: totalViews }
}

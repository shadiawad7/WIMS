import { query } from "@/lib/db"
import { normalizeModulePathId } from "@/lib/routes"

export type ModuleRouteId =
  | "methodology"
  | "modern-footy"
  | "physical-prep"
  | "positions"
  | "video-analysis"

export type DashboardModuleId = ModuleRouteId | "wims-select"

export type ModuleMeta = {
  id: DashboardModuleId
  table?: string
  name: string
  director: string
  directorVideoUrl?: string
  description: string
  thumbnail: string
  completion: number
  locked?: boolean
  unlockTime?: string
}

type ModuleMetaRow = {
  module_id: DashboardModuleId
  name: string
  director: string
  director_video_url: string | null
  description: string
  thumbnail: string
  completion: number
  locked: boolean
  unlock_time: string | null
}

function normalizeDashboardModuleId(value: string): DashboardModuleId | null {
  const normalized = normalizeModulePathId(value)
  if (normalized in DEFAULT_MODULE_META) {
    return normalized as DashboardModuleId
  }
  return null
}

function isMissingModuleMetadataTable(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "42P01"
}

function isMissingDirectorVideoColumn(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "42703"
}

export const DEFAULT_MODULE_META: Record<DashboardModuleId, ModuleMeta> = {
  methodology: {
    id: "methodology",
    table: "methodology",
    name: "METHODOLOGY",
    director: "Pau Llacer",
    directorVideoUrl: "/Pau_Llacer.mov",
    description: "Concepts of Football",
    completion: 27,
    thumbnail: "/football-tactics-whiteboard-strategy.jpg",
  },
  "modern-footy": {
    id: "modern-footy",
    table: "modern_footy",
    name: "MODERN FOOTY",
    director: "Pau Llacer",
    directorVideoUrl: "/Pau_Llacer.mov",
    description: "World Class Modern Style",
    completion: 53,
    thumbnail: "/modern-football-barcelona-style-play.jpg",
  },
  "physical-prep": {
    id: "physical-prep",
    table: "physical_prep",
    name: "PHYSICAL PREP",
    director: "Pau Llacer",
    directorVideoUrl: "/Pau_Llacer.mov",
    description: "Prevent Injuries & Prepare Body",
    completion: 92,
    thumbnail: "/soccer-player-fitness-training-gym.jpg",
  },
  positions: {
    id: "positions",
    table: "positions",
    name: "POSITIONS",
    director: "Pau Llacer",
    directorVideoUrl: "/Pau_Llacer.mov",
    description: "Master Your Position",
    completion: 17,
    thumbnail: "/soccer-field-positions-diagram.jpg",
  },
  "video-analysis": {
    id: "video-analysis",
    table: "video_analysis",
    name: "VIDEO ANALYSIS",
    director: "Pau Llacer",
    directorVideoUrl: "/Pau_Llacer.mov",
    description: "Concepts of Football",
    completion: 72,
    thumbnail: "/football-video-analysis-screen-tactical.jpg",
  },
  "wims-select": {
    id: "wims-select",
    name: "WIMS SELECT",
    director: "Pau Llacer",
    directorVideoUrl: "/Pau_Llacer.mov",
    description: "Exclusive Content",
    completion: 0,
    locked: true,
    unlockTime: "Unlock at 7 Months",
    thumbnail: "/vip-exclusive-premium-soccer-content.jpg",
  },
}

function isDashboardModuleId(value: string): value is DashboardModuleId {
  return normalizeDashboardModuleId(value) !== null
}

function mapRowToMeta(row: ModuleMetaRow): ModuleMeta {
  const normalizedId = normalizeDashboardModuleId(row.module_id)
  if (!normalizedId) {
    throw new Error(`Invalid module_id "${row.module_id}" in module_metadata`)
  }

  const fallback = DEFAULT_MODULE_META[normalizedId]
  return {
    ...fallback,
    id: normalizedId,
    name: row.name,
    director: row.director,
    directorVideoUrl: row.director_video_url || undefined,
    description: row.description,
    thumbnail: row.thumbnail,
    completion: row.completion,
    locked: row.locked,
    unlockTime: row.unlock_time || undefined,
  }
}

export function getDefaultModuleMeta(moduleId: string) {
  const normalizedId = normalizeDashboardModuleId(moduleId)
  if (!normalizedId) {
    return null
  }
  return DEFAULT_MODULE_META[normalizedId]
}

export async function getModuleMeta(moduleId: string) {
  const fallback = getDefaultModuleMeta(moduleId)
  if (!fallback) {
    return null
  }

  try {
    const { rows } = await query<ModuleMetaRow>(
      `
      SELECT module_id, name, director, director_video_url, description, thumbnail, completion, locked, unlock_time
      FROM module_metadata
      WHERE module_id = $1
      LIMIT 1
      `,
      [moduleId],
    )

    return rows[0] ? mapRowToMeta(rows[0]) : fallback
  } catch (error) {
    if (isMissingModuleMetadataTable(error)) {
      return fallback
    }
    if (isMissingDirectorVideoColumn(error)) {
      const { rows } = await query<Omit<ModuleMetaRow, "director_video_url"> & { director_video_url?: string | null }>(
        `
        SELECT module_id, name, director, description, thumbnail, completion, locked, unlock_time
        FROM module_metadata
        WHERE module_id = $1
        LIMIT 1
        `,
        [moduleId],
      )

      return rows[0]
        ? mapRowToMeta({
            ...rows[0],
            director_video_url: rows[0].director_video_url ?? fallback.directorVideoUrl ?? null,
          } as ModuleMetaRow)
        : fallback
    }
    throw error
  }
}

export async function getDashboardModules() {
  try {
    const { rows } = await query<ModuleMetaRow>(
      `
      SELECT module_id, name, director, director_video_url, description, thumbnail, completion, locked, unlock_time
      FROM module_metadata
      ORDER BY
        CASE module_id
          WHEN 'methodology' THEN 1
          WHEN 'modern-footy' THEN 2
          WHEN 'physical-prep' THEN 3
          WHEN 'positions' THEN 4
          WHEN 'video-analysis' THEN 5
          WHEN 'wims-select' THEN 6
          ELSE 999
        END
      `,
    )

    if (rows.length === 0) {
      return Object.values(DEFAULT_MODULE_META)
    }

    const rowMap = new Map(rows.map((row) => [row.module_id, mapRowToMeta(row)]))
    return Object.keys(DEFAULT_MODULE_META).map(
      (moduleId) => rowMap.get(moduleId as DashboardModuleId) || DEFAULT_MODULE_META[moduleId as DashboardModuleId],
    )
  } catch (error) {
    if (isMissingModuleMetadataTable(error)) {
      return Object.values(DEFAULT_MODULE_META)
    }
    if (isMissingDirectorVideoColumn(error)) {
      const { rows } = await query<Omit<ModuleMetaRow, "director_video_url"> & { director_video_url?: string | null }>(
        `
        SELECT module_id, name, director, description, thumbnail, completion, locked, unlock_time
        FROM module_metadata
        ORDER BY
          CASE module_id
            WHEN 'methodology' THEN 1
            WHEN 'modern-footy' THEN 2
            WHEN 'physical-prep' THEN 3
            WHEN 'positions' THEN 4
            WHEN 'video-analysis' THEN 5
            WHEN 'wims-select' THEN 6
            ELSE 999
          END
        `,
      )

      if (rows.length === 0) {
        return Object.values(DEFAULT_MODULE_META)
      }

      const rowMap = new Map(
        rows.map((row) => [
          row.module_id,
          mapRowToMeta({
            ...row,
            director_video_url:
              row.director_video_url ?? DEFAULT_MODULE_META[row.module_id as DashboardModuleId]?.directorVideoUrl ?? null,
          } as ModuleMetaRow),
        ]),
      )

      return Object.keys(DEFAULT_MODULE_META).map(
        (moduleId) => rowMap.get(moduleId as DashboardModuleId) || DEFAULT_MODULE_META[moduleId as DashboardModuleId],
      )
    }
    throw error
  }
}

export async function updateModuleMeta(
  moduleId: string,
  values: Pick<
    ModuleMeta,
    "name" | "director" | "directorVideoUrl" | "description" | "thumbnail" | "completion" | "locked" | "unlockTime"
  >,
) {
  const fallback = getDefaultModuleMeta(moduleId)
  if (!fallback) {
    return null
  }

  try {
    const { rows } = await query<ModuleMetaRow>(
      `
      INSERT INTO module_metadata (
        module_id,
        name,
        director,
        director_video_url,
        description,
        thumbnail,
        completion,
        locked,
        unlock_time
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (module_id) DO UPDATE SET
        name = EXCLUDED.name,
        director = EXCLUDED.director,
        director_video_url = EXCLUDED.director_video_url,
        description = EXCLUDED.description,
        thumbnail = EXCLUDED.thumbnail,
        completion = EXCLUDED.completion,
        locked = EXCLUDED.locked,
        unlock_time = EXCLUDED.unlock_time
      RETURNING module_id, name, director, director_video_url, description, thumbnail, completion, locked, unlock_time
      `,
      [
        moduleId,
        values.name,
        values.director,
        values.directorVideoUrl?.trim() || null,
        values.description,
        values.thumbnail,
        values.completion,
        values.locked ?? false,
        values.unlockTime || null,
      ],
    )

    return rows[0] ? mapRowToMeta(rows[0]) : fallback
  } catch (error) {
    if (isMissingModuleMetadataTable(error)) {
      throw new Error('Missing table "module_metadata". Run migration 20260328_create_module_metadata.sql first.')
    }
    if (isMissingDirectorVideoColumn(error)) {
      throw new Error(
        'Missing column "director_video_url" in module_metadata. Run migration 20260401_add_director_video_url_to_module_metadata.sql first.',
      )
    }
    throw error
  }
}

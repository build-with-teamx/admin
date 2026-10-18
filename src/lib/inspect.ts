import type { SupabaseIntegration } from "./integrations"
import type { SchemaTable } from "./types"

interface OpenApiProperty {
  type?: string
  format?: string
  description?: string
}

interface OpenApiSpec {
  definitions?: Record<string, { required?: string[]; properties?: Record<string, OpenApiProperty> }>
}

/**
 * Reads the public-schema table and column list from the project's PostgREST
 * OpenAPI document. Newer Supabase projects only serve it to the service-role
 * (secret) key.
 */
export async function inspectSupabase({ url, key }: SupabaseIntegration): Promise<SchemaTable[]> {
  const base = url.trim().replace(/\/+$/, "")
  const response = await fetch(`${base}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  })
  if (!response.ok) {
    throw new Error(`Supabase returned ${response.status} ${response.statusText}. Check the URL and key.`)
  }

  const spec = (await response.json()) as OpenApiSpec
  if (!spec.definitions) {
    throw new Error("Supabase did not return a schema. Use the service-role (secret) key for inspection.")
  }

  return Object.entries(spec.definitions)
    .map(([name, definition]) => ({
      name,
      columns: Object.entries(definition.properties ?? {}).map(([columnName, property]) => ({
        name: columnName,
        type: property.format ?? property.type ?? "unknown",
        required: definition.required?.includes(columnName) ?? false,
        primaryKey: property.description?.includes("Primary Key") ?? false,
      })),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

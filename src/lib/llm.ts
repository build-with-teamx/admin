import type { LlmIntegration } from "./integrations"
import type { SchemaTable } from "./types"

async function failure(provider: string, response: Response): Promise<Error> {
  const body = await response.text().catch(() => "")
  return new Error(`${provider} returned ${response.status}: ${body.slice(0, 200)}`)
}

/** Sends one prompt to the configured provider straight from the browser. */
export async function runPrompt({ provider, model, apiKey }: LlmIntegration, prompt: string): Promise<string> {
  switch (provider) {
    case "anthropic": {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({ model, max_tokens: 1024, messages: [{ role: "user", content: prompt }] }),
      })
      if (!response.ok) throw await failure(provider, response)
      const data = (await response.json()) as { content: { text?: string }[] }
      return data.content.map((block) => block.text ?? "").join("")
    }
    case "openai":
    case "mistral": {
      const endpoint =
        provider === "openai"
          ? "https://api.openai.com/v1/chat/completions"
          : "https://api.mistral.ai/v1/chat/completions"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, max_tokens: 1024, messages: [{ role: "user", content: prompt }] }),
      })
      if (!response.ok) throw await failure(provider, response)
      const data = (await response.json()) as { choices: { message: { content: string } }[] }
      return data.choices[0]?.message.content ?? ""
    }
    case "google": {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      )
      if (!response.ok) throw await failure(provider, response)
      const data = (await response.json()) as {
        candidates?: { content: { parts: { text?: string }[] } }[]
      }
      return data.candidates?.[0]?.content.parts.map((part) => part.text ?? "").join("") ?? ""
    }
  }
}

export function schemaPrompt(tables: SchemaTable[]): string {
  const outline = tables
    .map(
      (t) =>
        `${t.name}(${t.columns
          .map((c) => `${c.name}:${c.type}${c.primaryKey ? " pk" : ""}${c.required ? " required" : ""}`)
          .join(", ")})`
    )
    .join("\n")
  return [
    "You are a database analyst. Below is the public schema of a Supabase (Postgres) project.",
    "Reply in plain text with three short sections: Entities, Observations (relationships, missing indexes, naming or modelling issues), and Suggested questions to ask the data.",
    "",
    outline,
  ].join("\n")
}

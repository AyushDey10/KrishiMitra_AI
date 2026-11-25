const ORIGIN = process.env.API_ORIGIN ?? "http://127.0.0.1:8000";

/**
 * Server-side read. Returns null instead of throwing so a page can render its
 * editorial content even when the FastAPI service is not running.
 */
export async function serverGet<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${ORIGIN}/api${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

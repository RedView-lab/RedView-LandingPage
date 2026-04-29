const SUPABASE_REQUEST_TIMEOUT_MS = 4000;
const SUPABASE_RETRY_DELAY_MS = 250;
const RETRYABLE_EDGE_STATUSES = new Set([522, 523, 524, 530]);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function buildConnectivityErrorMessage(url: string, status?: number): string {
  const httpStatus = status ? ` (HTTP ${status})` : "";

  if (url.includes("/auth/v1/")) {
    return `Supabase auth backend unavailable${httpStatus}.`;
  }

  return `Supabase backend unavailable${httpStatus}.`;
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const abortController = new AbortController();
  const timeoutId = globalThis.setTimeout(() => {
    abortController.abort(new DOMException("Supabase request timed out", "AbortError"));
  }, SUPABASE_REQUEST_TIMEOUT_MS);

  const upstreamSignal = init?.signal;
  const handleAbort = () => abortController.abort();

  if (upstreamSignal) {
    if (upstreamSignal.aborted) {
      abortController.abort();
    } else {
      upstreamSignal.addEventListener("abort", handleAbort, { once: true });
    }
  }

  try {
    return await fetch(input, {
      ...init,
      signal: abortController.signal,
    });
  } finally {
    globalThis.clearTimeout(timeoutId);
    upstreamSignal?.removeEventListener("abort", handleAbort);
  }
}

export async function supabaseServerFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = getRequestUrl(input);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetchWithTimeout(input, init);

      if (RETRYABLE_EDGE_STATUSES.has(response.status)) {
        if (attempt === 0) {
          await delay(SUPABASE_RETRY_DELAY_MS);
          continue;
        }

        throw new Error(buildConnectivityErrorMessage(url, response.status));
      }

      return response;
    } catch (error) {
      const retryableTransportError = isAbortError(error) || isNetworkError(error);

      if (attempt === 0 && retryableTransportError) {
        await delay(SUPABASE_RETRY_DELAY_MS);
        continue;
      }

      if (retryableTransportError) {
        throw new Error(buildConnectivityErrorMessage(url));
      }

      throw error;
    }
  }

  throw new Error(buildConnectivityErrorMessage(url));
}
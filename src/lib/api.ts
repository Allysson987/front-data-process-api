
// src/lib/api.ts

export async function fetchApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));

    if (
      res.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      window.location.href = "/login";
    }

    const detail = errorData.detail;

    throw new Error(
      typeof detail === "string"
        ? detail
        : detail?.[0]?.msg ?? `Erro na requisição: ${res.statusText}`
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();

  return text ? (JSON.parse(text) as T) : ({} as T);
}

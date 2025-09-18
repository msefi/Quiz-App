import useSWR, { SWRConfiguration, SWRResponse } from "swr"
import { useAuthStore } from "@/stores/auth-store"

type RequestOptions = {
	headers?: Record<string, string>
	body?: any
	method?: "GET" | "POST" | "PUT" | "DELETE"
}

const fetcher = async (url: string, options: RequestOptions = {}) => {
	const { method = "GET", headers = {}, body } = options

	// Get token from auth store - only on client side
	let token: string | null = null;
	if (typeof window !== 'undefined') {
		token = useAuthStore.getState().token;
	}

	const res = await fetch(url, {
		method,
		headers: {
			"Content-Type": "application/json",
			...(token && { Authorization: `Bearer ${token}` }),
			...headers,
		},
		body: body ? JSON.stringify(body) : undefined,
	})

	if (!res.ok) {
		const error = new Error("An error occurred while fetching the data")
		// @ts-ignore
		error.info = await res.json()
		// @ts-ignore
		error.status = res.status
		throw error
	}

	return res.json()
}

// Hook SWR generic
export function useApi<T = any>(
  url: string,
  swrOptions?: SWRConfiguration
): SWRResponse<T, any> {
  const { data, error, isLoading, mutate, isValidating } = useSWR<T>(
    url,
    (url: string) => fetcher(url, { method: "GET" }),
    swrOptions
  )

  return {
    data,
    error,
    isLoading,
    mutate,
    isValidating,
  }
}

// Helper untuk POST, PUT, DELETE tanpa SWR
export const apiRequest = async <T = any>(
	url: string,
	options: RequestOptions
): Promise<T> => {
	return fetcher(url, options)
}

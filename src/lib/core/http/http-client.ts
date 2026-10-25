import type { ErrorResponse } from './api.model.ts';
import { ApiError, CLIENT_ERROR_CODES, isAbortError } from './api-error.ts';

type QueryValue = string | number | null | undefined;

export interface RequestOptions {
	method?: 'GET' | 'POST' | 'PATCH';
	query?: Record<string, QueryValue>;
	body?: unknown;
	signal?: AbortSignal;
}

export class HttpClient {
	readonly #baseUrl: string;
	readonly #fetch: typeof fetch;

	constructor(baseUrl: string, fetchFn: typeof fetch = (...args) => fetch(...args)) {
		this.#baseUrl = baseUrl;
		this.#fetch = fetchFn;
	}

	async request<T>(
		path: string,
		{ method = 'GET', query, body, signal }: RequestOptions = {}
	): Promise<T> {
		const url = new URL(path, this.#baseUrl);
		for (const [key, value] of Object.entries(query ?? {})) {
			if (value !== null && value !== undefined && value !== '')
				url.searchParams.set(key, String(value));
		}

		let response: Response;
		try {
			response = await this.#fetch(url, {
				method,
				signal,
				headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
				body: body === undefined ? undefined : JSON.stringify(body)
			});
		} catch (error) {
			if (isAbortError(error)) throw error;
			throw new ApiError({
				status: 0,
				code: CLIENT_ERROR_CODES.network,
				message: 'Could not reach the API'
			});
		}

		const requestId = response.headers.get('X-Request-ID') ?? undefined;
		const payload: unknown = await response.json().catch(() => null);

		if (response.ok && isSuccess(payload)) return payload as T;

		const error = isErrorResponse(payload) ? payload.error : null;
		throw new ApiError({
			status: response.status,
			code: error?.code ?? CLIENT_ERROR_CODES.invalidResponse,
			message: error?.message ?? `Unexpected response (HTTP ${response.status})`,
			details: error?.details ?? [],
			requestId
		});
	}
}

function isSuccess(payload: unknown): boolean {
	return (
		typeof payload === 'object' &&
		payload !== null &&
		'success' in payload &&
		payload.success === true
	);
}

function isErrorResponse(payload: unknown): payload is ErrorResponse {
	return (
		typeof payload === 'object' &&
		payload !== null &&
		'success' in payload &&
		payload.success === false &&
		'error' in payload
	);
}

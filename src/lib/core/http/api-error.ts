import type { ErrorDetail } from './api.model.ts';

/** Codes produced on the client side, in addition to the ones the API returns. */
export const CLIENT_ERROR_CODES = {
	network: 'NETWORK_ERROR',
	invalidResponse: 'INVALID_RESPONSE'
} as const;

interface ApiErrorInit {
	status: number;
	code: string;
	message: string;
	details?: ErrorDetail[];
	requestId?: string;
}

export class ApiError extends Error {
	readonly status: number;
	readonly code: string;
	readonly details: ErrorDetail[];
	readonly requestId: string | undefined;

	constructor({ status, code, message, details = [], requestId }: ApiErrorInit) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.code = code;
		this.details = details;
		this.requestId = requestId;
	}
}

export function isAbortError(error: unknown): boolean {
	return error instanceof DOMException && error.name === 'AbortError';
}

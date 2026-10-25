import { describe, expect, it } from 'vitest';
import { ApiError } from './api-error.ts';
import { getErrorMessage } from './error-message.ts';

const apiError = (status: number, code: string) => new ApiError({ status, code, message: 'raw' });

describe('getErrorMessage (AC-11)', () => {
	it('explains connection problems', () => {
		expect(getErrorMessage(apiError(0, 'NETWORK_ERROR'))).toMatch(/conectar con el servidor/);
	});

	it('explains server failures without exposing technical details', () => {
		const message = getErrorMessage(apiError(503, 'INVALID_RESPONSE'));

		expect(message).toMatch(/servidor tuvo un problema/);
		expect(message).not.toContain('raw');
	});

	it('lets features provide messages for their business codes', () => {
		const error = apiError(404, 'CUSTOMER_NOT_FOUND');

		expect(getErrorMessage(error, { CUSTOMER_NOT_FOUND: 'No existe' })).toBe('No existe');
	});

	it('falls back to a generic message for anything else', () => {
		expect(getErrorMessage(new Error('boom'))).toMatch(/error inesperado/);
	});
});

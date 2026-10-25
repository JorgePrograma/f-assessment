import { describe, expect, it } from 'vitest';
import { ApiError } from '#lib/core/http/api-error.ts';
import { toCustomerFormErrors, validateCustomerForm } from './customer-form.ts';

describe('validateCustomerForm (AC-19)', () => {
	it('accepts a valid name and email', () => {
		expect(validateCustomerForm({ name: ' Ana ', email: ' ana@example.com ' })).toEqual({});
	});

	it.each([
		[{ name: '', email: 'ana@example.com' }, { name: 'El nombre es obligatorio.' }],
		[{ name: '   ', email: 'ana@example.com' }, { name: 'El nombre es obligatorio.' }],
		[{ name: 'A'.repeat(121), email: 'ana@example.com' }, { name: expect.stringMatching(/120/) }],
		[{ name: 'Ana', email: '' }, { email: 'El email es obligatorio.' }],
		[{ name: 'Ana', email: 'ana@' }, { email: 'Ingresa un email válido.' }]
	])('rejects %o', (input, expected) => {
		expect(validateCustomerForm(input)).toEqual(expected);
	});
});

describe('toCustomerFormErrors (AC-20)', () => {
	it('puts a duplicated email on the email field', () => {
		const error = new ApiError({ status: 409, code: 'EMAIL_ALREADY_EXISTS', message: 'x' });

		expect(toCustomerFormErrors(error)).toEqual({ email: 'Ya existe un cliente con este email.' });
	});

	it('maps API validation details onto their fields', () => {
		const error = new ApiError({
			status: 422,
			code: 'VALIDATION_ERROR',
			message: 'x',
			details: [{ field: 'email', message: 'value is not a valid email address' }]
		});

		expect(toCustomerFormErrors(error)).toEqual({ email: 'Ingresa un email válido.' });
	});

	it('returns null for errors that do not belong to a field', () => {
		expect(
			toCustomerFormErrors(new ApiError({ status: 0, code: 'NETWORK_ERROR', message: 'x' }))
		).toBeNull();
		expect(toCustomerFormErrors(new Error('boom'))).toBeNull();
	});
});

import { ApiError } from '#lib/core/http/api-error.ts';
import type { CreateCustomerInput } from '#lib/features/customers/models/customer.model.ts';

export type CustomerFormErrors = Partial<Record<keyof CreateCustomerInput, string>>;

const MAX_NAME_LENGTH = 120;
// Pragmatic check for instant feedback; the API performs the authoritative validation.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Client-side validation, mirroring the API rules (AC-19). */
export function validateCustomerForm(input: CreateCustomerInput): CustomerFormErrors {
	const errors: CustomerFormErrors = {};
	const name = input.name.trim();
	const email = input.email.trim();

	if (!name) errors.name = 'El nombre es obligatorio.';
	else if (name.length > MAX_NAME_LENGTH)
		errors.name = `El nombre admite como máximo ${MAX_NAME_LENGTH} caracteres.`;

	if (!email) errors.email = 'El email es obligatorio.';
	else if (!EMAIL_PATTERN.test(email)) errors.email = 'Ingresa un email válido.';

	return errors;
}

/** Maps API rejections onto the field they belong to (AC-20). Returns null for non-field errors. */
export function toCustomerFormErrors(error: unknown): CustomerFormErrors | null {
	if (!(error instanceof ApiError)) return null;

	if (error.code === 'EMAIL_ALREADY_EXISTS') {
		return { email: 'Ya existe un cliente con este email.' };
	}

	if (error.code === 'VALIDATION_ERROR') {
		const errors: CustomerFormErrors = {};
		for (const detail of error.details) {
			if (detail.field === 'name') errors.name = 'Revisa el nombre.';
			if (detail.field === 'email') errors.email = 'Ingresa un email válido.';
		}
		return Object.keys(errors).length > 0 ? errors : null;
	}

	return null;
}

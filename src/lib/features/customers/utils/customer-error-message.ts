import { getErrorMessage } from '#lib/core/http/error-message.ts';

const CUSTOMER_ERROR_MESSAGES: Record<string, string> = {
	CUSTOMER_NOT_FOUND: 'El cliente ya no existe. Puede que haya sido eliminado.',
	EMAIL_ALREADY_EXISTS: 'Ya existe un cliente con ese email.'
};

export function getCustomerErrorMessage(error: unknown): string {
	return getErrorMessage(error, CUSTOMER_ERROR_MESSAGES);
}

import { ApiError, CLIENT_ERROR_CODES } from './api-error.ts';

const MESSAGES_BY_CODE: Record<string, string> = {
	[CLIENT_ERROR_CODES.network]:
		'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
	VALIDATION_ERROR: 'Los datos enviados no son válidos.'
};

/**
 * Turns any thrown value into a message that is safe and useful to show to the user.
 * Features pass their own business codes in `messagesByCode`.
 */
export function getErrorMessage(
	error: unknown,
	messagesByCode: Record<string, string> = {}
): string {
	if (error instanceof ApiError) {
		const known = messagesByCode[error.code] ?? MESSAGES_BY_CODE[error.code];
		if (known) return known;
		if (error.status >= 500)
			return 'El servidor tuvo un problema. Inténtalo de nuevo en unos segundos.';
	}
	return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

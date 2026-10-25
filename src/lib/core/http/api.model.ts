/** Envelope shared by every API endpoint (see ms-assessment-customer/specs/customers.spec.md §3). */

export interface PaginationMeta {
	page: number;
	size: number;
	total: number;
	pages: number;
}

export interface SuccessResponse<T> {
	success: true;
	data: T;
}

export interface PaginatedResponse<T> {
	success: true;
	data: T[];
	meta: PaginationMeta;
}

export interface ErrorDetail {
	field: string | null;
	message: string;
}

export interface ErrorResponse {
	success: false;
	error: {
		code: string;
		message: string;
		details: ErrorDetail[] | null;
	};
}

export interface Page<T> {
	items: T[];
	meta: PaginationMeta;
}

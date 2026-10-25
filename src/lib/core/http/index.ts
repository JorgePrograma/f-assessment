import { API_URL } from '$app/env/public';
import { HttpClient } from './http-client.ts';

/** Single, app-wide HTTP client wired with the configured API URL; every feature service reuses it. */
export const httpClient = new HttpClient(API_URL);

export { ApiError } from './api-error.ts';

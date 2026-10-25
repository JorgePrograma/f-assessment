import { API_URL } from '$app/env/public';
import { HttpClient } from './http-client.ts';

export const httpClient = new HttpClient(API_URL);

export { ApiError } from './api-error.ts';

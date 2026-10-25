import { resolve } from '$app/paths';

export function customerDetailPath(id: string): string {
	return resolve('/customers/[id]', { id });
}

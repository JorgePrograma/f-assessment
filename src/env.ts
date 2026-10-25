import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	API_URL: {
		public: true,
		description: 'Base URL of the Customers API.',
		schema: (value) => {
			const url = value || 'http://localhost:8000';
			if (!URL.canParse(url)) throw new Error(`API_URL must be a valid URL, received "${url}"`);
			return url;
		}
	}
});

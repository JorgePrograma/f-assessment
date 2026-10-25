import type { BadgeTone } from '#lib/design-system/index.ts';
import type { CustomerStatus } from '#lib/features/customers/models/customer.model.ts';

interface StatusPresentation {
	/** Singular label, used in the badge. */
	label: string;
	/** Plural label, used in the filter. */
	filterLabel: string;
	tone: BadgeTone;
	/** Fill of the status in charts; same hue as the badge dot so a status looks the same everywhere. */
	fillClass: string;
}

/** Single source of truth for how each status is shown; badge, filter, select and charts read from here. */
export const STATUS_PRESENTATION: Record<CustomerStatus, StatusPresentation> = {
	ACTIVE: { label: 'Activo', filterLabel: 'Activos', tone: 'success', fillClass: 'bg-emerald-500' },
	PENDING: {
		label: 'Pendiente',
		filterLabel: 'Pendientes',
		tone: 'warning',
		fillClass: 'bg-amber-400'
	},
	BLOCKED: {
		label: 'Bloqueado',
		filterLabel: 'Bloqueados',
		tone: 'danger',
		fillClass: 'bg-rose-500'
	}
};

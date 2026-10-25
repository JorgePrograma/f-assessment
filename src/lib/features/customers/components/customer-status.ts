import type { BadgeTone } from '#lib/design-system/index.ts';
import type { CustomerStatus } from '#lib/features/customers/models/customer.model.ts';

interface StatusPresentation {
	label: string;
	filterLabel: string;
	tone: BadgeTone;
	fillClass: string;
}

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

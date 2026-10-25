<script lang="ts">
	import { SegmentedControl } from '#lib/design-system/index.ts';
	import {
		CUSTOMER_STATUSES,
		type CustomerStatus
	} from '#lib/features/customers/models/customer.model.ts';
	import { STATUS_PRESENTATION } from './customer-status.ts';

	interface Props {
		value: CustomerStatus | null;
		onchange: (status: CustomerStatus | null) => void;
	}

	let { value, onchange }: Props = $props();

	const options: { value: CustomerStatus | null; label: string }[] = [
		{ value: null, label: 'Todos' },
		...CUSTOMER_STATUSES.map((status) => ({
			value: status,
			label: STATUS_PRESENTATION[status].filterLabel
		}))
	];
</script>

<SegmentedControl {options} {value} {onchange} label="Filtrar por estado" />

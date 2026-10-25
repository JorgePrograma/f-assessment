<script lang="ts">
	import { Badge } from '#lib/design-system/index.ts';
	import type { CustomerStatus } from '#lib/features/customers/models/customer.model.ts';
	import { STATUS_PRESENTATION } from './customer-status.ts';

	interface Props {
		status: CustomerStatus;
	}

	let { status }: Props = $props();

	const presentation = $derived(STATUS_PRESENTATION[status]);
</script>

<Badge tone={presentation.tone}>{presentation.label}</Badge>

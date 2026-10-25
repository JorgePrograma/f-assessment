<script lang="ts">
	import type { Customer } from '#lib/features/customers/models/customer.model.ts';
	import CustomerCards from './CustomerCards.svelte';
	import CustomerTable from './CustomerTable.svelte';

	interface Props {
		customers: Customer[];
		onselect: (customer: Customer) => void;
	}

	let { customers, onselect }: Props = $props();
</script>

<div class="hidden overflow-x-auto px-4 pb-2 sm:px-6 md:block" data-testid="customer-table">
	<CustomerTable {customers} {onselect} />
</div>
<div class="md:hidden" data-testid="customer-cards">
	<CustomerCards {customers} {onselect} />
</div>

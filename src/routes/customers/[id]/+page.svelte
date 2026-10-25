<script lang="ts">
	import { page } from '$app/state';
	import { CustomerDetailScreen } from '#lib/features/customers/index.ts';
</script>

<CustomerDetailScreen customerId={page.params.id ?? ''} />

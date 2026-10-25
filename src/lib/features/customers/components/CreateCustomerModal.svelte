<script lang="ts">
	import { Button, Modal, TextField } from '#lib/design-system/index.ts';
	import type {
		CreateCustomerInput,
		Customer
	} from '#lib/features/customers/models/customer.model.ts';
	import { getCustomerErrorMessage } from '#lib/features/customers/utils/customer-error-message.ts';
	import {
		toCustomerFormErrors,
		validateCustomerForm,
		type CustomerFormErrors
	} from '#lib/features/customers/utils/customer-form.ts';

	interface Props {
		open: boolean;
		onclose: () => void;
		oncreate: (input: CreateCustomerInput) => Promise<Customer>;
	}

	let { open, onclose, oncreate }: Props = $props();

	let name = $state('');
	let email = $state('');
	let errors = $state<CustomerFormErrors>({});
	let formError = $state<string | null>(null);
	let saving = $state(false);

	$effect(() => {
		if (open) {
			name = '';
			email = '';
			errors = {};
			formError = null;
		}
	});

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		formError = null;
		errors = validateCustomerForm({ name, email });
		if (Object.keys(errors).length > 0) {
			focusFirstInvalidField(event.currentTarget as HTMLFormElement);
			return;
		}

		saving = true;
		try {
			await oncreate({ name, email });
		} catch (error) {
			const fieldErrors = toCustomerFormErrors(error);
			if (fieldErrors) {
				errors = fieldErrors;
				focusFirstInvalidField(event.currentTarget as HTMLFormElement);
			} else {
				formError = getCustomerErrorMessage(error);
			}
		} finally {
			saving = false;
		}
	}

	function focusFirstInvalidField(form: HTMLFormElement) {
		queueMicrotask(() => form.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus());
	}
</script>

<Modal {open} title="Nuevo cliente" {onclose}>
	<form onsubmit={submit} novalidate class="space-y-4">
		<TextField
			label="Nombre"
			name="name"
			bind:value={name}
			error={errors.name}
			autocomplete="name"
			maxlength={120}
			placeholder="Juan Pérez"
			disabled={saving}
		/>
		<TextField
			label="Email"
			name="email"
			type="email"
			bind:value={email}
			error={errors.email}
			autocomplete="email"
			placeholder="juan@example.com"
			disabled={saving}
		/>
		<p class="text-xs text-slate-500">El cliente se registrará con estado Pendiente.</p>

		{#if formError}
			<p role="alert" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>
		{/if}

		<div class="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
			<Button variant="secondary" onclick={onclose} disabled={saving}>Cancelar</Button>
			<Button type="submit" disabled={saving}>{saving ? 'Creando…' : 'Crear cliente'}</Button>
		</div>
	</form>
</Modal>

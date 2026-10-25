import type { SweetAlertOptions } from 'sweetalert2';

type Tone = 'primary' | 'danger';

interface ConfirmOptions {
	title: string;
	text: string;
	confirmText: string;
	cancelText?: string;
	tone?: Tone;
}

const BUTTON =
	'rounded-lg px-4 py-2 text-sm font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2';

const CONFIRM_BUTTON: Record<Tone, string> = {
	primary: `${BUTTON} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600`,
	danger: `${BUTTON} bg-rose-600 text-white hover:bg-rose-500 focus-visible:outline-rose-600`
};

const BASE: SweetAlertOptions = {
	buttonsStyling: false,
	reverseButtons: true,
	customClass: {
		popup: 'rounded-2xl! p-6! font-sans!',
		title: 'text-lg! font-semibold! text-slate-900!',
		htmlContainer: 'text-sm! text-slate-600!',
		actions: 'gap-3! mt-6!',
		confirmButton: CONFIRM_BUTTON.primary,
		cancelButton: `${BUTTON} bg-white text-slate-900 ring-1 ring-slate-300 ring-inset hover:bg-slate-50`
	}
};

async function swal() {
	const { default: Swal } = await import('sweetalert2');
	return Swal;
}

export async function confirmAction({
	title,
	text,
	confirmText,
	cancelText = 'Cancelar',
	tone = 'primary'
}: ConfirmOptions): Promise<boolean> {
	const Swal = await swal();
	const result = await Swal.fire({
		...BASE,
		icon: tone === 'danger' ? 'warning' : 'question',
		title,
		text,
		showCancelButton: true,
		confirmButtonText: confirmText,
		cancelButtonText: cancelText,
		focusCancel: tone === 'danger',
		customClass: { ...(BASE.customClass as object), confirmButton: CONFIRM_BUTTON[tone] }
	});
	return result.isConfirmed;
}

export async function showLoading(
	title: string,
	text = 'Por favor espera un momento.'
): Promise<void> {
	const Swal = await swal();
	void Swal.fire({
		...BASE,
		title,
		text,
		allowOutsideClick: false,
		allowEscapeKey: false,
		showConfirmButton: false,
		didOpen: () => Swal.showLoading()
	});
}

export async function showSuccess(title: string, text?: string): Promise<void> {
	const Swal = await swal();
	await Swal.fire({
		...BASE,
		icon: 'success',
		title,
		text,
		confirmButtonText: 'Aceptar',
		timer: 2500,
		timerProgressBar: true
	});
}

export async function showError(title: string, text: string): Promise<void> {
	const Swal = await swal();
	await Swal.fire({ ...BASE, icon: 'error', title, text, confirmButtonText: 'Entendido' });
}

type Tone = 'primary' | 'danger';

interface ConfirmOptions {
	title: string;
	text: string;
	confirmText: string;
	cancelText?: string;
	tone?: Tone;
}

const BRAND = '#4f46e5';
const DANGER = '#e11d48';
const NEUTRAL = '#64748b';

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
		icon: tone === 'danger' ? 'warning' : 'question',
		title,
		text,
		showCancelButton: true,
		confirmButtonText: confirmText,
		cancelButtonText: cancelText,
		confirmButtonColor: tone === 'danger' ? DANGER : BRAND,
		cancelButtonColor: NEUTRAL,
		reverseButtons: true,
		focusCancel: tone === 'danger'
	});
	return result.isConfirmed;
}

export async function showLoading(
	title: string,
	text = 'Por favor espera un momento.'
): Promise<void> {
	const Swal = await swal();
	void Swal.fire({
		title,
		text,
		allowOutsideClick: false,
		allowEscapeKey: false,
		didOpen: () => Swal.showLoading()
	});
}

export async function showSuccess(title: string, text?: string): Promise<void> {
	const Swal = await swal();
	await Swal.fire({
		icon: 'success',
		title,
		text,
		confirmButtonText: 'Aceptar',
		confirmButtonColor: BRAND,
		timer: 2500,
		timerProgressBar: true
	});
}

export async function showError(title: string, text: string): Promise<void> {
	const Swal = await swal();
	await Swal.fire({
		icon: 'error',
		title,
		text,
		confirmButtonText: 'Entendido',
		confirmButtonColor: BRAND
	});
}

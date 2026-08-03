import { storageApiRepository } from '@/modules/shared/infrastructure/api/storage-api.repository';

export async function uploadFile(file: File, folder: 'dnis' | 'vouchers' | 'becas', dni: string = '', name: string = '') {
	try {
		const formData = new FormData();
		formData.append('file', file);
		if (dni) formData.append('nombre', getFileName(dni, folder, name));

		return await storageApiRepository.upload(folder, formData);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Error al subir archivo';
		throw new Error(message);
	}
}

function getFileName(dni: string, folder: 'dnis' | 'vouchers' | 'becas', originalName: string): string {
	switch (folder) {
		case 'dnis':
			return `DOCUMENTO_IDENTIDAD_${dni}`;
		case 'vouchers':
			return `VOUCHER_${dni}_${new Date().toISOString().split('T')[0]}`;
		case 'becas':
			// Prefijar el nombre original con BECAS y DNI
			return `BECAS_${dni}_${originalName}`;
	}
}

import { z } from 'zod'
import { apiUpload } from '@/lib/api.service'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'

const uploadResponseSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	folder: z.string().min(1),
	viewLink: z.string().min(1),
	downloadLink: z.string().min(1),
})

export async function uploadFile(file: File, folder: 'dnis' | 'vouchers' | 'becas', dni: string = '', name: string = '') {
	const formData = new FormData()
	formData.append('file', file)
	if (dni) formData.append('nombre', getFileName(dni, folder, name))

	const response = await apiUpload<unknown>(`upload/${folder}`, formData)
	return parseExternalResponse(
		uploadResponseSchema,
		response,
		'El servicio de archivos devolvio datos incompletos',
	)
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

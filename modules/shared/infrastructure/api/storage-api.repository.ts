import { httpClient } from '@/modules/shared/infrastructure/http/http-client';
import { parseExternalResponse, uploadResponseSchema } from '@/modules/shared/infrastructure/validation/external-response';

export interface UploadResponse {
  id: string;
  name: string;
  folder: string;
  viewLink: string;
  downloadLink: string;
}

export class StorageApiRepository {
  async upload(folder: string, formData: FormData): Promise<UploadResponse> {
    const response = await httpClient.upload<unknown>(`upload/${folder}`, formData);
    return parseExternalResponse(uploadResponseSchema, response, 'El servicio de archivos devolvio datos incompletos') as UploadResponse;
  }
}

export const storageApiRepository = new StorageApiRepository();

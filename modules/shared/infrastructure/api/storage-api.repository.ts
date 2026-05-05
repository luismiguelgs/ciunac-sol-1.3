import { httpClient } from '@/modules/shared/infrastructure/http/http-client';

export interface UploadResponse {
  id: string;
  name: string;
  folder: string;
  viewLink: string;
  downloadLink: string;
}

export class StorageApiRepository {
  async upload(folder: string, formData: FormData): Promise<UploadResponse> {
    return httpClient.upload<UploadResponse>(`upload/${folder}`, formData);
  }
}

export const storageApiRepository = new StorageApiRepository();

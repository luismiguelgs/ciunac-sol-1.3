import { httpClient } from '@/modules/shared/infrastructure/http/http-client';
import { AppResult } from '@/modules/shared/application/results/app-result';

export class ResourceApiRepository {
  async list<T>(resource: string): Promise<T[]> {
    return httpClient.get<T[]>(resource);
  }

  async get<T>(path: string): Promise<T> {
    return httpClient.get<T>(path);
  }

  async getOptional<T>(path: string): Promise<T | null> {
    return httpClient.getOptional<T>(path);
  }

  async create<TResponse, TBody = unknown>(path: string, body: TBody): Promise<TResponse> {
    return httpClient.post<TResponse, TBody>(path, body);
  }

  async update<TResponse, TBody = unknown>(path: string, body: TBody): Promise<TResponse> {
    return httpClient.patch<TResponse, TBody>(path, body);
  }

  async updateCommand<TBody = unknown>(path: string, body: TBody): Promise<void> {
    return httpClient.patchCommand<TBody>(path, body);
  }

  postSafe<TResponse, TBody = unknown>(path: string, body: TBody): Promise<AppResult<TResponse>> {
    return httpClient.postSafe<TResponse, TBody>(path, body);
  }
}

export const resourceApiRepository = new ResourceApiRepository();

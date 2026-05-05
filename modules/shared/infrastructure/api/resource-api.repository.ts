import { httpClient } from '@/modules/shared/infrastructure/http/http-client';

export class ResourceApiRepository {
  async list<T>(resource: string): Promise<T[]> {
    return httpClient.get<T[]>(resource);
  }

  async get<T>(path: string): Promise<T> {
    return httpClient.get<T>(path);
  }

  async create<TResponse, TBody = unknown>(path: string, body: TBody): Promise<TResponse> {
    return httpClient.post<TResponse, TBody>(path, body);
  }

  async update<TResponse, TBody = unknown>(path: string, body: TBody): Promise<TResponse> {
    return httpClient.patch<TResponse, TBody>(path, body);
  }

  postSafe<TResponse, TBody = unknown>(path: string, body: TBody) {
    return httpClient.postSafe<TResponse, TBody>(path, body);
  }
}

export const resourceApiRepository = new ResourceApiRepository();

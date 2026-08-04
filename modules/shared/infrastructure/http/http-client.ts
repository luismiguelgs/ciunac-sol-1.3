import { apiCommand, apiFetch, apiFetchOptional, apiFetchSafe, apiUpload } from '@/lib/api.service';
import { AppResult } from '@/modules/shared/application/results/app-result';

export class HttpClient {
  get<T>(path: string): Promise<T> {
    return apiFetch<T>(path, 'GET');
  }

  getOptional<T>(path: string): Promise<T | null> {
    return apiFetchOptional<T>(path, 'GET');
  }

  post<TResponse, TBody = unknown>(path: string, body?: TBody): Promise<TResponse> {
    return apiFetch<TResponse>(path, 'POST', body);
  }

  patch<TResponse, TBody = unknown>(path: string, body?: TBody): Promise<TResponse> {
    return apiFetch<TResponse>(path, 'PATCH', body);
  }

  patchCommand<TBody = unknown>(path: string, body?: TBody): Promise<void> {
    return apiCommand(path, 'PATCH', body);
  }

  postSafe<TResponse, TBody = unknown>(path: string, body?: TBody): Promise<AppResult<TResponse>> {
    return apiFetchSafe<TResponse>(path, 'POST', body);
  }

  upload<TResponse>(path: string, formData: FormData): Promise<TResponse> {
    return apiUpload<TResponse>(path, formData);
  }
}

export const httpClient = new HttpClient();

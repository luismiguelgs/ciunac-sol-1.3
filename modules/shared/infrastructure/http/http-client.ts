import { apiFetch, apiFetchSafe, apiUpload } from '@/lib/api.service';

export class HttpClient {
  get<T>(path: string): Promise<T> {
    return apiFetch<T>(path, 'GET');
  }

  post<TResponse, TBody = unknown>(path: string, body?: TBody): Promise<TResponse> {
    return apiFetch<TResponse>(path, 'POST', body);
  }

  patch<TResponse, TBody = unknown>(path: string, body?: TBody): Promise<TResponse> {
    return apiFetch<TResponse>(path, 'PATCH', body);
  }

  postSafe<TResponse, TBody = unknown>(path: string, body?: TBody) {
    return apiFetchSafe<TResponse>(path, 'POST', body);
  }

  upload<TResponse>(path: string, formData: FormData): Promise<TResponse> {
    return apiUpload<TResponse>(path, formData);
  }
}

export const httpClient = new HttpClient();

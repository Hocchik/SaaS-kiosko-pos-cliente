import { API_BASE_URL } from './api-base';

export function resolveImageUrl(url: string): string {
  return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
}

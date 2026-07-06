import { apiClient } from './client';

export interface TopProductSummary {
  name: string;
  quantity: number;
  revenue: number;
}

export interface CashCloseResponse {
  id: number;
  closeDate: string;
  expectedCash: number;
  actualCash: number;
  difference: number;
  salesCount: number;
  notes: string | null;
  closedAt: string;
}

export interface DaySummaryResponse {
  date: string;
  totalAmount: number;
  salesCount: number;
  topProducts: TopProductSummary[];
  isClosed: boolean;
  closure: CashCloseResponse | null;
}

export interface CreateCashCloseRequest {
  closeDate: string;
  actualCash: number;
  notes?: string;
}

export const cashCloseApi = {
  getSummary: (date?: string) =>
    apiClient.get<DaySummaryResponse>('/api/cash-close/summary', { params: date ? { date } : {} }).then(r => r.data),

  close: (req: CreateCashCloseRequest) =>
    apiClient.post<CashCloseResponse>('/api/cash-close', req).then(r => r.data),

  findAll: () =>
    apiClient.get<CashCloseResponse[]>('/api/cash-close').then(r => r.data),
};

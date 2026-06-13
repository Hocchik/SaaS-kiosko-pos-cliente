export interface TenantConfig {
  name: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  currency: string;
  duesLabel: string;
  features: Record<string, boolean>;
}

// Auth
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  tenantId: string | null;
  features: Record<string, boolean>;
}

export interface UserResponse {
  id: number;
  username: string;
  role: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
}

// Category
export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
}

// Client
export interface ClientResponse {
  id: number;
  name: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  type: 'client' | 'student' | 'teacher';
  grade: string | null;
  parent: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  area: string | null;
}

export interface CreateClientRequest {
  name: string;
  lastname: string;
  email?: string;
  phone?: string;
  address?: string;
  type?: string;
  grade?: string;
  parent?: string;
  parentPhone?: string;
  parentEmail?: string;
  area?: string;
}

export interface UpdateClientRequest {
  name: string;
  lastname: string;
  email?: string;
  phone?: string;
  address?: string;
  type?: string;
  grade?: string;
  parent?: string;
  parentPhone?: string;
  parentEmail?: string;
  area?: string;
}

// Product
export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  active: boolean;
  categoryId: number;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  active: boolean;
  categoryId: number;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  active: boolean;
  categoryId: number;
}

// Sale
export interface SaleResponse {
  id: number;
  saleDate: string;
  totalAmount: number;
  difference: number;
  notes: string;
  clientId: number;
  clientName: string;
  items: SaleItemResponse[];
  createdAt: string | null;
}

export interface SaleItemResponse {
  id: number;
  quantity: number;
  subTotal: number;
  productId: number;
  productName: string;
}

export interface CreateSaleRequest {
  saleDate: string;
  notes?: string;
  clientId: number;
  items: SaleItemRequest[];
}

export interface SaleItemRequest {
  productId: number;
  quantity: number;
}

// Report
export interface ReportResponse {
  id: number;
  reportDate: string;
  dateFrom: string;
  dateTo: string;
  reportType: string;
  clientId: number | null;
}

export interface CreateReportRequest {
  reportDate: string;
  dateFrom?: string;
  dateTo?: string;
  reportType: string;
  clientId?: number | null;
}

// POS
export interface CheckoutRequest {
  clientId: number;
  notes?: string;
  items: CartItemRequest[];
  amountPaid?: number;
  dueDate?: string;
  saleDate?: string;
}

export interface CartItemRequest {
  productId: number;
  quantity: number;
}

export interface CheckoutResponse {
  sale: SaleResponse;
  message: string;
}

// Due
export interface Due {
  id: number;
  endDate: string;
  saleId: number;
}

// Error
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}

// Statistics
export interface MonthlySales {
  year: number;
  month: number;
  label: string;
  total: number;
  count: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface CategorySales {
  categoryId: number;
  categoryName: string;
  totalRevenue: number;
  totalQuantity: number;
}

export interface DailySales {
  date: string;
  total: number;
  count: number;
}

export interface StatisticsResponse {
  totalSales: number;
  totalDebt: number;
  totalDebtorClients: number;
  totalSalesCount: number;
  totalProductsCount: number;
  totalClientsCount: number;
  averageTicket: number;
  salesByMonth: MonthlySales[];
  topProducts: TopProduct[];
  salesByCategory: CategorySales[];
  salesLast30Days: DailySales[];
}

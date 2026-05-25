import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { customAxiosInstance } from './axios-instance';
import type {
  MenuCategory,
  MenuItem,
  Customer,
  CustomerSummary,
  Order,
  Setting,
  DashboardSummary,
  PaginatedResponse,
  ApiError,
} from '@odyssey/types';

export { axiosInstance, customAxiosInstance } from './axios-instance';

export const queryKeys = {
  dashboard: ['dashboard', 'summary'] as const,
  menuCategories: ['menu', 'categories'] as const,
  menuItems: (params?: { categoryId?: number; available?: boolean }) => ['menu', 'items', params] as const,
  menuItem: (id: number) => ['menu', 'items', id] as const,
  orders: (params?: { status?: string; page?: number; limit?: number }) => ['orders', params] as const,
  order: (id: number) => ['orders', id] as const,
  customers: (params?: { page?: number; limit?: number }) => ['customers', params] as const,
  customer: (id: number) => ['customers', id] as const,
  settings: ['settings'] as const,
} as const;

export const useDashboardSummary = (options?: UseQueryOptions<DashboardSummary, ApiError>) =>
  useQuery({ queryKey: queryKeys.dashboard, queryFn: () => customAxiosInstance<DashboardSummary>({ url: '/dashboard/summary', method: 'GET' }), ...options });

export const useMenuCategories = (options?: UseQueryOptions<MenuCategory[], ApiError>) =>
  useQuery({ queryKey: queryKeys.menuCategories, queryFn: () => customAxiosInstance<MenuCategory[]>({ url: '/menu/categories', method: 'GET' }), ...options });

export const useCreateMenuCategory = (options?: UseMutationOptions<MenuCategory, ApiError, Partial<MenuCategory>>) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data) => customAxiosInstance<MenuCategory>({ url: '/menu/categories', method: 'POST', data }), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.menuCategories }), ...options });
};

export const useUpdateMenuCategory = (options?: UseMutationOptions<MenuCategory, ApiError, { id: number } & Partial<MenuCategory>>) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...data }) => customAxiosInstance<MenuCategory>({ url: `/menu/categories/${id}`, method: 'PUT', data }), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.menuCategories }), ...options });
};

export const useDeleteMenuCategory = (options?: UseMutationOptions<void, ApiError, number>) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => customAxiosInstance<void>({ url: `/menu/categories/${id}`, method: 'DELETE' }), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.menuCategories }), ...options });
};

export const useMenuItems = (params?: { categoryId?: number; available?: boolean }, options?: UseQueryOptions<MenuItem[], ApiError>) =>
  useQuery({ queryKey: queryKeys.menuItems(params), queryFn: () => { const sp = new URLSearchParams(); if (params?.categoryId !== undefined) sp.set('categoryId', String(params.categoryId)); if (params?.available !== undefined) sp.set('available', String(params.available)); const qs = sp.toString(); return customAxiosInstance<MenuItem[]>({ url: `/menu/items${qs ? `?${qs}` : ''}`, method: 'GET' }); }, ...options });

export const useMenuItem = (id: number, options?: UseQueryOptions<MenuItem, ApiError>) =>
  useQuery({ queryKey: queryKeys.menuItem(id), queryFn: () => customAxiosInstance<MenuItem>({ url: `/menu/items/${id}`, method: 'GET' }), ...options });

export const useCreateMenuItem = (options?: UseMutationOptions<MenuItem, ApiError, Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data) => customAxiosInstance<MenuItem>({ url: '/menu/items', method: 'POST', data }), onSuccess: () => qc.invalidateQueries({ queryKey: ['menu', 'items'] }), ...options });
};

export const useUpdateMenuItem = (options?: UseMutationOptions<MenuItem, ApiError, { id: number } & Partial<MenuItem>>) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...data }) => customAxiosInstance<MenuItem>({ url: `/menu/items/${id}`, method: 'PUT', data }), onSuccess: (_data: MenuItem, { id }: { id: number }) => { qc.invalidateQueries({ queryKey: ['menu', 'items'] }); qc.invalidateQueries({ queryKey: queryKeys.menuItem(id) }); }, ...options });
};

export const useDeleteMenuItem = (options?: UseMutationOptions<void, ApiError, number>) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => customAxiosInstance<void>({ url: `/menu/items/${id}`, method: 'DELETE' }), onSuccess: () => qc.invalidateQueries({ queryKey: ['menu', 'items'] }), ...options });
};

export const useOrders = (params?: { status?: string; page?: number; limit?: number; customerId?: number }, options?: UseQueryOptions<PaginatedResponse<Order>, ApiError>) =>
  useQuery({ queryKey: queryKeys.orders(params), queryFn: () => { const sp = new URLSearchParams(); if (params?.status) sp.set('status', params.status); if (params?.page) sp.set('page', String(params.page)); if (params?.limit) sp.set('limit', String(params.limit)); if (params?.customerId) sp.set('customerId', String(params.customerId)); const qs = sp.toString(); return customAxiosInstance<PaginatedResponse<Order>>({ url: `/orders${qs ? `?${qs}` : ''}`, method: 'GET' }); }, ...options });

export const useOrder = (id: number, options?: UseQueryOptions<Order, ApiError>) =>
  useQuery({ queryKey: queryKeys.order(id), queryFn: () => customAxiosInstance<Order>({ url: `/orders/${id}`, method: 'GET' }), ...options });

export const useCreateOrder = (options?: UseMutationOptions<Order, ApiError, { customerId?: number; items: Array<{ menuItemId: number; quantity: number }>; notes?: string }>) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data) => customAxiosInstance<Order>({ url: '/orders', method: 'POST', data }), onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }), ...options });
};

export const useOrderAction = (options?: UseMutationOptions<Order, ApiError, { id: number; action: string }>) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, action }) => customAxiosInstance<Order>({ url: `/orders/${id}/actions`, method: 'POST', data: { action } }), onSuccess: (_data: Order, { id }: { id: number }) => { qc.invalidateQueries({ queryKey: queryKeys.order(id) }); qc.invalidateQueries({ queryKey: ['orders'] }); qc.invalidateQueries({ queryKey: queryKeys.dashboard }); }, ...options });
};

export const useCustomers = (params?: { page?: number; limit?: number }, options?: UseQueryOptions<PaginatedResponse<CustomerSummary>, ApiError>) =>
  useQuery({ queryKey: queryKeys.customers(params), queryFn: () => { const sp = new URLSearchParams(); if (params?.page) sp.set('page', String(params.page)); if (params?.limit) sp.set('limit', String(params.limit)); const qs = sp.toString(); return customAxiosInstance<PaginatedResponse<CustomerSummary>>({ url: `/customers${qs ? `?${qs}` : ''}`, method: 'GET' }); }, ...options });

export const useCustomer = (id: number, options?: UseQueryOptions<CustomerSummary & { recentOrders: Order[] }, ApiError>) =>
  useQuery({ queryKey: queryKeys.customer(id), queryFn: () => customAxiosInstance<CustomerSummary & { recentOrders: Order[] }>({ url: `/customers/${id}`, method: 'GET' }), ...options });

export const useCreateCustomer = (options?: UseMutationOptions<Customer, ApiError, Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data) => customAxiosInstance<Customer>({ url: '/customers', method: 'POST', data }), onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }), ...options });
};

export const useUpdateCustomer = (options?: UseMutationOptions<Customer, ApiError, { id: number } & Partial<Customer>>) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...data }) => customAxiosInstance<Customer>({ url: `/customers/${id}`, method: 'PUT', data }), onSuccess: (_data: Customer, { id }: { id: number }) => { qc.invalidateQueries({ queryKey: ['customers'] }); qc.invalidateQueries({ queryKey: queryKeys.customer(id) }); }, ...options });
};

export const useSettings = (options?: UseQueryOptions<Setting[], ApiError>) =>
  useQuery({ queryKey: queryKeys.settings, queryFn: () => customAxiosInstance<Setting[]>({ url: '/settings', method: 'GET' }), ...options });

export const useUpdateSettings = (options?: UseMutationOptions<Setting[], ApiError, Array<{ key: string; value: string }>>) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (settings) => customAxiosInstance<Setting[]>({ url: '/settings', method: 'PUT', data: { settings } }), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.settings }), ...options });
};
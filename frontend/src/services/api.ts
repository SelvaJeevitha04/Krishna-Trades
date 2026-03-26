import axios from 'axios';
import { ApiResponse, PaginatedResponse } from '../types';

// Use the Vite proxy during local development (/api) instead of specifying the full URL
// This avoids CORS issues on localhost.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post<ApiResponse>('/auth/login', { email, password }),
  
  register: (userData: any) =>
    api.post<ApiResponse>('/auth/register', userData),
  
  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse>('/auth/refresh-token', { refreshToken }),
  
  logout: () =>
    api.post<ApiResponse>('/auth/logout'),
  
  getCurrentUser: () =>
    api.get<ApiResponse>('/auth/me'),
};

export const productAPI = {
  getProducts: (params?: any) =>
    api.get<PaginatedResponse<any>>('/products', { params }),
  
  getProductById: (id: string) =>
    api.get<ApiResponse>(`/products/${id}`),
  
  createProduct: (productData: any) =>
    api.post<ApiResponse>('/products', productData),
  
  updateProduct: (id: string, productData: any) =>
    api.put<ApiResponse>(`/products/${id}`, productData),
  
  deleteProduct: (id: string) =>
    api.delete<ApiResponse>(`/products/${id}`),
  
  getLowStockProducts: () =>
    api.get<ApiResponse>('/products/admin/low-stock'),
  
  addReview: (productId: string, reviewData: { rating: number; comment: string }) =>
    api.post<ApiResponse>(`/products/${productId}/reviews`, reviewData),
};

export const categoryAPI = {
  getCategories: (params?: any) =>
    api.get<PaginatedResponse<any>>('/categories', { params }),
  
  getCategoryById: (id: string) =>
    api.get<ApiResponse>(`/categories/${id}`),
  
  createCategory: (categoryData: any) =>
    api.post<ApiResponse>('/categories', categoryData),
  
  updateCategory: (id: string, categoryData: any) =>
    api.put<ApiResponse>(`/categories/${id}`, categoryData),
  
  deleteCategory: (id: string) =>
    api.delete<ApiResponse>(`/categories/${id}`),
};

export const orderAPI = {
  getUserOrders: (params?: any) =>
    api.get<PaginatedResponse<any>>('/orders', { params }),
  
  getOrderById: (id: string) =>
    api.get<ApiResponse>(`/orders/${id}`),
  
  createOrder: (orderData: any) =>
    api.post<ApiResponse>('/orders', orderData),
  
  updateOrderStatus: (id: string, statusData: any) =>
    api.put<ApiResponse>(`/orders/${id}/status`, statusData),
  
  getAllOrders: (params?: any) =>
    api.get<PaginatedResponse<any>>('/orders/admin/all', { params }),
};

export const userAPI = {
  updateProfile: (userData: any) =>
    api.put<ApiResponse>('/users/profile', userData),
  
  getNotifications: (params?: any) =>
    api.get<PaginatedResponse<any>>('/users/notifications', { params }),
  
  markNotificationRead: (id: string) =>
    api.put<ApiResponse>(`/users/notifications/${id}/read`),
  
  markAllNotificationsRead: () =>
    api.put<ApiResponse>('/users/notifications/read-all'),
  
  deleteNotification: (id: string) =>
    api.delete<ApiResponse>(`/users/notifications/${id}`),
};

export const adminAPI = {
  getDashboardAnalytics: (params?: any) =>
    api.get<ApiResponse>('/admin/dashboard', { params }),
  
  getAllUsers: (params?: any) =>
    api.get<PaginatedResponse<any>>('/admin/users', { params }),
  
  updateUserStatus: (id: string, statusData: any) =>
    api.put<ApiResponse>(`/admin/users/${id}/status`, statusData),
  
  getInventoryLogs: (params?: any) =>
    api.get<PaginatedResponse<any>>('/admin/inventory-logs', { params }),
  
  adjustInventory: (inventoryData: any) =>
    api.post<ApiResponse>('/admin/inventory/adjust', inventoryData),
  
  exportSalesData: (params?: any) =>
    api.get('/admin/sales/export', { 
      params,
      responseType: 'blob'
    }),
};

export const bulkOrderAPI = {
  createBulkOrder: (orderData: any) =>
    api.post<ApiResponse>('/bulk-orders', orderData),
  
  getUserBulkOrders: (params?: any) =>
    api.get<PaginatedResponse<any>>('/bulk-orders/my-requests', { params }),
  
  getAllBulkOrders: (params?: any) =>
    api.get<PaginatedResponse<any>>('/bulk-orders', { params }),
  
  updateBulkOrderStatus: (id: string, statusData: any) =>
    api.put<ApiResponse>(`/bulk-orders/${id}/status`, statusData),
};

export const paymentAPI = {
  /** Step 1: Create Razorpay order (get order_id + amount) */
  createRazorpayOrder: (items: any[]) =>
    api.post<ApiResponse>('/payments/create-razorpay-order', { items }),

  /** Step 2: Verify signature and place order in DB */
  verifyPayment: (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    items: any[];
    shippingAddress?: any;
  }) => api.post<ApiResponse>('/payments/verify', paymentData),
};

export default api;


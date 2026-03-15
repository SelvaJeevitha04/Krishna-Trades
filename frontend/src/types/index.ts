export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  alternatePhone?: string;
  shopName?: string;
  shopPhoto?: string;
  shopType?: 'retail' | 'supermarket' | 'medical' | 'stationary' | 'other';
  gstNumber?: string;
  shopAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  sku: string;
  brand: string;
  category: Category | string;
  price: number;
  stock: number;
  minOrderQuantity: number;
  minStock: number;
  availabilityStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  unit: 'pieces' | 'kg' | 'liters' | 'meters' | 'boxes' | 'dozen';
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  specifications?: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    color?: string;
    material?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  product: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  trackingNumber?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: string | any;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  total?: number;
  stock?: number;
  brand?: string;
  minOrderQuantity?: number;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'inventory';
  user: string;
  isRead: boolean;
  data?: {
    orderId?: string;
    productId?: string;
    action?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface DashboardAnalytics {
  overview: {
    totalUsers: number;
    totalProducts: number;
    totalCategories: number;
    totalOrders: number;
    totalRevenue: number;
    lowStockProducts: number;
  };
  orderStatusBreakdown: Array<{
    _id: string;
    count: number;
  }>;
  dailySales: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  recentOrders: Order[];
}

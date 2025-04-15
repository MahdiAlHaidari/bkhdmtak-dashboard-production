// User types
export interface User {
  id: number
  name: string
  phoneNumber: string
  imagePath: string | null
  createdAt: string
  updatedAt: string
}

// Provider types
export interface Provider {
  id: number
  name: string
  phoneNumber: string
  imagePath: string | null
  email?: string | null
  countryId?: number | null
  cityId?: number | null
  stateId?: number | null
  isAvailable: boolean
  isActive: boolean
  practicingImage?: string | null
  unifiedCardImageFront?: string | null
  residenceCardImageFront?: string | null
  residenceCardImageBack?: string | null
  unifiedCardImageBack?: string | null
  accountOrCardNumber?: string | null
  currentLatitude?: number | null
  currentLongitude?: number | null
  distanceInKm?: number | null
  createdAt?: string
  updatedAt?: string
}

// Provider with categories
export interface ProviderWithCategories {
  provider: Provider
  providerCategories: {
    category: {
      id: number
      nameAr: string | null
      nameEn: string | null
      descriptionAr?: string | null
      descriptionEn?: string | null
      markerImage?: string | null
      image?: string | null
      colorCode?: string | null
      platformDiscount?: number | null
      created?: string
      createdBy?: string | null
      lastModified?: string
      lastModifiedBy?: string | null
    }
    isApproved: boolean
  }[]
}

// Provider list params
export interface ProviderListParams {
  pageSize?: number
  pageNumber?: number
  name?: string
  phoneNumber?: string
  active?: boolean
  available?: boolean
}

// Category types
export interface Category {
  id: number
  name: string
  imagePath: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Subcategory types
export interface Subcategory {
  id: number
  name: string
  imagePath: string | null
  isActive: boolean
  categoryId: number
  categoryName: string
  createdAt: string
  updatedAt: string
}

// Service types
export interface Service {
  id: number
  name: string
  description: string | null
  price: number
  imagePath: string | null
  isActive: boolean
  subcategoryId: number
  subcategoryName: string
  categoryId: number
  categoryName: string
  providerId: number
  providerName: string
  createdAt: string
  updatedAt: string
}

// Product types
export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  imagePath: string | null
  isActive: boolean
  categoryId: number
  categoryName: string
  createdAt: string
  updatedAt: string
}

// Order types
export interface Order {
  id: number
  total: number
  orderStatus: number
  totalServices: number
  userId: number
  user: User
  providerId: number
  provider: Provider
  createdAt: string
  updatedAt: string
}

// Payment types
export interface Payment {
  id: number
  amount: number
  paymentMethod: number
  status: string
  orderId: number
  userId: number
  user: User
  createdAt: string
  updatedAt: string
}

// Payment details
export interface PaymentDetails {
  payment: {
    id: number
    amount: number
    status: string
    orderId: number
    createdAt: string
    updatedAt: string
  }
  logs: {
    status: string
    createdAt: string
  }[]
}

// Payment list params
export interface PaymentListParams {
  pageSize?: number
  pageNumber?: number
  status?: string
}

// Order details response
export interface OrderDetailsResponse {
  order: {
    id: number
    total: number
    finalTotal: number
    orderStatus: number
    paymentType: number
    totalProducts: number
    totalServices: number
    address: string | null
    notes: string | null
    userId: number
    user: User
    providerId: number | null
    provider: Provider | null
    products: {
      quantity: number
      product: Product
    }[]
    services: {
      quantity: number
      service: Service
    }[]
    customService: {
      name: string
      description: string
      quantity: number
    } | null
    createdAt: string
    updatedAt: string
  }
  rating: {
    rating: number
    comment: string | null
  } | null
}

// Admin types
export interface AdminInfo {
  id: number
  name: string | null
  phoneNumber: string | null
  isSuperAdmin: boolean
}

// Dashboard data
export interface DashboardData {
  totalUsers: number
  totalProviders: number
  totalOrders: number
  totalServices: number
  usersPercentageChange: number
  providersPercentageChange: number
  ordersPercentageChange: number
  servicesPercentageChange: number
  totalOrdersByMonth?: {
    month: number
    totalOrders: number
  }[]
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[]
  pageNumber: number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

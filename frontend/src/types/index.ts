export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'restaurantOwner' | 'deliveryAgent' | 'admin';
  loyaltyPoints?: number;
  token: string;
}

export interface Restaurant {
  _id: string;
  restaurantName: string;
  description?: string;
  cuisineType: string[];
  address: string;
  rating: number;
  openingTime?: string;
  closingTime?: string;
  isActive: boolean;
}

export interface MenuCategory {
  _id: string;
  restaurantId: string;
  categoryName: string;
}

export interface MenuItem {
  _id: string;
  restaurantId: string;
  categoryId: string;
  itemName: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  preparationTime?: number;
}

export interface CartItem {
  menuItemId: MenuItem | string;
  quantity: number;
  price: number;
}

export interface Cart {
  _id?: string;
  restaurantId?: string;
  items: CartItem[];
  totalAmount: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  deliveryAddress: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  userId: { _id: string; name: string; profileImage?: string } | string;
  restaurantId: string;
  orderId?: string;
  rating: number;
  reviewText?: string;
  reviewPoints?: number;
  images?: string[];
  createdAt?: string;
}

export interface LoyaltyReward {
  _id: string;
  userId: string;
  pointsEarned: number;
  reason: string;
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
}

export interface DeliveryTrackingPoint {
  _id: string;
  orderId: string;
  deliveryAgentId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

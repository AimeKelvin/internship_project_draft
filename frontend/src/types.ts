// src/types/index.ts

// ======================
// USER TYPES
// ======================
export type UserRole = 'manager' | 'waiter' | 'kitchen';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  full_name?: string;
  isActive?: boolean;
  createdAt?: string;
}

// ======================
// TABLE TYPES
// ======================
export type TableStatus = 'available' | 'occupied';

export interface DiningTable {
  id: number;
  table_number: number;
  status: TableStatus;
}

// ======================
// MENU TYPES
// ======================
export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
}

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  price: number;
  image_url?: string | null;
  is_available: boolean;
  category_name?: string;        // returned by backend join
}

// ======================
// ORDER TYPES
// ======================
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served';

export type OrderItemStatus = 'pending' | 'preparing' | 'ready' | 'served';

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  quantity: number;
  unit_price: number;           // backend uses unit_price
  notes?: string;
  status: OrderItemStatus;
  // Optional frontend convenience fields
  menu_item_name?: string;
  menu_item_image?: string; 
}

export interface Order {
  id: number;
  table_id: number;
  waiter_id: number;
  status: OrderStatus;
  total: number;
  created_at: string;
  updated_at?: string;

  // Optional fields returned by some endpoints
  table_number?: number;
  waiter_name?: string;
  items?: OrderItem[];
}

// ======================
// KITCHEN TYPES
// ======================
export interface KitchenOrderItem {
  order_id: number;
  table_id: number;
  order_status: 'pending' | 'cooking' | 'ready' | 'served';
  items: Array<{
    item_id: number;
    menu_item_id: number;
    item_name: string;
    quantity: number;
    notes?: string | null;
  }>;
}

// ======================
// API RESPONSE HELPERS
// ======================
export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: UserRole;
  };
}

export interface CreateStaffResponse {
  message: string;
  user: {
    id: number;
    username: string;
    role: 'waiter' | 'kitchen';
    full_name?: string;
  };
}
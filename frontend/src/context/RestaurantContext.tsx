// src/context/RestaurantContext.tsx
import React, { useCallback, useEffect, useState, createContext, useContext } from 'react';
import type {
  User,
  DiningTable,
  MenuCategory,
  MenuItem,
  Order,
  OrderStatus,
} from '../types';
import api from '../api';
import { useAuth } from './AuthContext';

interface RestaurantContextType {
  users: User[];
  tables: DiningTable[];
  fetchTables: () => Promise<void>;
  addTable: (tableNumber: number) => Promise<void>;
  updateTable: (id: number, tableNumber: number) => Promise<void>;
  deleteTable: (id: number) => Promise<void>;
  categories: MenuCategory[];
  fetchCategories: () => Promise<void>;
  addCategory: (name: string, description?: string) => Promise<void>;
  menuItems: MenuItem[];
  fetchMenuItems: () => Promise<void>;
  addMenuItem: (item: { category_id: number; name: string; price: number; image_url?: string }) => Promise<void>;
  updateMenuItem: (id: number, updates: { name?: string; price?: number; image_url?: string; is_available?: boolean }) => Promise<void>;
  deleteMenuItem: (id: number) => Promise<void>;
  orders: Order[];
  kitchenOrders: Order[];
  fetchOrders: () => Promise<void>;
  fetchKitchenOrders: () => Promise<void>;
  createOrder: (table_id: number, items: Array<{ menu_item_id: number; quantity: number; notes?: string }>) => Promise<void>;
  updateOrderStatus: (orderId: number, status: OrderStatus) => Promise<void>;
  createStaff: (data: { username: string; password: string; role: 'waiter' | 'kitchen'; full_name?: string }) => Promise<void>;
  fetchStaff: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType>({} as RestaurantContextType);

export function useRestaurant() {
  return useContext(RestaurantContext);
}

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [tables, setTables] = useState<DiningTable[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // ======================
  // Fetchers
  // ======================
  const fetchTables = useCallback(async () => {
    try {
      const data = await api.tables.getAll();
      setTables(data);
    } catch (e) {
      console.error('Failed to fetch tables', e);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (e) {
      console.error('Failed to fetch categories', e);
    }
  }, []);

  const fetchMenuItems = useCallback(async () => {
    try {
      const data = await api.menuItems.getAll();
      setMenuItems(data);
    } catch (e) {
      console.error('Failed to fetch menu items', e);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      let data: Order[] = [];
      if (user.role === 'manager') data = await api.orders.getAll();
      else if (user.role === 'waiter') data = await api.orders.getMyOrders();
      setOrders(data);
    } catch (e) {
      console.error('Failed to fetch orders', e);
    }
  }, [user]);

  const fetchKitchenOrders = useCallback(async () => {
    if (user?.role !== 'kitchen') return;
    try {
      const data = await api.kitchen.getOrders();
      setKitchenOrders(data);
    } catch (e) {
      console.error('Failed to fetch kitchen orders', e);
    }
  }, [user]);

  const fetchStaff = useCallback(async () => {
    if (user?.role !== 'manager') return;
    try {
      const data = await api.staff.getAll();
      setUsers(data);
    } catch (e) {
      console.error('Failed to fetch staff', e);
    }
  }, [user]);

  // ======================
  // Initial Load
  // ======================
  useEffect(() => {
    if (!user) return;
    fetchTables();
    fetchCategories();
    fetchMenuItems();
    if (user.role === 'manager' || user.role === 'waiter') fetchOrders();
    if (user.role === 'kitchen') fetchKitchenOrders();
    if (user.role === 'manager') fetchStaff();
  }, [user, fetchTables, fetchCategories, fetchMenuItems, fetchOrders, fetchKitchenOrders, fetchStaff]);

  // ======================
  // Polling
  // ======================
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchTables();
      if (user.role === 'manager' || user.role === 'waiter') fetchOrders();
      if (user.role === 'kitchen') fetchKitchenOrders();
    }, 8000);
    return () => clearInterval(interval);
  }, [user, fetchTables, fetchOrders, fetchKitchenOrders]);

  // ======================
  // Mutations
  // ======================
  const addTable = useCallback(async (tableNumber: number) => {
    await api.tables.create(tableNumber);
    await fetchTables();
  }, [fetchTables]);

  const updateTable = useCallback(async (id: number, tableNumber: number) => {
    await api.tables.update(id, tableNumber);
    await fetchTables();
  }, [fetchTables]);

  const deleteTable = useCallback(async (id: number) => {
    await api.tables.delete(id);
    await fetchTables();
  }, [fetchTables]);

  const addCategory = useCallback(async (name: string, description?: string) => {
    await api.categories.create(name, description);
    await fetchCategories();
  }, [fetchCategories]);

  const addMenuItem = useCallback(async (item: { category_id: number; name: string; price: number; image_url?: string }) => {
    await api.menuItems.create(item);
    await fetchMenuItems();
  }, [fetchMenuItems]);

  const updateMenuItem = useCallback(async (id: number, updates: { name?: string; price?: number; image_url?: string; is_available?: boolean }) => {
    await api.menuItems.update(id, updates);
    await fetchMenuItems();
  }, [fetchMenuItems]);

  const deleteMenuItem = useCallback(async (id: number) => {
    await api.menuItems.delete(id);
    await fetchMenuItems();
  }, [fetchMenuItems]);

  const createOrder = useCallback(async (table_id: number, items: Array<{ menu_item_id: number; quantity: number; notes?: string }>) => {
    await api.orders.create({ table_id, items });
    await Promise.all([fetchOrders(), fetchTables()]);
  }, [fetchOrders, fetchTables]);

  const updateOrderStatus = useCallback(async (orderId: number, status: OrderStatus) => {
    await api.kitchen.updateOrderStatus(orderId, status);
    await Promise.all([fetchOrders(), fetchKitchenOrders(), fetchTables()]);
  }, [fetchOrders, fetchKitchenOrders, fetchTables]);

  const createStaff = useCallback(async (data: { username: string; password: string; role: 'waiter' | 'kitchen'; full_name?: string }) => {
    await api.staff.create(data);
    await fetchStaff();
  }, [fetchStaff]);

  return (
    <RestaurantContext.Provider
      value={{
        users,
        tables,
        fetchTables,
        addTable,
        updateTable,
        deleteTable,
        categories,
        fetchCategories,
        addCategory,
        menuItems,
        fetchMenuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        orders,
        kitchenOrders,
        fetchOrders,
        fetchKitchenOrders,
        createOrder,
        updateOrderStatus,
        createStaff,
        fetchStaff,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}
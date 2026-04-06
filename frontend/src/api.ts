// src/lib/api.ts
const API_BASE = 'http://localhost:2000/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;
  return response.json();
}

// ======================
// REAL API CLIENT (Connected to your backend)
// ======================
const api = {
  auth: {
    login: async (username: string, password: string) => {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      // Store token
      localStorage.setItem('token', data.token);
      return data.user;
    },

    register: async (username: string, password: string) => {
      // This is for manager signup
      const data = await fetchApi('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      return data.user;
    },

    logout: async () => {
      localStorage.removeItem('token');
    },
  },

  tables: {
    getAll: async () => {
      return fetchApi('/tables');
    },

    create: async (table_number: number) => {
      return fetchApi('/tables', {
        method: 'POST',
        body: JSON.stringify({ table_number }),
      });
    },

    update: async (id: number, table_number: number) => {
      return fetchApi(`/tables/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ table_number }),
      });
    },

    delete: async (id: number) => {
      return fetchApi(`/tables/${id}`, { method: 'DELETE' });
    },
  },

  categories: {
    getAll: async () => {
      return fetchApi('/menu/categories');
    },

    create: async (name: string, description?: string) => {
      return fetchApi('/menu/categories', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });
    },

    update: async (id: number, name: string, description?: string) => {
      return fetchApi(`/menu/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, description }),
      });
    },

    delete: async (id: number) => {
      return fetchApi(`/menu/categories/${id}`, { method: 'DELETE' });
    },
  },

  menuItems: {
    getAll: async () => {
      return fetchApi('/menu/items');
    },

    create: async (item: {
      category_id: number;
      name: string;
      price: number;
      image_url?: string;
    }) => {
      return fetchApi('/menu/items', {
        method: 'POST',
        body: JSON.stringify(item),
      });
    },

    update: async (id: number, updates: {
      name?: string;
      price?: number;
      image_url?: string;
      is_available?: boolean;
    }) => {
      return fetchApi(`/menu/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    delete: async (id: number) => {
      return fetchApi(`/menu/items/${id}`, { method: 'DELETE' });
    },
  },

  orders: {
    getAll: async () => {
      return fetchApi('/orders');
    },

    getMyOrders: async () => {
      return fetchApi('/orders/my');
    },

    create: async (data: {
      table_id: number;
      items: Array<{ menu_item_id: number; quantity: number; notes?: string }>;
    }) => {
      return fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    updateStatus: async (id: number, status: string) => {
      return fetchApi(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },

    delete: async (id: number) => {
      return fetchApi(`/orders/${id}`, { method: 'DELETE' });
    },
  },

kitchen: {
  getOrders: async () => {
    return fetchApi('/kitchen/orders');
  },

  updateOrderStatus: async (order_id: number, status: string) => {
    return fetchApi('/kitchen/order-status', {
      method: 'PATCH',
      body: JSON.stringify({ order_id, status }),
    });
  },
},

 staff: {
  // ✅ CREATE STAFF
  create: async (data: {
    username: string;
    password: string;
    role: 'waiter' | 'kitchen';
    full_name?: string;
  }) => {
    return fetchApi('/auth/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ✅ GET ALL STAFF (NEW)
  getAll: async () => {
    return fetchApi('/auth/staff');
  },
},
};

export default api;
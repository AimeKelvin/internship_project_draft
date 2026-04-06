import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Badge } from '../components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/Table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/DropdownMenu';
import { Plus, Trash2, LayoutGrid, UtensilsCrossed, ClipboardList, Users, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

export function ManagerDashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Manage tables, menu, orders, and staff
          </p>
        </div>
      </div>

      <Tabs defaultValue="tables" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <LayoutGrid size={16} className="hidden sm:block" /> Tables
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center gap-2">
            <UtensilsCrossed size={16} className="hidden sm:block" /> Menu
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ClipboardList size={16} className="hidden sm:block" /> Orders
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users size={16} className="hidden sm:block" /> Staff
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="tables" className="m-0">
            <TablesTab />
          </TabsContent>
          <TabsContent value="menu" className="m-0">
            <MenuTab />
          </TabsContent>
          <TabsContent value="orders" className="m-0">
            <OrdersTab />
          </TabsContent>
          <TabsContent value="staff" className="m-0">
            <StaffTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ====================== TABLES TAB ======================
function TablesTab() {
  const { tables, addTable, deleteTable, fetchTables } = useRestaurant();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleAdd = async () => {
    if (!newTableNum || isNaN(Number(newTableNum))) {
      toast.error("Please enter a valid table number");
      return;
    }

    try {
      await addTable(Number(newTableNum));
      toast.success('Table added successfully');
      setIsAddOpen(false);
      setNewTableNum('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to add table');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'occupied':
        return 'bg-amber-500/10 text-amber-600 border-amber-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Dining Tables</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Table</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Table Number</Label>
                <Input
                  type="number"
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  placeholder="e.g. 12"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>Add Table</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((table) => (
          <Card key={table.id} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-center">
                T-{table.table_number}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-2">
              <Badge variant="outline" className={getStatusColor(table.status)}>
                {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
              </Badge>
            </CardContent>
            <CardFooter className="pt-2 justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => deleteTable(table.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ====================== MENU TAB ======================
function MenuTab() {
  const {
    categories,
    menuItems,
    addCategory,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    fetchMenuItems,
  } = useRestaurant();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  const [newCatName, setNewCatName] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category_id: '',
    image_url: '',
  });

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const filteredItems =
    activeCategory === 'all'
      ? menuItems
      : menuItems.filter((i) => i.category_id.toString() === activeCategory);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await addCategory(newCatName.trim());
      toast.success('Category added successfully');
      setIsAddCatOpen(false);
      setNewCatName('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to add category');
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category_id) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await addMenuItem({
        category_id: Number(newItem.category_id),
        name: newItem.name,
        price: Number(newItem.price),
        image_url: newItem.image_url || undefined,
      });

      toast.success('Menu item added successfully');
      setIsAddItemOpen(false);
      setNewItem({ name: '', price: '', category_id: '', image_url: '' });
    } catch (e: any) {
      toast.error(e.message || 'Failed to add menu item');
    }
  };

  return (
    <div className="space-y-6">
      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 overflow-x-auto">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('all')}
            size="sm"
          >
            All
          </Button>

          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id.toString() ? 'default' : 'outline'}
              onClick={() => setActiveCategory(cat.id.toString())}
              size="sm"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          {/* ADD CATEGORY */}
          <Dialog open={isAddCatOpen} onOpenChange={setIsAddCatOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
              </DialogHeader>

              <div className="space-y-2 py-4">
                <Label>Category Name</Label>
                <Input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button onClick={handleAddCategory}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ADD ITEM */}
          <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Item
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Menu Item</DialogTitle>
              </DialogHeader>

              <div className="space-y-3 py-4">
                <Input
                  placeholder="Name"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                />

                <Input
                  type="number"
                  placeholder="Price"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                />

                <Select
                  value={newItem.category_id}
                  onValueChange={(v) =>
                    setNewItem({ ...newItem, category_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Image URL"
                  value={newItem.image_url}
                  onChange={(e) =>
                    setNewItem({ ...newItem, image_url: e.target.value })
                  }
                />
              </div>

              <DialogFooter>
                <Button onClick={handleAddItem}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ITEMS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const price = Number(item.price || 0);

          return (
            <Card key={item.id}>
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-32 w-full object-cover rounded-t"
                />
              )}

              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>
                  {categories.find((c) => c.id === item.category_id)?.name}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="font-bold">${price.toFixed(2)}</p>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateMenuItem(item.id, {
                      is_available: !item.is_available,
                    })
                  }
                >
                  {item.is_available ? 'Available' : 'Off'}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMenuItem(item.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ====================== ORDERS TAB ======================
function OrdersTab() {
  const { orders, updateOrderStatus, fetchOrders } = useRestaurant();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-500/10 text-amber-600 border-amber-200',
      preparing: 'bg-blue-500/10 text-blue-600 border-blue-200',
      ready: 'bg-purple-500/10 text-purple-600 border-purple-200',
      served: 'bg-green-500/10 text-green-600 border-green-200',
      cancelled: 'bg-red-500/10 text-red-600 border-red-200',
    };

    return (
      <Badge variant="outline" className={colors[status] || ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
        <CardDescription>View and manage all restaurant orders</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Waiter</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No orders yet
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>T-{order.table_number || order.table_id}</TableCell>
                  <TableCell>{order.waiter_name || 'Unknown'}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>${Number(order.total || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(order.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'pending')}>
                          Mark Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'preparing')}>
                          Mark Preparing
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'ready')}>
                          Mark Ready
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'served')}>
                          Mark Served
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        >
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ====================== STAFF TAB ======================
function StaffTab() {
  const { users, createStaff } = useRestaurant();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'waiter' as 'waiter' | 'kitchen',
  });

  const handleCreate = async () => {
    if (!formData.username || !formData.password) {
      toast.error("Username and password are required");
      return;
    }

    try {
      await createStaff(formData);
      toast.success('Staff member created successfully');
            setIsOpen(false);
      setFormData({
        username: '',
        password: '',
        full_name: '',
        role: 'waiter',
      });
    } catch (e: any) {
      toast.error(e.message || 'Failed to create staff');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Staff Members</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <Input
                placeholder="Full Name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
              <Input
                placeholder="Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <Select
                value={formData.role}
                onValueChange={(v) =>
                  setFormData({ ...formData, role: v as 'waiter' | 'kitchen' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waiter">Waiter</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Create Staff</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.full_name}</TableCell>
              <TableCell>{u.username}</TableCell>
              <TableCell className="capitalize">{u.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
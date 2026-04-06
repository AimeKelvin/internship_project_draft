import { useMemo, useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Separator } from '../components/ui/Separator';
import { ScrollArea } from '../components/ui/ScrollArea';
import { Plus, Minus, ShoppingCart, ClipboardList, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/Badge'; // <-- make sure Badge is imported

export function WaiterDashboard() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Waiter Dashboard
          </h1>
          <p className="text-muted-foreground">
            Take new orders and manage your active tables.
          </p>
        </div>
      </div>

      <Tabs defaultValue="new-order" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="new-order" className="flex items-center gap-2">
            <ShoppingCart size={16} /> New Order
          </TabsTrigger>
          <TabsTrigger value="my-orders" className="flex items-center gap-2">
            <ClipboardList size={16} /> My Orders
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="new-order" className="m-0">
            <NewOrderTab />
          </TabsContent>
          <TabsContent value="my-orders" className="m-0">
            <MyOrdersTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

interface CartItem {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

function NewOrderTab() {
  const { tables = [], categories = [], menuItems = [], createOrder } = useRestaurant();
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTables = tables.filter((t) => t.status === 'available');

  const filteredItems = useMemo(() => {
    const available = (menuItems || []).filter((i) => i.is_available);
    if (activeCategory === 'all') return available;
    return available.filter((i) => i.category_id.toString() === activeCategory);
  }, [menuItems, activeCategory]);

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menu_item_id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menu_item_id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          menu_item_id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: 1,
          notes: ''
        }
      ];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.menu_item_id === id) {
            const newQ = i.quantity + delta;
            return newQ > 0 ? { ...i, quantity: newQ } : i;
          }
          return i;
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const updateNotes = (id: number, notes: string) => {
    setCart((prev) =>
      prev.map((i) =>
        i.menu_item_id === id ? { ...i, notes } : i
      )
    );
  };

  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  const handleSubmit = async () => {
    if (!selectedTable) {
      toast.error('Please select a table');
      return;
    }
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setIsSubmitting(true);
    try {
      await createOrder(
        parseInt(selectedTable),
        cart.map((i) => ({
          menu_item_id: i.menu_item_id,
          quantity: i.quantity,
          notes: i.notes || undefined
        }))
      );
      toast.success('Order submitted successfully');
      setCart([]);
      setSelectedTable('');
    } catch (e) {
      toast.error('Failed to submit order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Menu Section */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Menu</CardTitle>
              <div className="w-48">
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger
                    className={!selectedTable ? 'border-destructive/50 text-destructive' : ''}
                  >
                    <SelectValue placeholder="Select Table" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTables.length > 0 ? availableTables.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        Table {t.table_number}
                      </SelectItem>
                    )) : (
                      <SelectItem value="none">
                        No tables available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pt-2 pb-1">
              <Button
                variant={activeCategory === 'all' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setActiveCategory('all')}
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id.toString() ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id.toString())}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => addToCart(item)}
                >
                  <CardContent className="p-4 flex flex-col h-full justify-between gap-2">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${Number(item.price).toFixed(2)}
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" className="w-full mt-2">
                      Add
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart Section */}
      <div className="lg:col-span-1">
        <Card className="sticky top-6 flex flex-col h-[calc(100vh-12rem)]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart size={20} /> Current Order
            </CardTitle>
            <CardDescription>
              {selectedTable
                ? `Table ${tables.find((t) => t.id.toString() === selectedTable)?.table_number || ''}`
                : 'No table selected'}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                  <ShoppingCart size={32} className="mb-2 opacity-20" />
                  <p>Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4 pb-4">
                  {cart.map((item) => (
                    <div key={item.menu_item_id} className="flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="font-medium text-sm">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon-xs"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.menu_item_id, -1)}
                          >
                            <Minus size={12} />
                          </Button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon-xs"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.menu_item_id, 1)}
                          >
                            <Plus size={12} />
                          </Button>
                        </div>
                      </div>
                      <Input
                        placeholder="Add note..."
                        className="h-7 text-xs"
                        value={item.notes}
                        onChange={(e) => updateNotes(item.menu_item_id, e.target.value)}
                      />
                      <Separator className="mt-2" />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-4 border-t bg-muted/20">
            <div className="flex justify-between w-full text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={cart.length === 0 || !selectedTable || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Submitting...' : 'Send to Kitchen'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
function MyOrdersTab() {
  const { orders = [], updateOrderItemStatus, updateOrderStatus } = useRestaurant();

  // Split active and past orders safely
  const activeOrders = orders.filter(o => o && !['completed', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => o && ['completed', 'cancelled'].includes(o.status));

  const handleMarkServed = async (itemId: number) => {
    try {
      await updateOrderItemStatus(itemId, 'served');
      toast.success('Item marked as served');
    } catch {
      toast.error('Failed to update item');
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    try {
      await updateOrderStatus(orderId, 'served');
      toast.success('Order completed and table freed');
    } catch {
      toast.error('Failed to complete order');
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-xs text-amber-600">Pending</Badge>;
      case 'in_progress': return <Badge variant="outline" className="text-xs text-blue-600">In Progress</Badge>;
      case 'completed': return <Badge variant="outline" className="text-xs text-green-600">Completed</Badge>;
      case 'cancelled': return <Badge variant="outline" className="text-xs text-red-600">Cancelled</Badge>;
      default: return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getItemStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-xs">Pending</Badge>;
      case 'preparing': return <Badge variant="outline" className="text-xs text-amber-600">Preparing</Badge>;
      case 'ready': return <Badge variant="outline" className="text-xs text-green-600 animate-pulse">Ready</Badge>;
      case 'served': return <Badge variant="outline" className="text-xs text-muted-foreground">Served</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Active Orders */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
        {activeOrders.length === 0 ? (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              No active orders right now.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeOrders.map(order => (
              <Card key={order.id} className="flex flex-col">
                <CardHeader className="pb-3 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Table {order.table_number || '-'}</CardTitle>
                      {order.created_at && (
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Clock size={12} />
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </CardDescription>
                      )}
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>

               <CardContent className="pt-4 flex-1">
  <div className="space-y-3">
    {(order.items || []).map(item => (
      <div key={item.id} className="flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-2">
            {/* Image */}
            {item.menu_item_image && (
              <img
                src={item.menu_item_image}
                alt={item.menu_item_name}
                className="w-12 h-12 rounded object-cover"
              />
            )}
            {/* Name & notes */}
            <div>
              <span className="text-sm font-medium">{item.quantity}x {item.menu_item_name}</span>
              {item.notes && (
                <p className="text-xs text-muted-foreground italic">Note: {item.notes}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {getItemStatusBadge(item.status)}
            {item.status === 'ready' && (
              <Button
                size="xs"
                variant="secondary"
                className="h-6 text-xs px-2"
                onClick={() => handleMarkServed(item.id)}
              >
                Serve
              </Button>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
</CardContent>

                <CardFooter className="border-t pt-4 flex justify-between items-center bg-muted/10">
                  <div className="font-semibold">Total: ${Number(order.total || 0).toFixed(2)}</div>
                  <Button
                    size="sm"
                    variant={(order.items || []).every(i => i.status === 'served') ? 'default' : 'outline'}
                    onClick={() => handleCompleteOrder(order.id)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Checkout
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Orders */}
      {pastOrders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">Recently Completed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-70">
            {pastOrders.slice(0, 4).map(order => (
              <Card key={order.id}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-base">Table {order.table_number || '-'}</CardTitle>
                    <span className="text-sm font-medium">${Number(order.total || 0).toFixed(2)}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                  {(order.items || []).length} items • {getStatusBadge(order.status)}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
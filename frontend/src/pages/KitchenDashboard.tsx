// src/pages/KitchenDashboard.tsx
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChefHat, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRestaurant } from '../context/RestaurantContext';
import type { Order, OrderStatus } from '../types';

export function KitchenDashboard() {
  const { kitchenOrders, fetchKitchenOrders, updateOrderStatus } = useRestaurant();
  const [loading, setLoading] = useState(false);

  // Load orders initially and every 10s
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      await fetchKitchenOrders();
      setLoading(false);
    };
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchKitchenOrders]);

  // Handle updating order status
  const handleOrderStatusUpdate = async (orderId: number, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order ${orderId} marked as ${status}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to update order status');
    }
  };

  // Minutes elapsed since order creation
  const getTimeElapsed = (createdAt: string) =>
    Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / 60000);

  // Map UI status to DB enum
  const statusColumns: Array<{ key: OrderStatus; title: string; colorClass: string }> = [
    { key: 'pending', title: 'New Orders', colorClass: 'bg-red-500' },
    { key: 'preparing', title: 'Cooking', colorClass: 'bg-amber-500' },
    { key: 'ready', title: 'Ready to Serve', colorClass: 'bg-green-500' },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-muted/20 p-4 md:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="bg-primary p-2 rounded-lg text-primary-foreground">
          <ChefHat size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kitchen Display System</h1>
          <p className="text-sm text-muted-foreground">Live order queue</p>
        </div>
      </div>

      {loading && <div className="mb-4 text-center text-muted-foreground">Loading...</div>}

      {/* Status columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        {statusColumns.map(({ key: status, title, colorClass }) => {
          const statusOrders = kitchenOrders.filter(o => o.order_status === status);

          return (
            <div key={status} className="flex flex-col h-full bg-muted/30 rounded-xl border">
              {/* Column Header */}
              <div className="p-3 border-b bg-background/50 rounded-t-xl flex justify-between items-center">
                <h2 className="font-semibold flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${colorClass}`}></div> {title}
                </h2>
                <Badge variant="secondary">{statusOrders.length}</Badge>
              </div>

              {/* Orders List */}
              <div className="p-3 overflow-y-auto flex-1">
                {statusOrders.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    {status === 'pending'
                      ? 'No new orders'
                      : status === 'preparing'
                      ? 'Nothing cooking'
                      : 'No orders ready'}
                  </div>
                ) : (
                  statusOrders.map((order: Order) => (
                    <Card key={order.order_id} className="mb-3">
                      <CardHeader className="p-3 pb-1 flex justify-between items-center">
                        <div className="font-bold text-lg">Table {order.table_id}</div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock size={10} /> {getTimeElapsed(order.created_at)}m
                        </Badge>
                      </CardHeader>

                      <CardContent className="p-3 pt-0">
                        <div className="flex flex-col gap-2">
                          {(order.items ?? []).map(item => (
                            <div key={item.item_id} className="flex items-start gap-2 text-lg">
                              <span className="font-bold bg-muted px-2 py-0.5 rounded">{item.quantity}x</span>
                              <span className="font-medium leading-tight">{item.item_name}</span>
                              {item.notes && (
                                <div className="mt-1 text-sm bg-amber-500/10 text-amber-700 p-1 rounded-md flex items-start gap-1.5">
                                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                  <span>{item.notes}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>

                      <CardFooter className="p-3 pt-0 flex gap-2">
                        {status === 'pending' && (
                          <Button
                            className="w-full"
                            onClick={() => handleOrderStatusUpdate(order.order_id, 'preparing')}
                          >
                            Start Cooking
                          </Button>
                        )}
                        {status === 'preparing' && (
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleOrderStatusUpdate(order.order_id, 'ready')}
                          >
                            Mark Ready
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
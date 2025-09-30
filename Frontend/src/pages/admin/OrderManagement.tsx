/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import axiosClient from '@/apis/axiosClient';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  user: { id: number; email: string };
  table: { id: number; tableName: string; capacity: number; status: string; reservations: Reservation[] } | null;
  orderTime: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  product: { id: number; name: string; price: number };
  quantity: number;
  price: number;
}

interface Reservation {
  id: number;
  user: { id: number; email: string };
  numPeople: number;
  reservationTime: string;
  status: string;
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await axiosClient.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to fetch orders. Please try again.');
    }
  };

  const handleUpdateOrder = async () => {
    if (!editOrder || !editOrder.id) {
      toast.error('No order selected to update.');
      return;
    }
    try {
      const response = await axiosClient.put(`/orders/${editOrder.id}/status`, editOrder.status, {
        headers: { 'Content-Type': 'application/json' },
      });
      setOrders(orders.map((order) => (order.id === editOrder.id ? response.data : order)));
      setEditOrder(null);
      toast.success('Order updated successfully!');
    } catch (error: any) {
      console.error('Failed to update order:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update order. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleDeleteOrder = async (id: number) => {
    try {
      await axiosClient.delete(`/orders/${id}`);
      setOrders(orders.filter((order) => order.id !== id));
      toast.success('Order deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete order:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete order. Please try again.';
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Order Management</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User Email</TableHead>
            <TableHead>Order Time</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Items Count</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.user.email}</TableCell>
              <TableCell>{new Date(order.orderTime).toLocaleString()}</TableCell>
              <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
              <TableCell>{order.items.length}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mr-2" onClick={() => setViewOrder(order)}>
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Order Details - ID: {viewOrder?.id}</DialogTitle>
                    </DialogHeader>
                    {viewOrder && (
                      <div className="space-y-2">
                        <p><strong>User Email:</strong> {viewOrder.user.email}</p>
                        <p><strong>Order Time:</strong> {new Date(viewOrder.orderTime).toLocaleString()}</p>
                        <p><strong>Total Amount:</strong> ${viewOrder.totalAmount.toFixed(2)}</p>
                        <p><strong>Status:</strong> {viewOrder.status}</p>
                        {viewOrder.table && (
                          <p><strong>Table:</strong> {viewOrder.table.tableName} (Capacity: {viewOrder.table.capacity})</p>
                        )}
                        <h4 className="font-semibold mt-4">Items:</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {viewOrder.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.product.name}</TableCell>
                                <TableCell>${item.product.price.toFixed(2)}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>${(item.quantity * item.product.price).toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mr-2" onClick={() => setEditOrder(order)}>
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Order</DialogTitle>
                    </DialogHeader>
                    <Select
                      onValueChange={(value) => setEditOrder({ ...editOrder!, status: value })}
                      value={editOrder?.status}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Canceled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleUpdateOrder}>Save</Button>
                  </DialogContent>
                </Dialog>
                <Button variant="destructive" onClick={() => handleDeleteOrder(order.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderManagement;
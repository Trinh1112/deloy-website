/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import axiosClient from '@/apis/axiosClient';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { removeFromCart, updateQuantity, clearCart } from '@/redux/reducers/cartSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

interface Table {
  id: number;
  tableName: string;
  capacity: number;
  status: string;
}

const OrderPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [numPeople, setNumPeople] = useState<number>(1);
  const [reservationContent, setReservationContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1); // Quản lý bước hiện tại

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axiosClient.get('/tables');
        setTables(response.data);
      } catch (error) {
        console.error('Failed to fetch tables:', error);
        toast.error('Failed to fetch tables');
      }
    };
    fetchTables();
  }, []);

  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity >= 0) {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  const handleRemoveItem = (id: number) => {
    dispatch(removeFromCart(id));
    toast.success('Item removed from cart');
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please log in to place an order');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (selectedTableId) {
      const selectedTable = tables.find((table) => table.id === Number(selectedTableId));
      if (!selectedTable) {
        toast.error('Selected table not found');
        return;
      }

      if (selectedTable.status === 'BOOKED') {
        toast.error('This table is already booked');
        return;
      }

      if (numPeople <= 0) {
        toast.error('Number of people must be greater than 0');
        return;
      }

      if (numPeople > selectedTable.capacity) {
        toast.error(`Table only allows capacity (${selectedTable.capacity}) people`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const orderRequest = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        tableId: selectedTableId ? Number(selectedTableId) : null,
        numPeople: selectedTableId ? numPeople : null,
        reservationContent: selectedTableId ? reservationContent : null,
      };

      await axiosClient.post('/orders', orderRequest);
      toast.success('Order and reservation placed successfully!');
      dispatch(clearCart());
      setSelectedTableId(null);
      setNumPeople(1);
      setReservationContent('');
      setCurrentStep(1); // Reset về bước đầu
    } catch (error: any) {
      console.error('Failed to place order:', error);
      if (error.response?.data?.message === 'Table is already booked.') {
        toast.error('This table is already booked');
      } else {
        toast.error('Failed to place order: ' + (error.response?.data?.message || 'Unknown error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Component tóm tắt giỏ hàng
  const CartSummary = () => (
    <Card className="shadow-md border-none mb-6">
      <CardHeader className="bg-gray-100">
        <CardTitle className="text-lg text-gray-700">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-gray-600">
          {cartItems.length} item(s) - Total: <span className="font-semibold text-teal-600">${calculateTotal()}</span>
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Place Your Order</h2>

      {/* Progress Bar */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-teal-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
            1
          </div>
          <div className={`h-1 w-16 ${currentStep >= 2 ? 'bg-teal-500' : 'bg-gray-300'}`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-teal-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
            2
          </div>
          <div className={`h-1 w-16 ${currentStep >= 3 ? 'bg-teal-500' : 'bg-gray-300'}`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3 ? 'bg-teal-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
            3
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-3xl mx-auto">
        {/* Step 1: Cart */}
        {currentStep === 1 && (
          <Card className="shadow-lg border-none mb-6">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg">
              <CardTitle>Step 1: Your Cart</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Your cart is empty.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-gray-50">
                      <TableHead className="text-gray-700">Name</TableHead>
                      <TableHead className="text-gray-700">Price</TableHead>
                      <TableHead className="text-gray-700">Quantity</TableHead>
                      <TableHead className="text-gray-700">Total</TableHead>
                      <TableHead className="text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                            className="w-20 border-gray-300 focus:ring-teal-500"
                            min="0"
                          />
                        </TableCell>
                        <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleNextStep}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Next: Table Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Table Details */}
        {currentStep === 2 && (
          <Card className="shadow-lg border-none mb-6">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg">
              <CardTitle>Step 2: Table Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <CartSummary />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Table (Optional)
                </label>
                <Select onValueChange={setSelectedTableId} value={selectedTableId || ''}>
                  <SelectTrigger className="border-gray-300 focus:ring-teal-500">
                    <SelectValue placeholder="Select a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table.id} value={table.id.toString()}>
                        {table.tableName} (Capacity: {table.capacity}, Status: {table.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedTableId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of People
                    </label>
                    <Input
                      type="number"
                      value={numPeople}
                      onChange={(e) => setNumPeople(Number(e.target.value))}
                      min="1"
                      className="w-full border-gray-300 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reservation Notes (Optional)
                    </label>
                    <Textarea
                      value={reservationContent}
                      onChange={(e) => setReservationContent(e.target.value)}
                      placeholder="Enter any special requests or notes"
                      className="w-full border-gray-300 focus:ring-teal-500"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <Button
                  onClick={handlePrevStep}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Next: Confirm Order
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirm Order */}
        {currentStep === 3 && (
          <Card className="shadow-lg border-none mb-6">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg">
              <CardTitle>Step 3: Confirm Order</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <CartSummary />
              {selectedTableId && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Table Details</h3>
                  <p className="text-gray-600">
                    Table: {tables.find((t) => t.id === Number(selectedTableId))?.tableName} <br />
                    Number of People: {numPeople} <br />
                    Notes: {reservationContent || 'None'}
                  </p>
                </div>
              )}
              <div className="flex justify-between">
                <Button
                  onClick={handlePrevStep}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
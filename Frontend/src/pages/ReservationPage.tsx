/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import axiosClient from '@/apis/axiosClient';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-toastify';
import { Users, Calendar, MessageSquare, Check, X, Table2, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';

interface Table {
  id: number;
  tableName: string;
  capacity: number;
  status: 'BOOKED' | 'NOT_BOOKED';
}

const ReservationPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [numPeople, setNumPeople] = useState<number>(2);
  const [reservationDate, setReservationDate] = useState<Date | undefined>(undefined);
  const [reservationTime, setReservationTime] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCapacity, setFilterCapacity] = useState<string>('all');

  // Fetch all tables when the component mounts
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axiosClient.get('/tables');
        setTables(response.data);
      } catch (error) {
        console.error('Failed to fetch tables:', error);
        toast.error('Failed to fetch tables.');
      }
    };
    fetchTables();
  }, []);

  // Generate time slots (every 30 minutes from 10:00 to 22:00)
  const timeSlots = Array.from({ length: 25 }, (_, i) => {
    const hour = Math.floor(i / 2) + 10;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  // Handle table selection
  const handleSelectTable = (table: Table) => {
    if (table.status === 'BOOKED') {
      toast.error('This table is already booked.');
      return;
    }
    setSelectedTable(table);
    setIsModalOpen(true);
    setNumPeople(2);
    setReservationDate(undefined);
    setReservationTime('');
    setContent('');
  };

  // Handle reservation submission
  const handleReserve = async () => {
    if (!user) {
      toast.error('Please log in to make a reservation.');
      return;
    }

    if (!selectedTable || !reservationDate || !reservationTime || numPeople <= 0) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const reservationDateTime = new Date(reservationDate);
    const [hours, minutes] = reservationTime.split(':').map(Number);
    reservationDateTime.setHours(hours, minutes);

    if (reservationDateTime < new Date()) {
      toast.error('Reservation time cannot be in the past.');
      return;
    }

    if (numPeople > selectedTable.capacity) {
      toast.error(`Table capacity is ${selectedTable.capacity}.`);
      return;
    }
//
    setIsSubmitting(true);
    try {
      await axiosClient.post('/reservations', {
        tableId: selectedTable.id,
        numPeople,
        reservationTime: reservationDateTime.toISOString(),
        content,
      });

      toast.success('Reservation successful!');
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.id === selectedTable.id ? { ...table, status: 'BOOKED' } : table
        )
      );
      setIsModalOpen(false);
      setSelectedTable(null);
      setNumPeople(2);
      setReservationDate(undefined);
      setReservationTime('');
      setContent('');
    } catch (error: any) {
      console.error('Failed to reserve:', error);
      toast.error('Failed to reserve table: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter tables based on status and capacity
  const filteredTables = tables.filter((table) => {
    const statusMatch = filterStatus === 'all' || table.status === filterStatus;
    const capacityMatch =
      filterCapacity === 'all' || table.capacity >= Number(filterCapacity);
    return statusMatch && capacityMatch;
  });

  return (
    <div className="container mx-auto p-6 bg-blue-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-blue-800 text-center">Reserve a Table</h2>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
        <div className="flex-1">
          <label className="block text-sm font-medium text-blue-700 mb-2">Filter by Status</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="border-blue-300 focus:ring-blue-500">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="NOT_BOOKED">Available</SelectItem>
              <SelectItem value="BOOKED">Booked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-blue-700 mb-2">Min Capacity</label>
          <Select value={filterCapacity} onValueChange={setFilterCapacity}>
            <SelectTrigger className="border-blue-300 focus:ring-blue-500">
              <SelectValue placeholder="Select capacity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="6">6+</SelectItem>
              <SelectItem value="8">8+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table List */}
      <div className="max-w-3xl mx-auto">
        {filteredTables.length > 0 ? (
          <div className="space-y-4">
            {filteredTables.map((table) => (
              <Card
                key={table.id}
                className={`cursor-pointer transition-all duration-200 shadow-md ${
                  table.status === 'BOOKED'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-blue-200 hover:bg-blue-100'
                }`}
                onClick={() => handleSelectTable(table)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Table2 className="w-6 h-6 text-blue-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800">
                        Table {table.tableName}
                      </h3>
                      <p className="text-sm text-blue-600 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Capacity: {table.capacity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {table.status === 'BOOKED' ? (
                      <X className="w-5 h-5 text-red-500" />
                    ) : (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        table.status === 'BOOKED' ? 'text-red-500' : 'text-green-500'
                      }`}
                    >
                      {table.status === 'BOOKED' ? 'Booked' : 'Available'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-blue-500 text-center py-4">No tables match your filters.</p>
        )}
      </div>

      {/* Reservation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-blue-200 ">
          <DialogHeader>
            <DialogTitle className="flex items-center text-blue-800">
              <Table2 className="w-5 h-5 mr-2" />
              Reserve Table {selectedTable?.tableName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Number of People
              </label>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <Input
                  type="number"
                  value={numPeople}
                  onChange={(e) => setNumPeople(Number(e.target.value))}
                  min="1"
                  className="w-full border-blue-300 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Reservation Date
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <CalendarPicker
                  mode="single"
                  selected={reservationDate}
                  onSelect={setReservationDate}
                  disabled={(date) => date < new Date()}
                  className="w-full border-blue-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Reservation Time
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <Select value={reservationTime} onValueChange={setReservationTime}>
                  <SelectTrigger className="w-full border-blue-300 focus:ring-blue-500">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Special Requests (Optional)
              </label>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter any special requests or notes"
                  className="w-full border-blue-300 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleReserve}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Check className="w-5 h-5 mr-2" />
              )}
              Confirm Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReservationPage;
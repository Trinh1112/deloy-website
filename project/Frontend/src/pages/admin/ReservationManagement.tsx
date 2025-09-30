import { useEffect, useState } from 'react';
import axiosClient from '@/apis/axiosClient';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Reservation {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  table: {
    id: number;
    tableName: string;
    capacity: number;
    status: string;
  };
  numPeople: number;
  reservationTime: string;
  status: string;
  content: string;
}

const ReservationManagement = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [editReservation, setEditReservation] = useState<Reservation | null>(null);

  const fetchReservations = async () => {
    try {
      const response = await axiosClient.get('/reservations');
      setReservations(response.data);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  };

  const handleUpdateReservation = async () => {
    if (!editReservation) return;
    try {
      const response = await axiosClient.put(`/reservations/${editReservation.id}`, {
        status: editReservation.status,
      });
      setReservations(
        reservations.map((reservation) =>
          reservation.id === editReservation.id ? response.data : reservation
        )
      );
      setEditReservation(null);
    } catch (error) {
      console.error('Failed to update reservation:', error);
    }
  };

  const handleDeleteReservation = async (id: number) => {
    try {
      await axiosClient.delete(`/reservations/${id}`);
      setReservations(reservations.filter((reservation) => reservation.id !== id));
    } catch (error) {
      console.error('Failed to delete reservation:', error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Reservation Management</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Table</TableHead>
            <TableHead>People</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell>{reservation.id}</TableCell>
              <TableCell>{reservation.user.name}</TableCell>
              <TableCell>{reservation.table.tableName}</TableCell>
              <TableCell>{reservation.numPeople}</TableCell>
              <TableCell>{new Date(reservation.reservationTime).toLocaleString()}</TableCell>
              <TableCell>{reservation.status}</TableCell>
              <TableCell>{reservation.content}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mr-2" onClick={() => setEditReservation(reservation)}>
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Reservation</DialogTitle>
                    </DialogHeader>
                    <Select
                      onValueChange={(value) => setEditReservation({ ...editReservation!, status: value })}
                      defaultValue={editReservation?.status}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="CANCELED">Canceled</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="BOOKED">Booked</SelectItem>
                        <SelectItem value="NOT_BOOKED">Not Booked</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleUpdateReservation}>Save</Button>
                  </DialogContent>
                </Dialog>
                <Button variant="destructive" onClick={() => handleDeleteReservation(reservation.id)}>
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

export default ReservationManagement;
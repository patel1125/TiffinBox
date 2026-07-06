import { useEffect, useState } from 'react';
import api from '../services/api';

interface Reservation {
  _id: string;
  restaurantId: string;
  reservationDate: string;
  reservationTime: string;
  numberOfGuests: number;
  status: string;
}

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    api.get('/reservations/my-reservations').then(({ data }) => setReservations(data));
  }, []);

  if (reservations.length === 0) {
    return <div className="container empty-state">No table reservations yet.</div>;
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 className="display">My Reservations</h1>
      {reservations.map((res) => (
        <div key={res._id} className="card" style={{ padding: 16, marginBottom: 12 }}>
          <p>{new Date(res.reservationDate).toLocaleDateString()} at {res.reservationTime}</p>
          <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
            Guests: {res.numberOfGuests} • Status: {res.status}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Reservations;

import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

export function useOrderTracking(orderId, token) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId || !token) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/order`, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        connection.invoke('JoinOrderGroup', orderId);
        setLoading(false);
      })
      .catch(err => {
        console.error('SignalR Connection Error: ', err);
        setError(err);
        setLoading(false);
      });

    connection.on('ReceiveStatusUpdate', (data) => {
      if (data.orderId === orderId) {
        setStatus(data.status);
      }
    });

    return () => {
      if (connection) {
        connection.invoke('LeaveOrderGroup', orderId)
          .then(() => connection.stop())
          .catch(err => console.error('SignalR Stop Error:', err));
      }
    };
  }, [orderId, token]);

  return { status, setStatus, loading, error };
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io as socketIO, Socket } from 'socket.io-client';

export interface LiveWish {
  id?: string;
  name?: string;
  relationship?: string | null;
  message?: string;
  imageUrl?: string | null;
  createdAt?: string;
}

export interface LiveRsvp {
  id?: string;
  name?: string;
  guestCount?: number;
  attendance?: string;
  createdAt?: string;
}

interface UseLiveWeddingDataOptions {
  weddingId?: string | null;
}

export function useLiveWeddingData({ weddingId }: UseLiveWeddingDataOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestWish, setLatestWish] = useState<LiveWish | null>(null);
  const [latestRsvp, setLatestRsvp] = useState<LiveRsvp | null>(null);
  const [rsvpFlash, setRsvpFlash] = useState(false);
  const [liveRsvpIncrement, setLiveRsvpIncrement] = useState(0);

  const handleNewRsvp = useCallback((data: LiveRsvp) => {
    setLatestRsvp(data);
    setLiveRsvpIncrement((prev) => prev + 1);
    setRsvpFlash(true);
    setTimeout(() => setRsvpFlash(false), 2000);
  }, []);

  useEffect(() => {
    const socket = socketIO('/?XTransformPort=3004', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (weddingId) {
        socket.emit('join_wedding', weddingId);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('new_wish', (data: LiveWish) => {
      setLatestWish(data);
    });

    socket.on('new_rsvp', handleNewRsvp);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [weddingId, handleNewRsvp]);

  return { latestWish, latestRsvp, isConnected, rsvpFlash, liveRsvpIncrement };
}
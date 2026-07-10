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
  const [liveWishes, setLiveWishes] = useState<LiveWish[]>([]);
  const [latestRsvp, setLatestRsvp] = useState<LiveRsvp | null>(null);
  const [rsvpFlash, setRsvpFlash] = useState(false);
  const [liveRsvpIncrement, setLiveRsvpIncrement] = useState(0);

  // Add a wish to the accumulated list with dedup (used by socket listener & optimistic adds)
  const addWish = useCallback((wish: LiveWish) => {
    setLiveWishes((prev) => {
      if (wish.id && prev.some((w) => w.id === wish.id)) return prev;
      return [wish, ...prev];
    });
  }, []);

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
      addWish(data);
    });

    socket.on('new_rsvp', handleNewRsvp);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [weddingId, handleNewRsvp, addWish]);

  // Derived: most recent wish for consumers that only need the latest
  const latestWish = liveWishes.length > 0 ? liveWishes[0] : null;

  return { latestWish, liveWishes, addWish, latestRsvp, isConnected, rsvpFlash, liveRsvpIncrement };
}
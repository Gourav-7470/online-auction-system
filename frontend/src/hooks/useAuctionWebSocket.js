import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getToken } from '../utils/auth';

/**
 * Custom hook to connect to Spring Boot STOMP WebSocket for live auction bid updates
 * @param {number|string|null} auctionId - The auction ID to subscribe to
 * @param {Function} [onBidReceived] - Callback when a new bid is received on /topic/auction/{id}
 * @returns {{ isConnected: boolean, error: string | null, sendBid: Function }}
 */
export function useAuctionWebSocket(auctionId, onBidReceived) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const clientRef = useRef(null);
  const callbackRef = useRef(onBidReceived);

  // Keep callback reference updated without triggering re-connection
  useEffect(() => {
    callbackRef.current = onBidReceived;
  }, [onBidReceived]);

  useEffect(() => {
    if (!auctionId) return;

    const baseHttpUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    // Native ws:// url
    const wsUrl = baseHttpUrl.replace(/^http/, 'ws') + '/ws';
    const token = getToken();

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      // Fallback factory using SockJS in case browser requires SockJS emulation
      webSocketFactory: () => new SockJS(`${baseHttpUrl}/ws`),
      debug: (str) => {
        if (import.meta.env.DEV) {
          // console.log('[STOMP]', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      setError(null);

      // Subscribe to auction-specific channel: /topic/auction/{auctionId}
      const auctionTopic = `/topic/auction/${auctionId}`;
      client.subscribe(auctionTopic, (message) => {
        try {
          const payload = JSON.parse(message.body);
          if (callbackRef.current) {
            callbackRef.current(payload);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      });

      // Also subscribe to general /topic/bid for updates
      client.subscribe('/topic/bid', (message) => {
        try {
          const payload = JSON.parse(message.body);
          // If the general broadcast is for our current auction
          if (payload && (payload.auctionId === Number(auctionId) || payload.auction?.id === Number(auctionId))) {
            if (callbackRef.current) {
              callbackRef.current(payload);
            }
          }
        } catch (err) {
          console.error('Failed to parse general bid message:', err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP Broker error:', frame.headers['message'], frame.body);
      setError(frame.headers['message'] || 'WebSocket connection error');
    };

    client.onWebSocketClose = () => {
      setIsConnected(false);
    };

    client.onWebSocketError = (event) => {
      console.warn('WebSocket encountered an issue, will attempt reconnection:', event);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
      setIsConnected(false);
    };
  }, [auctionId]);

  /**
   * Send a bid update via WebSocket mapping @MessageMapping("/bid")
   */
  const sendBid = useCallback(
    (bidUpdate) => {
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.publish({
          destination: '/app/bid',
          body: JSON.stringify(bidUpdate),
        });
      }
    },
    []
  );

  return { isConnected, error, sendBid };
}

export default useAuctionWebSocket;

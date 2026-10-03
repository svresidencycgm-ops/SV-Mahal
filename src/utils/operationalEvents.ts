// Cross-tab & Real-time Operational Events Broadcaster
// Reflects instant notifications and desk bell sound on Admin & Manager panels

export type OperationalEventType = 'NEW_BOOKING' | 'USER_REGISTERED' | 'PAYMENT_RECORDED' | 'PAYMENT_REQUESTED';

export interface OperationalEvent {
  type: OperationalEventType;
  title: string;
  message: string;
  timestamp: number;
  data?: any;
}

const CHANNEL_NAME = 'sv_residency_ops_channel';
let broadcastChannel: BroadcastChannel | null = null;

try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel initialization deferred:', e);
}

/**
 * Broadcasts an event to all open browser windows and tabs (e.g. Admin / Manager panels).
 */
export const broadcastOperationalEvent = (event: Omit<OperationalEvent, 'timestamp'>): void => {
  const fullEvent: OperationalEvent = {
    ...event,
    timestamp: Date.now()
  };

  // 1. Send via BroadcastChannel for instant same-browser cross-tab delivery
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(fullEvent);
    } catch (e) {
      console.warn('BroadcastChannel send error:', e);
    }
  }

  // 2. Fallback via localStorage storage event for older browsers / isolated windows
  try {
    localStorage.setItem('sv_last_ops_event', JSON.stringify(fullEvent));
  } catch (e) {
    console.warn('Storage event broadcast error:', e);
  }
};

/**
 * Subscribes to real-time operational events.
 * Used by Admin & Manager panels to trigger the reception bell chime and show live alerts.
 */
export const subscribeToOperationalEvents = (
  onEvent: (event: OperationalEvent) => void
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  // Listener for BroadcastChannel
  const handleBroadcastMessage = (e: MessageEvent) => {
    if (e.data && e.data.type) {
      onEvent(e.data as OperationalEvent);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcastMessage);
  }

  // Listener for localStorage storage event fallback
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === 'sv_last_ops_event' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < 3000) {
          onEvent(parsed as OperationalEvent);
        }
      } catch (err) {
        console.warn('Failed parsing storage operational event:', err);
      }
    }
  };

  window.addEventListener('storage', handleStorageEvent);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
    window.removeEventListener('storage', handleStorageEvent);
  };
};

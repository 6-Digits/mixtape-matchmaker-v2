import { useEffect, useState } from 'react';
import {
  MAX_NOTIFICATIONS,
  NOTIFICATION_KEY,
  NOTIFICATION_TTL_MS,
} from './appDataConfig';
import type { AppNotification, AppUser } from './appDataTypes';
import { safeGetItem, safeJsonParse, safeSetItem } from '../services/mockDb';

function createNotification(message: string, target?: string): AppNotification {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    message,
    time: new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date()),
    read: false,
    createdAt: Date.now(),
    target,
  };
}

export function useNotifications(user: AppUser | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => (
    safeJsonParse<AppNotification[]>(safeGetItem(NOTIFICATION_KEY), [])
  ));
  const [notice, setNotice] = useState<string | null>(null);

  const pushNotice = (message: string) => {
    if (!user) return;
    setNotice(message);
  };

  const pushNotification = (message: string, target?: string) => {
    if (!user) return;
    const notification = createNotification(message, target);
    setNotifications((current) => {
      const next = [notification, ...current].slice(0, MAX_NOTIFICATIONS);
      safeSetItem(NOTIFICATION_KEY, JSON.stringify(next));
      return next;
    });
    setNotice((current) => current ?? message);
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNotifications((current) => {
        const cutoff = Date.now() - NOTIFICATION_TTL_MS;
        const next = current.filter((notification) => notification.createdAt > cutoff);
        if (next.length !== current.length) safeSetItem(NOTIFICATION_KEY, JSON.stringify(next));
        return next;
      });
    }, 10_000);

    return () => window.clearInterval(interval);
  }, []);

  const markNotificationsRead = () => {
    setNotifications((current) => {
      const next = current.map((notification) => ({ ...notification, read: true }));
      safeSetItem(NOTIFICATION_KEY, JSON.stringify(next));
      return next;
    });
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications((current) => {
      const next = current.filter((notification) => notification.id !== notificationId);
      safeSetItem(NOTIFICATION_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    safeSetItem(NOTIFICATION_KEY, JSON.stringify([]));
  };

  const clearNotice = () => setNotice(null);

  return {
    clearNotice,
    clearNotifications,
    dismissNotification,
    markNotificationsRead,
    notice,
    notifications,
    pushNotice,
    pushNotification,
  };
}

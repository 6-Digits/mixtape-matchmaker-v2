import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import type { AppNotification } from '../../state/AppDataContext';

type Props = {
  notifications: AppNotification[];
  onClearAll: () => void;
  onDismiss: (notificationId: string) => void;
  onOpen: (target: string) => void;
};

const NotificationsList: React.FC<Props> = ({ notifications, onClearAll, onDismiss, onOpen }) => {
  if (notifications.length === 0) {
    return <Typography color="text.secondary">No notifications yet. Mock activity will appear here.</Typography>;
  }

  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <Button size="small" variant="outlined" onClick={onClearAll}>
        Clear all
      </Button>
      {notifications.map((notification) => {
        const clickable = Boolean(notification.target);
        return (
          <Box
            key={notification.id}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={() => clickable && onOpen(notification.target!)}
            onKeyDown={(event) => {
              if (clickable && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                onOpen(notification.target!);
              }
            }}
            sx={{
              p: 1,
              borderRadius: 1.5,
              bgcolor: notification.read ? 'transparent' : 'action.hover',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 1,
              cursor: clickable ? 'pointer' : 'default',
              transition: 'background-color 120ms ease',
              '&:hover': clickable ? { bgcolor: 'action.selected' } : undefined,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">{notification.time}</Typography>
            </Box>
            <Button
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onDismiss(notification.id);
              }}
            >
              Clear
            </Button>
          </Box>
        );
      })}
    </Box>
  );
};

export default NotificationsList;

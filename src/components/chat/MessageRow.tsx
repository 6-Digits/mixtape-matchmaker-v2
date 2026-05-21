import React, { useRef, useState } from 'react';
import AddReactionRoundedIcon from '@mui/icons-material/AddReactionRounded';
import { Avatar, Box, IconButton, Popover, Stack, Tooltip, Typography } from '@mui/material';
import type { ChatMessage } from '../../data/demo';

const REACTIONS = ['❤️', '😂', '😍', '🔥', '👍', '😮', '😢'];
const DEFAULT_REACTION = '❤️';

type MessageRowProps = {
  message: ChatMessage;
  onReact: (emoji: string) => void;
  /** When true, render the partner's avatar next to this row. */
  showAvatar?: boolean;
  /** When false, hide the timestamp inside the bubble (mid-group). */
  showTimestamp?: boolean;
  /** The avatar to show for incoming messages. */
  partnerAvatar?: string;
  /** First / middle / last message in a sender group — drives bubble corner radii. */
  groupPosition?: 'solo' | 'first' | 'middle' | 'last';
};

const MessageRow: React.FC<MessageRowProps> = ({
  message,
  onReact,
  showAvatar = true,
  showTimestamp = true,
  partnerAvatar,
  groupPosition = 'solo',
}) => {
  const mine = message.from === 'You';
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const lastTapRef = useRef(0);
  const longPressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);
  const [bump, setBump] = useState(false);
  const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null);

  const openPicker = (anchor?: HTMLElement | null) => {
    setPickerAnchor(anchor ?? bubbleRef.current);
  };

  const applyReaction = (emoji: string) => {
    onReact(emoji);
    if (message.reaction !== emoji) {
      setBump(true);
      window.setTimeout(() => setBump(false), 280);
    }
    setPickerAnchor(null);
  };

  const handleBubbleClick = () => {
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      applyReaction(message.reaction || DEFAULT_REACTION);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const startLongPress = () => {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      openPicker(bubbleRef.current);
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // iMessage/Messenger-style asymmetric corners: the corner on the
  // "tail" side flattens for first/middle/last of a group.
  const sharpCorner = 6;
  const bigCorner = 18;
  const isFirst = groupPosition === 'solo' || groupPosition === 'first';
  const isLast = groupPosition === 'solo' || groupPosition === 'last';
  const corners = mine
    ? {
        borderTopLeftRadius: bigCorner,
        borderBottomLeftRadius: bigCorner,
        borderTopRightRadius: isFirst ? bigCorner : sharpCorner,
        borderBottomRightRadius: isLast ? bigCorner : sharpCorner,
      }
    : {
        borderTopRightRadius: bigCorner,
        borderBottomRightRadius: bigCorner,
        borderTopLeftRadius: isFirst ? bigCorner : sharpCorner,
        borderBottomLeftRadius: isLast ? bigCorner : sharpCorner,
      };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: mine ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 0.75,
        position: 'relative',
        width: '100%',
        mt: groupPosition === 'first' || groupPosition === 'solo' ? 0.5 : 0,
        '&:hover .msg-react-btn, &:focus-within .msg-react-btn': {
          opacity: 1,
          pointerEvents: 'auto',
        },
      }}
    >
      {!mine && (
        <Box sx={{ width: 32, height: 32, flexShrink: 0 }}>
          {showAvatar && partnerAvatar ? (
            <Avatar src={partnerAvatar} sx={{ width: 32, height: 32 }} />
          ) : null}
        </Box>
      )}
      <Box
        sx={{
          position: 'relative',
          maxWidth: { xs: 'min(82%, 520px)', md: 540 },
          minWidth: 0,
          mb: message.reaction ? 1.4 : 0,
        }}
      >
        <Box
          ref={bubbleRef}
          onClick={handleBubbleClick}
          onContextMenu={(event) => {
            event.preventDefault();
            openPicker(event.currentTarget as HTMLElement);
          }}
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
          onTouchMove={cancelLongPress}
          onTouchCancel={cancelLongPress}
          sx={{
            position: 'relative',
            px: 1.6,
            py: 1,
            ...corners,
            bgcolor: mine ? 'primary.main' : 'background.paper',
            color: mine ? 'primary.contrastText' : 'text.primary',
            border: mine ? 0 : 1,
            borderColor: 'divider',
            boxShadow: mine ? 0 : '0 1px 2px rgba(15, 23, 42, 0.06)',
            cursor: 'pointer',
            userSelect: 'text',
            transition: 'transform 160ms ease, box-shadow 160ms ease',
            transform: bump ? 'scale(1.025)' : 'scale(1)',
            WebkitTouchCallout: 'none',
          }}
        >
        <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.35 }}>
          {message.body}
        </Typography>
        {showTimestamp && (
          <Typography
            variant="caption"
            sx={{ display: 'block', opacity: 0.72, mt: 0.4, fontSize: 11 }}
          >
            {message.time}
          </Typography>
        )}
        {message.reaction && (
          <Tooltip title="Remove reaction">
            <Box
              aria-label={`Reacted ${message.reaction}`}
              onClick={(event) => {
                event.stopPropagation();
                applyReaction(message.reaction as string);
              }}
              sx={{
                position: 'absolute',
                [mine ? 'left' : 'right']: -8,
                bottom: -12,
                minWidth: 24,
                height: 24,
                px: 0.6,
                borderRadius: 99,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                boxShadow: 1,
                fontSize: 13,
                lineHeight: 1,
                cursor: 'pointer',
              }}
            >
              {message.reaction}
            </Box>
          </Tooltip>
        )}
        </Box>
        <IconButton
          size="small"
          className="msg-react-btn"
          onClick={() => openPicker(bubbleRef.current)}
          aria-label="Add reaction"
          sx={{
            position: 'absolute',
            top: '50%',
            [mine ? 'left' : 'right']: -34,
            width: 28,
            height: 28,
            opacity: { xs: 1, sm: 0 },
            pointerEvents: { xs: 'auto', sm: 'none' },
            transform: 'translateY(-50%)',
            transition: 'opacity 140ms ease',
            color: 'text.secondary',
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            boxShadow: 1,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <AddReactionRoundedIcon fontSize="small" />
        </IconButton>
      </Box>
      <Popover
        open={Boolean(pickerAnchor)}
        anchorEl={pickerAnchor}
        onClose={() => setPickerAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              p: 0.5,
              mt: -1,
              boxShadow: 6,
              border: 1,
              borderColor: 'divider',
            },
          },
        }}
      >
        <Stack direction="row" spacing={0.25}>
          {REACTIONS.map((emoji) => {
            const active = message.reaction === emoji;
            return (
              <IconButton
                key={emoji}
                size="small"
                onClick={() => applyReaction(emoji)}
                sx={{
                  fontSize: 18,
                  width: 34,
                  height: 34,
                  bgcolor: active ? 'action.selected' : 'transparent',
                  '&:hover': { transform: 'scale(1.2)' },
                  transition: 'transform 120ms ease',
                }}
              >
                <Box component="span" aria-hidden sx={{ fontSize: 18, lineHeight: 1 }}>
                  {emoji}
                </Box>
              </IconButton>
            );
          })}
        </Stack>
      </Popover>
    </Box>
  );
};

export default MessageRow;

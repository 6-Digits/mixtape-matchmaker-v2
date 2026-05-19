import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Paper,
  Popover,
  Stack,
  Typography,
} from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import AddReactionRoundedIcon from '@mui/icons-material/AddReactionRounded';
import { useAppData } from '../state/AppDataContext';
import { useSearchParams } from 'react-router-dom';
import type { ChatMessage } from '../data/demo';

const REACTIONS = ['❤️', '😂', '😍', '🔥', '👍', '😮', '😢'];
const DEFAULT_REACTION = '❤️';

const Chat: React.FC = () => {
  const { matches, messages, sendMessage, typingMatchId, reactToMessage } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeMatchId, setActiveMatchId] = useState(searchParams.get('match') || matches[0]?.id);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const activeMatch = matches.find((match) => match.id === activeMatchId) || matches[0];
  const activeMessages = messages.filter((message) => message.matchId === activeMatch?.id);
  const visibleMatches = useMemo(() => (
    matches.filter((match) => match.name.toLowerCase().includes(query.toLowerCase()) || match.playlist.toLowerCase().includes(query.toLowerCase()))
  ), [matches, query]);

  const messageScrollRef = useRef<HTMLDivElement | null>(null);

  const handleSend = () => {
    sendMessage(draft, activeMatch?.id);
    setDraft('');
  };

  useEffect(() => {
    const node = messageScrollRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [activeMessages.length, typingMatchId, activeMatch?.id]);

  return (
    <Box>
      <Typography variant="h3">Chat</Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5 }}>
        Keep the conversation close to the music that started it.
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          height: { xs: 'auto', md: 660 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
          overflow: 'hidden',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ borderRight: { md: 1 }, borderColor: { md: 'divider' }, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{ p: 2 }}>
            <InputBase
              fullWidth
              placeholder="Search matches"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              sx={{ px: 1.5, py: 1, borderRadius: 2, bgcolor: 'action.hover' }}
            />
          </Box>
          <Divider />
          <List disablePadding sx={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
            {visibleMatches.map((match) => (
              <ListItemButton
                key={match.id}
                selected={match.id === activeMatch?.id}
                sx={{ py: 1.4 }}
                onClick={() => {
                  setActiveMatchId(match.id);
                  setSearchParams({ match: match.id });
                }}
              >
                <ListItemAvatar>
                  <Avatar src={match.image} variant="rounded" />
                </ListItemAvatar>
                <ListItemText
                  secondary={match.playlist}
                  primary={<Typography sx={{ fontWeight: 900 }}>{match.name}</Typography>}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: { md: '100%' } }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', p: 2 }}>
            <Avatar src={activeMatch?.image} variant="rounded" />
            <Box>
              <Typography variant="h6">{activeMatch?.name || 'No match selected'}</Typography>
              <Typography variant="body2" color="text.secondary">{activeMatch?.score || 0}% match from City Lights, Side B</Typography>
            </Box>
          </Stack>
          <Divider />
          <Stack
            ref={messageScrollRef}
            spacing={1.5}
            sx={{
              flex: 1,
              p: 2.5,
              minHeight: 0,
              maxHeight: { xs: 420, md: 'unset' },
              overflowY: 'auto',
              bgcolor: 'action.hover',
            }}
          >
            {typingMatchId && typingMatchId === activeMatch?.id && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box
                  sx={{
                    px: 1.8,
                    py: 1.2,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    boxShadow: '0 8px 24px rgba(48, 31, 39, 0.08)',
                    fontStyle: 'italic',
                    color: 'text.secondary',
                  }}
                >
                  {activeMatch?.name || 'Match'} is typing…
                </Box>
              </Box>
            )}
            {activeMessages.map((message) => (
              <MessageRow
                key={message.id}
                message={message}
                onReact={(emoji) => reactToMessage(message.id, emoji)}
              />
            ))}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <InputBase
              fullWidth
              placeholder="Send a song, a thought, or both"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSend();
                }
              }}
              sx={{ px: 1.5, py: 1, borderRadius: 2, bgcolor: 'action.hover' }}
            />
            <Button variant="contained" endIcon={<SendRoundedIcon />} onClick={handleSend} disabled={!draft.trim()}>Send</Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

type MessageRowProps = {
  message: ChatMessage;
  onReact: (emoji: string) => void;
};

const MessageRow: React.FC<MessageRowProps> = ({ message, onReact }) => {
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: mine ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 0.5,
        position: 'relative',
        '&:hover .msg-react-btn, &:focus-within .msg-react-btn': {
          opacity: 1,
          pointerEvents: 'auto',
        },
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
        onMouseDown={startLongPress}
        onMouseUp={cancelLongPress}
        onMouseLeave={cancelLongPress}
        sx={{
          position: 'relative',
          maxWidth: 520,
          px: 1.8,
          py: 1.2,
          borderRadius: 2,
          bgcolor: mine ? 'primary.main' : 'background.paper',
          color: mine ? 'primary.contrastText' : 'text.primary',
          border: 1,
          borderColor: mine ? 'transparent' : 'divider',
          boxShadow: 1,
          cursor: 'pointer',
          userSelect: 'text',
          transition: 'transform 200ms ease',
          transform: bump ? 'scale(1.04)' : 'scale(1)',
          WebkitTouchCallout: 'none',
        }}
      >
        <Typography>{message.body}</Typography>
        <Typography variant="caption" sx={{ opacity: 0.72 }}>{message.time}</Typography>
        {message.reaction && (
          <Box
            aria-label={`Reacted ${message.reaction}`}
            onClick={(event) => {
              event.stopPropagation();
              applyReaction(message.reaction as string);
            }}
            sx={{
              position: 'absolute',
              [mine ? 'left' : 'right']: -10,
              bottom: -10,
              minWidth: 26,
              height: 26,
              px: 0.6,
              borderRadius: 99,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              boxShadow: 1,
              fontSize: 14,
              lineHeight: 1,
              cursor: 'pointer',
            }}
          >
            {message.reaction}
          </Box>
        )}
      </Box>
      <IconButton
        size="small"
        className="msg-react-btn"
        onClick={() => openPicker(bubbleRef.current)}
        aria-label="Add reaction"
        sx={{
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 140ms ease',
          color: 'text.secondary',
        }}
      >
        <AddReactionRoundedIcon fontSize="small" />
      </IconButton>
      <Popover
        open={Boolean(pickerAnchor)}
        anchorEl={pickerAnchor}
        onClose={() => setPickerAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 99,
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
                <Box component="span" aria-hidden sx={{ fontSize: 18, lineHeight: 1 }}>{emoji}</Box>
              </IconButton>
            );
          })}
        </Stack>
      </Popover>
    </Box>
  );
};

export default Chat;

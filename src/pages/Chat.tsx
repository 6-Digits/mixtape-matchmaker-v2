import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppData } from '../state/AppDataContext';
import MessageRow from '../components/chat/MessageRow';
import TypingDots from '../components/chat/TypingDots';
import type { ChatMessage, Match } from '../data/demo';

function parseTimeToMinutes(time: string): number {
  // "9:41 AM" → ordering integer for "today". Not a real timestamp, just for sorting.
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return 0;
  let h = Number(match[1]);
  const m = Number(match[2]);
  const period = match[3]?.toUpperCase();
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

function lastMessageFor(messages: ChatMessage[], matchId: string): ChatMessage | undefined {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].matchId === matchId) return messages[i];
  }
  return undefined;
}

const Chat: React.FC = () => {
  const { mutualMatches, messages, sendMessage, typingMatchId, reactToMessage, nowPlaying } = useAppData();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMatchId, setSelectedMatchId] = useState<string | undefined>();
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const messageScrollRef = useRef<HTMLDivElement | null>(null);

  const urlMatchId = searchParams.get('match') || undefined;
  const urlMatchIsValid = Boolean(urlMatchId && mutualMatches.some((m) => m.id === urlMatchId));
  const activeMatchId = urlMatchIsValid ? urlMatchId : selectedMatchId;
  // On desktop, default to the first match so the right pane is never empty.
  // On mobile, only show a conversation when the user has explicitly picked one.
  const activeMatch = isMobile
    ? mutualMatches.find((m) => m.id === activeMatchId)
    : mutualMatches.find((m) => m.id === activeMatchId) || mutualMatches[0];
  const showConversation = !isMobile || Boolean(activeMatch);
  const showSidebar = !isMobile || !activeMatch;

  const clearActiveMatch = () => {
    setSelectedMatchId(undefined);
    const next = new URLSearchParams(searchParams);
    next.delete('match');
    setSearchParams(next);
  };
  const activeMessages = useMemo(
    () => messages.filter((m) => m.matchId === activeMatch?.id),
    [messages, activeMatch?.id],
  );

  // Sort sidebar by most recent activity (last message time). Matches without messages float to top of the unstarted list.
  const orderedMatches = useMemo(() => {
    const decorated = mutualMatches.map((match) => {
      const last = lastMessageFor(messages, match.id);
      return {
        match,
        last,
        rank: last ? parseTimeToMinutes(last.time) : -1,
      };
    });
    decorated.sort((a, b) => b.rank - a.rank);
    return decorated;
  }, [mutualMatches, messages]);

  const visibleMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orderedMatches;
    return orderedMatches.filter(({ match }) => (
      match.name.toLowerCase().includes(q)
      || match.playlist.toLowerCase().includes(q)
    ));
  }, [orderedMatches, query]);

  // Group consecutive messages by sender for cleaner threading.
  const grouped = useMemo(() => {
    return activeMessages.map((m, i) => {
      const prev = activeMessages[i - 1];
      const next = activeMessages[i + 1];
      const sameAsPrev = prev?.from === m.from;
      const sameAsNext = next?.from === m.from;
      const position: 'solo' | 'first' | 'middle' | 'last' = !sameAsPrev && !sameAsNext
        ? 'solo'
        : !sameAsPrev && sameAsNext
        ? 'first'
        : sameAsPrev && sameAsNext
        ? 'middle'
        : 'last';
      return {
        message: m,
        position,
        showAvatar: position === 'solo' || position === 'last',
        showTimestamp: position === 'solo' || position === 'last',
      };
    });
  }, [activeMessages]);

  const handleSend = () => {
    const body = draft.trim();
    if (!body) return;
    sendMessage(body, activeMatch?.id);
    setDraft('');
  };

  useEffect(() => {
    const node = messageScrollRef.current;
    if (node) {
      requestAnimationFrame(() => {
        node.scrollTop = node.scrollHeight;
      });
    }
  }, [activeMessages.length, typingMatchId, activeMatch?.id]);

  if (mutualMatches.length === 0) {
    return (
      <Box>
        <Typography variant="h3">Chat</Typography>
        <Typography color="text.secondary" sx={{ mb: 2.5 }}>
          Chat unlocks when you and another listener both like each other.
        </Typography>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 1 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>No conversations yet.</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Head to Discover and like a few profiles. When someone likes you back, you'll be able to talk here.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/discover')}>Open Discover</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, mb: 2.5 }}>
        <Box>
          <Typography variant="h3">Chat</Typography>
          <Typography color="text.secondary">
            Keep the conversation close to the music that started it.
          </Typography>
        </Box>
        <Chip
          color="primary"
          variant="outlined"
          label={`${mutualMatches.length} match${mutualMatches.length === 1 ? '' : 'es'}`}
          sx={{ fontWeight: 800, mt: { xs: 1.5, sm: 0 } }}
        />
      </Stack>

      <Paper
        sx={{
          height: {
            xs: nowPlaying ? 'calc(100dvh - 280px)' : 'calc(100dvh - 168px)',
            md: 680,
          },
          minHeight: { xs: 420, md: 680 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
          gridTemplateRows: '1fr',
          overflow: 'hidden',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
        }}
      >
        {showSidebar && (
        <Box
          sx={{
            borderRight: { md: 1 },
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ p: 1.5 }}>
            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                px: 1.2,
                py: 0.6,
                borderRadius: 1,
                bgcolor: 'action.hover',
              }}
            >
              <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
              <InputBase
                fullWidth
                placeholder="Search matches"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                sx={{ fontSize: 14 }}
              />
            </Stack>
          </Box>
          <Divider />
          <List
            disablePadding
            sx={{
              overflowY: 'auto',
              flex: 1,
              minHeight: 0,
            }}
          >
            {visibleMatches.map(({ match, last }) => (
              <SidebarItem
                key={match.id}
                match={match}
                lastMessage={last}
                active={match.id === activeMatch?.id}
                onSelect={() => {
                  setSelectedMatchId(match.id);
                  setSearchParams({ match: match.id });
                }}
              />
            ))}
            {visibleMatches.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No matches match your search.
              </Typography>
            )}
          </List>
        </Box>
        )}

        {showConversation && (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
          {/* Header */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: 'center',
              p: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              minWidth: 0,
            }}
          >
            {isMobile && (
              <IconButton
                onClick={clearActiveMatch}
                size="small"
                aria-label="Back to matches"
                sx={{ flexShrink: 0, ml: -0.5 }}
              >
                <ArrowBackRoundedIcon />
              </IconButton>
            )}
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
              sx={{
                '& .MuiBadge-dot': {
                  bgcolor: 'success.main',
                  border: 2,
                  borderColor: 'background.paper',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                },
              }}
            >
              <Avatar src={activeMatch?.image} sx={{ width: 44, height: 44 }} />
            </Badge>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }} noWrap>
                {activeMatch?.name || 'No match selected'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {activeMatch?.score ?? 0}% match · {activeMatch?.playlist || 'their playlist'}
              </Typography>
            </Box>
            <Tooltip title="Open their playlist">
              <span>
                <IconButton
                  onClick={() => activeMatch && navigate(`/playlists?q=${encodeURIComponent(activeMatch.playlist)}`)}
                  disabled={!activeMatch}
                  size="small"
                  sx={{
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    flexShrink: 0,
                  }}
                >
                  <QueueMusicRoundedIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          {/* Message scroller */}
          <Box
            ref={messageScrollRef}
            sx={{
              flex: 1,
              px: { xs: 1.25, sm: 2.5 },
              py: 2,
              minHeight: 0,
              overflowY: 'auto',
              bgcolor: 'action.hover',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.4,
            }}
          >
            {activeMessages.length === 0 ? (
              <EmptyThread match={activeMatch} />
            ) : (
              grouped.map(({ message, position, showAvatar, showTimestamp }) => (
                <MessageRow
                  key={message.id}
                  message={message}
                  onReact={(emoji) => reactToMessage(message.id, emoji)}
                  groupPosition={position}
                  showAvatar={showAvatar}
                  showTimestamp={showTimestamp}
                  partnerAvatar={activeMatch?.image}
                />
              ))
            )}
            {typingMatchId && typingMatchId === activeMatch?.id && (
              <Box sx={{ mt: 0.5 }}>
                <TypingDots avatar={activeMatch?.image} />
              </Box>
            )}
          </Box>

          {/* Composer */}
          <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                maxRows={5}
                placeholder="Send a song, a thought, or both"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  // Skip Enter while an IME composition is active so CJK input
                  // doesn't accidentally send half a word.
                  const composing = (event.nativeEvent as KeyboardEvent).isComposing
                    || (event as unknown as { keyCode: number }).keyCode === 229;
                  if (event.key === 'Enter' && !event.shiftKey && !composing) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                slotProps={{
                  input: {
                    sx: {
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                      px: 1.5,
                      py: 0.6,
                      fontSize: 14,
                    },
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!draft.trim()}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'primary.dark' },
                  '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
                  width: 42,
                  height: 42,
                }}
                aria-label="Send message"
              >
                <SendRoundedIcon />
              </IconButton>
            </Stack>
          </Box>
        </Box>
        )}
      </Paper>
    </Box>
  );
};

type SidebarItemProps = {
  match: Match;
  lastMessage?: ChatMessage;
  active: boolean;
  onSelect: () => void;
};

const SidebarItem: React.FC<SidebarItemProps> = ({ match, lastMessage, active, onSelect }) => {
  const preview = lastMessage
    ? `${lastMessage.from === 'You' ? 'You: ' : ''}${lastMessage.body}`
    : 'Say hi to start the conversation.';

  return (
    <ListItemButton
      selected={active}
      onClick={onSelect}
      sx={{
        py: 1.2,
        px: 1.5,
        gap: 1,
        alignItems: 'flex-start',
        minWidth: 0,
        '&.Mui-selected': { bgcolor: 'action.selected' },
      }}
    >
      <ListItemAvatar sx={{ minWidth: 'auto', mr: 0 }}>
        <Avatar src={match.image} variant="rounded" sx={{ width: 42, height: 42 }} />
      </ListItemAvatar>
      <ListItemText
        sx={{ minWidth: 0, m: 0 }}
        primary={
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 14, minWidth: 0 }} noWrap>
              {match.name}
            </Typography>
            {lastMessage && (
              <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                {lastMessage.time}
              </Typography>
            )}
          </Stack>
        }
        secondary={
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: 12.5,
            }}
          >
            {preview}
          </Typography>
        }
      />
    </ListItemButton>
  );
};

const EmptyThread: React.FC<{ match?: Match }> = ({ match }) => (
  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 6, px: 2 }}>
    <Avatar src={match?.image} sx={{ width: 64, height: 64, mb: 1.5 }} />
    <Typography variant="h6" sx={{ mb: 0.5 }}>
      {match ? `You matched with ${match.name}` : 'Pick a conversation'}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340 }}>
      {match
        ? `Send the first message. They lean toward ${match.taste.split(',').slice(0, 2).join(' and ') || 'similar artists'}.`
        : 'Choose a match from the list to start chatting.'}
    </Typography>
  </Box>
);

export default Chat;

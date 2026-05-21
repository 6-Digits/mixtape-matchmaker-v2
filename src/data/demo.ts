import headphones from '../assets/headphones.jpg';
import connect from '../assets/connect.jpg';
import rings from '../assets/rings.jpg';
import jasonProfile from '../assets/jason_profile.jpg';
import farhanProfile from '../assets/farhan_profile.jpg';
import darrenProfile from '../assets/darren_profile.png';

function avatar(name: string, bg: string) {
  // Using Dicebear's Micah style for animated cartoon personalities
  return `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(name)}&backgroundColor=${bg.replace('#', '')}`;
}

const ninaProfile = avatar('Nina', '#ec407a');
const mayaProfile = avatar('Maya', '#7c3aed');
const alexProfile = avatar('Alex', '#0f766e');
const samProfile = avatar('Sam', '#2563eb');
const lenaProfile = avatar('Lena', '#be123c');
const jordanProfile = avatar('Jordan', '#f97316');
const priyaProfile = avatar('Priya', '#0ea5e9');
const theoProfile = avatar('Theo', '#16a34a');
const irisProfile = avatar('Iris', '#a855f7');
const quinnProfile = avatar('Quinn', '#f59e0b');
const rileyProfile = avatar('Riley', '#14b8a6');

export type Playlist = {
  id: string;
  title: string;
  description: string;
  image: string;
  songs: Song[];
  duration: string;
  likes: number;
  tag: string;
  owner: string;
  comments: PlaylistComment[];
};

export type Song = {
  title: string;
  artist: string;
  album: string;
  year: number;
  duration: string;
};

export type Match = {
  id: string;
  name: string;
  image: string;
  score: number;
  taste: string;
  playlist: string;
  bio?: string;
  location?: string;
  lookingFor?: string;
  favoriteTrack?: string;
  profileTags?: string[];
  /** They liked you — appears in your "Likes you" inbox until you decide. */
  theyLikedYou?: boolean;
  /** You liked them — waiting on their response unless they also liked you. */
  youLiked?: boolean;
  /** Mutual = theyLikedYou && youLiked. Derived helpers below. */
  passed?: boolean;
  /** Deprecated, kept for migration off old data. */
  status?: 'new' | 'liked' | 'passed';
};

export function isMutualMatch(m: Match) {
  return Boolean(m.theyLikedYou && m.youLiked) && !m.passed;
}
export function isInLikesInbox(m: Match) {
  return Boolean(m.theyLikedYou) && !m.youLiked && !m.passed;
}
export function isInDiscover(m: Match) {
  return !m.theyLikedYou && !m.youLiked && !m.passed;
}
export function isWaitingOnThem(m: Match) {
  return Boolean(m.youLiked) && !m.theyLikedYou && !m.passed;
}

export type ChatMessage = {
  id: string;
  matchId: string;
  from: string;
  body: string;
  time: string;
  reaction?: string;
};

export type PlaylistComment = {
  id: string;
  user: string;
  avatar: string;
  body: string;
  likes: number;
};

export const playlists: Playlist[] = [
  {
    id: 'city-lights',
    title: 'City Lights, Side A',
    description: 'Late-night synth-pop, disco edges, and songs that make a walk home feel cinematic.',
    image: headphones,
    songs: [
      { title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We’re Dreaming', year: 2011, duration: '4:03' },
      { title: 'Everything Is Embarrassing', artist: 'Sky Ferreira', album: 'Ghost', year: 2012, duration: '4:09' },
      { title: 'The Less I Know the Better', artist: 'Tame Impala', album: 'Currents', year: 2015, duration: '3:36' },
      { title: 'Dancing On My Own', artist: 'Robyn', album: 'Body Talk Pt. 1', year: 2010, duration: '4:48' },
      { title: 'A Real Hero', artist: 'College & Electric Youth', album: 'A Real Hero', year: 2010, duration: '4:27' },
      { title: 'Oblivion', artist: 'Grimes', album: 'Visions', year: 2012, duration: '4:11' },
      { title: 'Genesis', artist: 'Grimes', album: 'Visions', year: 2012, duration: '4:15' },
      { title: 'Safe and Sound', artist: 'Capital Cities', album: 'In a Tidal Wave of Mystery', year: 2013, duration: '3:12' },
      { title: 'Instant Crush', artist: 'Daft Punk feat. Julian Casablancas', album: 'Random Access Memories', year: 2013, duration: '5:37' },
      { title: 'Heartbeats', artist: 'The Knife', album: 'Deep Cuts', year: 2003, duration: '3:52' },
      { title: 'Kids', artist: 'MGMT', album: 'Oracular Spectacular', year: 2007, duration: '5:03' },
      { title: 'Electric Love', artist: 'BØRNS', album: 'Dopamine', year: 2015, duration: '3:38' },
    ],
    duration: '51m',
    likes: 248,
    tag: 'Popular',
    owner: 'Maya',
    comments: [
      { id: 'c-city-1', user: 'Jason', avatar: jasonProfile, body: 'This opener still feels huge at night.', likes: 12 },
      { id: 'c-city-2', user: 'Maya', avatar: mayaProfile, body: 'Robyn into Electric Youth is the point of the mix.', likes: 8 },
    ],
  },
  {
    id: 'golden-hour',
    title: 'Golden Hour Crush',
    description: 'Warm guitars, easy hooks, and a soft landing after a long week.',
    image: rings,
    songs: [
      { title: 'Sweet Disposition', artist: 'The Temper Trap', album: 'Conditions', year: 2008, duration: '3:54' },
      { title: 'Pink + White', artist: 'Frank Ocean', album: 'Blonde', year: 2016, duration: '3:05' },
      { title: 'Japanese Denim', artist: 'Daniel Caesar', album: 'Get You - Single', year: 2016, duration: '4:30' },
      { title: 'Nights', artist: 'Frank Ocean', album: 'Blonde', year: 2016, duration: '5:07' },
      { title: 'Good Days', artist: 'SZA', album: 'Good Days', year: 2020, duration: '4:39' },
      { title: 'Redbone', artist: 'Childish Gambino', album: 'Awaken, My Love!', year: 2016, duration: '5:27' },
      { title: 'Cranes in the Sky', artist: 'Solange', album: 'A Seat at the Table', year: 2016, duration: '4:10' },
      { title: 'Get You', artist: 'Daniel Caesar feat. Kali Uchis', album: 'Freudian', year: 2017, duration: '4:38' },
      { title: 'Super Rich Kids', artist: 'Frank Ocean feat. Earl Sweatshirt', album: 'channel ORANGE', year: 2012, duration: '5:04' },
      { title: 'Come Through and Chill', artist: 'Miguel feat. J. Cole', album: 'War & Leisure', year: 2017, duration: '5:22' },
      { title: 'Garden (Say It Like Dat)', artist: 'SZA', album: 'Ctrl', year: 2017, duration: '3:28' },
      { title: 'Best Part', artist: 'Daniel Caesar feat. H.E.R.', album: 'Freudian', year: 2017, duration: '3:29' },
    ],
    duration: '53m',
    likes: 181,
    tag: 'Shared',
    owner: 'Alex',
    comments: [
      { id: 'c-gold-1', user: 'Farhan', avatar: farhanProfile, body: 'Pink + White belongs exactly here.', likes: 15 },
      { id: 'c-gold-2', user: 'Alex', avatar: alexProfile, body: 'This one is built for sunset walks.', likes: 6 },
    ],
  },
  {
    id: 'first-date',
    title: 'First Date Nerves',
    description: 'Indie soul, flirty basslines, and enough confidence to text first.',
    image: connect,
    songs: [
      { title: 'Electric Feel', artist: 'MGMT', album: 'Oracular Spectacular', year: 2007, duration: '3:49' },
      { title: 'Come a Little Closer', artist: 'Cage the Elephant', album: 'Melophobia', year: 2013, duration: '3:49' },
      { title: 'Tongue Tied', artist: 'Grouplove', album: 'Never Trust a Happy Song', year: 2011, duration: '3:38' },
      { title: 'Cigarette Daydreams', artist: 'Cage the Elephant', album: 'Melophobia', year: 2013, duration: '3:28' },
      { title: 'Lisztomania', artist: 'Phoenix', album: 'Wolfgang Amadeus Phoenix', year: 2009, duration: '4:02' },
      { title: 'Take a Walk', artist: 'Passion Pit', album: 'Gossamer', year: 2012, duration: '4:24' },
      { title: 'Pumped Up Kicks', artist: 'Foster the People', album: 'Torches', year: 2011, duration: '3:59' },
      { title: 'Anna Sun', artist: 'Walk the Moon', album: 'Walk the Moon', year: 2012, duration: '5:21' },
      { title: 'Oxford Comma', artist: 'Vampire Weekend', album: 'Vampire Weekend', year: 2008, duration: '3:15' },
      { title: 'R U Mine?', artist: 'Arctic Monkeys', album: 'AM', year: 2013, duration: '3:21' },
      { title: 'Do I Wanna Know?', artist: 'Arctic Monkeys', album: 'AM', year: 2013, duration: '4:32' },
      { title: 'Float On', artist: 'Modest Mouse', album: 'Good News for People Who Love Bad News', year: 2004, duration: '3:28' },
    ],
    duration: '47m',
    likes: 312,
    tag: 'Match',
    owner: 'Sam',
    comments: [
      { id: 'c-date-1', user: 'Darren', avatar: darrenProfile, body: 'Electric Feel is doing a lot of work here.', likes: 9 },
      { id: 'c-date-2', user: 'Sam', avatar: samProfile, body: 'It is nervous in a charming way.', likes: 5 },
    ],
  },
  {
    id: 'make-memories',
    title: 'Make More Memories',
    description: 'Big choruses, camera-roll nostalgia, and songs built for the ride back.',
    image: headphones,
    songs: [
      { title: 'Mr. Brightside', artist: 'The Killers', album: 'Hot Fuss', year: 2003, duration: '3:42' },
      { title: 'Dog Days Are Over', artist: 'Florence + The Machine', album: 'Lungs', year: 2009, duration: '4:13' },
      { title: 'Young Folks', artist: 'Peter Bjorn and John', album: 'Writer’s Block', year: 2006, duration: '4:39' },
      { title: '1901', artist: 'Phoenix', album: 'Wolfgang Amadeus Phoenix', year: 2009, duration: '3:13' },
      { title: 'Somebody Else', artist: 'The 1975', album: 'I Like It When You Sleep...', year: 2016, duration: '5:47' },
      { title: 'Use Somebody', artist: 'Kings of Leon', album: 'Only by the Night', year: 2008, duration: '3:51' },
      { title: 'Ho Hey', artist: 'The Lumineers', album: 'The Lumineers', year: 2012, duration: '2:43' },
      { title: 'Little Talks', artist: 'Of Monsters and Men', album: 'My Head Is an Animal', year: 2011, duration: '4:26' },
      { title: 'Home', artist: 'Edward Sharpe & The Magnetic Zeros', album: 'Up from Below', year: 2009, duration: '5:06' },
      { title: 'Dog Days Are Over', artist: 'Florence + The Machine', album: 'Lungs', year: 2009, duration: '4:13' },
      { title: 'Sweet Nothing', artist: 'Calvin Harris feat. Florence Welch', album: '18 Months', year: 2012, duration: '3:33' },
      { title: 'The Sound', artist: 'The 1975', album: 'I Like It When You Sleep...', year: 2016, duration: '4:08' },
    ],
    duration: '50m',
    likes: 207,
    tag: 'Classic',
    owner: 'Jordan',
    comments: [
      { id: 'c-memory-1', user: 'Nina', avatar: ninaProfile, body: 'Mr. Brightside still wins the room.', likes: 22 },
      { id: 'c-memory-2', user: 'Lena', avatar: lenaProfile, body: 'The 1975 closer makes this less obvious.', likes: 4 },
    ],
  },
];

export const matches: Match[] = [
  // — Mutual matches (you can chat) —
  {
    id: 'jason',
    name: 'Jason',
    image: jasonProfile,
    score: 94,
    taste: 'M83, Robyn, Tame Impala, Phoenix',
    playlist: 'City Lights, Side A',
    bio: 'Night walks, sharp hooks, and a playlist that starts cinematic before it gets sentimental.',
    location: 'Los Angeles',
    lookingFor: 'Someone who notices transitions between songs.',
    favoriteTrack: 'Midnight City',
    profileTags: ['Synth-pop', 'Night drives', 'Big choruses'],
    theyLikedYou: true,
    youLiked: true,
  },
  {
    id: 'farhan',
    name: 'Farhan',
    image: farhanProfile,
    score: 89,
    taste: 'Frank Ocean, SZA, Daniel Caesar',
    playlist: 'Golden Hour Crush',
    bio: 'Soft vocals, sunset pacing, and R&B that leaves room for a long conversation.',
    location: 'San Diego',
    lookingFor: 'Trading slow-burn albums and weekend coffee spots.',
    favoriteTrack: 'Pink + White',
    profileTags: ['R&B', 'Warm guitars', 'Sunday reset'],
    theyLikedYou: true,
    youLiked: true,
  },
  // — Likes you (in your inbox, you haven't decided) —
  {
    id: 'darren',
    name: 'Darren',
    image: darrenProfile,
    score: 86,
    taste: 'MGMT, Cage the Elephant, Grouplove',
    playlist: 'First Date Nerves',
    bio: 'Indie hooks, a little chaos, and enough confidence to send the first message.',
    location: 'Long Beach',
    lookingFor: 'A first-date playlist that is charming without trying too hard.',
    favoriteTrack: 'Electric Feel',
    profileTags: ['Indie pop', 'Flirty basslines', 'Dive bars'],
    theyLikedYou: true,
  },
  {
    id: 'new',
    name: 'Nina',
    image: ninaProfile,
    score: 78,
    taste: 'The Killers, Florence + The Machine, The 1975',
    playlist: 'Make More Memories',
    bio: 'Camera-roll nostalgia, loud singalongs, and songs that make errands feel like scenes.',
    location: 'Pasadena',
    lookingFor: 'Someone who still believes in a perfect road-trip chorus.',
    favoriteTrack: 'Mr. Brightside',
    profileTags: ['Nostalgia', 'Road trips', 'Festival energy'],
    theyLikedYou: true,
  },
  // — Discover (neither side has acted) —
  {
    id: 'maya-match',
    name: 'Maya',
    image: mayaProfile,
    score: 91,
    taste: 'Robyn, M83, Sky Ferreira',
    playlist: 'City Lights, Side A',
    bio: 'Neon pop maximalist. I care deeply about the first three songs of any mix.',
    location: 'Silver Lake',
    lookingFor: 'Late-night walks and very specific synth textures.',
    favoriteTrack: 'Dancing On My Own',
    profileTags: ['Dance-pop', 'Neon', 'After hours'],
  },
  {
    id: 'alex-match',
    name: 'Alex',
    image: alexProfile,
    score: 84,
    taste: 'SZA, Frank Ocean, The Temper Trap',
    playlist: 'Golden Hour Crush',
    bio: 'Mostly mellow, secretly dramatic. I build playlists like they have weather.',
    location: 'Oakland',
    lookingFor: 'Album people, not just single people.',
    favoriteTrack: 'Good Days',
    profileTags: ['Alt R&B', 'Golden hour', 'Slow burn'],
  },
  {
    id: 'sam-match',
    name: 'Sam',
    image: samProfile,
    score: 81,
    taste: 'Phoenix, MGMT, The Postal Service',
    playlist: 'First Date Nerves',
    bio: 'Indie sleaze historian with a soft spot for songs that sound like borrowed jackets.',
    location: 'Echo Park',
    lookingFor: 'A low-pressure first drink and a high-stakes aux handoff.',
    favoriteTrack: 'Lisztomania',
    profileTags: ['Indie', '2000s', 'First dates'],
  },
  {
    id: 'lena-match',
    name: 'Lena',
    image: lenaProfile,
    score: 88,
    taste: 'Yeah Yeah Yeahs, Arcade Fire, Grizzly Bear',
    playlist: 'My Real Mix',
    bio: 'Tender guitars, dramatic drums, and a belief that every playlist needs one left turn.',
    location: 'Highland Park',
    lookingFor: 'Someone who likes a messy middle section.',
    favoriteTrack: 'Maps',
    profileTags: ['Indie rock', 'Deep cuts', 'Mixtapes'],
  },
  {
    id: 'jordan-match',
    name: 'Jordan',
    image: jordanProfile,
    score: 83,
    taste: 'The Killers, The Lumineers, Florence + The Machine',
    playlist: 'Make More Memories',
    bio: 'Big-hearted playlist maker. I want the chorus to arrive before I overthink it.',
    location: 'Santa Monica',
    lookingFor: 'Beach drives, loud hooks, and no shame about repeat listens.',
    favoriteTrack: 'Dog Days Are Over',
    profileTags: ['Anthems', 'Beach drives', 'Feel-good'],
  },
  {
    id: 'priya-match',
    name: 'Priya',
    image: priyaProfile,
    score: 90,
    taste: 'Solange, SZA, Childish Gambino',
    playlist: 'Golden Hour Crush',
    bio: 'I like playlists that breathe. Bonus points for a bassline that feels expensive.',
    location: 'Culver City',
    lookingFor: 'Someone who can talk production details without killing the mood.',
    favoriteTrack: 'Cranes in the Sky',
    profileTags: ['Soul', 'Production nerd', 'Warm nights'],
  },
  {
    id: 'theo-match',
    name: 'Theo',
    image: theoProfile,
    score: 76,
    taste: 'Vampire Weekend, Arctic Monkeys, Modest Mouse',
    playlist: 'First Date Nerves',
    bio: 'Former blog-rock kid, current playlist tinkerer. I still sequence for side A and side B.',
    location: 'Glendale',
    lookingFor: 'Dry humor, good headphones, and a strong opener.',
    favoriteTrack: 'Oxford Comma',
    profileTags: ['Blog rock', 'Witty lyrics', 'Record stores'],
  },
  {
    id: 'iris-match',
    name: 'Iris',
    image: irisProfile,
    score: 87,
    taste: 'Grimes, The Knife, Daft Punk',
    playlist: 'City Lights, Side A',
    bio: 'Electronic pop, strange textures, and songs that make the city look sharper.',
    location: 'Koreatown',
    lookingFor: 'Someone who likes dancing before dinner.',
    favoriteTrack: 'Heartbeats',
    profileTags: ['Electronic', 'Late nights', 'Sharp edges'],
  },
  {
    id: 'quinn-match',
    name: 'Quinn',
    image: quinnProfile,
    score: 79,
    taste: 'Kings of Leon, Phoenix, Peter Bjorn and John',
    playlist: 'Make More Memories',
    bio: 'I make playlists for the ride home, then pretend I did not get sentimental.',
    location: 'Venice',
    lookingFor: 'A person who knows when to skip and when to let it play.',
    favoriteTrack: 'Young Folks',
    profileTags: ['Road songs', 'Hooks', 'Nostalgia'],
  },
  {
    id: 'riley-match',
    name: 'Riley',
    image: rileyProfile,
    score: 85,
    taste: 'Robyn, Capital Cities, College',
    playlist: 'City Lights, Side A',
    bio: 'I like dance songs with a little ache in them. Best listened to while walking fast.',
    location: 'Downtown LA',
    lookingFor: 'Someone with a good walking pace and a better queue.',
    favoriteTrack: 'A Real Hero',
    profileTags: ['Dance floor', 'Cinematic', 'City walks'],
  },
];

export const messages: ChatMessage[] = [
  { id: 'm-jason-1', matchId: 'jason', from: 'Jason', body: 'Opening with “Midnight City” and then “Everything Is Embarrassing” is very strong.', time: '9:41 AM' },
  { id: 'm-jason-2', matchId: 'jason', from: 'You', body: 'I wanted the playlist to feel like walking home after the lights come on.', time: '9:43 AM' },
  { id: 'm-jason-3', matchId: 'jason', from: 'Jason', body: 'It works. I’m sending back Robyn, Phoenix, and maybe “A Real Hero.”', time: '9:44 AM' },
  { id: 'm-farhan-1', matchId: 'farhan', from: 'Farhan', body: 'Your Golden Hour mix made me replay “Japanese Denim.”', time: '10:12 AM' },
];

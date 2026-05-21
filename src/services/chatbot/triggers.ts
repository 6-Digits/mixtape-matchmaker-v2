export const POSITIVE = ['love', 'great', 'amazing', 'perfect', 'good', 'nice', 'beautiful', 'incredible', 'banger', 'fire', 'underrated', 'gem', 'classic'];
export const NEGATIVE = ['hate', 'bad', 'boring', 'terrible', 'overrated', 'meh', 'awful', 'skip', 'mid'];
export const GREETINGS = ['hi', 'hey', 'hello', 'yo', 'sup', "what's up", 'whats up', 'hiya', 'morning', 'evening'];
export const FAREWELLS = ['bye', 'gtg', 'goodnight', 'good night', 'later', 'ttyl', 'cya', 'peace'];
export const THANKS = ['thanks', 'thank you', 'ty', 'thx', 'appreciate', 'tysm'];
export const AGREES = ['agreed', 'same', 'exactly', 'right', 'true', 'fr', 'for real', 'word'];
export const DISCLOSURES = ['i feel', "i'm", 'i am', 'i was', "i've been", 'ive been', 'i had', 'i can\'t', 'i cant'];
export const LAUGHS = ['lol', 'lmao', 'haha', 'hehe', 'lmaoo'];
export const RECOMMEND = ['recommend', 'suggestion', 'suggest', 'what should', 'any songs', 'any tracks', 'put me on', 'rec me', 'rec'];
export const OPINION_PROMPTS = ['what do you think', 'thoughts', 'your take', 'do you like', 'do you love', 'what about'];
export const PROFILE_PROMPTS = ['tell me about yourself', 'about you', 'your profile', 'who are you', 'what are you looking for', 'looking for'];
export const DATE_PROMPTS = ['date', 'coffee', 'drink', 'meet', 'hang', 'plans', 'weekend'];
export const WHY_MATCH = ['why did we match', 'why match', 'matched', 'compatibility', 'overlap', 'score'];
export const MUSIC_ACTIVITY = ['listening to', 'playing', 'queue', 'queued', 'currently listening', 'on repeat', 'just heard'];
export const FLIRTY = ['cute', 'flirt', 'crush', 'you seem', 'you sound', 'your vibe', 'into you', 'chemistry'];
export const APOLOGY = ['sorry', 'my bad', 'apologize', 'apology', 'didn\'t mean', 'didnt mean'];
export const CHECK_IN = ['how are you', 'how was your day', 'how are things', 'you okay', 'how you doing', 'how is your day'];
export const UNCERTAINTY = ['not sure', 'idk', 'i don\'t know', 'i dont know', 'maybe', 'confused', 'unsure'];
export const DEEP_QUESTION = ['biggest fear', 'dream', 'childhood', 'memory', 'miss', 'regret', 'believe in', 'important to you'];
export const WEATHER_TIME = ['rain', 'raining', 'sunny', 'cold', 'hot', 'morning', 'night', 'late', 'early', 'weather'];
export const COMPLIMENT = ['you have good taste', 'great taste', 'love your taste', 'your playlist is', 'you are funny', 'you\'re funny', 'you seem cool'];
export const TEASING = ['roast', 'judge me', 'be honest', 'hot take', 'controversial', 'red flag', 'green flag'];
export const BOUNDARY = ['too much', 'too soon', 'uncomfortable', 'slow down', 'pressure', 'weird'];
export const DEFENSIVE = [
  'are you judging me',
  'bad take',
  'don\'t judge',
  'dont judge',
  'not my fault',
  'stop judging',
  'that was rude',
  'that\'s rude',
  'thats rude',
  'why are you coming at me',
  'why would you say that',
  'you always',
  'you never',
  'you started it',
  'you\'re being unfair',
  'youre being unfair',
];
export const HOSTILE = [
  'annoying',
  'asshole',
  'fuck you',
  'idiot',
  'leave me alone',
  'shut up',
  'stupid',
  'trash take',
  'you suck',
  'you\'re wrong',
  'youre wrong',
];
export const ASK_ME = ['ask me', 'ask something', 'question for me', 'your turn', 'what do you want to know'];
export const CHANGE_TOPIC = ['anyway', 'change topic', 'different topic', 'random question', 'also'];
export const LYRIC_MOMENT = ['lyrics', 'line', 'verse', 'chorus', 'bridge', 'hook', 'drop', 'production', 'bassline', 'drums', 'synth'];

export const MOOD_WORDS: Record<string, string[]> = {
  chill: ['chill', 'relax', 'calm', 'mellow', 'sleepy', 'quiet', 'cozy', 'lofi'],
  hype: ['hype', 'pump', 'energy', 'workout', 'dance', 'party', 'loud', 'gym'],
  sad: ['sad', 'cry', 'breakup', 'lonely', 'down', 'rainy', 'blue'],
  romantic: ['love', 'romantic', 'crush', 'date', 'flirt', 'cute'],
  drive: ['drive', 'driving', 'roadtrip', 'highway', 'cruise'],
  focus: ['focus', 'study', 'work', 'coding', 'reading'],
};

export const MOOD_ARTIST_RE: Record<string, RegExp> = {
  chill: /(ocean|caesar|sza|miguel|solange|grizzly|postal|temper trap)/i,
  hype: /(mgmt|phoenix|killers|daft|capital|m83|arctic|lumineers|passion pit)/i,
  sad: /(florence|sky ferreira|frank|sza|grizzly|knife|cage)/i,
  romantic: /(daniel caesar|frank|sza|miguel|temper trap|grimes)/i,
  drive: /(killers|phoenix|m83|tame|cage|arctic|fleet)/i,
  focus: /(grimes|postal|ocean|grizzly|temper|m83)/i,
};

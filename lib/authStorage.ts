import AsyncStorage from '@react-native-async-storage/async-storage';

export type Reminder = { id: string; title: string; notes: string };
export type ReminderMap = Record<string, Reminder[]>;
export type CalendarType = 'FBLA National' | 'FBLA State' | 'FBLA Regional';
export type AllReminders = Record<CalendarType, ReminderMap>;
export type ChatMessage = {
  id: string;
  senderUsername: string;
  text: string;
  createdAt: string;
};
export type ConversationSummary = {
  conversationId: string;
  otherUsername: string;
  otherDisplayName: string;
  otherChapterName: string;
  lastMessageText: string;
  lastMessageAt: string;
};
export type ConversationDetail = {
  conversationId: string;
  otherUsername: string;
  otherDisplayName: string;
  otherChapterName: string;
  messages: ChatMessage[];
};
export type MemberDirectoryItem = {
  username: string;
  displayName: string;
  chapterName: string;
};

export type UserRecord = {
  username: string;
  password: string;
  displayName: string;
  reminders: AllReminders;
  profile?: {
    state?: string;
    school?: string;
    chapterName?: string;
    gradDate?: string; // YYYY-MM-DD
    profileImageUri?: string | null;
    duesTotal?: number;
    duesPaid?: number;
    profileComplete?: boolean;
  };
};

type UsersDb = Record<string, UserRecord>;
type ConversationRecord = {
  participants: [string, string];
  messages: ChatMessage[];
};
type MessagesDb = Record<string, ConversationRecord>;

const USERS_DB_KEY = '@fbla_users_v1';
const CURRENT_USER_KEY = '@fbla_current_user_v1';
const MESSAGES_DB_KEY = '@fbla_messages_v1';

export const emptyReminders = (): AllReminders => ({
  'FBLA National': {},
  'FBLA State': {},
  'FBLA Regional': {},
});

const normalizeUsername = (username: string) => username.trim().toLowerCase();

const loadUsersDb = async (): Promise<UsersDb> => {
  const raw = await AsyncStorage.getItem(USERS_DB_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const saveUsersDb = async (db: UsersDb) => {
  await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
};

const loadMessagesDb = async (): Promise<MessagesDb> => {
  const raw = await AsyncStorage.getItem(MESSAGES_DB_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const saveMessagesDb = async (db: MessagesDb) => {
  await AsyncStorage.setItem(MESSAGES_DB_KEY, JSON.stringify(db));
};

const buildConversationId = (usernameA: string, usernameB: string) =>
  [normalizeUsername(usernameA), normalizeUsername(usernameB)].sort().join('__');

export const signUpUser = async (username: string, password: string, displayName: string) => {
  const cleanUsername = normalizeUsername(username);
  const cleanPassword = password.trim();
  const cleanDisplayName = displayName.trim() || cleanUsername;

  if (!cleanUsername || !cleanPassword) {
    return { ok: false as const, error: 'Username and password are required.' };
  }

  const db = await loadUsersDb();
  if (db[cleanUsername]) {
    return { ok: false as const, error: 'That username already exists.' };
  }

  db[cleanUsername] = {
    username: cleanUsername,
    password: cleanPassword,
    displayName: cleanDisplayName,
    reminders: emptyReminders(),
    profile: {
      state: '',
      school: '',
      chapterName: '',
      gradDate: '',
      profileImageUri: null,
      duesTotal: 0,
      duesPaid: 0,
      profileComplete: false,
    },
  };

  await saveUsersDb(db);
  await AsyncStorage.setItem(CURRENT_USER_KEY, cleanUsername);
  return { ok: true as const };
};

export const loginUser = async (username: string, password: string) => {
  const cleanUsername = normalizeUsername(username);
  const cleanPassword = password.trim();
  const db = await loadUsersDb();
  const user = db[cleanUsername];

  if (!user || user.password !== cleanPassword) {
    return { ok: false as const, error: 'Invalid username or password.' };
  }

  await AsyncStorage.setItem(CURRENT_USER_KEY, cleanUsername);
  return { ok: true as const };
};

export const logoutUser = async () => {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = async (): Promise<UserRecord | null> => {
  const currentUsername = await AsyncStorage.getItem(CURRENT_USER_KEY);
  if (!currentUsername) return null;

  const db = await loadUsersDb();
  return db[currentUsername] ?? null;
};

export const setCurrentUserReminders = async (reminders: AllReminders) => {
  const currentUsername = await AsyncStorage.getItem(CURRENT_USER_KEY);
  if (!currentUsername) {
    throw new Error('No user is logged in.');
  }

  const db = await loadUsersDb();
  const user = db[currentUsername];
  if (!user) {
    throw new Error('Logged-in user was not found.');
  }

  db[currentUsername] = {
    ...user,
    reminders,
  };

  await saveUsersDb(db);
};

export const setCurrentUserProfile = async (profilePatch: Partial<UserRecord['profile']>) => {
  const currentUsername = await AsyncStorage.getItem(CURRENT_USER_KEY);
  if (!currentUsername) {
    throw new Error('No user is logged in.');
  }

  const db = await loadUsersDb();
  const user = db[currentUsername];
  if (!user) {
    throw new Error('Logged-in user was not found.');
  }

  db[currentUsername] = {
    ...user,
    profile: {
      ...(user.profile ?? {}),
      ...(profilePatch ?? {}),
    },
  };

  await saveUsersDb(db);
};

export const setCurrentUserDisplayName = async (displayName: string) => {
  const currentUsername = await AsyncStorage.getItem(CURRENT_USER_KEY);
  if (!currentUsername) {
    throw new Error('No user is logged in.');
  }

  const db = await loadUsersDb();
  const user = db[currentUsername];
  if (!user) {
    throw new Error('Logged-in user was not found.');
  }

  const cleanDisplayName = displayName.trim();
  db[currentUsername] = {
    ...user,
    displayName: cleanDisplayName || user.displayName,
  };

  await saveUsersDb(db);
};

export const getAllMembersDirectory = async (): Promise<MemberDirectoryItem[]> => {
  const currentUsername = await AsyncStorage.getItem(CURRENT_USER_KEY);
  const db = await loadUsersDb();

  return Object.values(db)
    .filter((user) => user.username !== currentUsername)
    .map((user) => ({
      username: user.username,
      displayName: user.displayName,
      chapterName: user.profile?.chapterName?.trim() || 'No chapter listed',
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
};

export const getCurrentUserConversations = async (): Promise<ConversationSummary[]> => {
  const currentUsername = await AsyncStorage.getItem(CURRENT_USER_KEY);
  if (!currentUsername) return [];

  const usersDb = await loadUsersDb();
  const messagesDb = await loadMessagesDb();

  const summaries = Object.entries(messagesDb)
    .filter(([, conversation]) => conversation.participants.includes(currentUsername))
    .map(([conversationId, conversation]) => {
      const otherUsername =
        conversation.participants[0] === currentUsername
          ? conversation.participants[1]
          : conversation.participants[0];
      const otherUser = usersDb[otherUsername];
      const lastMessage = conversation.messages[conversation.messages.length - 1];

      return {
        conversationId,
        otherUsername,
        otherDisplayName: otherUser?.displayName || otherUsername,
        otherChapterName: otherUser?.profile?.chapterName?.trim() || 'No chapter listed',
        lastMessageText: lastMessage?.text || '',
        lastMessageAt: lastMessage?.createdAt || '',
      };
    })
    .filter((item) => item.lastMessageAt)
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  return summaries;
};

export const getConversationWithUser = async (otherUsername: string): Promise<ConversationDetail> => {
  const currentUsername = await AsyncStorage.getItem(CURRENT_USER_KEY);
  if (!currentUsername) {
    throw new Error('No user is logged in.');
  }

  const normalizedOther = normalizeUsername(otherUsername);
  const usersDb = await loadUsersDb();
  const otherUser = usersDb[normalizedOther];

  if (!otherUser) {
    throw new Error('That member account was not found.');
  }

  const conversationId = buildConversationId(currentUsername, normalizedOther);
  const messagesDb = await loadMessagesDb();
  const conversation = messagesDb[conversationId];

  return {
    conversationId,
    otherUsername: normalizedOther,
    otherDisplayName: otherUser.displayName,
    otherChapterName: otherUser.profile?.chapterName?.trim() || 'No chapter listed',
    messages: conversation?.messages || [],
  };
};

export const sendMessageToUser = async (otherUsername: string, text: string) => {
  const currentUsername = await AsyncStorage.getItem(CURRENT_USER_KEY);
  if (!currentUsername) {
    throw new Error('No user is logged in.');
  }

  const normalizedOther = normalizeUsername(otherUsername);
  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error('Message cannot be empty.');
  }

  const usersDb = await loadUsersDb();
  if (!usersDb[normalizedOther]) {
    throw new Error('That member account was not found.');
  }

  const conversationId = buildConversationId(currentUsername, normalizedOther);
  const messagesDb = await loadMessagesDb();
  const existingConversation = messagesDb[conversationId];
  const message: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    senderUsername: currentUsername,
    text: trimmedText,
    createdAt: new Date().toISOString(),
  };

  messagesDb[conversationId] = {
    participants: existingConversation?.participants || [currentUsername, normalizedOther].sort() as [string, string],
    messages: [...(existingConversation?.messages || []), message],
  };

  await saveMessagesDb(messagesDb);
};

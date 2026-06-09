import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import { firebaseAuth, firestoreDb } from '@/lib/firebase';

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
type UserProfile = NonNullable<UserRecord['profile']>;

type UsersDb = Record<string, UserRecord>;
type ConversationRecord = {
  participants: [string, string];
  messages: ChatMessage[];
};
type MessagesDb = Record<string, ConversationRecord>;
type RemoteUserSummary = {
  uid: string;
  username: string;
  displayName: string;
  chapterName: string;
};

const USERS_DB_KEY = '@fbla_users_v1';
const CURRENT_USER_KEY = '@fbla_current_user_v1';
const MESSAGES_DB_KEY = '@fbla_messages_v1';
const LOCAL_AUTH_RESET_KEY = '@fbla_local_auth_reset_v1';
const LOCAL_AUTH_RESET_VERSION = '2026-06-09-fresh-start';

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
const buildFirestoreConversationId = (uidA: string, uidB: string) => [uidA, uidB].sort().join('__');

const defaultProfile = (): NonNullable<UserRecord['profile']> => ({
  state: '',
  school: '',
  chapterName: '',
  gradDate: '',
  profileImageUri: null,
  duesTotal: 0,
  duesPaid: 0,
  profileComplete: false,
});

const syncCurrentUserRecordToFirestore = async (user: UserRecord) => {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) return;

  const userDoc = doc(firestoreDb, 'users', uid);
  const snapshot = await getDoc(userDoc);
  const timestamps = snapshot.exists()
    ? { updatedAt: serverTimestamp() }
    : { createdAt: serverTimestamp(), updatedAt: serverTimestamp() };

  await setDoc(
    userDoc,
    {
      uid,
      email: user.username,
      displayName: user.displayName,
      reminders: user.reminders,
      profile: user.profile ?? defaultProfile(),
      ...timestamps,
    },
    { merge: true },
  );
};

const syncCurrentUserRecordToFirestoreBestEffort = async (user: UserRecord) => {
  try {
    await syncCurrentUserRecordToFirestore(user);
  } catch (error) {
    console.warn('Firebase profile sync skipped', error);
  }
};

const loadCurrentFirebaseUserRecord = async (username: string): Promise<Partial<UserRecord> | null> => {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) return null;

  try {
    const snapshot = await getDoc(doc(firestoreDb, 'users', uid));
    if (!snapshot.exists()) return null;

    const data = snapshot.data() as Partial<UserRecord>;
    return {
      displayName: typeof data.displayName === 'string' ? data.displayName : firebaseAuth.currentUser?.displayName || username,
      reminders: data.reminders ?? emptyReminders(),
      profile: data.profile ?? defaultProfile(),
    };
  } catch (error) {
    console.warn('Firebase user profile load skipped', error);
    return null;
  }
};

const currentFirebaseUid = () => {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) {
    throw new Error('No Firebase user is signed in.');
  }
  return uid;
};

const timestampToIso = (value: unknown) => {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
};

const mapRemoteUser = (uid: string, data: Record<string, any>, fallbackUsername = ''): RemoteUserSummary => ({
  uid,
  username: typeof data.email === 'string' ? data.email : fallbackUsername,
  displayName: typeof data.displayName === 'string' && data.displayName.trim() ? data.displayName : fallbackUsername,
  chapterName:
    typeof data.profile?.chapterName === 'string' && data.profile.chapterName.trim()
      ? data.profile.chapterName
      : 'No chapter listed',
});

const getRemoteUserByUsername = async (username: string): Promise<RemoteUserSummary | null> => {
  const cleanUsername = normalizeUsername(username);
  const usersSnapshot = await getDocs(query(collection(firestoreDb, 'users'), where('email', '==', cleanUsername)));
  const firstMatch = usersSnapshot.docs[0];
  if (!firstMatch) return null;

  return mapRemoteUser(firstMatch.id, firstMatch.data(), cleanUsername);
};

const getRemoteUserByUid = async (uid: string): Promise<RemoteUserSummary | null> => {
  const snapshot = await getDoc(doc(firestoreDb, 'users', uid));
  if (!snapshot.exists()) return null;

  return mapRemoteUser(snapshot.id, snapshot.data(), snapshot.id);
};

const ensureDirectConversation = async ({
  conversationId,
  currentUid,
  currentUsername,
  otherUser,
}: {
  conversationId: string;
  currentUid: string;
  currentUsername: string;
  otherUser: RemoteUserSummary;
}) => {
  const conversationDoc = doc(firestoreDb, 'conversations', conversationId);
  const conversationSnapshot = await getDoc(conversationDoc);
  if (conversationSnapshot.exists()) return conversationDoc;

  await setDoc(conversationDoc, {
    participants: [currentUid, otherUser.uid].sort(),
    participantEmails: [currentUsername, otherUser.username].sort(),
    lastMessageText: '',
    lastSenderId: currentUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return conversationDoc;
};

export const signUpUser = async (
  username: string,
  password: string,
  displayName: string,
  profilePatch: Partial<UserProfile> = {},
) => {
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

  let uid = '';

  try {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, cleanUsername, cleanPassword);
    uid = credential.user.uid;
    await updateProfile(credential.user, { displayName: cleanDisplayName });
  } catch (err) {
    const error = err as Error;
    return { ok: false as const, error: error.message || 'Unable to create Firebase account.' };
  }

  const userRecord: UserRecord = {
    username: cleanUsername,
    password: cleanPassword,
    displayName: cleanDisplayName,
    reminders: emptyReminders(),
    profile: {
      ...defaultProfile(),
      ...profilePatch,
    },
  };

  db[cleanUsername] = userRecord;
  await saveUsersDb(db);
  await AsyncStorage.setItem(CURRENT_USER_KEY, cleanUsername);

  await setDoc(doc(firestoreDb, 'users', uid), {
    uid,
    email: cleanUsername,
    displayName: cleanDisplayName,
    reminders: userRecord.reminders,
    profile: userRecord.profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).catch((error) => {
    console.warn('Firebase user profile create skipped', error);
  });

  return { ok: true as const };
};

export const loginUser = async (username: string, password: string) => {
  const cleanUsername = normalizeUsername(username);
  const cleanPassword = password.trim();

  try {
    await signInWithEmailAndPassword(firebaseAuth, cleanUsername, cleanPassword);
  } catch {
    return { ok: false as const, error: 'Invalid username or password.' };
  }

  const db = await loadUsersDb();
  const user = db[cleanUsername];
  const remoteUser = await loadCurrentFirebaseUserRecord(cleanUsername);

  if (!user) {
    db[cleanUsername] = {
      username: cleanUsername,
      password: '',
      displayName: remoteUser?.displayName || firebaseAuth.currentUser?.displayName || cleanUsername,
      reminders: remoteUser?.reminders || emptyReminders(),
      profile: remoteUser?.profile || defaultProfile(),
    };
    await saveUsersDb(db);
  } else if (remoteUser) {
    db[cleanUsername] = {
      ...user,
      displayName: remoteUser.displayName || user.displayName,
      reminders: remoteUser.reminders || user.reminders,
      profile: remoteUser.profile || user.profile,
    };
    await saveUsersDb(db);
  }

  await AsyncStorage.setItem(CURRENT_USER_KEY, cleanUsername);
  await syncCurrentUserRecordToFirestoreBestEffort(db[cleanUsername]);
  return { ok: true as const };
};

export const logoutUser = async () => {
  await signOut(firebaseAuth);
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
};

export const clearLocalAccountData = async () => {
  await signOut(firebaseAuth).catch(() => undefined);
  await AsyncStorage.multiRemove([USERS_DB_KEY, CURRENT_USER_KEY, MESSAGES_DB_KEY]);
};

export const clearLocalAccountDataOnce = async () => {
  const resetVersion = await AsyncStorage.getItem(LOCAL_AUTH_RESET_KEY);
  if (resetVersion === LOCAL_AUTH_RESET_VERSION) return;

  await clearLocalAccountData();
  await AsyncStorage.setItem(LOCAL_AUTH_RESET_KEY, LOCAL_AUTH_RESET_VERSION);
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
  await syncCurrentUserRecordToFirestoreBestEffort(db[currentUsername]);
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
  await syncCurrentUserRecordToFirestoreBestEffort(db[currentUsername]);
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
  if (firebaseAuth.currentUser) {
    await updateProfile(firebaseAuth.currentUser, { displayName: db[currentUsername].displayName }).catch(() => undefined);
  }
  await syncCurrentUserRecordToFirestoreBestEffort(db[currentUsername]);
};

export const getAllMembersDirectory = async (): Promise<MemberDirectoryItem[]> => {
  const currentUid = firebaseAuth.currentUser?.uid;
  const usersSnapshot = await getDocs(collection(firestoreDb, 'users'));

  return usersSnapshot.docs
    .filter((item) => item.id !== currentUid)
    .map((item) => {
      const user = mapRemoteUser(item.id, item.data(), item.id);
      return {
        username: user.username,
        displayName: user.displayName,
        chapterName: user.chapterName,
      };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
};

export const getCurrentUserConversations = async (): Promise<ConversationSummary[]> => {
  const currentUsername = await AsyncStorage.getItem(CURRENT_USER_KEY);
  if (!currentUsername) return [];
  const uid = currentFirebaseUid();

  const snapshot = await getDocs(query(collection(firestoreDb, 'conversations'), where('participants', 'array-contains', uid)));
  const summaries = await Promise.all(
    snapshot.docs.map(async (item) => {
      const data = item.data();
      const participants = Array.isArray(data.participants) ? data.participants : [];
      const otherUid = participants.find((participant) => participant !== uid);
      if (!otherUid) return null;
      const otherUser = await getRemoteUserByUid(otherUid);
      if (!otherUser) return null;
      return {
        conversationId: item.id,
        otherUsername: otherUser.username,
        otherDisplayName: otherUser.displayName,
        otherChapterName: otherUser.chapterName,
        lastMessageText: typeof data.lastMessageText === 'string' ? data.lastMessageText : '',
        lastMessageAt: timestampToIso(data.updatedAt ?? data.createdAt),
      };
    }),
  );

  return summaries
    .filter((item): item is ConversationSummary => item !== null)
    .filter((item) => item.lastMessageAt)
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
};

export const getConversationWithUser = async (otherUsername: string): Promise<ConversationDetail> => {
  const currentUsername = await AsyncStorage.getItem(CURRENT_USER_KEY);
  if (!currentUsername) {
    throw new Error('No user is logged in.');
  }
  const uid = currentFirebaseUid();

  const otherUser = await getRemoteUserByUsername(otherUsername);
  if (!otherUser) {
    throw new Error('That member account was not found.');
  }

  const conversationId = buildFirestoreConversationId(uid, otherUser.uid);
  await ensureDirectConversation({
    conversationId,
    currentUid: uid,
    currentUsername,
    otherUser,
  });

  const messagesSnapshot = await getDocs(
    query(collection(firestoreDb, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc')),
  );

  return {
    conversationId,
    otherUsername: otherUser.username,
    otherDisplayName: otherUser.displayName,
    otherChapterName: otherUser.chapterName,
    messages: messagesSnapshot.docs.map((item) => {
      const data = item.data();
      return {
        id: item.id,
        senderUsername: data.senderId === uid ? currentUsername : otherUser.username,
        text: typeof data.text === 'string' ? data.text : '',
        createdAt: timestampToIso(data.createdAt),
      };
    }),
  };
};

export const sendMessageToUser = async (otherUsername: string, text: string) => {
  const currentUsername = await AsyncStorage.getItem(CURRENT_USER_KEY);
  if (!currentUsername) {
    throw new Error('No user is logged in.');
  }
  const uid = currentFirebaseUid();

  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error('Message cannot be empty.');
  }

  const otherUser = await getRemoteUserByUsername(otherUsername);
  if (!otherUser) {
    throw new Error('That member account was not found.');
  }

  const conversationId = buildFirestoreConversationId(uid, otherUser.uid);
  const conversationDoc = await ensureDirectConversation({
    conversationId,
    currentUid: uid,
    currentUsername,
    otherUser,
  });
  const conversationSnapshot = await getDoc(conversationDoc);
  const timestamps = conversationSnapshot.exists()
    ? { updatedAt: serverTimestamp() }
    : { createdAt: serverTimestamp(), updatedAt: serverTimestamp() };

  await setDoc(
    conversationDoc,
    {
      participants: [uid, otherUser.uid].sort(),
      participantEmails: [currentUsername, otherUser.username].sort(),
      lastMessageText: trimmedText,
      lastSenderId: uid,
      ...timestamps,
    },
    { merge: true },
  );

  await addDoc(collection(firestoreDb, 'conversations', conversationId, 'messages'), {
    senderId: uid,
    text: trimmedText,
    createdAt: serverTimestamp(),
  });
};

import { useEffect, useMemo, useState } from 'react';
import {
  PracticeQuizEvent,
  getPracticeQuizEventByName,
  loadPracticeQuizEvents,
  loadPracticeQuizPrefs,
  persistPracticeQuizPrefs,
} from '@/models/practiceQuizModel';

export function usePracticeQuizViewModel() {
  const [events, setEvents] = useState<PracticeQuizEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lastOpenedEvent, setLastOpenedEvent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [eventList, prefs] = await Promise.all([loadPracticeQuizEvents(), loadPracticeQuizPrefs()]);
      setEvents(eventList);
      setFavorites(prefs.favorites);
      setLastOpenedEvent(prefs.lastOpenedEvent);
      setLoading(false);
    };

    void load();
  }, []);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = !query ? events : events.filter((event) => event.name.toLowerCase().includes(query));

    return [...list].sort((a, b) => {
      const aFav = favorites.includes(a.name) ? 1 : 0;
      const bFav = favorites.includes(b.name) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      return a.name.localeCompare(b.name);
    });
  }, [events, favorites, searchQuery]);

  const toggleFavorite = async (eventName: string) => {
    const updated = favorites.includes(eventName)
      ? favorites.filter((item) => item !== eventName)
      : [...favorites, eventName];

    setFavorites(updated);
    await persistPracticeQuizPrefs({
      favorites: updated,
      lastOpenedEvent,
    });
  };

  const setLastOpened = async (eventName: string) => {
    setLastOpenedEvent(eventName);
    await persistPracticeQuizPrefs({
      favorites,
      lastOpenedEvent: eventName,
    });
  };

  return {
    events: filteredEvents,
    loading,
    searchQuery,
    setSearchQuery,
    favorites,
    lastOpenedEvent,
    toggleFavorite,
    setLastOpened,
  };
}

export function usePracticeQuizViewerViewModel(eventName: string) {
  const [selectedEvent, setSelectedEvent] = useState<PracticeQuizEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const event = await getPracticeQuizEventByName(eventName);
      setSelectedEvent(event);
      setLoading(false);
    };

    if (!eventName.trim()) {
      setSelectedEvent(null);
      setLoading(false);
      return;
    }

    void load();
  }, [eventName]);

  return {
    loading,
    selectedEvent,
  };
}

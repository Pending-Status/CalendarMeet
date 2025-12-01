import { create } from 'zustand';

export type CalendarEvent = {
  id: string;
  title?: string;
  start?: string;
  end?: string | null;
  date?: string;
  type?: string;
  location?: string;
  [key: string]: unknown;
};

export type NotificationItem = {
  id?: number;
  title?: string;
  message?: string;
  type?: string;
  read?: boolean;
  createdAt?: number;
};

type StoreState = {
  events: CalendarEvent[];
  filteredEvents: CalendarEvent[];
  searchQuery: string;
  filterType: string;
  filterDate: string | null;
  notifications: NotificationItem[];
  userInterests: string[];
  setEvents: (events: CalendarEvent[]) => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (eventId: string) => void;
  setSearchQuery: (query: string) => void;
  setFilterType: (type: string) => void;
  setFilterDate: (date: string | null) => void;
  applyFilters: (events: CalendarEvent[]) => CalendarEvent[];
  clearFilters: () => void;
  addNotification: (notification: NotificationItem) => void;
  markNotificationRead: (id: number) => void;
  clearNotifications: () => void;
  getUnreadCount: () => number;
  setUserInterests: (interests: string[]) => void;
  addUserInterest: (interest: string) => void;
  removeUserInterest: (interest: string) => void;
};

export const useStore = create<StoreState>((set, get) => ({
  // Events
  events: [],
  filteredEvents: [],
  searchQuery: '',
  filterType: 'all',
  filterDate: null,

  setEvents: (events) => set({ events, filteredEvents: events }),

  addEvent: (event) =>
    set((state) => {
      const newEvents = [...state.events, event];
      return { events: newEvents, filteredEvents: get().applyFilters(newEvents) };
    }),

  updateEvent: (eventId, updates) =>
    set((state) => {
      const newEvents = state.events.map((e) => (e.id === eventId ? { ...e, ...updates } : e));
      return { events: newEvents, filteredEvents: get().applyFilters(newEvents) };
    }),

  deleteEvent: (eventId) =>
    set((state) => {
      const newEvents = state.events.filter((e) => e.id !== eventId);
      return { events: newEvents, filteredEvents: get().applyFilters(newEvents) };
    }),

  setSearchQuery: (query) =>
    set({ searchQuery: query }, false, () => {
      set({ filteredEvents: get().applyFilters(get().events) });
    }),

  setFilterType: (type) =>
    set({ filterType: type }, false, () => {
      set({ filteredEvents: get().applyFilters(get().events) });
    }),

  setFilterDate: (date) =>
    set({ filterDate: date }, false, () => {
      set({ filteredEvents: get().applyFilters(get().events) });
    }),

  applyFilters: (events) => {
    const { searchQuery, filterType, filterDate } = get();
    let filtered = [...events];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query) ||
          event.type?.toLowerCase().includes(query)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((event) => event.type === filterType);
    }

    if (filterDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date || event.start || '');
        const filterDateObj = new Date(filterDate);
        return eventDate.toDateString() === filterDateObj.toDateString();
      });
    }

    return filtered;
  },

  clearFilters: () =>
    set({
      searchQuery: '',
      filterType: 'all',
      filterDate: null,
      filteredEvents: get().events,
    }),

  // Notifications
  notifications: [],

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: notification.id ?? Date.now(), read: false, createdAt: notification.createdAt || Date.now() },
      ],
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  clearNotifications: () => set({ notifications: [] }),

  getUnreadCount: () => get().notifications.filter((n) => !n.read).length,

  // User interactions
  userInterests: [],

  setUserInterests: (interests) => set({ userInterests: interests }),

  addUserInterest: (interest) =>
    set((state) => ({
      userInterests: [...state.userInterests, interest],
    })),

  removeUserInterest: (interest) =>
    set((state) => ({
      userInterests: state.userInterests.filter((i) => i !== interest),
    })),
}));

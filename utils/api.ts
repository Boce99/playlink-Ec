
import { BEARER_TOKEN_KEY } from "@/lib/auth";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const API_URL = Constants.expoConfig?.extra?.backendUrl || "http://localhost:3000";

async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(BEARER_TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(BEARER_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  console.log(`API Request: ${options.method || "GET"} ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    console.log(`API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`API Error for ${endpoint}:`, error.message);
    throw error;
  }
}

async function authenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

// Public API methods
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: "GET" });
}

export async function apiPost<T>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : JSON.stringify({}),
  });
}

// Authenticated API methods
export async function authenticatedGet<T>(endpoint: string): Promise<T> {
  return authenticatedRequest<T>(endpoint, { method: "GET" });
}

export async function authenticatedPost<T>(endpoint: string, data?: any): Promise<T> {
  return authenticatedRequest<T>(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : JSON.stringify({}),
  });
}

export async function authenticatedPut<T>(endpoint: string, data?: any): Promise<T> {
  return authenticatedRequest<T>(endpoint, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : JSON.stringify({}),
  });
}

export async function authenticatedDelete<T>(endpoint: string): Promise<T> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const url = `${API_URL}${endpoint}`;
  console.log(`API Request: DELETE ${url}`);

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`API Error for ${endpoint}:`, error.message);
    throw error;
  }
}

// Player API endpoints
export const playerAPI = {
  // Profile & Clubs
  getProfile: () => authenticatedGet<{
    id: string;
    name: string;
    email: string;
    image?: string;
    clubs: Array<{ id: string; name: string; role: string }>;
  }>("/api/user/profile"),

  getClubs: () => authenticatedGet<Array<{
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    role: string;
  }>>("/api/user/clubs"),

  // Club Discovery
  discoverClubs: () => authenticatedGet<Array<{
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    memberCount: number;
    courtsCount: number;
    activeTournamentsCount: number;
  }>>("/api/clubs/discover"),

  joinClub: (clubId: string) => authenticatedPost<{ success: boolean; membership: any }>(`/api/clubs/${clubId}/join`),

  // Bookings
  getBookings: () => authenticatedGet<Array<{
    id: string;
    clubName: string;
    courtName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: string;
    qrCode: string;
    createdAt: string;
  }>>("/api/bookings"),

  createBooking: (data: {
    clubId: string;
    courtId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
  }) => authenticatedPost<any>("/api/bookings", data),

  cancelBooking: (bookingId: string) => authenticatedDelete<{ success: boolean }>(`/api/bookings/${bookingId}`),

  // Tournaments
  getTournaments: () => authenticatedGet<Array<{
    id: string;
    name: string;
    clubName: string;
    type: string;
    startDate: string;
    status: string;
    participants: number;
    maxParticipants: number;
  }>>("/api/tournaments"),

  joinTournament: (tournamentId: string) => authenticatedPost<{ success: boolean; request: any }>(`/api/tournaments/${tournamentId}/join`),

  getTournamentDetails: (tournamentId: string) => authenticatedGet<any>(`/api/tournaments/${tournamentId}`),

  // Rankings & Stats
  getRankings: (clubId: string) => authenticatedGet<Array<{
    rank: number;
    userId: string;
    userName: string;
    points: number;
    eloRating: number;
    wins: number;
    losses: number;
    matchesPlayed: number;
  }>>(`/api/rankings/${clubId}`),

  getUserStats: (clubId: string) => authenticatedGet<{
    points: number;
    eloRating: number;
    wins: number;
    losses: number;
    matchesPlayed: number;
    setsWon: number;
    setsLost: number;
    recentMatches: Array<{ opponent: string; result: string; date: string }>;
  }>(`/api/user/stats/${clubId}`),

  // Notifications
  getNotifications: () => authenticatedGet<Array<{
    id: string;
    type: string;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
  }>>("/api/notifications"),

  markNotificationRead: (notificationId: string) => authenticatedPut<{ success: boolean }>(`/api/notifications/${notificationId}/read`),
};

// Club Admin API endpoints
export const clubAPI = {
  // Dashboard
  getDashboard: () => authenticatedGet<{
    todayBookings: number;
    activeMembers: number;
    activeTournaments: number;
    revenue: number;
    recentActivity: Array<{ type: string; description: string; timestamp: string }>;
  }>("/api/club/dashboard"),

  // Club Info Management
  getClubInfo: () => authenticatedGet<{
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    createdAt: string;
  }>("/api/club/info"),

  updateClubInfo: (data: { name?: string; address?: string; phone?: string; email?: string }) =>
    authenticatedPut<any>("/api/club/info", data),

  // Courts
  getCourts: () => authenticatedGet<Array<{
    id: string;
    name: string;
    isActive: boolean;
    schedules: Array<{
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
      slotDurationMinutes: number;
    }>;
  }>>("/api/club/courts"),

  createCourt: (data: {
    name: string;
    isActive: boolean;
    schedules: Array<{
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
      slotDurationMinutes: number;
    }>;
  }) => authenticatedPost<any>("/api/club/courts", data),

  updateCourt: (courtId: string, data: any) => authenticatedPut<any>(`/api/club/courts/${courtId}`, data),

  deleteCourt: (courtId: string) => authenticatedDelete<{ success: boolean }>(`/api/club/courts/${courtId}`),

  // Bookings
  getBookings: () => authenticatedGet<Array<{
    id: string;
    userName: string;
    courtName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: string;
    qrCode: string;
  }>>("/api/club/bookings"),

  updateBookingStatus: (bookingId: string, status: string) => authenticatedPut<any>(`/api/club/bookings/${bookingId}/status`, { status }),

  // Tournaments
  getTournaments: () => authenticatedGet<Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    maxParticipants: number;
    currentParticipants: number;
  }>>("/api/club/tournaments"),

  createTournament: (data: {
    name: string;
    type: string;
    startDate: string;
    endDate: string;
    maxParticipants: number;
  }) => authenticatedPost<any>("/api/club/tournaments", data),

  updateTournament: (tournamentId: string, data: any) => authenticatedPut<any>(`/api/club/tournaments/${tournamentId}`, data),

  getTournamentRequests: (tournamentId: string) => authenticatedGet<Array<{
    id: string;
    userId: string;
    userName: string;
    status: string;
    createdAt: string;
  }>>(`/api/club/tournaments/${tournamentId}/requests`),

  updateTournamentRequest: (tournamentId: string, requestId: string, status: string) => 
    authenticatedPut<any>(`/api/club/tournaments/${tournamentId}/requests/${requestId}`, { status }),

  closeRegistration: (tournamentId: string) =>
    authenticatedPost<{ success: boolean; matchesCreated: number; bracket: any[] }>(
      `/api/club/tournaments/${tournamentId}/close-registration`,
      {}
    ),

  // Players
  getPlayers: () => authenticatedGet<Array<{
    id: string;
    userId: string;
    userName: string;
    email: string;
    role: string;
    joinedAt: string;
    stats: { wins: number; losses: number; matchesPlayed: number };
  }>>("/api/club/players"),

  updatePlayerRole: (userId: string, role: string) => authenticatedPut<any>(`/api/club/players/${userId}/role`, { role }),

  removePlayer: (userId: string) => authenticatedDelete<{ success: boolean }>(`/api/club/players/${userId}`),

  // Staff
  getStaff: () => authenticatedGet<Array<{
    id: string;
    userId: string;
    userName: string;
    email: string;
    role: string;
    joinedAt: string;
  }>>("/api/club/staff"),

  addStaff: (data: { userId: string; role: string }) => authenticatedPost<any>("/api/club/staff", data),

  // QR Validation
  validateQR: (qrCode: string) => authenticatedPost<{
    success: boolean;
    booking?: { id: string; userName: string; courtName: string; bookingDate: string; startTime: string; endTime: string; status: string };
    error?: string;
  }>("/api/qr/validate", { qrCode }),

  // Notifications
  sendNotification: (data: { title: string; body: string; recipientType: 'all' | 'players' | 'staff' }) =>
    authenticatedPost<{ success: boolean; notificationsSent: number }>("/api/club/notifications/send", data),

  getNotificationHistory: () => authenticatedGet<Array<{
    id: string;
    title: string;
    body: string;
    recipientType: string;
    sentAt: string;
    recipientCount: number;
  }>>("/api/club/notifications/history"),
};

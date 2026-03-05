
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
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
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
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
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
  // Club Discovery & Membership
  discoverClubs: () => authenticatedGet<Array<{
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    memberCount: number;
    courtsCount: number;
    activeTournamentsCount: number;
  }>>("/api/player/clubs/discover"),

  joinClub: (clubId: string) => authenticatedPost<{ success: boolean }>("/api/player/clubs/join", { clubId }),

  getClubs: () => authenticatedGet<Array<{
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    role: string;
  }>>("/api/player/clubs"),

  // Bookings
  getBookings: (filter?: 'upcoming' | 'past') => {
    const endpoint = filter ? `/api/player/bookings?filter=${filter}` : "/api/player/bookings";
    return authenticatedGet<Array<{
      id: string;
      clubName: string;
      courtName: string;
      bookingDate: string;
      startTime: string;
      endTime: string;
      status: string;
      qrCode: string;
      createdAt: string;
    }>>(endpoint);
  },

  getBookingDetails: (bookingId: string) => authenticatedGet<{
    id: string;
    clubName: string;
    courtName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: string;
    qrCode: string;
    createdAt: string;
  }>(`/api/player/bookings/${bookingId}`),

  createBooking: (data: {
    clubId: string;
    courtId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
  }) => authenticatedPost<{
    id: string;
    clubName: string;
    courtName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: string;
    qrCode: string;
    createdAt: string;
  }>("/api/player/bookings", data),

  cancelBooking: (bookingId: string) => authenticatedDelete<{ success: boolean }>(`/api/player/bookings/${bookingId}`),

  getCourts: (clubId: string) => authenticatedGet<Array<{
    id: string;
    name: string;
    isAvailable: boolean;
  }>>(`/api/player/clubs/${clubId}/courts`),

  getTimeSlots: (clubId: string, courtId: string, date: string) => 
    authenticatedGet<Array<{
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>>(`/api/player/clubs/${clubId}/courts/${courtId}/timeslots?date=${date}`),

  // Tournaments
  getTournaments: (clubId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (clubId) params.append('clubId', clubId);
    if (status) params.append('status', status);
    const queryString = params.toString();
    const endpoint = queryString ? `/api/player/tournaments?${queryString}` : "/api/player/tournaments";
    return authenticatedGet<Array<{
      id: string;
      name: string;
      clubName: string;
      type: string;
      status: string;
      startDate: string;
      endDate: string;
      participants: number;
      maxParticipants: number;
      description?: string;
    }>>(endpoint);
  },

  getTournamentDetails: (tournamentId: string) => authenticatedGet<{
    id: string;
    name: string;
    clubName: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    participants: number;
    maxParticipants: number;
    description?: string;
    isRegistered: boolean;
    registrationStatus?: 'pending' | 'approved' | 'rejected';
  }>(`/api/player/tournaments/${tournamentId}`),

  joinTournament: (tournamentId: string) => authenticatedPost<{ success: boolean }>(`/api/player/tournaments/${tournamentId}/join`, {}),

  // Profile & Stats
  getUserStats: (clubId: string) => authenticatedGet<{
    points: number;
    eloRating: number;
    wins: number;
    losses: number;
    matchesPlayed: number;
    setsWon: number;
    setsLost: number;
    recentMatches: Array<{ opponent: string; result: string; date: string }>;
  }>(`/api/player/stats?clubId=${clubId}`),

  getRankings: (clubId: string) => authenticatedGet<Array<{
    rank: number;
    userId: string;
    userName: string;
    points: number;
    eloRating: number;
    wins: number;
    losses: number;
    matchesPlayed: number;
  }>>(`/api/player/clubs/${clubId}/rankings`),

  // Notifications
  getNotifications: () => authenticatedGet<Array<{
    id: string;
    title: string;
    body: string;
    type: string;
    isRead: boolean;
    createdAt: string;
  }>>("/api/player/notifications"),

  markNotificationRead: (notificationId: string) => authenticatedPut<{ success: boolean }>(`/api/player/notifications/${notificationId}/read`, {}),
};

// Club Admin API endpoints
export const clubAPI = {
  // Dashboard
  getDashboard: (clubId: string) => authenticatedGet<{
    todayBookings: number;
    activeMembers: number;
    activeTournaments: number;
    upcomingMatches: number;
    totalCourts: number;
  }>(`/api/club/dashboard?clubId=${clubId}`),

  // Club Settings
  getClubInfo: (clubId: string) => authenticatedGet<{
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
  }>(`/api/club/info?clubId=${clubId}`),

  updateClubInfo: (clubId: string, data: { name?: string; address?: string; phone?: string; email?: string }) =>
    authenticatedPut<{
      id: string;
      name: string;
      address: string;
      phone: string;
      email: string;
    }>(`/api/club/info?clubId=${clubId}`, data),

  // Courts
  getCourts: (clubId: string) => authenticatedGet<Array<{
    id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
  }>>(`/api/club/courts?clubId=${clubId}`),

  createCourt: (clubId: string, data: { name: string; isActive: boolean }) =>
    authenticatedPost<{
      id: string;
      name: string;
      isActive: boolean;
      createdAt: string;
    }>(`/api/club/courts?clubId=${clubId}`, data),

  updateCourt: (clubId: string, courtId: string, data: { name?: string; isActive?: boolean }) =>
    authenticatedPut<{
      id: string;
      name: string;
      isActive: boolean;
      createdAt: string;
    }>(`/api/club/courts/${courtId}?clubId=${clubId}`, data),

  deleteCourt: (clubId: string, courtId: string) =>
    authenticatedDelete<{ success: boolean }>(`/api/club/courts/${courtId}?clubId=${clubId}`),

  // Bookings
  getBookings: (clubId: string, status?: string, date?: string) => {
    const params = new URLSearchParams({ clubId });
    if (status) params.append('status', status);
    if (date) params.append('date', date);
    return authenticatedGet<Array<{
      id: string;
      userName: string;
      userEmail: string;
      courtName: string;
      bookingDate: string;
      startTime: string;
      endTime: string;
      status: 'confirmed' | 'cancelled' | 'checked_in' | 'no_show' | 'completed';
      qrCode: string;
      createdAt: string;
    }>>(`/api/club/bookings?${params.toString()}`);
  },

  updateBookingStatus: (clubId: string, bookingId: string, status: 'confirmed' | 'cancelled' | 'checked_in' | 'no_show' | 'completed') =>
    authenticatedPut<{
      id: string;
      status: string;
    }>(`/api/club/bookings/${bookingId}/status?clubId=${clubId}`, { status }),

  // Tournaments
  getTournaments: (clubId: string) => authenticatedGet<Array<{
    id: string;
    name: string;
    type: 'Traditional' | 'Super 8' | 'Rey de cancha' | 'Americano';
    status: 'open' | 'closed' | 'in_progress' | 'completed';
    startDate: string;
    endDate: string;
    maxParticipants: number;
    participantCount: number;
    createdAt: string;
  }>>(`/api/club/tournaments?clubId=${clubId}`),

  createTournament: (clubId: string, data: {
    name: string;
    type: 'Traditional' | 'Super 8' | 'Rey de cancha' | 'Americano';
    startDate: string;
    endDate: string;
    maxParticipants: number;
    description?: string;
  }) => authenticatedPost<{
    id: string;
    name: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    maxParticipants: number;
    createdAt: string;
  }>(`/api/club/tournaments?clubId=${clubId}`, data),

  deleteTournament: (clubId: string, tournamentId: string) =>
    authenticatedDelete<{ success: boolean }>(`/api/club/tournaments/${tournamentId}?clubId=${clubId}`),

  getTournamentRequests: (clubId: string, tournamentId: string) =>
    authenticatedGet<Array<{
      id: string;
      userId: string;
      userName: string;
      userEmail: string;
      status: 'pending' | 'approved' | 'rejected';
      createdAt: string;
    }>>(`/api/club/tournaments/${tournamentId}/requests?clubId=${clubId}`),

  approveTournamentRequest: (clubId: string, tournamentId: string, requestId: string) =>
    authenticatedPut<{ success: boolean }>(`/api/club/tournaments/${tournamentId}/requests/${requestId}/approve?clubId=${clubId}`, {}),

  rejectTournamentRequest: (clubId: string, tournamentId: string, requestId: string) =>
    authenticatedPut<{ success: boolean }>(`/api/club/tournaments/${tournamentId}/requests/${requestId}/reject?clubId=${clubId}`, {}),

  closeRegistration: (clubId: string, tournamentId: string) =>
    authenticatedPost<{
      success: boolean;
      matchesCreated: number;
      bracket: Array<{
        matchId: string;
        round: number;
        teamA: Array<{ userId: string; userName: string }>;
        teamB: Array<{ userId: string; userName: string }>;
      }>;
    }>(`/api/club/tournaments/${tournamentId}/close-registration?clubId=${clubId}`, {}),

  // Matches
  getMatches: (clubId: string, tournamentId?: string, status?: string) => {
    const params = new URLSearchParams({ clubId });
    if (tournamentId) params.append('tournamentId', tournamentId);
    if (status) params.append('status', status);
    return authenticatedGet<Array<{
      id: string;
      tournamentId?: string;
      tournamentName?: string;
      round?: number;
      status: 'pending' | 'scheduled' | 'played' | 'verified' | 'disputed';
      teamA: Array<{ userId: string; userName: string }>;
      teamB: Array<{ userId: string; userName: string }>;
      results: Array<{ setNumber: number; teamAScore: number; teamBScore: number }>;
      createdAt: string;
    }>>(`/api/club/matches?${params.toString()}`);
  },

  recordMatchResult: (clubId: string, matchId: string, results: Array<{ setNumber: number; teamAScore: number; teamBScore: number }>) =>
    authenticatedPost<{
      id: string;
      status: string;
      results: Array<{ setNumber: number; teamAScore: number; teamBScore: number }>;
    }>(`/api/club/matches/${matchId}/result?clubId=${clubId}`, { results }),

  // Rankings
  getRankings: (clubId: string) => authenticatedGet<Array<{
    rank: number;
    userId: string;
    userName: string;
    points: number;
    eloRating: number;
    wins: number;
    losses: number;
    matchesPlayed: number;
  }>>(`/api/club/rankings?clubId=${clubId}`),

  recalculateRankings: (clubId: string) =>
    authenticatedPost<{ success: boolean }>(`/api/club/rankings/recalculate?clubId=${clubId}`, {}),

  // Players
  getPlayers: (clubId: string) => authenticatedGet<Array<{
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    role: 'player' | 'staff' | 'admin';
    joinedAt: string;
    stats: {
      points: number;
      eloRating: number;
      wins: number;
      losses: number;
      matchesPlayed: number;
    };
  }>>(`/api/club/players?clubId=${clubId}`),

  addPlayer: (clubId: string, email: string) =>
    authenticatedPost<{
      id: string;
      userId: string;
      userName: string;
      userEmail: string;
      role: string;
      joinedAt: string;
    }>(`/api/club/players?clubId=${clubId}`, { email }),

  removePlayer: (clubId: string, userId: string) =>
    authenticatedDelete<{ success: boolean }>(`/api/club/players/${userId}?clubId=${clubId}`),

  // Staff
  getStaff: (clubId: string) => authenticatedGet<Array<{
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    role: 'staff' | 'admin';
    joinedAt: string;
  }>>(`/api/club/staff?clubId=${clubId}`),

  addStaff: (clubId: string, email: string) =>
    authenticatedPost<{
      id: string;
      userId: string;
      userName: string;
      userEmail: string;
      role: string;
      joinedAt: string;
    }>(`/api/club/staff?clubId=${clubId}`, { email }),

  removeStaff: (clubId: string, userId: string) =>
    authenticatedDelete<{ success: boolean }>(`/api/club/staff/${userId}?clubId=${clubId}`),

  // Notifications
  sendNotification: (clubId: string, data: { title: string; body: string; target: 'all' | 'players' | 'staff' }) =>
    authenticatedPost<{ success: boolean; notificationsSent: number }>(`/api/club/notifications?clubId=${clubId}`, data),

  // QR Scanner
  validateQR: (clubId: string, qrCode: string) =>
    authenticatedPost<{
      success: boolean;
      booking?: {
        id: string;
        userName: string;
        courtName: string;
        startTime: string;
        endTime: string;
      };
      error?: string;
    }>(`/api/club/qr/validate?clubId=${clubId}`, { qrCode }),
};

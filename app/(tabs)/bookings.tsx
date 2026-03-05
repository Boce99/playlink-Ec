
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

interface Booking {
  id: string;
  clubName: string;
  courtName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled' | 'checked_in' | 'no_show' | 'completed';
  qrCode: string;
}

export default function BookingsScreen() {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  const loadBookings = useCallback(async () => {
    console.log('BookingsScreen: Loading bookings for user', user?.email);
    try {
      // TODO: Backend Integration - GET /api/bookings to fetch all user bookings
      
      // Mock data
      setBookings([
        {
          id: '1',
          clubName: 'Club Padel Central',
          courtName: 'Cancha 1',
          bookingDate: '2024-01-20',
          startTime: '18:00',
          endTime: '19:30',
          status: 'confirmed',
          qrCode: 'QR123456',
        },
        {
          id: '2',
          clubName: 'Padel Club Norte',
          courtName: 'Cancha 3',
          bookingDate: '2024-01-15',
          startTime: '16:00',
          endTime: '17:30',
          status: 'completed',
          qrCode: 'QR789012',
        },
      ]);
    } catch (error) {
      console.error('BookingsScreen: Error loading bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const onRefresh = useCallback(() => {
    console.log('BookingsScreen: Refreshing bookings');
    setRefreshing(true);
    loadBookings();
  }, [loadBookings]);

  const getStatusColor = (status: string) => {
    const statusColors = {
      confirmed: theme.success,
      cancelled: theme.error,
      checked_in: theme.secondary,
      no_show: theme.error,
      completed: theme.textSecondary,
    };
    return statusColors[status as keyof typeof statusColors] || theme.textSecondary;
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      checked_in: 'Check-in realizado',
      no_show: 'No asistió',
      completed: 'Completada',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filter === 'upcoming') {
      return bookingDate >= today && booking.status !== 'completed' && booking.status !== 'cancelled';
    } else {
      return bookingDate < today || booking.status === 'completed' || booking.status === 'cancelled';
    }
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Mis Reservas', headerShown: true }} />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Mis Reservas', headerShown: true }} />
      
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <View style={[styles.filterContainer, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'upcoming' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFilter('upcoming')}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === 'upcoming' ? '#FFFFFF' : theme.text },
              ]}
            >
              Próximas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'past' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFilter('past')}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === 'past' ? '#FFFFFF' : theme.text },
              ]}
            >
              Pasadas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="calendar-today"
              size={64}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {filter === 'upcoming' ? 'No tienes reservas próximas' : 'No tienes reservas pasadas'}
            </Text>
            {filter === 'upcoming' && (
              <TouchableOpacity
                style={[styles.newBookingButton, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/booking/new')}
              >
                <Text style={styles.newBookingButtonText}>Hacer una reserva</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredBookings.map((booking) => {
            const statusColor = getStatusColor(booking.status);
            const statusText = getStatusText(booking.status);
            const dateText = booking.bookingDate;
            const timeText = `${booking.startTime} - ${booking.endTime}`;
            
            return (
              <TouchableOpacity
                key={booking.id}
                style={[styles.bookingCard, { backgroundColor: theme.card }]}
                onPress={() => router.push(`/booking/${booking.id}`)}
              >
                <View style={styles.bookingHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                  </View>
                  {booking.status === 'confirmed' && (
                    <IconSymbol
                      ios_icon_name="qrcode"
                      android_material_icon_name="qr-code"
                      size={24}
                      color={theme.primary}
                    />
                  )}
                </View>
                <Text style={[styles.bookingClub, { color: theme.text }]}>{booking.clubName}</Text>
                <Text style={[styles.bookingCourt, { color: theme.textSecondary }]}>
                  {booking.courtName}
                </Text>
                <View style={styles.bookingDetails}>
                  <View style={styles.bookingDetail}>
                    <IconSymbol
                      ios_icon_name="calendar"
                      android_material_icon_name="calendar-today"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.bookingDetailText, { color: theme.textSecondary }]}>
                      {dateText}
                    </Text>
                  </View>
                  <View style={styles.bookingDetail}>
                    <IconSymbol
                      ios_icon_name="clock"
                      android_material_icon_name="access-time"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.bookingDetailText, { color: theme.textSecondary }]}>
                      {timeText}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/booking/new')}
      >
        <IconSymbol
          ios_icon_name="plus"
          android_material_icon_name="add"
          size={28}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  newBookingButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  newBookingButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  bookingCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingClub: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookingCourt: {
    fontSize: 14,
    marginBottom: 12,
  },
  bookingDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  bookingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookingDetailText: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

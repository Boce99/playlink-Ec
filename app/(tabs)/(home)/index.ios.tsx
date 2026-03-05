
import { useAuth } from '@/contexts/AuthContext';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { colors } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { playerAPI } from '@/utils/api';

interface Booking {
  id: string;
  clubName: string;
  courtName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  qrCode: string;
}

interface Club {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  role: string;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentColors = colors[colorScheme ?? 'light'];

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadData = useCallback(async () => {
    console.log('HomeScreen (iOS): Loading data for user', user?.email);
    try {
      setLoading(true);

      // Fetch user's clubs
      const clubsData = await playerAPI.getClubs();
      console.log('HomeScreen (iOS): Loaded clubs:', clubsData.length);
      setClubs(clubsData);

      // Fetch upcoming bookings
      const bookingsData = await playerAPI.getBookings();
      const upcoming = bookingsData
        .filter(b => b.status === 'confirmed' || b.status === 'checked_in')
        .slice(0, 3);
      console.log('HomeScreen (iOS): Loaded upcoming bookings:', upcoming.length);
      setUpcomingBookings(upcoming);

      // Fetch notifications
      const notificationsData = await playerAPI.getNotifications();
      const unread = notificationsData.filter(n => !n.isRead).slice(0, 3);
      console.log('HomeScreen (iOS): Loaded unread notifications:', unread.length);
      setNotifications(unread);
    } catch (error: any) {
      console.error('HomeScreen (iOS): Error loading data:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    console.log('HomeScreen (iOS): User triggered refresh');
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: currentColors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentColors.primary} />
          <Text style={[styles.loadingText, { color: currentColors.text }]}>
            Cargando...
          </Text>
        </View>
      </View>
    );
  }

  const userName = user?.name || user?.email?.split('@')[0] || 'Jugador';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={currentColors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors[colorScheme ?? 'light'].textSecondary }]}>
              Hola,
            </Text>
            <Text style={[styles.userName, { color: colors[colorScheme ?? 'light'].text }]}>
              {userName}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: colors[colorScheme ?? 'light'].card }]}
            onPress={() => router.push('/notifications')}
          >
            <IconSymbol
              ios_icon_name="bell.fill"
              android_material_icon_name="notifications"
              size={24}
              color={colors[colorScheme ?? 'light'].text}
            />
            {notifications.length > 0 && (
              <View style={[styles.badge, { backgroundColor: colors[colorScheme ?? 'light'].error }]}>
                <Text style={styles.badgeText}>{notifications.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors[colorScheme ?? 'light'].text }]}>
            Acciones Rápidas
          </Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors[colorScheme ?? 'light'].card }]}
              onPress={() => router.push('/(tabs)/bookings')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors[colorScheme ?? 'light'].primary + '20' }]}>
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="calendar-today"
                  size={28}
                  color={colors[colorScheme ?? 'light'].primary}
                />
              </View>
              <Text style={[styles.actionText, { color: colors[colorScheme ?? 'light'].text }]}>
                Reservar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors[colorScheme ?? 'light'].card }]}
              onPress={() => router.push('/(tabs)/tournaments')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors[colorScheme ?? 'light'].secondary + '20' }]}>
                <IconSymbol
                  ios_icon_name="trophy.fill"
                  android_material_icon_name="emoji-events"
                  size={28}
                  color={colors[colorScheme ?? 'light'].secondary}
                />
              </View>
              <Text style={[styles.actionText, { color: colors[colorScheme ?? 'light'].text }]}>
                Torneos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors[colorScheme ?? 'light'].card }]}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors[colorScheme ?? 'light'].accent + '20' }]}>
                <IconSymbol
                  ios_icon_name="chart.bar.fill"
                  android_material_icon_name="bar-chart"
                  size={28}
                  color={colors[colorScheme ?? 'light'].accent}
                />
              </View>
              <Text style={[styles.actionText, { color: colors[colorScheme ?? 'light'].text }]}>
                Ranking
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors[colorScheme ?? 'light'].text }]}>
              Próximas Reservas
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')}>
              <Text style={[styles.seeAllText, { color: colors[colorScheme ?? 'light'].primary }]}>
                Ver todas
              </Text>
            </TouchableOpacity>
          </View>

          {upcomingBookings.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors[colorScheme ?? 'light'].card }]}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={48}
                color={colors[colorScheme ?? 'light'].textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors[colorScheme ?? 'light'].textSecondary }]}>
                No tienes reservas próximas
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors[colorScheme ?? 'light'].primary }]}
                onPress={() => router.push('/(tabs)/bookings')}
              >
                <Text style={styles.emptyButtonText}>Hacer una reserva</Text>
              </TouchableOpacity>
            </View>
          ) : (
            upcomingBookings.map((booking) => {
              const dateDisplay = formatDate(booking.bookingDate);
              const startTimeDisplay = formatTime(booking.startTime);
              const endTimeDisplay = formatTime(booking.endTime);
              
              return (
                <View
                  key={booking.id}
                  style={[styles.bookingCard, { backgroundColor: colors[colorScheme ?? 'light'].card }]}
                >
                  <View style={styles.bookingHeader}>
                    <Text style={[styles.bookingClub, { color: colors[colorScheme ?? 'light'].text }]}>
                      {booking.clubName}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: colors[colorScheme ?? 'light'].success + '20' }]}>
                      <Text style={[styles.statusText, { color: colors[colorScheme ?? 'light'].success }]}>
                        Confirmada
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.bookingCourt, { color: colors[colorScheme ?? 'light'].textSecondary }]}>
                    {booking.courtName}
                  </Text>
                  <View style={styles.bookingDetails}>
                    <View style={styles.bookingDetail}>
                      <IconSymbol
                        ios_icon_name="calendar"
                        android_material_icon_name="calendar-today"
                        size={16}
                        color={colors[colorScheme ?? 'light'].textSecondary}
                      />
                      <Text style={[styles.bookingDetailText, { color: colors[colorScheme ?? 'light'].textSecondary }]}>
                        {dateDisplay}
                      </Text>
                    </View>
                    <View style={styles.bookingDetail}>
                      <IconSymbol
                        ios_icon_name="clock"
                        android_material_icon_name="access-time"
                        size={16}
                        color={colors[colorScheme ?? 'light'].textSecondary}
                      />
                      <Text style={[styles.bookingDetailText, { color: colors[colorScheme ?? 'light'].textSecondary }]}>
                        {startTimeDisplay}
                      </Text>
                      <Text style={[styles.bookingDetailText, { color: colors[colorScheme ?? 'light'].textSecondary }]}>
                        -
                      </Text>
                      <Text style={[styles.bookingDetailText, { color: colors[colorScheme ?? 'light'].textSecondary }]}>
                        {endTimeDisplay}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* My Clubs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors[colorScheme ?? 'light'].text }]}>
              Mis Clubes
            </Text>
            <TouchableOpacity onPress={() => router.push('/clubs/discover')}>
              <Text style={[styles.seeAllText, { color: colors[colorScheme ?? 'light'].primary }]}>
                Descubrir
              </Text>
            </TouchableOpacity>
          </View>
          {clubs.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors[colorScheme ?? 'light'].card }]}>
              <IconSymbol
                ios_icon_name="building.2"
                android_material_icon_name="business"
                size={48}
                color={colors[colorScheme ?? 'light'].textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors[colorScheme ?? 'light'].textSecondary }]}>
                No perteneces a ningún club
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors[colorScheme ?? 'light'].primary }]}
                onPress={() => router.push('/clubs/discover')}
              >
                <Text style={styles.emptyButtonText}>Descubrir clubes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            clubs.map((club) => (
              <View
                key={club.id}
                style={[styles.clubCard, { backgroundColor: colors[colorScheme ?? 'light'].card }]}
              >
                <View style={[styles.clubIcon, { backgroundColor: colors[colorScheme ?? 'light'].primary + '20' }]}>
                  <IconSymbol
                    ios_icon_name="building.2"
                    android_material_icon_name="business"
                    size={24}
                    color={colors[colorScheme ?? 'light'].primary}
                  />
                </View>
                <View style={styles.clubInfo}>
                  <Text style={[styles.clubName, { color: colors[colorScheme ?? 'light'].text }]}>
                    {club.name}
                  </Text>
                  {club.address && (
                    <Text style={[styles.clubAddress, { color: colors[colorScheme ?? 'light'].textSecondary }]}>
                      {club.address}
                    </Text>
                  )}
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors[colorScheme ?? 'light'].textSecondary}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bookingCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingClub: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  clubIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  clubAddress: {
    fontSize: 14,
  },
});

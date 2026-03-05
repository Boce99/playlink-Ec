
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

interface DashboardStats {
  todayBookings: number;
  activeMembers: number;
  activeTournaments: number;
  upcomingMatches: number;
  totalCourts: number;
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
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuGrid: {
    gap: 12,
  },
  menuCard: {
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function ClubDashboardScreen() {
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    activeMembers: 0,
    activeTournaments: 0,
    upcomingMatches: 0,
    totalCourts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textDark : colors.textLight;
  const mutedColor = isDark ? colors.mutedDark : colors.mutedLight;
  const borderColor = isDark ? colors.borderDark : colors.borderLight;

  const loadDashboardData = useCallback(async () => {
    try {
      console.log('Loading club dashboard data...');
      // TODO: Backend Integration - GET /api/club/dashboard
      // Returns: { todayBookings, activeMembers, activeTournaments, upcomingMatches, totalCourts }
      
      const mockStats: DashboardStats = {
        todayBookings: 12,
        activeMembers: 45,
        activeTournaments: 3,
        upcomingMatches: 8,
        totalCourts: 4,
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  const handleSignOut = async () => {
    try {
      console.log('User signing out from club dashboard');
      await signOut();
      setShowSignOutModal(false);
      router.replace('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    {
      title: 'Canchas',
      description: 'Gestionar canchas y horarios',
      icon: 'sports-tennis',
      iosIcon: 'sportscourt',
      color: colors.primary,
      route: '/(club)/courts',
    },
    {
      title: 'Reservas',
      description: 'Ver y gestionar reservas',
      icon: 'calendar-today',
      iosIcon: 'calendar',
      color: colors.success,
      route: '/(club)/bookings',
    },
    {
      title: 'Torneos',
      description: 'Crear y administrar torneos',
      icon: 'emoji-events',
      iosIcon: 'trophy',
      color: colors.warning,
      route: '/(club)/tournaments',
    },
    {
      title: 'Partidos',
      description: 'Registrar resultados de partidos',
      icon: 'sports',
      iosIcon: 'figure.tennis',
      color: colors.error,
      route: '/(club)/matches',
    },
    {
      title: 'Ranking',
      description: 'Ver ranking y estadísticas',
      icon: 'leaderboard',
      iosIcon: 'chart.bar',
      color: '#9C27B0',
      route: '/(club)/rankings',
    },
    {
      title: 'Jugadores',
      description: 'Gestionar jugadores del club',
      icon: 'group',
      iosIcon: 'person.2',
      color: '#00BCD4',
      route: '/(club)/players',
    },
    {
      title: 'Staff',
      description: 'Administrar personal del club',
      icon: 'badge',
      iosIcon: 'person.badge.key',
      color: '#FF5722',
      route: '/(club)/staff',
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const greetingText = 'Panel de Administración';
  const subtitleText = user?.name || 'Club Manager';
  const todayBookingsText = stats.todayBookings.toString();
  const activeMembersText = stats.activeMembers.toString();
  const activeTournamentsText = stats.activeTournaments.toString();
  const upcomingMatchesText = stats.upcomingMatches.toString();
  const totalCourtsText = stats.totalCourts.toString();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { backgroundColor: cardBg }]}>
        <Text style={[styles.greeting, { color: textColor }]}>{greetingText}</Text>
        <Text style={[styles.subtitle, { color: mutedColor }]}>{subtitleText}</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{todayBookingsText}</Text>
            <Text style={[styles.statLabel, { color: mutedColor }]}>Reservas Hoy</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>{activeMembersText}</Text>
            <Text style={[styles.statLabel, { color: mutedColor }]}>Miembros Activos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{activeTournamentsText}</Text>
            <Text style={[styles.statLabel, { color: mutedColor }]}>Torneos Activos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: colors.error }]}>{upcomingMatchesText}</Text>
            <Text style={[styles.statLabel, { color: mutedColor }]}>Partidos Próximos</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: textColor }]}>Gestión</Text>
        
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={[styles.menuCard, { backgroundColor: cardBg }]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <IconSymbol
                  ios_icon_name={item.iosIcon}
                  android_material_icon_name={item.icon}
                  size={24}
                  color={item.color}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: textColor }]}>{item.title}</Text>
                <Text style={[styles.menuDescription, { color: mutedColor }]}>{item.description}</Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="arrow-forward"
                size={20}
                color={mutedColor}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: colors.error + '20' }]}
          onPress={() => setShowSignOutModal(true)}
        >
          <IconSymbol ios_icon_name="arrow.right.square" android_material_icon_name="logout" size={20} color={colors.error} />
          <Text style={[styles.signOutButtonText, { color: colors.error }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <Modal visible={showSignOutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Cerrar Sesión</Text>
            <Text style={[styles.modalText, { color: mutedColor }]}>
              ¿Estás seguro de que deseas cerrar sesión?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: borderColor }]}
                onPress={() => setShowSignOutModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: textColor }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={handleSignOut}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

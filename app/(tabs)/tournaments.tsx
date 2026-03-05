
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

interface Tournament {
  id: string;
  name: string;
  clubName: string;
  tournamentType: string;
  startDate: string;
  status: string;
  participants: number;
  maxParticipants: number;
}

export default function TournamentsScreen() {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState<'open' | 'my' | 'completed'>('open');

  const loadTournaments = useCallback(async () => {
    console.log('TournamentsScreen: Loading tournaments');
    try {
      // TODO: Backend Integration - GET /api/tournaments/club/:clubId to fetch tournaments
      
      // Mock data
      setTournaments([
        {
          id: '1',
          name: 'Torneo de Verano 2024',
          clubName: 'Club Padel Central',
          tournamentType: 'traditional',
          startDate: '2024-02-01',
          status: 'open',
          participants: 12,
          maxParticipants: 16,
        },
        {
          id: '2',
          name: 'Copa Navideña',
          clubName: 'Padel Club Norte',
          tournamentType: 'super8',
          startDate: '2024-01-10',
          status: 'completed',
          participants: 8,
          maxParticipants: 8,
        },
      ]);
    } catch (error) {
      console.error('TournamentsScreen: Error loading tournaments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const onRefresh = useCallback(() => {
    console.log('TournamentsScreen: Refreshing tournaments');
    setRefreshing(true);
    loadTournaments();
  }, [loadTournaments]);

  const getTournamentTypeText = (type: string) => {
    const types = {
      traditional: 'Tradicional',
      super8: 'Super 8',
      king_of_court: 'Rey de Cancha',
      american: 'Americano',
    };
    return types[type as keyof typeof types] || type;
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      open: theme.success,
      closed: theme.accent,
      in_progress: theme.secondary,
      completed: theme.textSecondary,
    };
    return statusColors[status as keyof typeof statusColors] || theme.textSecondary;
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      open: 'Inscripciones abiertas',
      closed: 'Inscripciones cerradas',
      in_progress: 'En progreso',
      completed: 'Finalizado',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const filteredTournaments = tournaments.filter(tournament => {
    if (filter === 'open') {
      return tournament.status === 'open';
    } else if (filter === 'my') {
      // TODO: Filter by user's registered tournaments
      return true;
    } else {
      return tournament.status === 'completed';
    }
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Torneos', headerShown: true }} />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Torneos', headerShown: true }} />
      
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <View style={[styles.filterContainer, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'open' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFilter('open')}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === 'open' ? '#FFFFFF' : theme.text },
              ]}
            >
              Abiertos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'my' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFilter('my')}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === 'my' ? '#FFFFFF' : theme.text },
              ]}
            >
              Mis Torneos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'completed' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFilter('completed')}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === 'completed' ? '#FFFFFF' : theme.text },
              ]}
            >
              Finalizados
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
        {filteredTournaments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="trophy"
              android_material_icon_name="emoji-events"
              size={64}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {filter === 'open' && 'No hay torneos abiertos'}
              {filter === 'my' && 'No estás inscrito en ningún torneo'}
              {filter === 'completed' && 'No hay torneos finalizados'}
            </Text>
          </View>
        ) : (
          filteredTournaments.map((tournament) => {
            const statusColor = getStatusColor(tournament.status);
            const statusText = getStatusText(tournament.status);
            const typeText = getTournamentTypeText(tournament.tournamentType);
            const spotsText = `${tournament.participants}/${tournament.maxParticipants} jugadores`;
            
            return (
              <TouchableOpacity
                key={tournament.id}
                style={[styles.tournamentCard, { backgroundColor: theme.card }]}
                onPress={() => router.push(`/tournament/${tournament.id}`)}
              >
                <View style={styles.tournamentHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                  </View>
                  <View style={[styles.typeBadge, { backgroundColor: theme.accent + '20' }]}>
                    <Text style={[styles.typeText, { color: theme.accent }]}>{typeText}</Text>
                  </View>
                </View>
                <Text style={[styles.tournamentName, { color: theme.text }]}>{tournament.name}</Text>
                <Text style={[styles.tournamentClub, { color: theme.textSecondary }]}>
                  {tournament.clubName}
                </Text>
                <View style={styles.tournamentDetails}>
                  <View style={styles.tournamentDetail}>
                    <IconSymbol
                      ios_icon_name="calendar"
                      android_material_icon_name="calendar-today"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.tournamentDetailText, { color: theme.textSecondary }]}>
                      {tournament.startDate}
                    </Text>
                  </View>
                  <View style={styles.tournamentDetail}>
                    <IconSymbol
                      ios_icon_name="person.2"
                      android_material_icon_name="group"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.tournamentDetailText, { color: theme.textSecondary }]}>
                      {spotsText}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
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
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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
    textAlign: 'center',
  },
  tournamentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tournamentHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tournamentClub: {
    fontSize: 14,
    marginBottom: 12,
  },
  tournamentDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  tournamentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tournamentDetailText: {
    fontSize: 14,
  },
});

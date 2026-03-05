
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Modal,
  Platform,
  RefreshControl,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { playerAPI } from '@/utils/api';

interface Club {
  id: string;
  name: string;
}

interface PlayerStats {
  points: number;
  eloRating: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
  setsWon: number;
  setsLost: number;
  recentMatches: Array<{ opponent: string; result: string; date: string }>;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    console.log('ProfileScreen: Loading player data');
    try {
      setLoading(true);
      
      const clubsData = await playerAPI.getClubs();
      setClubs(clubsData);
      
      if (clubsData.length > 0 && !selectedClub) {
        setSelectedClub(clubsData[0]);
        const statsData = await playerAPI.getUserStats(clubsData[0].id);
        setStats(statsData);
      }
    } catch (error: any) {
      console.error('ProfileScreen: Error loading data:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedClub]);

  const onRefresh = useCallback(() => {
    console.log('ProfileScreen: Refreshing data');
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleClubChange = async (club: Club) => {
    console.log('ProfileScreen: Changing club to', club.name);
    setSelectedClub(club);
    try {
      const statsData = await playerAPI.getUserStats(club.id);
      setStats(statsData);
    } catch (error: any) {
      console.error('ProfileScreen: Error loading stats:', error.message);
    }
  };

  const handleSignOut = async () => {
    console.log('ProfileScreen: User initiated sign out');
    try {
      setSigningOut(true);
      await signOut();
      setShowSignOutModal(false);
      router.replace('/auth');
    } catch (error: any) {
      console.error('ProfileScreen: Error signing out:', error.message);
    } finally {
      setSigningOut(false);
    }
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'Jugador';
  const userEmail = user?.email || '';
  const winRate = stats && stats.matchesPlayed > 0 
    ? ((stats.wins / stats.matchesPlayed) * 100).toFixed(1) 
    : '0.0';

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Perfil', headerShown: true }} />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Perfil', headerShown: true }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: theme.card }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{userEmail}</Text>
        </View>

        {/* Club Selector */}
        {clubs.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Club Seleccionado</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clubSelector}>
              {clubs.map((club) => {
                const isSelected = selectedClub?.id === club.id;
                
                return (
                  <TouchableOpacity
                    key={club.id}
                    style={[
                      styles.clubChip,
                      { backgroundColor: isSelected ? theme.primary : theme.card },
                    ]}
                    onPress={() => handleClubChange(club)}
                  >
                    <Text
                      style={[
                        styles.clubChipText,
                        { color: isSelected ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {club.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Stats Overview */}
        {stats && (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Estadísticas</Text>
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                  <IconSymbol
                    ios_icon_name="star.fill"
                    android_material_icon_name="star"
                    size={24}
                    color={theme.accent}
                  />
                  <Text style={[styles.statValue, { color: theme.text }]}>{stats.points}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Puntos</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                  <IconSymbol
                    ios_icon_name="chart.bar.fill"
                    android_material_icon_name="bar-chart"
                    size={24}
                    color={theme.secondary}
                  />
                  <Text style={[styles.statValue, { color: theme.text }]}>{stats.eloRating}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Rating ELO</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                  <IconSymbol
                    ios_icon_name="trophy.fill"
                    android_material_icon_name="emoji-events"
                    size={24}
                    color={theme.success}
                  />
                  <Text style={[styles.statValue, { color: theme.text }]}>{stats.wins}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Victorias</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                  <IconSymbol
                    ios_icon_name="xmark.circle.fill"
                    android_material_icon_name="cancel"
                    size={24}
                    color={theme.error}
                  />
                  <Text style={[styles.statValue, { color: theme.text }]}>{stats.losses}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Derrotas</Text>
                </View>
              </View>
            </View>

            {/* Performance */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Rendimiento</Text>
              <View style={[styles.performanceCard, { backgroundColor: theme.card }]}>
                <View style={styles.performanceRow}>
                  <Text style={[styles.performanceLabel, { color: theme.textSecondary }]}>
                    Partidos Jugados
                  </Text>
                  <Text style={[styles.performanceValue, { color: theme.text }]}>
                    {stats.matchesPlayed}
                  </Text>
                </View>
                <View style={styles.performanceRow}>
                  <Text style={[styles.performanceLabel, { color: theme.textSecondary }]}>
                    Tasa de Victoria
                  </Text>
                  <Text style={[styles.performanceValue, { color: theme.text }]}>
                    {winRate}
                  </Text>
                  <Text style={[styles.performanceValue, { color: theme.text }]}>%</Text>
                </View>
                <View style={styles.performanceRow}>
                  <Text style={[styles.performanceLabel, { color: theme.textSecondary }]}>
                    Sets Ganados
                  </Text>
                  <Text style={[styles.performanceValue, { color: theme.text }]}>
                    {stats.setsWon}
                  </Text>
                </View>
                <View style={styles.performanceRow}>
                  <Text style={[styles.performanceLabel, { color: theme.textSecondary }]}>
                    Sets Perdidos
                  </Text>
                  <Text style={[styles.performanceValue, { color: theme.text }]}>
                    {stats.setsLost}
                  </Text>
                </View>
              </View>
            </View>

            {/* Recent Matches */}
            {stats.recentMatches && stats.recentMatches.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Partidos Recientes</Text>
                {stats.recentMatches.map((match, index) => {
                  const isWin = match.result === 'win';
                  const resultColor = isWin ? theme.success : theme.error;
                  const resultText = isWin ? 'Victoria' : 'Derrota';
                  
                  return (
                    <View key={index} style={[styles.matchCard, { backgroundColor: theme.card }]}>
                      <View style={styles.matchInfo}>
                        <Text style={[styles.matchOpponent, { color: theme.text }]}>
                          vs
                        </Text>
                        <Text style={[styles.matchOpponent, { color: theme.text }]}>
                          {match.opponent}
                        </Text>
                      </View>
                      <View style={styles.matchDetails}>
                        <View style={[styles.matchResult, { backgroundColor: resultColor + '20' }]}>
                          <Text style={[styles.matchResultText, { color: resultColor }]}>
                            {resultText}
                          </Text>
                        </View>
                        <Text style={[styles.matchDate, { color: theme.textSecondary }]}>
                          {match.date}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: theme.error }]}
          onPress={() => setShowSignOutModal(true)}
        >
          <IconSymbol
            ios_icon_name="arrow.right.square"
            android_material_icon_name="logout"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.signOutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <Modal visible={showSignOutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>¿Cerrar Sesión?</Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
              ¿Estás seguro de que deseas cerrar sesión?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.background }]}
                onPress={() => setShowSignOutModal(false)}
                disabled={signingOut}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.error }]}
                onPress={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Cerrar Sesión</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
    marginHorizontal: 20,
    marginTop: Platform.OS === 'android' ? 48 : 20,
    marginBottom: 24,
    borderRadius: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  clubSelector: {
    flexDirection: 'row',
  },
  clubChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  clubChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  performanceCard: {
    padding: 16,
    borderRadius: 12,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    gap: 8,
  },
  performanceLabel: {
    fontSize: 15,
    flex: 1,
  },
  performanceValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  matchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  matchInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  matchOpponent: {
    fontSize: 15,
    fontWeight: '600',
  },
  matchDetails: {
    alignItems: 'flex-end',
  },
  matchResult: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  matchResultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  matchDate: {
    fontSize: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

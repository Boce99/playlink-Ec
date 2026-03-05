
import { colors } from '@/styles/commonStyles';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
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

interface RankingPlayer {
  rank: number;
  userId: string;
  userName: string;
  userEmail: string;
  points: number;
  eloRating: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
  setsWon: number;
  setsLost: number;
  winRate: number;
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
  scrollContent: {
    padding: 16,
  },
  recalculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  recalculateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  rankingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  playerEmail: {
    fontSize: 12,
  },
  eloContainer: {
    alignItems: 'flex-end',
  },
  eloLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  eloValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumRank: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  podiumRankText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  podiumElo: {
    fontSize: 12,
  },
});

export default function RankingsScreen() {
  const [rankings, setRankings] = useState<RankingPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textDark : colors.textLight;
  const mutedColor = isDark ? colors.mutedDark : colors.mutedLight;
  const borderColor = isDark ? colors.borderDark : colors.borderLight;

  const loadRankings = useCallback(async () => {
    try {
      console.log('Loading club rankings...');
      // TODO: Backend Integration - GET /api/club/rankings
      // Returns: [{ rank, userId, userName, userEmail, points, eloRating, wins, losses, matchesPlayed, setsWon, setsLost, winRate }]
      
      const mockRankings: RankingPlayer[] = [
        {
          rank: 1,
          userId: 'user1',
          userName: 'Juan Pérez',
          userEmail: 'juan@example.com',
          points: 1500,
          eloRating: 1850,
          wins: 25,
          losses: 5,
          matchesPlayed: 30,
          setsWon: 52,
          setsLost: 18,
          winRate: 83.3,
        },
        {
          rank: 2,
          userId: 'user2',
          userName: 'María García',
          userEmail: 'maria@example.com',
          points: 1350,
          eloRating: 1780,
          wins: 22,
          losses: 8,
          matchesPlayed: 30,
          setsWon: 48,
          setsLost: 22,
          winRate: 73.3,
        },
        {
          rank: 3,
          userId: 'user3',
          userName: 'Carlos López',
          userEmail: 'carlos@example.com',
          points: 1200,
          eloRating: 1720,
          wins: 20,
          losses: 10,
          matchesPlayed: 30,
          setsWon: 44,
          setsLost: 26,
          winRate: 66.7,
        },
        {
          rank: 4,
          userId: 'user4',
          userName: 'Ana Martínez',
          userEmail: 'ana@example.com',
          points: 1100,
          eloRating: 1680,
          wins: 18,
          losses: 12,
          matchesPlayed: 30,
          setsWon: 40,
          setsLost: 30,
          winRate: 60.0,
        },
      ];
      
      setRankings(mockRankings);
    } catch (error) {
      console.error('Error loading rankings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRankings();
  }, [loadRankings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRankings();
  }, [loadRankings]);

  const handleRecalculate = async () => {
    try {
      console.log('Recalculating rankings...');
      // TODO: Backend Integration - POST /api/club/rankings/recalculate
      setRefreshing(true);
      loadRankings();
    } catch (error) {
      console.error('Error recalculating rankings:', error);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return colors.primary;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Stack.Screen options={{ headerShown: true, title: 'Ranking' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const topThree = rankings.slice(0, 3);
  const restOfRankings = rankings.slice(3);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen options={{ headerShown: true, title: 'Ranking' }} />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <TouchableOpacity
          style={[styles.recalculateButton, { backgroundColor: colors.primary }]}
          onPress={handleRecalculate}
        >
          <IconSymbol ios_icon_name="arrow.clockwise" android_material_icon_name="refresh" size={20} color="#fff" />
          <Text style={[styles.recalculateButtonText, { color: '#fff' }]}>Recalcular Ranking</Text>
        </TouchableOpacity>

        {rankings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol ios_icon_name="chart.bar" android_material_icon_name="leaderboard" size={48} color={mutedColor} />
            <Text style={[styles.emptyText, { color: mutedColor }]}>No hay datos de ranking</Text>
          </View>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <View style={styles.topThreeContainer}>
                {topThree.map((player) => {
                  const rankColor = getRankColor(player.rank);
                  const rankTextValue = player.rank.toString();
                  const eloText = `ELO: ${player.eloRating}`;
                  
                  return (
                    <View key={player.userId} style={styles.podiumItem}>
                      <View style={[styles.podiumRank, { backgroundColor: rankColor }]}>
                        <Text style={[styles.podiumRankText, { color: '#fff' }]}>{rankTextValue}</Text>
                      </View>
                      <Text style={[styles.podiumName, { color: textColor }]}>{player.userName}</Text>
                      <Text style={[styles.podiumElo, { color: mutedColor }]}>{eloText}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Rest of Rankings */}
            {restOfRankings.map((player) => {
              const rankColor = getRankColor(player.rank);
              const rankTextValue = player.rank.toString();
              const eloLabelText = 'ELO';
              const eloValueText = player.eloRating.toString();
              const winsText = player.wins.toString();
              const lossesText = player.losses.toString();
              const winRateText = `${player.winRate.toFixed(1)}%`;
              const matchesText = player.matchesPlayed.toString();
              
              return (
                <View key={player.userId} style={[styles.rankingCard, { backgroundColor: cardBg }]}>
                  <View style={styles.rankingHeader}>
                    <View style={[styles.rankBadge, { backgroundColor: rankColor + '20' }]}>
                      <Text style={[styles.rankText, { color: rankColor }]}>{rankTextValue}</Text>
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={[styles.playerName, { color: textColor }]}>{player.userName}</Text>
                      <Text style={[styles.playerEmail, { color: mutedColor }]}>{player.userEmail}</Text>
                    </View>
                    <View style={styles.eloContainer}>
                      <Text style={[styles.eloLabel, { color: mutedColor }]}>{eloLabelText}</Text>
                      <Text style={[styles.eloValue, { color: colors.primary }]}>{eloValueText}</Text>
                    </View>
                  </View>

                  <View style={[styles.statsContainer, { borderTopColor: borderColor }]}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.success }]}>{winsText}</Text>
                      <Text style={[styles.statLabel, { color: mutedColor }]}>Victorias</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.error }]}>{lossesText}</Text>
                      <Text style={[styles.statLabel, { color: mutedColor }]}>Derrotas</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.primary }]}>{winRateText}</Text>
                      <Text style={[styles.statLabel, { color: mutedColor }]}>% Victoria</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: textColor }]}>{matchesText}</Text>
                      <Text style={[styles.statLabel, { color: mutedColor }]}>Partidos</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

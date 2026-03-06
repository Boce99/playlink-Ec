
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
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { playerAPI } from '@/utils/api';

interface RankingPlayer {
  rank: number;
  userId: string;
  userName: string;
  points: number;
  eloRating: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
}

interface Club {
  id: string;
  name: string;
}

export default function PlayerRankingsScreen() {
  const [rankings, setRankings] = useState<RankingPlayer[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textDark : colors.textLight;
  const mutedColor = isDark ? colors.mutedDark : colors.mutedLight;
  const borderColor = isDark ? colors.borderDark : colors.borderLight;

  const loadData = useCallback(async () => {
    console.log('[PlayerRankings] Loading clubs and rankings');
    try {
      setLoading(true);
      
      const clubsData = await playerAPI.getClubs();
      setClubs(clubsData);
      
      if (clubsData.length > 0) {
        const clubToUse = selectedClub || clubsData[0];
        if (!selectedClub) {
          setSelectedClub(clubToUse);
        }
        
        const rankingsData = await playerAPI.getRankings(clubToUse.id);
        setRankings(rankingsData);
      }
    } catch (error: any) {
      console.error('[PlayerRankings] Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedClub]);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    console.log('[PlayerRankings] Refreshing rankings');
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleClubChange = async (club: Club) => {
    console.log('[PlayerRankings] Changing club to', club.name);
    setSelectedClub(club);
    try {
      setLoading(true);
      const rankingsData = await playerAPI.getRankings(club.id);
      setRankings(rankingsData);
    } catch (error: any) {
      console.error('[PlayerRankings] Error loading rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return colors.primary;
  };

  if (loading && !selectedClub) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <Stack.Screen options={{ title: 'Ranking', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const topThree = rankings.slice(0, 3);
  const restOfRankings = rankings.slice(3);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Ranking', headerShown: true }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Club Selector */}
        {clubs.length > 1 && (
          <View style={styles.clubSelectorContainer}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Club</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clubSelector}>
              {clubs.map((club) => {
                const isSelected = selectedClub?.id === club.id;
                
                return (
                  <TouchableOpacity
                    key={club.id}
                    style={[
                      styles.clubChip,
                      { backgroundColor: isSelected ? colors.primary : cardBg },
                    ]}
                    onPress={() => handleClubChange(club)}
                  >
                    <Text
                      style={[
                        styles.clubChipText,
                        { color: isSelected ? '#FFFFFF' : textColor },
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

        {rankings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="chart.bar"
              android_material_icon_name="leaderboard"
              size={48}
              color={mutedColor}
            />
            <Text style={[styles.emptyText, { color: mutedColor }]}>
              No hay datos de ranking disponibles
            </Text>
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
              const winRate = player.matchesPlayed > 0 
                ? ((player.wins / player.matchesPlayed) * 100).toFixed(1) 
                : '0.0';
              const winRateText = `${winRate}%`;
              const matchesText = player.matchesPlayed.toString();
              
              return (
                <View key={player.userId} style={[styles.rankingCard, { backgroundColor: cardBg }]}>
                  <View style={styles.rankingHeader}>
                    <View style={[styles.rankBadge, { backgroundColor: rankColor + '20' }]}>
                      <Text style={[styles.rankText, { color: rankColor }]}>{rankTextValue}</Text>
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={[styles.playerName, { color: textColor }]}>{player.userName}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  clubSelectorContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
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
});

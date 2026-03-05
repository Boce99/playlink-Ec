
import { colors } from '@/styles/commonStyles';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useClub } from '@/contexts/ClubContext';
import { clubAPI } from '@/utils/api';
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
  Modal,
  TextInput,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
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
  editButton: {
    marginLeft: 8,
    padding: 4,
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
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
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
  feedbackModalContent: {
    width: '85%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  feedbackMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  feedbackButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
});

export default function RankingsScreen() {
  const [rankings, setRankings] = useState<RankingPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<RankingPlayer | null>(null);
  const [editedElo, setEditedElo] = useState('');
  const [editedPoints, setEditedPoints] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{ visible: boolean; title: string; message: string; isError: boolean }>({
    visible: false,
    title: '',
    message: '',
    isError: false,
  });

  const { selectedClub } = useClub();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textDark : colors.textLight;
  const mutedColor = isDark ? colors.mutedDark : colors.mutedLight;
  const borderColor = isDark ? colors.borderDark : colors.borderLight;

  const showFeedback = (title: string, message: string, isError = false) => {
    setFeedbackModal({ visible: true, title, message, isError });
  };

  const loadRankings = useCallback(async () => {
    if (!selectedClub) {
      console.log('No club selected, cannot load rankings');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      console.log('[Rankings] Loading club rankings for club:', selectedClub.id);
      const data = await clubAPI.getRankings(selectedClub.id);
      
      // Calculate additional stats
      const enrichedData = data.map((player, index) => ({
        ...player,
        rank: index + 1,
        setsWon: 0,
        setsLost: 0,
        winRate: player.matchesPlayed > 0 ? (player.wins / player.matchesPlayed) * 100 : 0,
      }));
      
      setRankings(enrichedData);
    } catch (error: any) {
      console.error('[Rankings] Error loading rankings:', error);
      showFeedback('Error', error.message || 'No se pudieron cargar los rankings', true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedClub]);

  useEffect(() => {
    loadRankings();
  }, [loadRankings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRankings();
  }, [loadRankings]);

  const handleRecalculate = async () => {
    if (!selectedClub) return;

    try {
      console.log('[Rankings] Recalculating rankings for club:', selectedClub.id);
      await clubAPI.recalculateRankings(selectedClub.id);
      showFeedback('Éxito', 'Rankings recalculados correctamente');
      setRefreshing(true);
      loadRankings();
    } catch (error: any) {
      console.error('[Rankings] Error recalculating rankings:', error);
      showFeedback('Error', error.message || 'No se pudieron recalcular los rankings', true);
    }
  };

  const handleEditPlayer = (player: RankingPlayer) => {
    console.log('[Rankings] Editing player:', player.userName);
    setEditingPlayer(player);
    setEditedElo(player.eloRating.toString());
    setEditedPoints(player.points.toString());
  };

  const handleSaveEdit = async () => {
    if (!editingPlayer || !selectedClub) return;

    const newElo = parseInt(editedElo);
    const newPoints = parseInt(editedPoints);

    if (isNaN(newElo) || isNaN(newPoints)) {
      showFeedback('Error', 'Por favor ingresa valores numéricos válidos', true);
      return;
    }

    setSaving(true);
    try {
      console.log('[Rankings] Updating ranking for player:', editingPlayer.userId, { eloRating: newElo, points: newPoints });
      
      const result = await clubAPI.updateRanking(selectedClub.id, editingPlayer.userId, {
        eloRating: newElo,
        points: newPoints,
      });
      
      console.log('[Rankings] Update result:', result);
      
      // Update local state with server response
      setRankings(prev => prev.map(p => 
        p.userId === editingPlayer.userId 
          ? { 
              ...p, 
              eloRating: result.player?.eloRating ?? newElo, 
              points: result.player?.points ?? newPoints 
            }
          : p
      ));
      
      setEditingPlayer(null);
      showFeedback('Éxito', `Ranking de ${editingPlayer.userName} actualizado correctamente`);
    } catch (error: any) {
      console.error('[Rankings] Error updating ranking:', error);
      showFeedback('Error', error.message || 'No se pudo actualizar el ranking', true);
    } finally {
      setSaving(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return colors.primary;
  };

  if (!selectedClub) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Stack.Screen options={{ headerShown: true, title: 'Ranking' }} />
        <View style={styles.emptyContainer}>
          <IconSymbol ios_icon_name="building.2" android_material_icon_name="business" size={48} color={mutedColor} />
          <Text style={[styles.emptyText, { color: mutedColor }]}>No hay club seleccionado</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleRecalculate}
          >
            <IconSymbol ios_icon_name="arrow.clockwise" android_material_icon_name="refresh" size={20} color="#fff" />
            <Text style={[styles.actionButtonText, { color: '#fff' }]}>Recalcular</Text>
          </TouchableOpacity>
        </View>

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
                    <TouchableOpacity key={player.userId} style={styles.podiumItem} onPress={() => handleEditPlayer(player)}>
                      <View style={[styles.podiumRank, { backgroundColor: rankColor }]}>
                        <Text style={[styles.podiumRankText, { color: '#fff' }]}>{rankTextValue}</Text>
                      </View>
                      <Text style={[styles.podiumName, { color: textColor }]}>{player.userName}</Text>
                      <Text style={[styles.podiumElo, { color: mutedColor }]}>{eloText}</Text>
                      <IconSymbol ios_icon_name="pencil" android_material_icon_name="edit" size={14} color={colors.primary} />
                    </TouchableOpacity>
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
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditPlayer(player)}
                    >
                      <IconSymbol ios_icon_name="pencil" android_material_icon_name="edit" size={20} color={colors.primary} />
                    </TouchableOpacity>
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

      {/* Edit Ranking Modal */}
      <Modal visible={editingPlayer !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Editar Ranking</Text>
            
            {editingPlayer && (
              <>
                <Text style={[styles.playerName, { color: textColor, marginBottom: 16 }]}>
                  {editingPlayer.userName}
                </Text>

                <Text style={[styles.inputLabel, { color: textColor }]}>ELO Rating</Text>
                <TextInput
                  style={[styles.input, { 
                    borderColor: borderColor, 
                    color: textColor,
                    backgroundColor: isDark ? colors.backgroundDark : colors.backgroundLight 
                  }]}
                  value={editedElo}
                  onChangeText={setEditedElo}
                  keyboardType="numeric"
                  placeholder="1500"
                  placeholderTextColor={mutedColor}
                  editable={!saving}
                />

                <Text style={[styles.inputLabel, { color: textColor }]}>Puntos</Text>
                <TextInput
                  style={[styles.input, { 
                    borderColor: borderColor, 
                    color: textColor,
                    backgroundColor: isDark ? colors.backgroundDark : colors.backgroundLight 
                  }]}
                  value={editedPoints}
                  onChangeText={setEditedPoints}
                  keyboardType="numeric"
                  placeholder="1000"
                  placeholderTextColor={mutedColor}
                  editable={!saving}
                />
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: borderColor, opacity: saving ? 0.5 : 1 }]}
                onPress={() => !saving && setEditingPlayer(null)}
                disabled={saving}
              >
                <Text style={[styles.modalButtonText, { color: textColor }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Feedback Modal */}
      <Modal visible={feedbackModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.feedbackModalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.feedbackTitle, { color: feedbackModal.isError ? colors.error : colors.success }]}>
              {feedbackModal.title}
            </Text>
            <Text style={[styles.feedbackMessage, { color: mutedColor }]}>
              {feedbackModal.message}
            </Text>
            <TouchableOpacity
              style={[styles.feedbackButton, { backgroundColor: feedbackModal.isError ? colors.error : colors.primary }]}
              onPress={() => setFeedbackModal(prev => ({ ...prev, visible: false }))}
            >
              <Text style={styles.feedbackButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

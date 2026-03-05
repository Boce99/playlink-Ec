
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
  Modal,
  TextInput,
  Platform,
} from 'react-native';

interface Player {
  userId: string;
  userName: string;
}

interface MatchResult {
  setNumber: number;
  teamAScore: number;
  teamBScore: number;
}

interface Match {
  id: string;
  tournamentId?: string;
  tournamentName?: string;
  round?: number;
  status: 'pending' | 'scheduled' | 'played' | 'verified' | 'disputed';
  teamA: Player[];
  teamB: Player[];
  results: MatchResult[];
  createdAt: string;
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  matchCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tournamentInfo: {
    flex: 1,
  },
  tournamentName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  roundText: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  teamsContainer: {
    gap: 12,
    marginBottom: 12,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 60,
  },
  teamPlayers: {
    flex: 1,
    fontSize: 14,
  },
  resultsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  resultsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
  },
  matchActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  setInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  setLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 60,
  },
  scoreInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [resultData, setResultData] = useState<MatchResult[]>([
    { setNumber: 1, teamAScore: 0, teamBScore: 0 },
    { setNumber: 2, teamAScore: 0, teamBScore: 0 },
    { setNumber: 3, teamAScore: 0, teamBScore: 0 },
  ]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textDark : colors.textLight;
  const mutedColor = isDark ? colors.mutedDark : colors.mutedLight;
  const borderColor = isDark ? colors.borderDark : colors.borderLight;

  const loadMatches = useCallback(async () => {
    try {
      console.log('Loading club matches...');
      // TODO: Backend Integration - GET /api/club/matches
      // Returns: [{ id, tournamentId, tournamentName, round, status, teamA: [{ userId, userName }], teamB: [{ userId, userName }], results: [{ setNumber, teamAScore, teamBScore }], createdAt }]
      
      const mockMatches: Match[] = [
        {
          id: '1',
          tournamentId: '1',
          tournamentName: 'Torneo de Verano 2024',
          round: 1,
          status: 'scheduled',
          teamA: [
            { userId: 'user1', userName: 'Juan Pérez' },
            { userId: 'user2', userName: 'Carlos López' },
          ],
          teamB: [
            { userId: 'user3', userName: 'María García' },
            { userId: 'user4', userName: 'Ana Martínez' },
          ],
          results: [],
          createdAt: '2024-01-20T10:00:00Z',
        },
        {
          id: '2',
          tournamentId: '1',
          tournamentName: 'Torneo de Verano 2024',
          round: 1,
          status: 'played',
          teamA: [
            { userId: 'user5', userName: 'Pedro Sánchez' },
            { userId: 'user6', userName: 'Luis Rodríguez' },
          ],
          teamB: [
            { userId: 'user7', userName: 'Sofia Torres' },
            { userId: 'user8', userName: 'Laura Díaz' },
          ],
          results: [
            { setNumber: 1, teamAScore: 6, teamBScore: 4 },
            { setNumber: 2, teamAScore: 6, teamBScore: 3 },
          ],
          createdAt: '2024-01-20T11:00:00Z',
        },
      ];
      
      setMatches(mockMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMatches();
  }, [loadMatches]);

  const handleRecordResult = (match: Match) => {
    setSelectedMatch(match);
    setResultData([
      { setNumber: 1, teamAScore: 0, teamBScore: 0 },
      { setNumber: 2, teamAScore: 0, teamBScore: 0 },
      { setNumber: 3, teamAScore: 0, teamBScore: 0 },
    ]);
    setShowResultModal(true);
  };

  const handleSaveResult = async () => {
    if (!selectedMatch) return;

    try {
      console.log('Recording match result:', selectedMatch.id, resultData);
      // TODO: Backend Integration - PUT /api/club/matches/:id/result
      // Body: { results: [{ setNumber, teamAScore, teamBScore }], winnerId: string }
      // This should also update rankings automatically
      
      setShowResultModal(false);
      setSelectedMatch(null);
      loadMatches();
    } catch (error) {
      console.error('Error recording result:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: mutedColor,
      scheduled: colors.primary,
      played: colors.success,
      verified: colors.success,
      disputed: colors.error,
    };
    return statusColors[status as keyof typeof statusColors] || mutedColor;
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      pending: 'Pendiente',
      scheduled: 'Programado',
      played: 'Jugado',
      verified: 'Verificado',
      disputed: 'Disputado',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Stack.Screen options={{ headerShown: true, title: 'Partidos' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen options={{ headerShown: true, title: 'Partidos' }} />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol ios_icon_name="sportscourt" android_material_icon_name="sports-tennis" size={48} color={mutedColor} />
            <Text style={[styles.emptyText, { color: mutedColor }]}>No hay partidos registrados</Text>
          </View>
        ) : (
          matches.map((match) => {
            const statusColor = getStatusColor(match.status);
            const statusText = getStatusText(match.status);
            const teamANames = match.teamA.map(p => p.userName).join(' / ');
            const teamBNames = match.teamB.map(p => p.userName).join(' / ');
            const roundText = match.round ? `Ronda ${match.round}` : 'Partido amistoso';

            return (
              <View key={match.id} style={[styles.matchCard, { backgroundColor: cardBg }]}>
                <View style={styles.matchHeader}>
                  <View style={styles.tournamentInfo}>
                    <Text style={[styles.tournamentName, { color: textColor }]}>
                      {match.tournamentName || 'Partido Amistoso'}
                    </Text>
                    <Text style={[styles.roundText, { color: mutedColor }]}>{roundText}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                  </View>
                </View>

                <View style={styles.teamsContainer}>
                  <View style={styles.teamRow}>
                    <Text style={[styles.teamLabel, { color: colors.primary }]}>Equipo A</Text>
                    <Text style={[styles.teamPlayers, { color: textColor }]}>{teamANames}</Text>
                  </View>
                  <View style={styles.teamRow}>
                    <Text style={[styles.teamLabel, { color: colors.error }]}>Equipo B</Text>
                    <Text style={[styles.teamPlayers, { color: textColor }]}>{teamBNames}</Text>
                  </View>
                </View>

                {match.results.length > 0 && (
                  <View style={[styles.resultsContainer, { borderTopColor: borderColor }]}>
                    <Text style={[styles.resultsTitle, { color: mutedColor }]}>Resultado:</Text>
                    {match.results.map((result) => {
                      const setResultText = `Set ${result.setNumber}`;
                      const scoreText = `${result.teamAScore} - ${result.teamBScore}`;
                      
                      return (
                        <View key={result.setNumber} style={styles.resultRow}>
                          <Text style={[styles.resultText, { color: mutedColor }]}>{setResultText}</Text>
                          <Text style={[styles.resultText, { color: textColor }]}>{scoreText}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                {match.status === 'scheduled' && (
                  <View style={styles.matchActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.success + '20' }]}
                      onPress={() => handleRecordResult(match)}
                    >
                      <IconSymbol ios_icon_name="checkmark.circle" android_material_icon_name="check-circle" size={16} color={colors.success} />
                      <Text style={[styles.actionButtonText, { color: colors.success }]}>Registrar Resultado</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Record Result Modal */}
      <Modal visible={showResultModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Registrar Resultado</Text>
            
            {selectedMatch && (
              <>
                <Text style={[styles.label, { color: textColor, marginBottom: 16 }]}>
                  {selectedMatch.teamA.map(p => p.userName).join(' / ')} vs {selectedMatch.teamB.map(p => p.userName).join(' / ')}
                </Text>

                <ScrollView>
                  {resultData.map((result, index) => {
                    const setLabelText = `Set ${result.setNumber}`;
                    
                    return (
                      <View key={result.setNumber} style={styles.setInputContainer}>
                        <Text style={[styles.setLabel, { color: textColor }]}>{setLabelText}</Text>
                        <TextInput
                          style={[styles.scoreInput, { backgroundColor: bgColor, color: textColor, borderColor }]}
                          keyboardType="number-pad"
                          value={result.teamAScore.toString()}
                          onChangeText={(text) => {
                            const newData = [...resultData];
                            newData[index].teamAScore = parseInt(text) || 0;
                            setResultData(newData);
                          }}
                        />
                        <Text style={[styles.vsText, { color: mutedColor }]}>-</Text>
                        <TextInput
                          style={[styles.scoreInput, { backgroundColor: bgColor, color: textColor, borderColor }]}
                          keyboardType="number-pad"
                          value={result.teamBScore.toString()}
                          onChangeText={(text) => {
                            const newData = [...resultData];
                            newData[index].teamBScore = parseInt(text) || 0;
                            setResultData(newData);
                          }}
                        />
                      </View>
                    );
                  })}
                </ScrollView>
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: borderColor }]}
                onPress={() => setShowResultModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: textColor }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveResult}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

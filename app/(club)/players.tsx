
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

interface PlayerStats {
  points: number;
  eloRating: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
}

interface Player {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'player' | 'staff' | 'admin';
  joinedAt: string;
  stats: PlayerStats;
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
  playerCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    marginBottom: 4,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
  },
  playerActions: {
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
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
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

export default function ClubPlayersScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [newPlayerEmail, setNewPlayerEmail] = useState('');

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textDark : colors.textLight;
  const mutedColor = isDark ? colors.mutedDark : colors.mutedLight;
  const borderColor = isDark ? colors.borderDark : colors.borderLight;

  const loadPlayers = useCallback(async () => {
    try {
      console.log('Loading club players...');
      // TODO: Backend Integration - GET /api/club/players
      // Returns: [{ id, userId, userName, userEmail, role, joinedAt, stats: { points, eloRating, wins, losses, matchesPlayed } }]
      
      const mockPlayers: Player[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Juan Pérez',
          userEmail: 'juan@example.com',
          role: 'player',
          joinedAt: '2024-01-01T10:00:00Z',
          stats: {
            points: 1500,
            eloRating: 1850,
            wins: 25,
            losses: 5,
            matchesPlayed: 30,
          },
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'María García',
          userEmail: 'maria@example.com',
          role: 'player',
          joinedAt: '2024-01-05T10:00:00Z',
          stats: {
            points: 1350,
            eloRating: 1780,
            wins: 22,
            losses: 8,
            matchesPlayed: 30,
          },
        },
      ];
      
      setPlayers(mockPlayers);
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPlayers();
  }, [loadPlayers]);

  const handleAddPlayer = async () => {
    try {
      console.log('Adding player:', newPlayerEmail);
      // TODO: Backend Integration - POST /api/club/players
      // Body: { userEmail: newPlayerEmail, role: 'player' }
      
      setShowAddModal(false);
      setNewPlayerEmail('');
      loadPlayers();
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  const handleRemovePlayer = async () => {
    if (!selectedPlayer) return;

    try {
      console.log('Removing player:', selectedPlayer.id);
      // TODO: Backend Integration - DELETE /api/club/players/:id
      
      setShowRemoveModal(false);
      setSelectedPlayer(null);
      loadPlayers();
    } catch (error) {
      console.error('Error removing player:', error);
    }
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      player: colors.primary,
      staff: colors.warning,
      admin: colors.error,
    };
    return roleColors[role as keyof typeof roleColors] || mutedColor;
  };

  const getRoleText = (role: string) => {
    const roleTexts = {
      player: 'Jugador',
      staff: 'Staff',
      admin: 'Admin',
    };
    return roleTexts[role as keyof typeof roleTexts] || role;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Stack.Screen options={{ headerShown: true, title: 'Jugadores' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen options={{ headerShown: true, title: 'Jugadores' }} />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <IconSymbol ios_icon_name="person.badge.plus" android_material_icon_name="person-add" size={20} color="#fff" />
          <Text style={[styles.addButtonText, { color: '#fff' }]}>Agregar Jugador</Text>
        </TouchableOpacity>

        {players.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol ios_icon_name="person.2" android_material_icon_name="group" size={48} color={mutedColor} />
            <Text style={[styles.emptyText, { color: mutedColor }]}>No hay jugadores registrados</Text>
          </View>
        ) : (
          players.map((player) => {
            const roleColor = getRoleColor(player.role);
            const roleText = getRoleText(player.role);
            const eloText = player.stats.eloRating.toString();
            const winsText = player.stats.wins.toString();
            const lossesText = player.stats.losses.toString();
            const matchesText = player.stats.matchesPlayed.toString();
            
            return (
              <View key={player.id} style={[styles.playerCard, { backgroundColor: cardBg }]}>
                <View style={styles.playerHeader}>
                  <View style={styles.playerInfo}>
                    <Text style={[styles.playerName, { color: textColor }]}>{player.userName}</Text>
                    <Text style={[styles.playerEmail, { color: mutedColor }]}>{player.userEmail}</Text>
                  </View>
                  <View style={[styles.roleBadge, { backgroundColor: roleColor + '20' }]}>
                    <Text style={[styles.roleText, { color: roleColor }]}>{roleText}</Text>
                  </View>
                </View>

                <View style={[styles.statsContainer, { borderTopColor: borderColor }]}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>{eloText}</Text>
                    <Text style={[styles.statLabel, { color: mutedColor }]}>ELO</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.success }]}>{winsText}</Text>
                    <Text style={[styles.statLabel, { color: mutedColor }]}>Victorias</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.error }]}>{lossesText}</Text>
                    <Text style={[styles.statLabel, { color: mutedColor }]}>Derrotas</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: textColor }]}>{matchesText}</Text>
                    <Text style={[styles.statLabel, { color: mutedColor }]}>Partidos</Text>
                  </View>
                </View>

                <View style={styles.playerActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                    onPress={() => {
                      setSelectedPlayer(player);
                      setShowRemoveModal(true);
                    }}
                  >
                    <IconSymbol ios_icon_name="person.badge.minus" android_material_icon_name="person-remove" size={16} color={colors.error} />
                    <Text style={[styles.actionButtonText, { color: colors.error }]}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Player Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Agregar Jugador</Text>
            
            <Text style={[styles.label, { color: textColor }]}>Email del Jugador</Text>
            <TextInput
              style={[styles.input, { backgroundColor: bgColor, color: textColor, borderColor }]}
              placeholder="jugador@example.com"
              placeholderTextColor={mutedColor}
              keyboardType="email-address"
              autoCapitalize="none"
              value={newPlayerEmail}
              onChangeText={setNewPlayerEmail}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: borderColor }]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: textColor }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleAddPlayer}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Remove Player Modal */}
      <Modal visible={showRemoveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Remover Jugador</Text>
            <Text style={[styles.label, { color: mutedColor, marginBottom: 20 }]}>
              ¿Estás seguro de que deseas remover a {selectedPlayer?.userName} del club?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: borderColor }]}
                onPress={() => setShowRemoveModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: textColor }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={handleRemovePlayer}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

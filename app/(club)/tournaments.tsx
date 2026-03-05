
import { colors } from '@/styles/commonStyles';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
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

interface Tournament {
  id: string;
  name: string;
  type: 'Traditional' | 'Super 8' | 'Rey de cancha' | 'Americano';
  status: 'open' | 'closed' | 'in_progress' | 'completed';
  startDate: string;
  endDate: string;
  maxParticipants: number;
  participantCount: number;
  createdAt: string;
}

interface TournamentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'pending' | 'approved' | 'rejected';
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
  tournamentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tournamentInfo: {
    flex: 1,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tournamentType: {
    fontSize: 14,
    marginBottom: 8,
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
  tournamentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  tournamentActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
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
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  pickerButton: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
  },
  pickerOptions: {
    borderTopWidth: 1,
  },
  pickerOption: {
    padding: 12,
  },
  pickerOptionText: {
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
  requestCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  requestEmail: {
    fontSize: 14,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  requestButton: {
    padding: 8,
    borderRadius: 6,
  },
});

export default function ClubTournamentsScreen() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [requests, setRequests] = useState<TournamentRequest[]>([]);
  const [showTypePicker, setShowTypePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Traditional' as Tournament['type'],
    startDate: '',
    endDate: '',
    maxParticipants: '',
  });

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const bgColor = isDark ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textDark : colors.textLight;
  const mutedColor = isDark ? colors.mutedDark : colors.mutedLight;
  const borderColor = isDark ? colors.borderDark : colors.borderLight;

  const loadTournaments = useCallback(async () => {
    try {
      console.log('Loading club tournaments...');
      // TODO: Backend Integration - GET /api/club/tournaments
      // Returns: [{ id, name, type, status, startDate, endDate, maxParticipants, participantCount, createdAt }]
      
      // Mock data for now
      const mockTournaments: Tournament[] = [
        {
          id: '1',
          name: 'Torneo de Verano 2024',
          type: 'Traditional',
          status: 'open',
          startDate: '2024-02-01',
          endDate: '2024-02-15',
          maxParticipants: 16,
          participantCount: 8,
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          name: 'Super 8 Mensual',
          type: 'Super 8',
          status: 'in_progress',
          startDate: '2024-01-20',
          endDate: '2024-01-27',
          maxParticipants: 8,
          participantCount: 8,
          createdAt: '2024-01-10T10:00:00Z',
        },
      ];
      
      setTournaments(mockTournaments);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTournaments();
  }, [loadTournaments]);

  const handleAddTournament = async () => {
    try {
      console.log('Creating tournament:', formData);
      // TODO: Backend Integration - POST /api/club/tournaments
      // Body: { name, type, startDate?, endDate?, maxParticipants? }
      
      setShowAddModal(false);
      setFormData({
        name: '',
        type: 'Traditional',
        startDate: '',
        endDate: '',
        maxParticipants: '',
      });
      loadTournaments();
    } catch (error) {
      console.error('Error creating tournament:', error);
    }
  };

  const handleDeleteTournament = async (tournamentId: string) => {
    try {
      console.log('Deleting tournament:', tournamentId);
      // TODO: Backend Integration - DELETE /api/club/tournaments/:id
      loadTournaments();
    } catch (error) {
      console.error('Error deleting tournament:', error);
    }
  };

  const handleCloseRegistration = async (tournamentId: string) => {
    try {
      console.log('Closing registration for tournament:', tournamentId);
      // TODO: Backend Integration - POST /api/club/tournaments/:id/close-registration
      loadTournaments();
    } catch (error) {
      console.error('Error closing registration:', error);
    }
  };

  const handleViewRequests = async (tournament: Tournament) => {
    try {
      console.log('Loading requests for tournament:', tournament.id);
      setSelectedTournament(tournament);
      // TODO: Backend Integration - GET /api/club/tournaments/:id/requests
      // Returns: [{ id, userId, userName, userEmail, status, createdAt }]
      
      const mockRequests: TournamentRequest[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Juan Pérez',
          userEmail: 'juan@example.com',
          status: 'pending',
          createdAt: '2024-01-16T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'María García',
          userEmail: 'maria@example.com',
          status: 'pending',
          createdAt: '2024-01-16T11:00:00Z',
        },
      ];
      
      setRequests(mockRequests);
      setShowRequestsModal(true);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      console.log('Approving request:', requestId);
      // TODO: Backend Integration - PUT /api/club/tournaments/:tournamentId/requests/:requestId
      // Body: { status: 'approved' }
      
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      console.log('Rejecting request:', requestId);
      // TODO: Backend Integration - PUT /api/club/tournaments/:tournamentId/requests/:requestId
      // Body: { status: 'rejected' }
      
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      open: colors.success,
      closed: colors.warning,
      in_progress: colors.primary,
      completed: mutedColor,
    };
    return statusColors[status as keyof typeof statusColors] || mutedColor;
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      open: 'Abierto',
      closed: 'Cerrado',
      in_progress: 'En Progreso',
      completed: 'Completado',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const getTournamentTypeText = (type: string) => {
    const typeTexts = {
      Traditional: 'Tradicional',
      'Super 8': 'Super 8',
      'Rey de cancha': 'Rey de Cancha',
      Americano: 'Americano',
    };
    return typeTexts[type as keyof typeof typeTexts] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Stack.Screen options={{ headerShown: true, title: 'Torneos' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen options={{ headerShown: true, title: 'Torneos' }} />
      
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
          <IconSymbol ios_icon_name="plus" android_material_icon_name="add" size={20} color="#fff" />
          <Text style={[styles.addButtonText, { color: '#fff' }]}>Crear Torneo</Text>
        </TouchableOpacity>

        {tournaments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol ios_icon_name="trophy" android_material_icon_name="emoji-events" size={48} color={mutedColor} />
            <Text style={[styles.emptyText, { color: mutedColor }]}>No hay torneos creados</Text>
          </View>
        ) : (
          tournaments.map((tournament) => {
            const statusColor = getStatusColor(tournament.status);
            const statusText = getStatusText(tournament.status);
            const typeText = getTournamentTypeText(tournament.type);
            const startDateText = formatDate(tournament.startDate);
            const endDateText = formatDate(tournament.endDate);
            const participantsText = `${tournament.participantCount}/${tournament.maxParticipants}`;

            return (
              <View key={tournament.id} style={[styles.tournamentCard, { backgroundColor: cardBg }]}>
                <View style={styles.tournamentHeader}>
                  <View style={styles.tournamentInfo}>
                    <Text style={[styles.tournamentName, { color: textColor }]}>{tournament.name}</Text>
                    <Text style={[styles.tournamentType, { color: mutedColor }]}>{typeText}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                  </View>
                </View>

                <View style={styles.tournamentDetails}>
                  <View style={styles.detailRow}>
                    <IconSymbol ios_icon_name="calendar" android_material_icon_name="calendar-today" size={16} color={mutedColor} />
                    <Text style={[styles.detailText, { color: mutedColor }]}>{startDateText}</Text>
                    <Text style={[styles.detailText, { color: mutedColor }]}>-</Text>
                    <Text style={[styles.detailText, { color: mutedColor }]}>{endDateText}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <IconSymbol ios_icon_name="person.2" android_material_icon_name="group" size={16} color={mutedColor} />
                    <Text style={[styles.detailText, { color: mutedColor }]}>Participantes:</Text>
                    <Text style={[styles.detailText, { color: textColor }]}>{participantsText}</Text>
                  </View>
                </View>

                <View style={[styles.tournamentActions, { borderTopColor: borderColor }]}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                    onPress={() => handleViewRequests(tournament)}
                  >
                    <IconSymbol ios_icon_name="person.badge.plus" android_material_icon_name="person-add" size={16} color={colors.primary} />
                    <Text style={[styles.actionButtonText, { color: colors.primary }]}>Solicitudes</Text>
                  </TouchableOpacity>
                  
                  {tournament.status === 'open' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.warning + '20' }]}
                      onPress={() => handleCloseRegistration(tournament.id)}
                    >
                      <IconSymbol ios_icon_name="lock" android_material_icon_name="lock" size={16} color={colors.warning} />
                      <Text style={[styles.actionButtonText, { color: colors.warning }]}>Cerrar</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                    onPress={() => handleDeleteTournament(tournament.id)}
                  >
                    <IconSymbol ios_icon_name="trash" android_material_icon_name="delete" size={16} color={colors.error} />
                    <Text style={[styles.actionButtonText, { color: colors.error }]}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Tournament Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Crear Torneo</Text>
            
            <ScrollView>
              <Text style={[styles.label, { color: textColor }]}>Nombre</Text>
              <TextInput
                style={[styles.input, { backgroundColor: bgColor, color: textColor, borderColor }]}
                placeholder="Nombre del torneo"
                placeholderTextColor={mutedColor}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <Text style={[styles.label, { color: textColor }]}>Tipo</Text>
              <View style={[styles.pickerContainer, { borderColor }]}>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowTypePicker(!showTypePicker)}
                >
                  <Text style={[styles.pickerText, { color: textColor }]}>
                    {getTournamentTypeText(formData.type)}
                  </Text>
                  <IconSymbol
                    ios_icon_name={showTypePicker ? 'chevron.up' : 'chevron.down'}
                    android_material_icon_name={showTypePicker ? 'arrow-drop-up' : 'arrow-drop-down'}
                    size={20}
                    color={mutedColor}
                  />
                </TouchableOpacity>
                {showTypePicker && (
                  <View style={[styles.pickerOptions, { borderTopColor: borderColor }]}>
                    {(['Traditional', 'Super 8', 'Rey de cancha', 'Americano'] as const).map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={styles.pickerOption}
                        onPress={() => {
                          setFormData({ ...formData, type });
                          setShowTypePicker(false);
                        }}
                      >
                        <Text style={[styles.pickerOptionText, { color: textColor }]}>
                          {getTournamentTypeText(type)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <Text style={[styles.label, { color: textColor }]}>Fecha de Inicio</Text>
              <TextInput
                style={[styles.input, { backgroundColor: bgColor, color: textColor, borderColor }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={mutedColor}
                value={formData.startDate}
                onChangeText={(text) => setFormData({ ...formData, startDate: text })}
              />

              <Text style={[styles.label, { color: textColor }]}>Fecha de Fin</Text>
              <TextInput
                style={[styles.input, { backgroundColor: bgColor, color: textColor, borderColor }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={mutedColor}
                value={formData.endDate}
                onChangeText={(text) => setFormData({ ...formData, endDate: text })}
              />

              <Text style={[styles.label, { color: textColor }]}>Máximo de Participantes</Text>
              <TextInput
                style={[styles.input, { backgroundColor: bgColor, color: textColor, borderColor }]}
                placeholder="16"
                placeholderTextColor={mutedColor}
                keyboardType="number-pad"
                value={formData.maxParticipants}
                onChangeText={(text) => setFormData({ ...formData, maxParticipants: text })}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: borderColor }]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: textColor }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleAddTournament}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Requests Modal */}
      <Modal visible={showRequestsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Solicitudes - {selectedTournament?.name}
            </Text>
            
            <ScrollView>
              {requests.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: mutedColor }]}>No hay solicitudes pendientes</Text>
                </View>
              ) : (
                requests.map((request) => (
                  <View key={request.id} style={[styles.requestCard, { backgroundColor: bgColor }]}>
                    <View style={styles.requestInfo}>
                      <Text style={[styles.requestName, { color: textColor }]}>{request.userName}</Text>
                      <Text style={[styles.requestEmail, { color: mutedColor }]}>{request.userEmail}</Text>
                    </View>
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={[styles.requestButton, { backgroundColor: colors.success + '20' }]}
                        onPress={() => handleApproveRequest(request.id)}
                      >
                        <IconSymbol ios_icon_name="checkmark" android_material_icon_name="check" size={20} color={colors.success} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.requestButton, { backgroundColor: colors.error + '20' }]}
                        onPress={() => handleRejectRequest(request.id)}
                      >
                        <IconSymbol ios_icon_name="xmark" android_material_icon_name="close" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary, marginTop: 16 }]}
              onPress={() => setShowRequestsModal(false)}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

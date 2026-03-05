
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { playerAPI } from '@/utils/api';

interface TournamentDetails {
  id: string;
  name: string;
  clubName: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  participants: number;
  maxParticipants: number;
  description?: string;
  isRegistered: boolean;
  registrationStatus?: 'pending' | 'approved' | 'rejected';
}

export default function TournamentDetailsScreen() {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState<TournamentDetails | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadTournamentDetails();
  }, [id]);

  const loadTournamentDetails = async () => {
    console.log('TournamentDetailsScreen: Loading tournament', id);
    try {
      setLoading(true);
      const data = await playerAPI.getTournamentDetails(id as string);
      setTournament(data);
    } catch (error: any) {
      console.error('TournamentDetailsScreen: Error loading tournament:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTournament = async () => {
    console.log('TournamentDetailsScreen: Joining tournament', id);
    try {
      setJoining(true);
      await playerAPI.joinTournament(id as string);
      
      setShowJoinModal(false);
      Alert.alert('Éxito', 'Solicitud enviada. El club revisará tu inscripción.', [
        { text: 'OK', onPress: () => loadTournamentDetails() },
      ]);
    } catch (error: any) {
      console.error('TournamentDetailsScreen: Error joining tournament:', error.message);
      Alert.alert('Error', 'No se pudo enviar la solicitud. Intenta nuevamente.');
    } finally {
      setJoining(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Detalles del Torneo', headerShown: true }} />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Detalles del Torneo', headerShown: true }} />
        <Text style={[styles.errorText, { color: theme.error }]}>No se pudo cargar el torneo</Text>
      </View>
    );
  }

  const statusColor = getStatusColor(tournament.status);
  const statusText = getStatusText(tournament.status);
  const typeText = getTournamentTypeText(tournament.type);
  const startDateDisplay = formatDate(tournament.startDate);
  const endDateDisplay = formatDate(tournament.endDate);
  const spotsText = `${tournament.participants}/${tournament.maxParticipants}`;
  const canJoin = tournament.status === 'open' && !tournament.isRegistered && tournament.participants < tournament.maxParticipants;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Detalles del Torneo',
          headerShown: true,
          headerBackTitle: 'Atrás',
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card }]}>
          <View style={styles.headerBadges}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: theme.accent + '20' }]}>
              <Text style={[styles.typeText, { color: theme.accent }]}>{typeText}</Text>
            </View>
          </View>
          <Text style={[styles.tournamentName, { color: theme.text }]}>{tournament.name}</Text>
          <Text style={[styles.clubName, { color: theme.textSecondary }]}>{tournament.clubName}</Text>
        </View>

        {/* Registration Status */}
        {tournament.isRegistered && (
          <View style={[styles.registrationCard, { backgroundColor: theme.card }]}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={32}
              color={theme.success}
            />
            <View style={styles.registrationContent}>
              <Text style={[styles.registrationTitle, { color: theme.text }]}>
                {tournament.registrationStatus === 'approved' && 'Inscripción Aprobada'}
                {tournament.registrationStatus === 'pending' && 'Solicitud Pendiente'}
                {tournament.registrationStatus === 'rejected' && 'Solicitud Rechazada'}
              </Text>
              <Text style={[styles.registrationMessage, { color: theme.textSecondary }]}>
                {tournament.registrationStatus === 'approved' && 'Estás inscrito en este torneo'}
                {tournament.registrationStatus === 'pending' && 'El club está revisando tu solicitud'}
                {tournament.registrationStatus === 'rejected' && 'Tu solicitud fue rechazada'}
              </Text>
            </View>
          </View>
        )}

        {/* Details */}
        <View style={[styles.detailsCard, { backgroundColor: theme.card }]}>
          <View style={styles.detailRow}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="calendar-today"
              size={24}
              color={theme.primary}
            />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Fecha de Inicio</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{startDateDisplay}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="event"
              size={24}
              color={theme.primary}
            />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Fecha de Fin</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{endDateDisplay}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <IconSymbol
              ios_icon_name="person.2"
              android_material_icon_name="group"
              size={24}
              color={theme.primary}
            />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Participantes</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{spotsText}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {tournament.description && (
          <View style={[styles.descriptionCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.descriptionTitle, { color: theme.text }]}>Descripción</Text>
            <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>
              {tournament.description}
            </Text>
          </View>
        )}

        {/* Join Button */}
        {canJoin && (
          <TouchableOpacity
            style={[styles.joinButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowJoinModal(true)}
          >
            <IconSymbol
              ios_icon_name="person.badge.plus"
              android_material_icon_name="person-add"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.joinButtonText}>Solicitar Inscripción</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Join Confirmation Modal */}
      <Modal visible={showJoinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>¿Unirse al Torneo?</Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
              Se enviará una solicitud al club. El administrador revisará tu inscripción y te notificará cuando sea aprobada.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.background }]}
                onPress={() => setShowJoinModal(false)}
                disabled={joining}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleJoinTournament}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Confirmar</Text>
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
    padding: 20,
  },
  header: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  headerBadges: {
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
    fontSize: 12,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tournamentName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  clubName: {
    fontSize: 16,
  },
  registrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
  },
  registrationContent: {
    flex: 1,
  },
  registrationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  registrationMessage: {
    fontSize: 14,
  },
  detailsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailContent: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
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
    lineHeight: 22,
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

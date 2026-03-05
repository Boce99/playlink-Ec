
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

interface BookingDetails {
  id: string;
  clubName: string;
  courtName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled' | 'checked_in' | 'no_show' | 'completed';
  qrCode: string;
  createdAt: string;
}

export default function BookingDetailsScreen() {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadBookingDetails();
  }, [id]);

  const loadBookingDetails = async () => {
    console.log('BookingDetailsScreen: Loading booking', id);
    try {
      setLoading(true);
      // TODO: Backend Integration - GET /api/bookings/:id to fetch booking details
      
      // Mock data
      setBooking({
        id: id as string,
        clubName: 'Club Padel Central',
        courtName: 'Cancha 1',
        bookingDate: '2024-01-20',
        startTime: '18:00',
        endTime: '19:30',
        status: 'confirmed',
        qrCode: 'QR123456',
        createdAt: '2024-01-15T10:30:00Z',
      });
    } catch (error: any) {
      console.error('BookingDetailsScreen: Error loading booking:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    console.log('BookingDetailsScreen: Cancelling booking', id);
    try {
      setCancelling(true);
      await playerAPI.cancelBooking(id as string);
      
      setShowCancelModal(false);
      Alert.alert('Éxito', 'Reserva cancelada exitosamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('BookingDetailsScreen: Error cancelling booking:', error.message);
      Alert.alert('Error', 'No se pudo cancelar la reserva. Intenta nuevamente.');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      confirmed: theme.success,
      cancelled: theme.error,
      checked_in: theme.secondary,
      no_show: theme.error,
      completed: theme.textSecondary,
    };
    return statusColors[status as keyof typeof statusColors] || theme.textSecondary;
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      checked_in: 'Check-in realizado',
      no_show: 'No asistió',
      completed: 'Completada',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Detalles de Reserva', headerShown: true }} />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Detalles de Reserva', headerShown: true }} />
        <Text style={[styles.errorText, { color: theme.error }]}>No se pudo cargar la reserva</Text>
      </View>
    );
  }

  const statusColor = getStatusColor(booking.status);
  const statusText = getStatusText(booking.status);
  const dateDisplay = formatDate(booking.bookingDate);
  const canCancel = booking.status === 'confirmed';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Detalles de Reserva',
          headerShown: true,
          headerBackTitle: 'Atrás',
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        </View>

        {/* QR Code (if confirmed) */}
        {booking.status === 'confirmed' && (
          <View style={[styles.qrContainer, { backgroundColor: theme.card }]}>
            <IconSymbol
              ios_icon_name="qrcode"
              android_material_icon_name="qr-code"
              size={120}
              color={theme.text}
            />
            <Text style={[styles.qrText, { color: theme.textSecondary }]}>
              Muestra este código QR en el club
            </Text>
            <Text style={[styles.qrCode, { color: theme.text }]}>{booking.qrCode}</Text>
          </View>
        )}

        {/* Booking Details */}
        <View style={[styles.detailsCard, { backgroundColor: theme.card }]}>
          <View style={styles.detailRow}>
            <IconSymbol
              ios_icon_name="building.2"
              android_material_icon_name="business"
              size={24}
              color={theme.primary}
            />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Club</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{booking.clubName}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <IconSymbol
              ios_icon_name="sportscourt"
              android_material_icon_name="sports-tennis"
              size={24}
              color={theme.primary}
            />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Cancha</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{booking.courtName}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="calendar-today"
              size={24}
              color={theme.primary}
            />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Fecha</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{dateDisplay}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <IconSymbol
              ios_icon_name="clock"
              android_material_icon_name="access-time"
              size={24}
              color={theme.primary}
            />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Horario</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {booking.startTime}
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>-</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {booking.endTime}
              </Text>
            </View>
          </View>
        </View>

        {/* Cancel Button */}
        {canCancel && (
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.error }]}
            onPress={() => setShowCancelModal(true)}
          >
            <IconSymbol
              ios_icon_name="xmark.circle"
              android_material_icon_name="cancel"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.cancelButtonText}>Cancelar Reserva</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>¿Cancelar Reserva?</Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
              Esta acción no se puede deshacer. ¿Estás seguro de que deseas cancelar esta reserva?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.background }]}
                onPress={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>No, mantener</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.error }]}
                onPress={handleCancelBooking}
                disabled={cancelling}
              >
                {cancelling ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Sí, cancelar</Text>
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
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrContainer: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    marginBottom: 24,
  },
  qrText: {
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  qrCode: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  detailsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailContent: {
    marginLeft: 16,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonText: {
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


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
  Platform,
} from 'react-native';

interface Booking {
  id: string;
  userName: string;
  userEmail: string;
  courtName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled' | 'checked_in' | 'no_show' | 'completed';
  qrCode: string;
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
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userEmail: {
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
  bookingDetails: {
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
  bookingActions: {
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
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
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

export default function ClubBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textDark : colors.textLight;
  const mutedColor = isDark ? colors.mutedDark : colors.mutedLight;
  const borderColor = isDark ? colors.borderDark : colors.borderLight;

  const loadBookings = useCallback(async () => {
    try {
      console.log('Loading club bookings...');
      // TODO: Backend Integration - GET /api/club/bookings
      // Returns: [{ id, userName, userEmail, courtName, bookingDate, startTime, endTime, status, qrCode, createdAt }]
      
      const mockBookings: Booking[] = [
        {
          id: '1',
          userName: 'Juan Pérez',
          userEmail: 'juan@example.com',
          courtName: 'Cancha 1',
          bookingDate: '2024-01-25',
          startTime: '10:00',
          endTime: '11:30',
          status: 'confirmed',
          qrCode: 'QR123',
          createdAt: '2024-01-20T10:00:00Z',
        },
        {
          id: '2',
          userName: 'María García',
          userEmail: 'maria@example.com',
          courtName: 'Cancha 2',
          bookingDate: '2024-01-25',
          startTime: '14:00',
          endTime: '15:30',
          status: 'checked_in',
          qrCode: 'QR124',
          createdAt: '2024-01-20T11:00:00Z',
        },
        {
          id: '3',
          userName: 'Carlos López',
          userEmail: 'carlos@example.com',
          courtName: 'Cancha 1',
          bookingDate: '2024-01-24',
          startTime: '16:00',
          endTime: '17:30',
          status: 'completed',
          qrCode: 'QR125',
          createdAt: '2024-01-19T10:00:00Z',
        },
      ];
      
      setBookings(mockBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBookings();
  }, [loadBookings]);

  const handleUpdateStatus = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      console.log('Updating booking status:', bookingId, newStatus);
      // TODO: Backend Integration - PUT /api/club/bookings/:id/status
      // Body: { status: newStatus }
      
      loadBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      console.log('Cancelling booking:', selectedBooking.id);
      // TODO: Backend Integration - DELETE /api/club/bookings/:id
      
      setShowCancelModal(false);
      setSelectedBooking(null);
      loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      confirmed: colors.primary,
      cancelled: colors.error,
      checked_in: colors.success,
      no_show: colors.warning,
      completed: mutedColor,
    };
    return statusColors[status as keyof typeof statusColors] || mutedColor;
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      checked_in: 'Check-in',
      no_show: 'No Show',
      completed: 'Completada',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filteredBookings = bookings.filter((booking) => {
    if (selectedFilter === 'all') return true;
    return booking.status === selectedFilter;
  });

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Stack.Screen options={{ headerShown: true, title: 'Reservas' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen options={{ headerShown: true, title: 'Reservas' }} />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {[
            { key: 'all', label: 'Todas' },
            { key: 'confirmed', label: 'Confirmadas' },
            { key: 'checked_in', label: 'Check-in' },
            { key: 'completed', label: 'Completadas' },
          ].map((filter) => {
            const isSelected = selectedFilter === filter.key;
            
            return (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: isSelected ? colors.primary : 'transparent',
                    borderColor: isSelected ? colors.primary : borderColor,
                  },
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    { color: isSelected ? '#fff' : textColor },
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol ios_icon_name="calendar" android_material_icon_name="event" size={48} color={mutedColor} />
            <Text style={[styles.emptyText, { color: mutedColor }]}>No hay reservas</Text>
          </View>
        ) : (
          filteredBookings.map((booking) => {
            const statusColor = getStatusColor(booking.status);
            const statusText = getStatusText(booking.status);
            const dateText = formatDate(booking.bookingDate);
            const timeText = `${booking.startTime} - ${booking.endTime}`;
            
            return (
              <View key={booking.id} style={[styles.bookingCard, { backgroundColor: cardBg }]}>
                <View style={styles.bookingHeader}>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: textColor }]}>{booking.userName}</Text>
                    <Text style={[styles.userEmail, { color: mutedColor }]}>{booking.userEmail}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                  </View>
                </View>

                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <IconSymbol ios_icon_name="sportscourt" android_material_icon_name="sports-tennis" size={16} color={mutedColor} />
                    <Text style={[styles.detailText, { color: textColor }]}>{booking.courtName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <IconSymbol ios_icon_name="calendar" android_material_icon_name="calendar-today" size={16} color={mutedColor} />
                    <Text style={[styles.detailText, { color: mutedColor }]}>{dateText}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <IconSymbol ios_icon_name="clock" android_material_icon_name="access-time" size={16} color={mutedColor} />
                    <Text style={[styles.detailText, { color: mutedColor }]}>{timeText}</Text>
                  </View>
                </View>

                {booking.status === 'confirmed' && (
                  <View style={[styles.bookingActions, { borderTopColor: borderColor }]}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.success + '20' }]}
                      onPress={() => handleUpdateStatus(booking.id, 'checked_in')}
                    >
                      <IconSymbol ios_icon_name="checkmark" android_material_icon_name="check" size={16} color={colors.success} />
                      <Text style={[styles.actionButtonText, { color: colors.success }]}>Check-in</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                      onPress={() => {
                        setSelectedBooking(booking);
                        setShowCancelModal(true);
                      }}
                    >
                      <IconSymbol ios_icon_name="xmark" android_material_icon_name="close" size={16} color={colors.error} />
                      <Text style={[styles.actionButtonText, { color: colors.error }]}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Cancelar Reserva</Text>
            <Text style={[styles.modalText, { color: mutedColor }]}>
              ¿Estás seguro de que deseas cancelar esta reserva?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: borderColor }]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: textColor }]}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={handleCancelBooking}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Sí, Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

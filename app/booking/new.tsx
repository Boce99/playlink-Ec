
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { playerAPI } from '@/utils/api';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Club {
  id: string;
  name: string;
}

interface Court {
  id: string;
  name: string;
  isAvailable: boolean;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function NewBookingScreen() {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showClubModal, setShowClubModal] = useState(false);
  const [showCourtModal, setShowCourtModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    console.log('NewBookingScreen: Loading clubs');
    try {
      const clubsData = await playerAPI.getClubs();
      setClubs(clubsData);
    } catch (error: any) {
      console.error('NewBookingScreen: Error loading clubs:', error.message);
    }
  };

  const loadCourts = async (clubId: string) => {
    console.log('NewBookingScreen: Loading courts for club', clubId);
    try {
      setLoading(true);
      // TODO: Backend Integration - GET /api/clubs/:clubId/courts to fetch available courts
      
      // Mock data
      setCourts([
        { id: '1', name: 'Cancha 1', isAvailable: true },
        { id: '2', name: 'Cancha 2', isAvailable: true },
        { id: '3', name: 'Cancha 3', isAvailable: false },
      ]);
    } catch (error: any) {
      console.error('NewBookingScreen: Error loading courts:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async (clubId: string, courtId: string, date: Date) => {
    console.log('NewBookingScreen: Loading time slots', { clubId, courtId, date });
    try {
      setLoading(true);
      // TODO: Backend Integration - GET /api/clubs/:clubId/courts/:courtId/availability?date=YYYY-MM-DD
      
      // Mock data
      setTimeSlots([
        { startTime: '08:00', endTime: '09:30', isAvailable: true },
        { startTime: '09:30', endTime: '11:00', isAvailable: false },
        { startTime: '11:00', endTime: '12:30', isAvailable: true },
        { startTime: '14:00', endTime: '15:30', isAvailable: true },
        { startTime: '15:30', endTime: '17:00', isAvailable: true },
        { startTime: '17:00', endTime: '18:30', isAvailable: false },
        { startTime: '18:30', endTime: '20:00', isAvailable: true },
      ]);
    } catch (error: any) {
      console.error('NewBookingScreen: Error loading time slots:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClubSelect = (club: Club) => {
    console.log('NewBookingScreen: Club selected', club.name);
    setSelectedClub(club);
    setSelectedCourt(null);
    setSelectedTimeSlot(null);
    setShowClubModal(false);
    loadCourts(club.id);
  };

  const handleCourtSelect = (court: Court) => {
    console.log('NewBookingScreen: Court selected', court.name);
    setSelectedCourt(court);
    setSelectedTimeSlot(null);
    setShowCourtModal(false);
    if (selectedClub) {
      loadTimeSlots(selectedClub.id, court.id, selectedDate);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      console.log('NewBookingScreen: Date selected', date);
      setSelectedDate(date);
      setSelectedTimeSlot(null);
      if (selectedClub && selectedCourt) {
        loadTimeSlots(selectedClub.id, selectedCourt.id, date);
      }
    }
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    console.log('NewBookingScreen: Time slot selected', slot);
    setSelectedTimeSlot(slot);
    setShowTimeModal(false);
  };

  const handleCreateBooking = async () => {
    if (!selectedClub || !selectedCourt || !selectedTimeSlot) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    console.log('NewBookingScreen: Creating booking');
    try {
      setLoading(true);
      
      const bookingData = {
        clubId: selectedClub.id,
        courtId: selectedCourt.id,
        bookingDate: selectedDate.toISOString().split('T')[0],
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
      };

      await playerAPI.createBooking(bookingData);
      
      Alert.alert('Éxito', 'Reserva creada exitosamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('NewBookingScreen: Error creating booking:', error.message);
      Alert.alert('Error', 'No se pudo crear la reserva. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const dateDisplay = formatDate(selectedDate);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Nueva Reserva',
          headerShown: true,
          headerBackTitle: 'Atrás',
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Club Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Club</Text>
          <TouchableOpacity
            style={[styles.selector, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setShowClubModal(true)}
          >
            <Text style={[styles.selectorText, { color: selectedClub ? theme.text : theme.textSecondary }]}>
              {selectedClub ? selectedClub.name : 'Selecciona un club'}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="expand-more"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Court Selection */}
        {selectedClub && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Cancha</Text>
            <TouchableOpacity
              style={[styles.selector, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setShowCourtModal(true)}
              disabled={courts.length === 0}
            >
              <Text style={[styles.selectorText, { color: selectedCourt ? theme.text : theme.textSecondary }]}>
                {selectedCourt ? selectedCourt.name : 'Selecciona una cancha'}
              </Text>
              <IconSymbol
                ios_icon_name="chevron.down"
                android_material_icon_name="expand-more"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Date Selection */}
        {selectedCourt && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Fecha</Text>
            <TouchableOpacity
              style={[styles.selector, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.selectorText, { color: theme.text }]}>
                {dateDisplay}
              </Text>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Time Slot Selection */}
        {selectedCourt && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Horario</Text>
            <TouchableOpacity
              style={[styles.selector, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setShowTimeModal(true)}
              disabled={timeSlots.length === 0}
            >
              <Text style={[styles.selectorText, { color: selectedTimeSlot ? theme.text : theme.textSecondary }]}>
                {selectedTimeSlot ? `${selectedTimeSlot.startTime} - ${selectedTimeSlot.endTime}` : 'Selecciona un horario'}
              </Text>
              <IconSymbol
                ios_icon_name="chevron.down"
                android_material_icon_name="expand-more"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Summary */}
        {selectedClub && selectedCourt && selectedTimeSlot && (
          <View style={[styles.summary, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryTitle, { color: theme.text }]}>Resumen de Reserva</Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Club:</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>{selectedClub.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Cancha:</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>{selectedCourt.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Fecha:</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>{dateDisplay}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Horario:</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {selectedTimeSlot.startTime}
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>-</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {selectedTimeSlot.endTime}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Create Button */}
      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          style={[
            styles.createButton,
            { backgroundColor: theme.primary },
            (!selectedClub || !selectedCourt || !selectedTimeSlot || loading) && styles.createButtonDisabled,
          ]}
          onPress={handleCreateBooking}
          disabled={!selectedClub || !selectedCourt || !selectedTimeSlot || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Confirmar Reserva</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Club Modal */}
      <Modal visible={showClubModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Selecciona un Club</Text>
              <TouchableOpacity onPress={() => setShowClubModal(false)}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {clubs.map((club) => (
                <TouchableOpacity
                  key={club.id}
                  style={[styles.modalItem, { borderBottomColor: theme.border }]}
                  onPress={() => handleClubSelect(club)}
                >
                  <Text style={[styles.modalItemText, { color: theme.text }]}>{club.name}</Text>
                  {selectedClub?.id === club.id && (
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={20}
                      color={theme.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Court Modal */}
      <Modal visible={showCourtModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Selecciona una Cancha</Text>
              <TouchableOpacity onPress={() => setShowCourtModal(false)}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {courts.map((court) => (
                <TouchableOpacity
                  key={court.id}
                  style={[styles.modalItem, { borderBottomColor: theme.border }]}
                  onPress={() => handleCourtSelect(court)}
                  disabled={!court.isAvailable}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      { color: court.isAvailable ? theme.text : theme.textSecondary },
                    ]}
                  >
                    {court.name}
                  </Text>
                  {!court.isAvailable && (
                    <Text style={[styles.unavailableText, { color: theme.error }]}>No disponible</Text>
                  )}
                  {selectedCourt?.id === court.id && (
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={20}
                      color={theme.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Slot Modal */}
      <Modal visible={showTimeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Selecciona un Horario</Text>
              <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {timeSlots.map((slot, index) => {
                const timeText = `${slot.startTime} - ${slot.endTime}`;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.modalItem, { borderBottomColor: theme.border }]}
                    onPress={() => handleTimeSlotSelect(slot)}
                    disabled={!slot.isAvailable}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        { color: slot.isAvailable ? theme.text : theme.textSecondary },
                      ]}
                    >
                      {timeText}
                    </Text>
                    {!slot.isAvailable && (
                      <Text style={[styles.unavailableText, { color: theme.error }]}>Ocupado</Text>
                    )}
                    {selectedTimeSlot?.startTime === slot.startTime && (
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={20}
                        color={theme.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectorText: {
    fontSize: 16,
  },
  summary: {
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  createButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 16,
    flex: 1,
  },
  unavailableText: {
    fontSize: 12,
    marginRight: 8,
  },
});

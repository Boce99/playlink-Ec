
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { clubAPI } from '@/utils/api';
import { useClub } from '@/contexts/ClubContext';

interface BookingDetails {
  id: string;
  userName: string;
  courtName: string;
  startTime: string;
  endTime: string;
}

export default function QRScannerScreen() {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { selectedClub } = useClub();

  const [scanning, setScanning] = useState(false);
  const [validating, setValidating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleScanQR = async (qrCode: string) => {
    if (!selectedClub) {
      console.error('QRScannerScreen: No club selected');
      setValidationSuccess(false);
      setErrorMessage('No hay club seleccionado');
      setShowResultModal(true);
      return;
    }

    console.log('QRScannerScreen: Validating QR code:', qrCode);
    try {
      setValidating(true);
      const result = await clubAPI.validateQR(selectedClub.id, qrCode);

      if (result.success && result.booking) {
        console.log('QRScannerScreen: QR validation successful');
        setValidationSuccess(true);
        setBookingDetails(result.booking);
      } else {
        console.log('QRScannerScreen: QR validation failed:', result.error);
        setValidationSuccess(false);
        setErrorMessage(result.error || 'Código QR inválido');
      }
      setShowResultModal(true);
    } catch (error: any) {
      console.error('QRScannerScreen: Error validating QR:', error.message);
      setValidationSuccess(false);
      setErrorMessage('Error al validar el código QR');
      setShowResultModal(true);
    } finally {
      setValidating(false);
      setScanning(false);
    }
  };

  const handleManualInput = () => {
    const mockQRCode = 'BOOKING-123-1234567890-abc123';
    handleScanQR(mockQRCode);
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
    setBookingDetails(null);
    setErrorMessage('');
  };

  if (!selectedClub) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Escanear QR', headerShown: true }} />
        <View style={styles.errorContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle"
            android_material_icon_name="warning"
            size={64}
            color={theme.error}
          />
          <Text style={[styles.errorTitle, { color: theme.text }]}>
            No hay club seleccionado
          </Text>
          <Text style={[styles.errorSubtext, { color: theme.textSecondary }]}>
            Por favor selecciona un club desde el panel de administración
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Escanear QR', headerShown: true }} />

      <View style={styles.content}>
        <View style={[styles.scannerContainer, { backgroundColor: theme.card }]}>
          <View style={[styles.scannerFrame, { borderColor: theme.primary }]}>
            <View style={[styles.corner, styles.topLeft, { borderColor: theme.primary }]} />
            <View style={[styles.corner, styles.topRight, { borderColor: theme.primary }]} />
            <View style={[styles.corner, styles.bottomLeft, { borderColor: theme.primary }]} />
            <View style={[styles.corner, styles.bottomRight, { borderColor: theme.primary }]} />
            
            {scanning ? (
              <ActivityIndicator size="large" color={theme.primary} />
            ) : (
              <IconSymbol
                ios_icon_name="qrcode"
                android_material_icon_name="qr-code-scanner"
                size={80}
                color={theme.textSecondary}
              />
            )}
          </View>
        </View>

        <Text style={[styles.instructionText, { color: theme.text }]}>
          Escanea el código QR de la reserva
        </Text>
        <Text style={[styles.subText, { color: theme.textSecondary }]}>
          Coloca el código QR dentro del marco para validar el check-in
        </Text>

        <TouchableOpacity
          style={[styles.scanButton, { backgroundColor: theme.primary }]}
          onPress={handleManualInput}
          disabled={scanning || validating}
        >
          {validating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <IconSymbol
                ios_icon_name="camera"
                android_material_icon_name="camera"
                size={24}
                color="#fff"
              />
              <Text style={styles.scanButtonText}>Escanear Código QR</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <IconSymbol
            ios_icon_name="info.circle"
            android_material_icon_name="info"
            size={20}
            color={theme.primary}
          />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Solo se pueden validar reservas confirmadas para el día de hoy
          </Text>
        </View>
      </View>

      <Modal visible={showResultModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {validationSuccess ? (
              <>
                <View style={[styles.resultIcon, { backgroundColor: theme.success + '20' }]}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={64}
                    color={theme.success}
                  />
                </View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>¡Check-in Exitoso!</Text>
                {bookingDetails && (
                  <View style={styles.bookingInfo}>
                    <View style={styles.bookingRow}>
                      <Text style={[styles.bookingLabel, { color: theme.textSecondary }]}>Jugador:</Text>
                      <Text style={[styles.bookingValue, { color: theme.text }]}>
                        {bookingDetails.userName}
                      </Text>
                    </View>
                    <View style={styles.bookingRow}>
                      <Text style={[styles.bookingLabel, { color: theme.textSecondary }]}>Cancha:</Text>
                      <Text style={[styles.bookingValue, { color: theme.text }]}>
                        {bookingDetails.courtName}
                      </Text>
                    </View>
                    <View style={styles.bookingRow}>
                      <Text style={[styles.bookingLabel, { color: theme.textSecondary }]}>Horario:</Text>
                      <Text style={[styles.bookingValue, { color: theme.text }]}>
                        {bookingDetails.startTime} - {bookingDetails.endTime}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <>
                <View style={[styles.resultIcon, { backgroundColor: theme.error + '20' }]}>
                  <IconSymbol
                    ios_icon_name="xmark.circle.fill"
                    android_material_icon_name="cancel"
                    size={64}
                    color={theme.error}
                  />
                </View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Error de Validación</Text>
                <Text style={[styles.errorText, { color: theme.textSecondary }]}>
                  {errorMessage}
                </Text>
              </>
            )}
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={handleCloseModal}
            >
              <Text style={styles.modalButtonText}>Continuar</Text>
            </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  scannerContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    padding: 40,
    marginTop: 40,
    marginBottom: 32,
  },
  scannerFrame: {
    flex: 1,
    borderWidth: 3,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 16,
  },
  instructionText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
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
    padding: 32,
    alignItems: 'center',
  },
  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  bookingInfo: {
    width: '100%',
    marginBottom: 24,
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  bookingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookingValue: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

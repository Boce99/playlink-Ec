
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  TextInput,
  Platform,
  Modal,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { clubAPI } from '@/utils/api';

interface ClubInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
}

export default function ClubSettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [editedInfo, setEditedInfo] = useState<Partial<ClubInfo>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const loadClubInfo = useCallback(async () => {
    console.log('ClubSettingsScreen: Loading club information');
    try {
      setLoading(true);
      // TODO: Backend Integration - GET /api/club/info
      // Returns: { id, name, address, phone, email, createdAt }
      const info = await clubAPI.getClubInfo();
      console.log('ClubSettingsScreen: Loaded club info:', info.name);
      setClubInfo(info);
      setEditedInfo({
        name: info.name,
        address: info.address,
        phone: info.phone,
        email: info.email,
      });
    } catch (error: any) {
      console.error('ClubSettingsScreen: Error loading club info:', error.message);
      // Mock data for development
      const mockInfo: ClubInfo = {
        id: '1',
        name: 'Club Padel Central',
        address: 'Av. Principal 123, Quito',
        phone: '+593 99 123 4567',
        email: 'info@padelcentral.com',
        createdAt: '2024-01-01T00:00:00Z',
      };
      setClubInfo(mockInfo);
      setEditedInfo({
        name: mockInfo.name,
        address: mockInfo.address,
        phone: mockInfo.phone,
        email: mockInfo.email,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClubInfo();
  }, [loadClubInfo]);

  const handleSave = async () => {
    console.log('ClubSettingsScreen: Saving club information');
    try {
      setSaving(true);
      // TODO: Backend Integration - PUT /api/club/info
      // Body: { name?, address?, phone?, email? }
      // Returns: updated club object
      await clubAPI.updateClubInfo(editedInfo);
      console.log('ClubSettingsScreen: Successfully saved club info');
      setShowSuccessModal(true);
      loadClubInfo();
    } catch (error: any) {
      console.error('ClubSettingsScreen: Error saving club info:', error.message);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    if (!clubInfo) return false;
    return (
      editedInfo.name !== clubInfo.name ||
      editedInfo.address !== clubInfo.address ||
      editedInfo.phone !== clubInfo.phone ||
      editedInfo.email !== clubInfo.email
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Configuración del Club', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const changesDetected = hasChanges();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Configuración del Club', headerShown: true }} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Información del Club</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Nombre del Club</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={editedInfo.name}
              onChangeText={(text) => setEditedInfo({ ...editedInfo, name: text })}
              placeholder="Nombre del club"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Dirección</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={editedInfo.address}
              onChangeText={(text) => setEditedInfo({ ...editedInfo, address: text })}
              placeholder="Dirección completa"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Teléfono</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={editedInfo.phone}
              onChangeText={(text) => setEditedInfo({ ...editedInfo, phone: text })}
              placeholder="+593 99 123 4567"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={editedInfo.email}
              onChangeText={(text) => setEditedInfo({ ...editedInfo, email: text })}
              placeholder="info@club.com"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {clubInfo && (
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <IconSymbol
              ios_icon_name="info.circle"
              android_material_icon_name="info"
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Club creado el {new Date(clubInfo.createdAt).toLocaleDateString('es-ES')}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: changesDetected ? theme.primary : theme.border },
          ]}
          onPress={handleSave}
          disabled={!changesDetected || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <IconSymbol
                ios_icon_name="checkmark.circle"
                android_material_icon_name="check-circle"
                size={20}
                color="#fff"
              />
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.successIcon, { backgroundColor: theme.success + '20' }]}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={48}
                color={theme.success}
              />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>¡Cambios Guardados!</Text>
            <Text style={[styles.modalText, { color: theme.textSecondary }]}>
              La información del club se ha actualizado correctamente.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowSuccessModal(false)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
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

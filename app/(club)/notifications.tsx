
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  TextInput,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { clubAPI } from '@/utils/api';

type RecipientType = 'all' | 'players' | 'staff';

export default function ClubNotificationsScreen() {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [recipientType, setRecipientType] = useState<RecipientType>('all');
  const [sending, setSending] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [notificationsSent, setNotificationsSent] = useState(0);

  const handleSendNotification = useCallback(async () => {
    if (!title.trim() || !body.trim()) {
      console.log('ClubNotificationsScreen: Title and body are required');
      return;
    }

    console.log('ClubNotificationsScreen: Sending notification to', recipientType);
    try {
      setSending(true);
      // TODO: Backend Integration - POST /api/club/notifications/send
      // Body: { title: string, body: string, recipientType: 'all' | 'players' | 'staff' }
      // Returns: { success: true, notificationsSent: number }
      const result = await clubAPI.sendNotification({ title, body, recipientType });

      console.log('ClubNotificationsScreen: Notifications sent:', result.notificationsSent);
      setNotificationsSent(result.notificationsSent);
      setShowSuccessModal(true);
      setTitle('');
      setBody('');
      setRecipientType('all');
    } catch (error: any) {
      console.error('ClubNotificationsScreen: Error sending notifications:', error.message);
    } finally {
      setSending(false);
    }
  }, [title, body, recipientType]);

  const canSend = title.trim().length > 0 && body.trim().length > 0 && !sending;

  const recipientTypeText = recipientType === 'all' ? 'Todos los miembros' : recipientType === 'players' ? 'Solo jugadores' : 'Solo staff';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Enviar Notificaciones', headerShown: true }} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Nueva Notificación</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Título</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Título de la notificación"
              placeholderTextColor={theme.textSecondary}
              maxLength={100}
            />
            <Text style={[styles.charCount, { color: theme.textSecondary }]}>
              {title.length}/100
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Mensaje</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={body}
              onChangeText={setBody}
              placeholder="Escribe el mensaje de la notificación..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={6}
              maxLength={500}
            />
            <Text style={[styles.charCount, { color: theme.textSecondary }]}>
              {body.length}/500
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Destinatarios</Text>
            <View style={styles.recipientButtons}>
              <TouchableOpacity
                style={[
                  styles.recipientButton,
                  { backgroundColor: recipientType === 'all' ? theme.primary : theme.background, borderColor: theme.border },
                ]}
                onPress={() => setRecipientType('all')}
              >
                <IconSymbol
                  ios_icon_name="person.3"
                  android_material_icon_name="groups"
                  size={20}
                  color={recipientType === 'all' ? '#fff' : theme.text}
                />
                <Text style={[styles.recipientButtonText, { color: recipientType === 'all' ? '#fff' : theme.text }]}>
                  Todos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.recipientButton,
                  { backgroundColor: recipientType === 'players' ? theme.primary : theme.background, borderColor: theme.border },
                ]}
                onPress={() => setRecipientType('players')}
              >
                <IconSymbol
                  ios_icon_name="person.2"
                  android_material_icon_name="group"
                  size={20}
                  color={recipientType === 'players' ? '#fff' : theme.text}
                />
                <Text style={[styles.recipientButtonText, { color: recipientType === 'players' ? '#fff' : theme.text }]}>
                  Jugadores
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.recipientButton,
                  { backgroundColor: recipientType === 'staff' ? theme.primary : theme.background, borderColor: theme.border },
                ]}
                onPress={() => setRecipientType('staff')}
              >
                <IconSymbol
                  ios_icon_name="person.badge.key"
                  android_material_icon_name="badge"
                  size={20}
                  color={recipientType === 'staff' ? '#fff' : theme.text}
                />
                <Text style={[styles.recipientButtonText, { color: recipientType === 'staff' ? '#fff' : theme.text }]}>
                  Staff
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.previewCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>Vista Previa</Text>
          <View style={[styles.notificationPreview, { backgroundColor: theme.background }]}>
            <View style={styles.previewHeader}>
              <IconSymbol
                ios_icon_name="bell.fill"
                android_material_icon_name="notifications"
                size={20}
                color={theme.primary}
              />
              <Text style={[styles.previewTitle, { color: theme.text }]}>
                {title || 'Título de la notificación'}
              </Text>
            </View>
            <Text style={[styles.previewBody, { color: theme.textSecondary }]}>
              {body || 'El mensaje de la notificación aparecerá aquí...'}
            </Text>
            <Text style={[styles.previewRecipient, { color: theme.textSecondary }]}>
              Para: {recipientTypeText}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: canSend ? theme.primary : theme.border },
          ]}
          onPress={handleSendNotification}
          disabled={!canSend}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <IconSymbol
                ios_icon_name="paperplane.fill"
                android_material_icon_name="send"
                size={20}
                color="#fff"
              />
              <Text style={styles.sendButtonText}>Enviar Notificación</Text>
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
                size={64}
                color={theme.success}
              />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>¡Notificación Enviada!</Text>
            <Text style={[styles.modalText, { color: theme.textSecondary }]}>
              Se ha enviado la notificación a {notificationsSent} {notificationsSent === 1 ? 'persona' : 'personas'}.
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
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  recipientButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  recipientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  recipientButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  previewCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  notificationPreview: {
    borderRadius: 12,
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  previewBody: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  previewRecipient: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonText: {
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


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

interface StaffMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'staff' | 'admin';
  joinedAt: string;
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
  staffCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  staffEmail: {
    fontSize: 12,
    marginBottom: 4,
  },
  joinedText: {
    fontSize: 11,
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
  staffActions: {
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

export default function ClubStaffScreen() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [newStaffEmail, setNewStaffEmail] = useState('');

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textDark : colors.textLight;
  const mutedColor = isDark ? colors.mutedDark : colors.mutedLight;
  const borderColor = isDark ? colors.borderDark : colors.borderLight;

  const loadStaff = useCallback(async () => {
    try {
      console.log('Loading club staff...');
      // TODO: Backend Integration - GET /api/club/staff
      // Returns: [{ id, userId, userName, userEmail, role, joinedAt }]
      
      const mockStaff: StaffMember[] = [
        {
          id: '1',
          userId: 'staff1',
          userName: 'Pedro Administrador',
          userEmail: 'pedro@club.com',
          role: 'admin',
          joinedAt: '2024-01-01T10:00:00Z',
        },
        {
          id: '2',
          userId: 'staff2',
          userName: 'Laura Staff',
          userEmail: 'laura@club.com',
          role: 'staff',
          joinedAt: '2024-01-10T10:00:00Z',
        },
      ];
      
      setStaff(mockStaff);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStaff();
  }, [loadStaff]);

  const handleAddStaff = async () => {
    try {
      console.log('Adding staff member:', newStaffEmail);
      // TODO: Backend Integration - POST /api/club/staff
      // Body: { userEmail: newStaffEmail }
      
      setShowAddModal(false);
      setNewStaffEmail('');
      loadStaff();
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const handleRemoveStaff = async () => {
    if (!selectedStaff) return;

    try {
      console.log('Removing staff member:', selectedStaff.id);
      // TODO: Backend Integration - DELETE /api/club/staff/:id
      
      setShowRemoveModal(false);
      setSelectedStaff(null);
      loadStaff();
    } catch (error) {
      console.error('Error removing staff:', error);
    }
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      staff: colors.warning,
      admin: colors.error,
    };
    return roleColors[role as keyof typeof roleColors] || mutedColor;
  };

  const getRoleText = (role: string) => {
    const roleTexts = {
      staff: 'Staff',
      admin: 'Administrador',
    };
    return roleTexts[role as keyof typeof roleTexts] || role;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Stack.Screen options={{ headerShown: true, title: 'Staff' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen options={{ headerShown: true, title: 'Staff' }} />
      
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
          <Text style={[styles.addButtonText, { color: '#fff' }]}>Agregar Staff</Text>
        </TouchableOpacity>

        {staff.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol ios_icon_name="person.2" android_material_icon_name="group" size={48} color={mutedColor} />
            <Text style={[styles.emptyText, { color: mutedColor }]}>No hay miembros del staff</Text>
          </View>
        ) : (
          staff.map((member) => {
            const roleColor = getRoleColor(member.role);
            const roleText = getRoleText(member.role);
            const joinedText = `Unido: ${formatDate(member.joinedAt)}`;
            
            return (
              <View key={member.id} style={[styles.staffCard, { backgroundColor: cardBg }]}>
                <View style={styles.staffHeader}>
                  <View style={styles.staffInfo}>
                    <Text style={[styles.staffName, { color: textColor }]}>{member.userName}</Text>
                    <Text style={[styles.staffEmail, { color: mutedColor }]}>{member.userEmail}</Text>
                    <Text style={[styles.joinedText, { color: mutedColor }]}>{joinedText}</Text>
                  </View>
                  <View style={[styles.roleBadge, { backgroundColor: roleColor + '20' }]}>
                    <Text style={[styles.roleText, { color: roleColor }]}>{roleText}</Text>
                  </View>
                </View>

                {member.role !== 'admin' && (
                  <View style={[styles.staffActions, { borderTopColor: borderColor }]}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                      onPress={() => {
                        setSelectedStaff(member);
                        setShowRemoveModal(true);
                      }}
                    >
                      <IconSymbol ios_icon_name="person.badge.minus" android_material_icon_name="person-remove" size={16} color={colors.error} />
                      <Text style={[styles.actionButtonText, { color: colors.error }]}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Staff Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Agregar Staff</Text>
            
            <Text style={[styles.label, { color: textColor }]}>Email del Staff</Text>
            <TextInput
              style={[styles.input, { backgroundColor: bgColor, color: textColor, borderColor }]}
              placeholder="staff@club.com"
              placeholderTextColor={mutedColor}
              keyboardType="email-address"
              autoCapitalize="none"
              value={newStaffEmail}
              onChangeText={setNewStaffEmail}
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
                onPress={handleAddStaff}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Remove Staff Modal */}
      <Modal visible={showRemoveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Remover Staff</Text>
            <Text style={[styles.label, { color: mutedColor, marginBottom: 20 }]}>
              ¿Estás seguro de que deseas remover a {selectedStaff?.userName} del staff?
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
                onPress={handleRemoveStaff}
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

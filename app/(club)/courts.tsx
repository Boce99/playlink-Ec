
import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface Court {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance';
}

export default function CourtsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [courts, setCourts] = useState<Court[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourtName, setNewCourtName] = useState('');
  const [newCourtType, setNewCourtType] = useState('indoor');

  const loadCourts = useCallback(async () => {
    try {
      console.log('Loading courts');
      // TODO: Backend Integration - GET /api/club/courts to fetch courts list
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCourts([
        { id: '1', name: 'Cancha 1', type: 'indoor', status: 'available' },
        { id: '2', name: 'Cancha 2', type: 'outdoor', status: 'occupied' },
        { id: '3', name: 'Cancha 3', type: 'indoor', status: 'available' },
        { id: '4', name: 'Cancha 4', type: 'outdoor', status: 'maintenance' },
      ]);
    } catch (error) {
      console.error('Error loading courts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCourts();
  }, [loadCourts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCourts();
  }, [loadCourts]);

  const handleAddCourt = async () => {
    if (!newCourtName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la cancha');
      return;
    }

    try {
      console.log('Adding new court:', newCourtName, newCourtType);
      // TODO: Backend Integration - POST /api/club/courts with { name, type }
      setShowAddModal(false);
      setNewCourtName('');
      setNewCourtType('indoor');
      loadCourts();
    } catch (error) {
      console.error('Error adding court:', error);
      Alert.alert('Error', 'No se pudo agregar la cancha');
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      available: '#4CAF50',
      occupied: '#FF9800',
      maintenance: '#F44336',
    };
    return statusColors[status as keyof typeof statusColors] || '#999';
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      available: 'Disponible',
      occupied: 'Ocupada',
      maintenance: 'Mantenimiento',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors[colorScheme ?? 'light'].background }]}>
        <ActivityIndicator size="large" color={colors[colorScheme ?? 'light'].primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors[colorScheme ?? 'light'].background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Gestión de Canchas',
          headerStyle: { backgroundColor: colors[colorScheme ?? 'light'].background },
          headerTintColor: colors[colorScheme ?? 'light'].text,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors[colorScheme ?? 'light'].primary}
          />
        }
      >
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors[colorScheme ?? 'light'].primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <IconSymbol
            ios_icon_name="plus"
            android_material_icon_name="add"
            size={20}
            color="#fff"
          />
          <Text style={styles.addButtonText}>Agregar Cancha</Text>
        </TouchableOpacity>

        {courts.map((court) => {
          const statusColor = getStatusColor(court.status);
          const statusText = getStatusText(court.status);
          const courtTypeText = court.type === 'indoor' ? 'Interior' : 'Exterior';

          return (
            <View
              key={court.id}
              style={[styles.courtCard, { backgroundColor: isDark ? '#1E1E1E' : '#fff' }]}
            >
              <View style={styles.courtHeader}>
                <Text style={[styles.courtName, { color: colors[colorScheme ?? 'light'].text }]}>
                  {court.name}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                  <Text style={styles.statusText}>{statusText}</Text>
                </View>
              </View>
              <Text style={[styles.courtType, { color: colors[colorScheme ?? 'light'].textSecondary }]}>
                {courtTypeText}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E1E1E' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: colors[colorScheme ?? 'light'].text }]}>
              Agregar Nueva Cancha
            </Text>

            <TextInput
              style={[styles.input, { 
                color: colors[colorScheme ?? 'light'].text,
                borderColor: colors[colorScheme ?? 'light'].border,
              }]}
              placeholder="Nombre de la cancha"
              placeholderTextColor={colors[colorScheme ?? 'light'].textSecondary}
              value={newCourtName}
              onChangeText={setNewCourtName}
            />

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newCourtType === 'indoor' && styles.typeButtonActive,
                ]}
                onPress={() => setNewCourtType('indoor')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: newCourtType === 'indoor' ? '#fff' : colors[colorScheme ?? 'light'].text },
                  ]}
                >
                  Interior
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newCourtType === 'outdoor' && styles.typeButtonActive,
                ]}
                onPress={() => setNewCourtType('outdoor')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: newCourtType === 'outdoor' ? '#fff' : colors[colorScheme ?? 'light'].text },
                  ]}
                >
                  Exterior
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: colors[colorScheme ?? 'light'].primary }]}
                onPress={handleAddCourt}
              >
                <Text style={styles.confirmButtonText}>Agregar</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  courtCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courtName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  courtType: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


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
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { playerAPI } from '@/utils/api';

interface Club {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  memberCount: number;
  courtsCount: number;
  activeTournamentsCount: number;
}

export default function DiscoverClubsScreen() {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joining, setJoining] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadClubs = useCallback(async () => {
    console.log('DiscoverClubsScreen: Loading available clubs');
    try {
      setLoading(true);
      // TODO: Backend Integration - GET /api/clubs/discover
      // Returns: [{ id, name, address, phone, email, memberCount, courtsCount, activeTournamentsCount }]
      const clubsData = await playerAPI.discoverClubs();
      console.log('DiscoverClubsScreen: Loaded clubs:', clubsData.length);
      setClubs(clubsData);
    } catch (error: any) {
      console.error('DiscoverClubsScreen: Error loading clubs:', error.message);
      // Mock data for development
      setClubs([
        {
          id: '1',
          name: 'Club Padel Central',
          address: 'Av. Principal 123, Quito',
          phone: '+593 99 123 4567',
          email: 'info@padelcentral.com',
          memberCount: 45,
          courtsCount: 4,
          activeTournamentsCount: 2,
        },
        {
          id: '2',
          name: 'Padel Club Norte',
          address: 'Calle Norte 456, Quito',
          phone: '+593 99 765 4321',
          email: 'contacto@padelnorte.com',
          memberCount: 32,
          courtsCount: 3,
          activeTournamentsCount: 1,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadClubs();
  }, [loadClubs]);

  const onRefresh = useCallback(() => {
    console.log('DiscoverClubsScreen: User triggered refresh');
    setRefreshing(true);
    loadClubs();
  }, [loadClubs]);

  const handleJoinClub = async () => {
    if (!selectedClub) return;

    console.log('DiscoverClubsScreen: User joining club:', selectedClub.name);
    try {
      setJoining(true);
      // TODO: Backend Integration - POST /api/clubs/:clubId/join
      // Body: { message?: string }
      // Returns: { success: true, membership: { id, clubId, userId, role, createdAt } }
      await playerAPI.joinClub(selectedClub.id);
      console.log('DiscoverClubsScreen: Successfully joined club');
      setShowJoinModal(false);
      setSelectedClub(null);
      router.back();
    } catch (error: any) {
      console.error('DiscoverClubsScreen: Error joining club:', error.message);
    } finally {
      setJoining(false);
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (club.address && club.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Descubrir Clubes', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Cargando clubes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Descubrir Clubes', headerShown: true }} />

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.card }]}>
          <IconSymbol
            ios_icon_name="magnifyingglass"
            android_material_icon_name="search"
            size={20}
            color={theme.textSecondary}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Buscar clubes..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {filteredClubs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="building.2"
              android_material_icon_name="business"
              size={64}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No se encontraron clubes
            </Text>
          </View>
        ) : (
          filteredClubs.map((club) => {
            const memberCountText = `${club.memberCount} miembros`;
            const courtsCountText = `${club.courtsCount} canchas`;
            const tournamentsCountText = `${club.activeTournamentsCount} torneos activos`;

            return (
              <View key={club.id} style={[styles.clubCard, { backgroundColor: theme.card }]}>
                <View style={styles.clubHeader}>
                  <View style={[styles.clubIcon, { backgroundColor: theme.primary + '20' }]}>
                    <IconSymbol
                      ios_icon_name="building.2"
                      android_material_icon_name="business"
                      size={32}
                      color={theme.primary}
                    />
                  </View>
                  <View style={styles.clubInfo}>
                    <Text style={[styles.clubName, { color: theme.text }]}>{club.name}</Text>
                    {club.address && (
                      <View style={styles.clubDetail}>
                        <IconSymbol
                          ios_icon_name="location"
                          android_material_icon_name="location-on"
                          size={14}
                          color={theme.textSecondary}
                        />
                        <Text style={[styles.clubDetailText, { color: theme.textSecondary }]}>
                          {club.address}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.clubStats}>
                  <View style={styles.statItem}>
                    <IconSymbol
                      ios_icon_name="person.2"
                      android_material_icon_name="group"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.statText, { color: theme.textSecondary }]}>
                      {memberCountText}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <IconSymbol
                      ios_icon_name="sportscourt"
                      android_material_icon_name="sports-tennis"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.statText, { color: theme.textSecondary }]}>
                      {courtsCountText}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <IconSymbol
                      ios_icon_name="trophy"
                      android_material_icon_name="emoji-events"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.statText, { color: theme.textSecondary }]}>
                      {tournamentsCountText}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.joinButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setSelectedClub(club);
                    setShowJoinModal(true);
                  }}
                >
                  <Text style={styles.joinButtonText}>Unirse al Club</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Join Confirmation Modal */}
      <Modal visible={showJoinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Unirse al Club</Text>
            <Text style={[styles.modalText, { color: theme.textSecondary }]}>
              ¿Deseas unirte a {selectedClub?.name}?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.border }]}
                onPress={() => {
                  setShowJoinModal(false);
                  setSelectedClub(null);
                }}
                disabled={joining}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleJoinClub}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>Unirse</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  clubCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  clubHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  clubIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  clubInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  clubName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  clubDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clubDetailText: {
    fontSize: 13,
    flex: 1,
  },
  clubStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
  },
  joinButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
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
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

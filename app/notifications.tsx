
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
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = useCallback(async () => {
    console.log('NotificationsScreen: Loading notifications');
    try {
      // TODO: Backend Integration - GET /api/notifications to fetch notifications
      
      // Mock data
      setNotifications([
        {
          id: '1',
          title: 'Reserva confirmada',
          message: 'Tu reserva para mañana a las 18:00 está confirmada',
          type: 'booking_created',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Torneo aprobado',
          message: 'Tu solicitud para el Torneo de Verano ha sido aprobada',
          type: 'tournament_approved',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('NotificationsScreen: Error loading notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = useCallback(() => {
    console.log('NotificationsScreen: Refreshing notifications');
    setRefreshing(true);
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    console.log('NotificationsScreen: Marking notification as read:', notificationId);
    // TODO: Backend Integration - PUT /api/notifications/:id/read
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      booking_created: 'calendar-today',
      booking_reminder: 'alarm',
      tournament_approved: 'emoji-events',
      match_scheduled: 'sports',
      result_published: 'bar-chart',
      new_message: 'message',
    };
    return icons[type as keyof typeof icons] || 'notifications';
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Notificaciones', headerShown: true }} />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Notificaciones', headerShown: true }} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="bell"
              android_material_icon_name="notifications"
              size={64}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No tienes notificaciones
            </Text>
          </View>
        ) : (
          notifications.map((notification) => {
            const iconName = getNotificationIcon(notification.type);
            
            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  { backgroundColor: notification.read ? theme.card : theme.highlight },
                ]}
                onPress={() => handleMarkAsRead(notification.id)}
              >
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                  <IconSymbol
                    ios_icon_name="bell.fill"
                    android_material_icon_name={iconName}
                    size={24}
                    color={theme.primary}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, { color: theme.text }]}>
                    {notification.title}
                  </Text>
                  <Text style={[styles.notificationMessage, { color: theme.textSecondary }]}>
                    {notification.message}
                  </Text>
                </View>
                {!notification.read && (
                  <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
});

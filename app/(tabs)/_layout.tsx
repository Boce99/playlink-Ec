
import React from 'react';
import { Platform } from 'react-native';
import FloatingTabBar from '@/components/FloatingTabBar';
import { Href } from 'expo-router';
import { Stack } from 'expo-router';

export default function TabLayout() {
  console.log('[TabLayout] Rendering tab layout for platform:', Platform.OS);
  
  const tabs = [
    {
      name: 'Inicio',
      route: '/(tabs)/(home)' as Href,
      icon: 'home' as any,
      label: 'Inicio',
    },
    {
      name: 'Reservas',
      route: '/(tabs)/bookings' as Href,
      icon: 'calendar-today' as any,
      label: 'Reservas',
    },
    {
      name: 'Torneos',
      route: '/(tabs)/tournaments' as Href,
      icon: 'emoji-events' as any,
      label: 'Torneos',
    },
    {
      name: 'Perfil',
      route: '/(tabs)/profile' as Href,
      icon: 'person' as any,
      label: 'Perfil',
    },
  ];

  if (Platform.OS === 'ios') {
    console.log('[TabLayout] iOS detected, using Stack layout');
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
        <Stack.Screen name="bookings" options={{ headerShown: false }} />
        <Stack.Screen name="tournaments" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack>
    );
  }

  console.log('[TabLayout] Rendering FloatingTabBar');
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
        <Stack.Screen name="bookings" options={{ headerShown: false }} />
        <Stack.Screen name="tournaments" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}

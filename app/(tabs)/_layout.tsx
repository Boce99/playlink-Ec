
import React from 'react';
import { Platform } from 'react-native';
import FloatingTabBar from '@/components/FloatingTabBar';
import { Href } from 'expo-router';

export default function TabLayout() {
  const tabs = [
    {
      name: 'Inicio',
      route: '/(tabs)/(home)' as Href,
      ios_icon_name: 'house.fill',
      android_material_icon_name: 'home',
    },
    {
      name: 'Reservas',
      route: '/(tabs)/bookings' as Href,
      ios_icon_name: 'calendar',
      android_material_icon_name: 'calendar-today',
    },
    {
      name: 'Torneos',
      route: '/(tabs)/tournaments' as Href,
      ios_icon_name: 'trophy.fill',
      android_material_icon_name: 'emoji-events',
    },
    {
      name: 'Perfil',
      route: '/(tabs)/profile' as Href,
      ios_icon_name: 'person.fill',
      android_material_icon_name: 'person',
    },
  ];

  if (Platform.OS === 'ios') {
    return null; // iOS uses native tabs
  }

  return <FloatingTabBar tabs={tabs} />;
}

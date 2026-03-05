
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import React from 'react';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <Label>Inicio</Label>
        <Icon sf={{ default: 'house', selected: 'house.fill' }} drawable="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="bookings">
        <Label>Reservas</Label>
        <Icon sf={{ default: 'calendar', selected: 'calendar.badge.clock' }} drawable="calendar-today" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tournaments">
        <Label>Torneos</Label>
        <Icon sf={{ default: 'trophy', selected: 'trophy.fill' }} drawable="emoji-events" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Perfil</Label>
        <Icon sf={{ default: 'person', selected: 'person.fill' }} drawable="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

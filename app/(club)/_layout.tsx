
import { Stack } from 'expo-router';
import React from 'react';

export default function ClubLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="courts" options={{ headerShown: false }} />
      <Stack.Screen name="bookings" options={{ headerShown: false }} />
      <Stack.Screen name="tournaments" options={{ headerShown: false }} />
      <Stack.Screen name="matches" options={{ headerShown: false }} />
      <Stack.Screen name="rankings" options={{ headerShown: false }} />
      <Stack.Screen name="players" options={{ headerShown: false }} />
      <Stack.Screen name="staff" options={{ headerShown: false }} />
    </Stack>
  );
}

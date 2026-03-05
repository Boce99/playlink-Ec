
import "react-native-reanimated";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ClubProvider } from "@/contexts/ClubContext";
import * as SplashScreen from "expo-splash-screen";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert, ActivityIndicator, View } from "react-native";
import { useFonts } from "expo-font";
import { SystemBars } from "react-native-edge-to-edge";
import { colors } from "@/styles/commonStyles";

SplashScreen.preventAutoHideAsync();

const PlayLinkLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.light.primary,
    background: colors.light.background,
    card: colors.light.card,
    text: colors.light.text,
    border: colors.light.border,
  },
};

const PlayLinkDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.dark.primary,
    background: colors.dark.background,
    card: colors.dark.card,
    text: colors.dark.text,
    border: colors.dark.border,
  },
};

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      console.log("[RootLayout] Auth loading, waiting...");
      return;
    }

    const inAuthGroup = segments[0] === 'auth' || segments[0] === 'auth-popup' || segments[0] === 'auth-callback';
    const inTabsGroup = segments[0] === '(tabs)';

    console.log('[RootLayout] Auth state - User:', user ? `logged in (${user.email})` : 'not logged in', 'Segments:', segments);

    if (!user && !inAuthGroup) {
      console.log('[RootLayout] User not authenticated, redirecting to /auth');
      router.replace('/auth');
    } else if (user && (inAuthGroup || segments.length === 0)) {
      console.log('[RootLayout] User authenticated, redirecting to home');
      setTimeout(() => {
        router.replace('/(tabs)/(home)');
      }, 100);
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#4A9BF0" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(club)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="auth-popup" options={{ presentation: "modal" }} />
      <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ presentation: "modal", title: "Notificaciones" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { isConnected } = useNetworkState();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (isConnected === false) {
      Alert.alert(
        "Sin Conexión a Internet",
        "Por favor verifica tu conexión a internet e intenta nuevamente."
      );
    }
  }, [isConnected]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? PlayLinkDarkTheme : PlayLinkLightTheme}>
        <AuthProvider>
          <ClubProvider>
            <WidgetProvider>
              <SystemBars style={colorScheme === "dark" ? "light" : "dark"} />
              <RootLayoutNav />
              <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            </WidgetProvider>
          </ClubProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

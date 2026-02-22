import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { XpProvider } from '@/constants/XpContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ActivityIndicator, View } from 'react-native';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// mesma configuração usada em outros arquivos
const firebaseConfig = {
  apiKey: "AIzaSyAC-uFM4pwfXDuKxGvsFM3Z7v7oF0BC3U4",
  authDomain: "biosyntech-8ffe1.firebaseapp.com",
  projectId: "biosyntech-8ffe1",
  storageBucket: "biosyntech-8ffe1.firebasestorage.app",
  messagingSenderId: "642421745104",
  appId: "1:642421745104:web:ef5298a181d4a178f145d5",
  measurementId: "G-XV52RYJVY3"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return unsub;
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' }}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <XpProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </>
          ) : (
            <>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </>
          )}
        </Stack>
        <StatusBar style="auto" />
      </XpProvider>
    </ThemeProvider>
  );
}

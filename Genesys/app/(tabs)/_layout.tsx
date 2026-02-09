import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAC-uFM4pwfXDuKxGvsFM3Z7v7oF0BC3U4",
  authDomain: "biosyntech-8ffe1.firebaseapp.com",
  projectId: "biosyntech-8ffe1",
  storageBucket: "biosyntech-8ffe1.firebasestorage.app",
  messagingSenderId: "642421745104",
  appId: "1:642421745104:web:ef5298a181d4a178f145d5",
  measurementId: "G-XV52RYJVY3"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = initializeAuth(app, {});

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return unsubscribe;
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#122620' }}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="(tabs)/index" />
      ) : (
        <Stack.Screen name="(tabs)/home" />
      )}
    </Stack>
  );
}
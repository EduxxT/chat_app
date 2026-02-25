import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext'; // Ajusta la ruta si moviste el context
import { View, ActivityIndicator } from 'react-native';

// 1. COMPONENTE INTERNO: Aquí sucede la lógica
function RootLayoutNav() {
  const { authState } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authState.isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (authState.authenticated && inAuthGroup) {
      // Usuario logueado intentando ver login -> Mandar a Home
      router.replace('../home');
    } else if (!authState.authenticated && !inAuthGroup) {
      // Usuario sin sesión intentando ver Home -> Mandar a Login
      router.replace('/(auth)/login');
    }
  }, [authState.authenticated, segments, authState.isLoading]);

  if (authState.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

// 2. COMPONENTE EXTERNO (Export Default): Solo provee el contexto
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
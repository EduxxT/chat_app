import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}>
        
      {/* --- TU PANTALLA PRINCIPAL --- */}
      <Tabs.Screen
        name="index_msg"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.badge.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear.badge" color={color} />,
        }}
      />
      
      {/* Ocultar Login si aparece */}
      <Tabs.Screen
        name="login"
        options={{ href: null }} 
      />

      {/* Ocultar Register si aparece */}
      <Tabs.Screen
        name="register"
        options={{ href: null }} 
      />

      {/* Ocultar grupo Auth si aparece duplicado */}
      <Tabs.Screen
        name="(auth)"
        options={{ href: null }} 
      />

      {/* Ocultar Index default si aparece */}
      <Tabs.Screen
        name="index"
        options={{ href: null }} 
      />

    </Tabs>
  );
}
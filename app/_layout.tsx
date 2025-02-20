import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme, Pressable } from 'react-native';
import { AuthProvider, useAuth } from '@/src/lib/AuthContext';
import { Redirect } from 'expo-router';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

type HabitParams = {
  id: string;
}

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const colorScheme = useColorScheme();

  const NewHabitButton = () => (
    <Pressable 
      onPress={() => router.push('/habits/new')}
      style={({ pressed }) => ({
        marginRight: 15,
        opacity: pressed ? 0.5 : 1,
      })}
    >
      <FontAwesome name="plus" size={24} color="#007AFF" />
    </Pressable>
  );

  const BackButton = () => (
    <Pressable
      onPress={() => router.push("/")}
      style={({ pressed }) => ({
        marginLeft: 15,
        opacity: pressed ? 0.5 : 1,
      })}
    >
      <FontAwesome name="caret-left" size={24} color="#007AFF" />
    </Pressable>
  );

  if (loading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackVisible: false,
          headerRight: () => <NewHabitButton />,
          animation: "none",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "My Habits",
          }}
        />
        <Stack.Screen
          name="auth"
          options={{
            headerShown: false,
            headerRight: undefined,
          }}
        />
        <Stack.Screen
          name="habits/[id]"
          options={({ route }) => ({
            title: `Habit ${(route.params as HabitParams)?.id ?? ""}`,
          })}
        />
        <Stack.Screen
          name="habits/new"
          options={{
            title: "New Habit",
            headerRight: undefined,
            headerLeft: () => <BackButton />,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

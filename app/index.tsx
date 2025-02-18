import { Redirect } from 'expo-router';
import { useAuth } from '@/src/lib/AuthContext';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) return null;

  // Redirect to the auth page if there's no session, otherwise to the tabs
  return <Redirect href={session ? '/(tabs)' : '/auth'} />;
} 
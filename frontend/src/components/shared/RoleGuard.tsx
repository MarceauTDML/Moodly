import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { EmptyState } from './EmptyState';
import { Button } from '../ui/Button';
export function RoleGuard({ children }: { children: ReactNode }) {
  const { session, signOut } = useAuth();
  if (session?.user.role === 'MANAGER' || session?.user.role === 'ADMIN') return children;
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <EmptyState
        title="Espace collaborateur"
        description="Votre compte n'a pas accès à la vision manager."
      />
      <Button title="Retour à la connexion" onPress={signOut} />
    </View>
  );
}

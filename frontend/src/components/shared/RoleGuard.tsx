import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { EmptyState } from './EmptyState';
import { Button } from '../ui/Button';
import type { Role } from '../../types/user.types';
export function RoleGuard({
  children,
  roles = ['MANAGER', 'ADMIN'],
}: {
  children: ReactNode;
  roles?: readonly Role[];
}) {
  const { session, signOut } = useAuth();
  if (session && roles.includes(session.user.role)) return children;
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <EmptyState
        title="Accès indisponible"
        description="Votre compte n'a pas accès à cet espace. Reconnectez-vous avec le compte adapté."
      />
      <Button title="Retour à la connexion" onPress={signOut} />
    </View>
  );
}

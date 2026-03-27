'use client';

import { useState, useEffect, useCallback } from 'react';
import { authClient, type SessionUser } from '../lib/auth-client';

export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authClient
      .getSession()
      .then((data) => {
        setUser(data?.user ?? null);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authClient.signOut();
    } finally {
      setUser(null);
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
  };
}

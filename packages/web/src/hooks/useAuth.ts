import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface User {
  id: string;
  email: string;
  username?: string;
  emailConfirmed: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Controlla sessione corrente (v2 response shape)
    supabase.auth.getSession().then(({ data }) => {
      const session = (data as any).session;
      if (session?.user) {
        // Verifica se l'email è confermata
        const emailConfirmed = !!(
          session.user.email_confirmed_at ||
          session.user.confirmed_at
        );

        setUser({
          id: session.user.id,
          email: session.user.email || "",
          username: session.user.user_metadata?.username,
          emailConfirmed,
        });
      }
      setIsLoading(false);
    });

    // Ascolta cambiamenti auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const emailConfirmed = !!(
          session.user.email_confirmed_at ||
          session.user.confirmed_at
        );

        setUser({
          id: session.user.id,
          email: session.user.email || "",
          username: session.user.user_metadata?.username,
          emailConfirmed,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isEmailConfirmed: user?.emailConfirmed ?? false,
  };
}

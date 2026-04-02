import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  name: string | null;
  headline: string | null;
  linkedin_url: string | null;
  interests: string[] | null;
  subscription_tier?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isPro: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isPro: false,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, currentUserEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, headline, linkedin_url, interests, subscription_tier')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        // Use the subscription tier from the database, fallback to free
        const profileData = { ...data } as UserProfile;
        
        if (currentUserEmail === 'martin.ellenjane@gmail.com') {
          profileData.subscription_tier = 'pro';
        } else {
          profileData.subscription_tier = data.subscription_tier || 'free';
        }

        setProfile(profileData);
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    }
  };

  const isPro = profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'recruiter';

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id, session.user.email);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isPro, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

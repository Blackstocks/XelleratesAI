'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseclient';
import useSWR from 'swr';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const AuthContext = createContext();

const fetcher = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

const AuthProvider = ({ children }) => {
  const {
    data: user,
    mutate,
    error,
  } = useSWR('user', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const [loading, setLoading] = useState(!user && !error);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          Cookies.set('access_token', session.access_token, {
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'Strict',
          });
          Cookies.set('refresh_token', session.refresh_token, {
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'Strict',
          });
          mutate(fetcher, false);
        } else {
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          mutate(undefined, false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [mutate]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return error;

      Cookies.set('access_token', data.session.access_token, {
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'Strict',
      });
      Cookies.set('refresh_token', data.session.refresh_token, {
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'Strict',
      });

      // Immediately fetch the user's profile after logging in
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.status !== 'approved') {
        toast.error('Your account is not approved yet.', {
          position: 'top-right',
          autoClose: 3000,
        });
        await supabase.auth.signOut(); // Log out the user immediately
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        mutate(undefined, false);
        return { message: 'Your account is not approved yet.' };
      }

      mutate(fetcher, false); // Immediately update user state

      toast.success('Login successful!', {
        position: 'top-right',
        autoClose: 500,
      });
    } catch (err) {
      console.error('Login error:', err);
      return err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      mutate(undefined, false);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;

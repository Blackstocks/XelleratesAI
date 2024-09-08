'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from 'react';
import { supabase } from '@/lib/supabaseclient';
import useSWR from 'swr';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import jwt from 'jsonwebtoken'; // Import JWT library

const AuthContext = createContext();

const fetcher = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

// Define initial state
const initialState = {
  user: null,
  loading: true,
  error: null,
  toastId: null,
};

// Define reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_TOAST':
      return { ...state, toastId: action.payload };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Fetch user data using SWR
  const { data: swrUser, mutate } = useSWR('user', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  useEffect(() => {
    if (swrUser) {
      dispatch({ type: 'SET_USER', payload: swrUser });
    }
  }, [swrUser]);

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

  const showErrorToast = useCallback(
    (message) => {
      if (!toast.isActive(state.toastId)) {
        const id = toast.error(message, {
          position: 'top-right',
          autoClose: 3000,
        });
        dispatch({ type: 'SET_TOAST', payload: id });
      }
    },
    [state.toastId]
  );

  const login = useCallback(
    async (email, password) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

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

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        if (profile.status !== 'approved') {
          showErrorToast('Your account is not approved yet.');
          await supabase.auth.signOut(); // Log out the user immediately
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          mutate(undefined, false);
          return; // Prevent returning a message to avoid duplicate toasts
        }

        mutate(fetcher, false); // Immediately update user state

        if (!toast.isActive(state.toastId)) {
          const id = toast.success('Login successful!', {
            position: 'top-right',
            autoClose: 500,
          });
          dispatch({ type: 'SET_TOAST', payload: id });
        }

        // Generate JWT for the Pitch Deck
        const token = jwt.sign(
          { userId: data.user.id },
          process.env.NEXT_PUBLIC_JWT_SECRET,
          { expiresIn: '10m' }
        );
        Cookies.set('pitchdeck_token', token, {
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          sameSite: 'None', // Important for cross-site cookies
        });
      } catch (err) {
        console.error('Login error:', err);
        dispatch({ type: 'SET_ERROR', payload: err });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [showErrorToast, mutate, state.toastId]
  );

  const logout = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      Cookies.remove('pitchdeck_token'); // Remove the token for the pitch deck
      mutate(undefined, false);
    } catch (err) {
      console.error('Logout error:', err);
      dispatch({ type: 'SET_ERROR', payload: err });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [mutate]);

  return (
    <AuthContext.Provider
      value={{ user: state.user, loading: state.loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;

/**
 * Google Sign-In Hook
 * Using Expo AuthSession
 */

import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../contexts/AuthContext';

WebBrowser.maybeCompleteAuthSession();

// Replace with your Google OAuth Client IDs
const GOOGLE_CLIENT_ID = {
  android: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  ios: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  web: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
};

export const useGoogleSignIn = () => {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CLIENT_ID.android,
    iosClientId: GOOGLE_CLIENT_ID.ios,
    webClientId: GOOGLE_CLIENT_ID.web,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response.authentication?.idToken);
    }
  }, [response]);

  const handleGoogleResponse = async (idToken: string | undefined) => {
    if (!idToken) {
      console.error('No ID token received from Google');
      return;
    }

    setLoading(true);
    try {
      await googleLogin(idToken);
      // Navigation is handled by AuthContext
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await promptAsync();
    } catch (error) {
      console.error('Error prompting Google sign-in:', error);
      setLoading(false);
      throw error;
    }
  };

  return {
    signInWithGoogle,
    loading,
    disabled: !request || loading,
  };
};

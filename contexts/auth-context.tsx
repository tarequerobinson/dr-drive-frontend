import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';

const API_URL = 'https://dr-drive-backend.onrender.com/api'; // Added /api prefix

type User = {
    id: number;
    username: string;
    email: string;
    phone?: string;
    chassis?: string;
    year?: number;
    make?: string;
    model?: string;
    created_at?: string;
    updated_at?: string;
};

type SignUpData = {
    username: string;
    email: string;
    password: string;
    phone: string;
    year?: string;
    make?: string;
    model?: string;
    chassis?: string;
};

type AuthContextType = {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    signIn: (username: string, password: string) => Promise<void>;
    signUp: (userData: SignUpData) => Promise<void>;
    signOut: () => Promise<void>;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Load stored token on app start
    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('auth_token');
            const storedUser = await AsyncStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Error loading stored auth:', error);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (username: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            if (data.success && data.token && data.user) {
                // Store token and user data with consistent key names
                await AsyncStorage.setItem('auth_token', data.token);
                await AsyncStorage.setItem('user', JSON.stringify(data.user));

                setToken(data.token);
                setUser(data.user);
                setIsAuthenticated(true);

                router.replace('/(tabs)');
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    };

    const signUp = async (userData: SignUpData) => {
        try {
            // Prepare payload matching backend expectations
            const payload: any = {
                username: userData.username,
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
            };

            // Add optional vehicle fields only if provided
            if (userData.year) {
                payload.year = parseInt(userData.year);
            }
            if (userData.make) {
                payload.make = userData.make;
            }
            if (userData.model) {
                payload.model = userData.model;
            }
            if (userData.chassis) {
                payload.chassis = userData.chassis;
            }

            console.log('Sending sign up request:', payload);

            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            console.log('Sign up response:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            if (data.success && data.token && data.user) {
                // Store token and user data with consistent key names
                await AsyncStorage.setItem('auth_token', data.token);
                await AsyncStorage.setItem('user', JSON.stringify(data.user));

                setToken(data.token);
                setUser(data.user);
                setIsAuthenticated(true);

                router.replace('/(tabs)');
            } else {
                throw new Error(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('user');

            setToken(null);
            setUser(null);
            setIsAuthenticated(false);

            router.replace('/auth/sign-in');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                token,
                signIn,
                signUp,
                signOut,
                loading,
            }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
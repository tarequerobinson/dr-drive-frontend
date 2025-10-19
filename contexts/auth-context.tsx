import { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://YOUR_SERVER_IP:6000/api'; // Replace with your server IP

type User = {
    id: number;
    username: string;
    email: string;
    phone?: string;
    chassis?: string;
    year?: number;
    make?: string;
    model?: string;
};

type AuthContextType = {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    signIn: (username: string, password: string) => Promise<void>;
    signUp: (userData: any) => Promise<void>;
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
            const storedToken = await AsyncStorage.getItem('authToken');
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

            if (data.success) {
                // Store token and user data
                await AsyncStorage.setItem('authToken', data.token);
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
            alert(error instanceof Error ? error.message : 'Login failed. Please try again.');
            throw error;
        }
    };

    const signUp = async (userData: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        phone: string;
        year: string;
        make: string;
        model: string;
        chassisNumber: string;
    }) => {
        try {
            // Create username from first and last name
            const username = `${userData.firstName.toLowerCase()}${userData.lastName.toLowerCase()}`;

            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email: userData.email,
                    password: userData.password,
                    phone: userData.phone,
                    year: parseInt(userData.year) || null,
                    make: userData.make,
                    model: userData.model,
                    chassis: userData.chassisNumber,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            if (data.success) {
                // Store token and user data
                await AsyncStorage.setItem('authToken', data.token);
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
            alert(error instanceof Error ? error.message : 'Registration failed. Please try again.');
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await AsyncStorage.removeItem('authToken');
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
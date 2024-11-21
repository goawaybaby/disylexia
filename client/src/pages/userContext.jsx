import { useState, useEffect, createContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:8000';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = API_BASE_URL;

    useEffect(() => {
        const verifyUser = async () => {
            try {
                console.log('Starting user verification...');
                const token = Cookies.get('token');
                console.log('Token from cookies:', token);

                if (!token) {
                    console.log('No token found');
                    setIsLoggedIn(false);
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                console.log('Making request to /profile');
                const response = await axios.get(`${API_BASE_URL}/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('Response from /profile:', response);

                if (response.data) {
                    console.log('User data received:', response.data);
                    setUser(response.data);
                    setIsLoggedIn(true);
                } else {
                    console.log('No user data received');
                    setIsLoggedIn(false);
                    setUser(null);
                    Cookies.remove('token');
                }
            } catch (error) {
                console.error('Auth error:', error);
                setIsLoggedIn(false);
                setUser(null);
                Cookies.remove('token');
            } finally {
                console.log('Setting isLoading to false');
                setIsLoading(false);
            }
        };

        verifyUser();
    }, []);

    const logout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/logout`, {}, {
                withCredentials: true
            });
            Cookies.remove('token');
            setUser(null);
            setIsLoggedIn(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/login`, {
                email,
                password
            }, {
                withCredentials: true
            });

            if (response.data.user) {
                console.log('Login response user:', response.data.user);
                setUser(response.data.user);
                setIsLoggedIn(true);
                return { success: true };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: error.response?.data?.error || 'Login failed' 
            };
        }
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            isLoggedIn, 
            isLoading, 
            setIsLoading,   // Provide state updater functions
            setIsLoggedIn,  // Provide state updater functions
            setUser,        // Provide state updater functions
            logout,
            login
        }}>
            {children}
        </UserContext.Provider>
    );
}

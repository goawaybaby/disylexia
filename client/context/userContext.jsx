import { useState, useEffect } from 'react';
import axios from 'axios';
import { createContext } from 'react';
import Cookies from 'js-cookie';


export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = Cookies.get('token');
        setIsLoggedIn(!!token);
        if (!user) {
            axios.get('/profile').then(({ data }) => {
                setUser(data);
            });
        }
        }, []);

        const logout = async () => {
            await axios.post('/logout');
            Cookies.remove('token');
            setUser(null);
            setIsLoggedIn(false);
        };
    

    return (
        <UserContext.Provider value={{ user, setUser, isLoggedIn, logout  }}>
            {children}
        </UserContext.Provider>
    );
}

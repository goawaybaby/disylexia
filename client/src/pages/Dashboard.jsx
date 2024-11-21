import { useContext, useEffect } from 'react';
import { UserContext } from '../pages/userContext'; // Update path based on new location
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

function Dashboard() {
    const { user, isLoggedIn, isLoading, logout, setUser, setIsLoggedIn, setIsLoading } = useContext(UserContext);
    const navigate = useNavigate();

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
            const response = await axios.get('http://localhost:8000/profile', {
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

    useEffect(() => {
        verifyUser();
    }, []);

    useEffect(() => {
        console.log(`isLoading: ${isLoading}, isLoggedIn: ${isLoggedIn}`);
        if (!isLoading && !isLoggedIn) {
            console.log("User not logged in. Redirecting to login...");
            navigate('/login', { replace: true });
            console.log(`UserContext - isLoading: ${isLoading}, isLoggedIn: ${isLoggedIn}, user:`, user);
        }
    }, [isLoading, isLoggedIn, navigate, user]);

    const handleManualVerify = async () => {
        try {
            const token = Cookies.get('token');
            console.log('Token from cookies:', token);
            if (!token) {
                alert('No token found');
                return;
            }

            console.log('Making manual request to /profile');
            const response = await axios.get('http://localhost:8000/profile', {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Manual response from profile endpoint:', response);

            if (response.data) {
                alert('User data received: ' + JSON.stringify(response.data));
            } else {
                alert('No user data received');
            }
        } catch (error) {
            console.error('Manual auth error:', error);
            alert('Error fetching profile');
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isLoggedIn) {
        return null; // Will redirect via useEffect
    }

    return (
        <div>
            <div className="flex justify-between items-center p-4">
                <h1 className="text-2xl font-bold">Welcome to the Dashboard!</h1>
                <button 
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                    Logout
                </button>
                <button
                    onClick={handleManualVerify}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded ml-4"
                >
                    Manually Verify User
                </button>
            </div>
            {user && (
                <div className="p-4">
                    <h2 className="text-xl">Hi, {user.email}!</h2>
                    {/* Add more user info or dashboard content here */}
                </div>
            )}
        </div>
    );
}

export default Dashboard;





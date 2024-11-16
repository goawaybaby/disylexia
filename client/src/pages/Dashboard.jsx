import { useContext } from 'react';
import { UserContext } from '../../context/userContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import StartScreen from '../StartScreen';



export default function Dashboard() {
    const { user, isLoggedIn, logout } = useContext(UserContext);

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {

            await axios.post('/logout');
            Cookies.remove('token');
            setUser(null); 
            navigate('/login');

        } catch (error) {

            console.error('Logout failed:', error);
            
        }
    };

    return (
        <div>
            <h2>Dashboard</h2>
            
            {!!user && <h2>Hi, {user.username}!</h2>}
            <br />
            {isLoggedIn && (
                <button onClick={logout}>Logout</button>
            )}
            <button onClick={(navigate('/startscreen'))}></button>
        </div>
    );
}


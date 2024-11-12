import { useContext } from 'react';
import { UserContext } from '../../context/userContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {

            await axios.post('/logout');
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
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}


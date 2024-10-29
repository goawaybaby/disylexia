import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [data, setData] = useState({  // Changed `Data` to `data`
        email: '',
        password: '',
    });

    const loginUser = async (e) => {
        e.preventDefault();
        console.log(data);  // Correctly logging `data`
        
        const { email, password } = data;  // Using `data` as defined in state

        try {
            const response = await axios.post('/login', { email, password });
            const data = response.data;  // This is response data

            if (data.error) {
                toast.error(data.error);
            } else {
                setData({ email: '', password: '' });  // Clear data on success
                navigate('/');
                toast.success('Welcome back!');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while logging in.');
        }
    };

    return (
        <div>
            <h3>Login</h3>
            <br />
            <form onSubmit={loginUser}>
                <label>Email</label>
                <input
                    type="text"
                    placeholder="Enter email"
                    value={data.email}  // Use `data` here
                    onChange={(e) => setData({ ...data, email: e.target.value })}  // Update `data`
                />
                <label>Password</label>
                <input
                    type="password"
                    placeholder="Enter password"
                    value={data.password}  // Use `data` here
                    onChange={(e) => setData({ ...data, password: e.target.value })}  // Update `data`
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}



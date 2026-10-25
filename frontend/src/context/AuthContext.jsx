import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initialize state from localStorage so it survives page refreshes
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(false);

    // Keep localStorage in sync whenever token or user changes
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const authToken = response.data.token;
            const userData = { email }; // Store user info needed for Navbar/app

            setToken(authToken);
            setUser(userData);
            return { success: true };
        } catch (err) {
            return { 
                success: false, 
                error: err.response?.data?.error || 'Login failed. Please check your credentials.' 
            };
        } finally {
            setLoading(false);
        }
    };

    const signup = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/signup', { email, password });
            const authToken = response.data.token;
            const userData = { email };

            setToken(authToken);
            setUser(userData);
            return { success: true };
        } catch (err) {
            return { 
                success: false, 
                error: err.response?.data?.error || 'Signup failed. Email may already be in use.' 
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ token, user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
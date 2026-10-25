import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(false);

    // Base API URL for your backend
    const API_URL = 'http://localhost:5000/api/auth';

    useEffect(() => {
        if (token) {
            // Store token in localStorage
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    // Login function
    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            setToken(response.data.token);
            setUser(response.data.user);
            setLoading(false);
            return { success: true };
        } catch (err) {
            setLoading(false);
            return { 
                success: false, 
                error: err.response?.data?.error || 'Login failed' 
            };
        }
    };

    // Signup function
    const signup = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/signup`, { email, password });
            setToken(response.data.token);
            setUser(response.data.user);
            setLoading(false);
            return { success: true };
        } catch (err) {
            setLoading(false);
            return { 
                success: false, 
                error: err.response?.data?.error || 'Signup failed' 
            };
        }
    };

    // Logout function
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
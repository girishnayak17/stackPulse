import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GitBranch, Code2, LogOut, User } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16171d] px-6 py-4 flex justify-between items-center sticky top-0 z-50">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                <GitBranch className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <span>Stack<span className="text-purple-600 dark:text-purple-400">Pulse</span></span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-6">
                <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition">
                    Search & Analyze
                </Link>
                <Link to="/compare" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition">
                    Compare
                </Link>
                {user && (
                    <Link to="/saved" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition">
                        Saved & Pins
                    </Link>
                )}
            </div>

            {/* Auth Actions */}
            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                            <User className="w-4 h-4" /> {user.email}
                        </span>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/login"
                            className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 transition"
                        >
                            Login
                        </Link>
                        <Link 
                            to="/signup"
                            className="px-4 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition"
                        >
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
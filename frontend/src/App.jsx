import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Search from './pages/Search';
import Compare from './pages/Compare';
import SavedPins from './pages/SavedPins';

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50 dark:bg-[#16171d] text-gray-900 dark:text-gray-100 flex flex-col">
                    <Navbar />
                    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
                        <Routes>
                            <Route path="/" element={<Search />} />
                            <Route path="/compare" element={<Compare />} />
                            <Route path="/saved" element={<SavedPins />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}
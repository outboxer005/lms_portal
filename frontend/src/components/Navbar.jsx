import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User, LayoutDashboard, Home, Sun, Moon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            background: 'linear-gradient(135deg, var(--primary-700) 0%, var(--primary-900) 100%)',
            color: 'white',
            padding: '1rem 0',
            boxShadow: 'var(--shadow-lg)',
            position: 'sticky',
            top: 0,
            width: '100%',
            zIndex: 1000,
        }}>
            <div className="container flex justify-between items-center">
                <Link to="/" style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'white',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)',
                }}>
                    <LayoutDashboard size={28} />
                    Student Portal
                </Link>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="btn"
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {user ? (
                        <>
                            <Link to="/" className="flex items-center gap-2" style={{
                                color: 'white',
                                textDecoration: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius-md)',
                            }}>
                                <Home size={20} />
                                <span className="hide-mobile">Home</span>
                            </Link>

                            <div className="flex items-center gap-3" style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(255,255,255,0.15)',
                                borderRadius: 'var(--radius-lg)',
                            }}>
                                <User size={20} />
                                <span style={{ fontWeight: '600' }} className="hide-mobile">{user.firstName}</span>
                                <span className="badge" style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                }}>{user.role}</span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2"
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                }}>
                                <LogOut size={18} />
                                <span className="hide-mobile">Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary" style={{
                                background: 'white',
                                color: 'var(--primary-700)',
                                border: 'none'
                            }}>
                                Login
                            </Link>
                            <Link to="/register" className="btn" style={{
                                background: 'rgba(255,255,255,0.15)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.5)',
                            }}>
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

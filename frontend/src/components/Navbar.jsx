import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User, LayoutDashboard, Home, Sun, Moon, Bell, CheckCircle2, X } from 'lucide-react';
import { notificationAPI } from '../services/api';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await notificationAPI.getUnread();
            if (res.data) {
                setNotifications(res.data);
                setUnreadCount(res.data.length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications([]);
            setUnreadCount(0);
            setShowDropdown(false);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

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

                    {user && (
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
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
                                    position: 'relative',
                                }}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-4px',
                                        right: '-4px',
                                        background: '#ef4444',
                                        color: 'white',
                                        fontSize: '0.65rem',
                                        fontWeight: 'bold',
                                        padding: '0.1rem 0.35rem',
                                        borderRadius: '10px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {showDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 10px)',
                                    right: 0,
                                    width: '320px',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    boxShadow: 'var(--shadow-xl)',
                                    overflow: 'hidden',
                                    zIndex: 1000,
                                    animation: 'slideUp 0.2s ease-out'
                                }}>
                                    <div style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid var(--border-color)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'rgba(96,165,250,0.05)'
                                    }}>
                                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Bell size={16} color="var(--primary-500)" /> Notifications
                                        </h3>
                                        {notifications.length > 0 && (
                                            <button onClick={markAllAsRead} style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--primary-500)',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}>
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>

                                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                <Bell size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                                                <p style={{ margin: 0, fontSize: '0.85rem' }}>No new notifications</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                {notifications.map(notification => (
                                                    <div key={notification.id} style={{
                                                        padding: '1rem',
                                                        borderBottom: '1px solid var(--border-color)',
                                                        position: 'relative',
                                                        background: 'var(--bg-card)',
                                                        transition: 'background 0.2s'
                                                    }}>
                                                        <div style={{ paddingRight: '1rem' }}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                                                                {notification.title}
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                                {notification.message}
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.4rem', opacity: 0.7 }}>
                                                                {new Date(notification.createdAt).toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => markAsRead(notification.id, e)}
                                                            title="Mark as read"
                                                            style={{
                                                                position: 'absolute',
                                                                top: '1rem',
                                                                right: '1rem',
                                                                background: 'none',
                                                                border: 'none',
                                                                color: 'var(--text-secondary)',
                                                                cursor: 'pointer',
                                                                opacity: 0.6,
                                                                padding: '0.2rem'
                                                            }}
                                                        >
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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

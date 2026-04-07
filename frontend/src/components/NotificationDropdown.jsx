import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { notificationAPI } from '../services/api';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await notificationAPI.getUnread();
            if (res.data) {
                setNotifications(res.data);
                setUnreadCount(res.data.length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    }, []);

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

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                    background: 'var(--accent-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent-subtle)'}
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
            <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default NotificationDropdown;

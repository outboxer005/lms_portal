import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    LogOut,
    Menu,
    BookOpen,
    Library,
    Settings,
    ChevronDown,
    ChevronRight,
    FileText,
    RotateCcw,
    PlusCircle,
    Users,
    Search,
    Home,
    X,
    Sun,
    Moon,
    UserPlus,
    CreditCard,
    ClipboardList,
    Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

const DashboardLayout = ({ children, role }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Define navigation items based on role
    const getNavItems = () => {
        switch (role) {
            case 'ADMIN':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
                    { icon: Users, label: 'Manage Users', path: '/admin/dashboard?tab=users' },
                    { icon: BookOpen, label: 'Manage Books', path: '/admin/dashboard?tab=books' },
                    { icon: RotateCcw, label: 'Issue / Return Books', path: '/admin/dashboard?tab=issue-return' },
                    { icon: UserPlus, label: 'Manage Members', path: '/admin/dashboard?tab=members' },
                    { icon: CreditCard, label: 'Membership Plans', path: '/admin/dashboard?tab=plans' },
                    { icon: ClipboardList, label: 'Book Requests', path: '/admin/dashboard?tab=book-requests' },
                    { icon: User, label: 'Profile', path: '/admin/dashboard?tab=profile' },
                ];
            case 'STAFF':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/staff/dashboard' },
                    { icon: BookOpen, label: 'Manage Books', path: '/staff/dashboard?tab=books' },
                    { icon: RotateCcw, label: 'Issue / Return Books', path: '/staff/dashboard?tab=issue-return' },
                    { icon: UserPlus, label: 'Manage Members', path: '/staff/dashboard?tab=members' },
                    { icon: CreditCard, label: 'Membership Plans', path: '/staff/dashboard?tab=plans' },
                    { icon: ClipboardList, label: 'Book Requests', path: '/staff/dashboard?tab=book-requests' },
                    { icon: User, label: 'Profile', path: '/staff/dashboard?tab=profile' },
                ];
            case 'STUDENT':
            default:
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
                    { icon: BookOpen, label: 'Browse Books', path: '/student/dashboard?tab=library' },
                    { icon: Library, label: 'My Books', path: '/student/dashboard?tab=mybooks' },
                    { icon: PlusCircle, label: 'Request Book', path: '/student/dashboard?tab=request-book' },
                    { icon: CreditCard, label: 'My Membership', path: '/student/dashboard?tab=membership' },
                    { icon: User, label: 'Profile', path: '/student/profile' },
                ];
        }
    };

    const navItems = getNavItems();
    const [openDropdown, setOpenDropdown] = useState(null);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--bg-body)', position: 'relative', overflow: 'hidden' }}>
            {/* Custom Scrollbar */}
            <style>{`
                ::-webkit-scrollbar {
                    width: 12px;
                    height: 12px;
                }
                ::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.5);
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(96, 165, 250, 0.3);
                    border-radius: 10px;
                    border: 2px solid rgba(15, 23, 42, 0.5);
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(96, 165, 250, 0.5);
                }
            `}</style>

            {/* Background Gradient Effects */}
            <div style={{
                position: 'fixed',
                top: '-30%',
                right: '-10%',
                width: '40%',
                height: '40%',
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>

            {/* Sidebar - Dark Theme */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: -320 }}
                        animate={{ x: 0 }}
                        exit={{ x: -320 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{
                            width: '320px',
                            background: 'var(--bg-card)',
                            backdropFilter: 'blur(24px)',
                            borderRight: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'fixed',
                            height: '100vh',
                            zIndex: 1000,
                            left: 0,
                            top: 0
                        }}
                    >
                        {/* Sidebar Header */}
                        <div style={{
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid var(--border-color)',
                            minHeight: '80px'
                        }}>
                            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                                <div style={{ color: 'var(--primary-500)', display: 'flex' }}>
                                    <BookOpen size={28} />
                                </div>
                                <span style={{ fontWeight: '800', fontSize: '1.5rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>LibPortal</span>
                            </Link>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                style={{
                                    background: 'var(--accent-subtle)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-main)',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-subtle)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* User Info */}
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '1.25rem'
                            }}>
                                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1rem' }}>
                                    {user?.personalDetails?.firstName || user?.firstName || user?.username || 'User'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {role === 'ADMIN' ? 'Administrator' : role === 'STAFF' ? 'Staff Member' : 'Student'}
                                </div>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
                            {navItems.map((item, index) => {
                                if (item.children) {
                                    const isOpen = openDropdown === index;
                                    const childActive = item.children.some(c => location.pathname + location.search === c.path);
                                    return (
                                        <div key={index}>
                                            <button
                                                onClick={() => setOpenDropdown(isOpen ? null : index)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    width: '100%',
                                                    gap: '1rem',
                                                    padding: '0.875rem 1rem',
                                                    borderRadius: '12px',
                                                    color: childActive ? 'var(--text-main)' : 'var(--text-secondary)',
                                                    background: childActive ? 'var(--accent-subtle)' : 'transparent',
                                                    border: childActive ? '1px solid var(--primary-500)' : '1px solid transparent',
                                                    cursor: 'pointer',
                                                    fontWeight: childActive ? '600' : '500',
                                                    fontSize: '0.95rem',
                                                    transition: 'all 0.2s ease',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <item.icon size={20} strokeWidth={childActive ? 2.5 : 2} />
                                                    <span>{item.label}</span>
                                                </div>
                                                <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                            </button>
                                            {isOpen && (
                                                <div style={{ paddingLeft: '2rem', marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    {item.children.map((child, ci) => {
                                                        const isChildActive = location.pathname + location.search === child.path;
                                                        return (
                                                            <Link
                                                                key={ci}
                                                                to={child.path}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.5rem',
                                                                    padding: '0.65rem 1rem',
                                                                    borderRadius: '10px',
                                                                    color: isChildActive ? 'var(--primary-500)' : 'var(--text-secondary)',
                                                                    background: isChildActive ? 'var(--accent-subtle)' : 'transparent',
                                                                    textDecoration: 'none',
                                                                    fontWeight: isChildActive ? '600' : '500',
                                                                    fontSize: '0.9rem',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                <ChevronRight size={14} />
                                                                {child.label}
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                const isActive = location.pathname === item.path || (item.path && (location.pathname + location.search === item.path));
                                return (
                                    <Link
                                        key={index}
                                        to={item.path}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '0.875rem 1rem',
                                            borderRadius: '12px',
                                            color: isActive ? 'var(--text-main)' : 'var(--text-secondary)',
                                            background: isActive ? 'var(--accent-subtle)' : 'transparent',
                                            border: isActive ? '1px solid var(--primary-500)' : '1px solid transparent',
                                            textDecoration: 'none',
                                            fontWeight: isActive ? '600' : '500',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'var(--accent-subtle)';
                                                e.currentTarget.style.color = 'var(--text-main)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = 'var(--text-secondary)';
                                            }
                                        }}
                                    >
                                        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Logout Button */}
                        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                            <button
                                onClick={handleLogout}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '12px',
                                    color: '#fca5a5',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    cursor: 'pointer',
                                    width: '100%',
                                    fontWeight: '600',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                                }}
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Menu Toggle Button (when sidebar closed) */}
            {!sidebarOpen && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        position: 'fixed',
                        top: '20px',
                        left: '20px',
                        zIndex: 1001,
                        background: 'var(--bg-card)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-main)',
                        boxShadow: 'var(--shadow-md)'
                    }}
                    onClick={() => setSidebarOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Menu size={24} />
                </motion.button>
            )}

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                marginLeft: sidebarOpen ? '320px' : '0',
                transition: 'margin-left 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Topbar - Dark Theme */}
                <header style={{
                    minHeight: '80px',
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(24px)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 2rem',
                    position: 'sticky',
                    top: 0,
                    zIndex: 900
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.7rem', fontWeight: '700', color: 'var(--text-main)' }}>
                            {role === 'ADMIN' ? 'Admin Portal' : role === 'STAFF' ? 'Staff Portal' : 'Student Portal'}
                        </h2>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            Welcome back, {user?.personalDetails?.firstName || user?.firstName || user?.username || 'User'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
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
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-input)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-subtle)'; }}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        {/* Notification Bell */}
                        <button style={{
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
                        </button>

                        {/* User Avatar */}
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            border: '2px solid var(--border-color)'
                        }}>
                            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div style={{
                    flex: 1,
                    padding: '2rem',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;

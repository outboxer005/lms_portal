
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { MDBContainer, MDBBtn, MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
import { BookOpen, UserPlus, ArrowRight, Menu, X, Home, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import swal from 'sweetalert';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [navExpanded, setNavExpanded] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        
        if (!credentials.username.trim()) {
            newErrors.username = 'Username or email is required';
        }
        
        if (!credentials.password) {
            newErrors.password = 'Password is required';
        } else if (credentials.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
        // Clear error for this field
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            swal('Validation Error', 'Please fix the errors in the form', 'error');
            return;
        }
        
        setLoading(true);

        try {
            const userData = await login(credentials);
            swal('Welcome back!', `Hello, ${userData.username || 'User'}!`, 'success', { button: 'Continue' })
                .then(() => {
                    if (userData.role === 'ADMIN') navigate('/admin/dashboard');
                    else if (userData.role === 'STAFF') navigate('/staff/dashboard');
                    else navigate('/student/dashboard');
                });
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Invalid username or password';
            swal('Login Failed', errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            background: 'linear-gradient(135deg, var(--bg-body) 0%, var(--gray-100) 50%, var(--gray-200) 100%)', 
            minHeight: '100vh', 
            width: '100%',
            color: 'var(--text-main)', 
            fontFamily: 'Inter, sans-serif', 
            position: 'relative', 
            overflow: 'auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'stretch'
        }}>
            {/* Custom Scrollbar & Mobile */}
            <style>{`
                @media (max-width: 768px) { .hide-mobile { display: none !important; } }
                /* Custom Scrollbar for Webkit browsers (Chrome, Safari, Edge) */
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
                    transition: background 0.3s ease;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(96, 165, 250, 0.5);
                }
                
                ::-webkit-scrollbar-thumb:active {
                    background: rgba(96, 165, 250, 0.7);
                }
                
                /* Firefox scrollbar */
                * {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(96, 165, 250, 0.3) rgba(15, 23, 42, 0.5);
                }
            `}</style>
            
            {/* Gradient Background Effects */}
            <div style={{ 
                position: 'absolute', 
                top: '-50%', 
                right: '-10%', 
                width: '60%', 
                height: '60%', 
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                zIndex: 0
            }}></div>
            <div style={{ 
                position: 'absolute', 
                bottom: '-30%', 
                left: '-10%', 
                width: '50%', 
                height: '50%', 
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                zIndex: 0
            }}></div>

            {/* Collapsible Navbar */}
            <div style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 100 }}>
                <motion.button
                    onClick={() => setNavExpanded(!navExpanded)}
                    style={{
                        background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '50%',
                        width: '56px',
                        height: '56px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                        transition: 'all 0.3s ease'
                    }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {navExpanded ? <X size={24} /> : <Menu size={24} />}
                </motion.button>

                <AnimatePresence>
                    {navExpanded && (
                        <motion.nav
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -20, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'absolute',
                                top: '70px',
                                left: '0',
                                background: 'rgba(15, 23, 42, 0.95)',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '20px',
                                padding: '1.5rem',
                                minWidth: '250px',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <Link 
                                    to="/" 
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px',
                                        textDecoration: 'none',
                                        color: 'white',
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <Home size={20} />
                                    <span style={{ fontWeight: '600' }}>Home</span>
                                </Link>

                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '12px',
                                    padding: '0.75rem',
                                    borderTop: '1px solid rgba(255,255,255,0.1)',
                                    paddingTop: '1rem',
                                    marginTop: '0.5rem'
                                }}>
                                    <div style={{ color: '#60a5fa', display: 'flex' }}>
                                        <BookOpen size={24} />
                                    </div>
                                    <span style={{ color: 'white', fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>LibPortal</span>
                                </div>

                                <Link 
                                    to="/register" 
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                                        color: 'white',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '50px',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
                                        e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary-400) 0%, var(--primary-500) 100%)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.35)';
                                        e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)';
                                    }}
                                >
                                    <UserPlus size={18} />
                                    Register
                                </Link>
                            </div>
                        </motion.nav>
                    )}
                </AnimatePresence>
            </div>

            {/* Split Layout: Image (hidden on mobile) + Login Form */}
            <div className="hide-mobile" style={{ 
                flex: 1, 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '2rem',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
                backgroundImage: 'url(https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=600&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.75) 100%)' }} />
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'white', maxWidth: '400px' }} className="hide-mobile">
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Welcome to LibPortal</h3>
                    <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6 }}>Your gateway to digital library management. Browse, borrow, and explore.</p>
                    <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=320&h=240&fit=crop" alt="Library" style={{ marginTop: '2rem', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', maxWidth: '100%' }} />
                </div>
            </div>
            <div style={{ 
                flex: 1, 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '2rem',
                position: 'relative',
                zIndex: 10,
                background: 'var(--bg-body)'
            }}>
                <MDBContainer style={{ maxWidth: '520px', width: '100%' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className='w-100'
                    >
                        <MDBCard className='shadow-5' style={{ 
                            background: 'var(--bg-card)', 
                            backdropFilter: 'blur(24px)', 
                            border: '2px solid var(--border-color)', 
                            color: 'var(--text-main)', 
                            borderRadius: '22px',
                            padding: '0.75rem'
                        }}>
                            <MDBCardBody style={{ padding: '1.6rem 1.5rem' }}>
                                <div className="text-center mb-3">
                                    <h2 className="mb-2" style={{ fontSize: '2rem', letterSpacing: '-0.02em', color: 'var(--text-main)', fontWeight: '400' }}>Sign In</h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '400' }}>Enter your credentials to continue</p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {/* Username Input */}
                                    <div className="mb-3">
                                        <label style={{ 
                                            fontWeight: '400', 
                                            fontSize: '0.95rem', 
                                            color: 'var(--text-main)',
                                            marginBottom: '0.4rem',
                                            display: 'block'
                                        }}>
                                            Enter your ID or Email
                                        </label>
                                        <input
                                            type='text'
                                            name="username"
                                            value={credentials.username}
                                            onChange={handleChange}
                                            placeholder="Enter your ID or email"
                                            required
                                            style={{ 
                                                width: '100%',
                                                background: 'var(--bg-input)', 
                                                border: errors.username ? '2px solid #ef4444' : '2px solid var(--border-color)', 
                                                height: '44px', 
                                                borderRadius: '12px', 
                                                color: 'var(--text-main)',
                                                padding: '0 1rem',
                                                fontSize: '0.95rem',
                                                fontWeight: '400',
                                                outline: 'none',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = 'var(--primary-500)';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.2)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = errors.username ? '#ef4444' : 'var(--border-color)';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                        {errors.username && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{ 
                                                    color: '#fca5a5', 
                                                    fontSize: '0.8rem', 
                                                    fontWeight: '400',
                                                    marginTop: '0.25rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}
                                            >
                                                <AlertCircle size={14} /> {errors.username}
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Password Input */}
                                    <div className="mb-3">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                            <label style={{ fontWeight: '400', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                                Password
                                            </label>
                                            <Link to="#" style={{ color: 'var(--primary-500)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '400' }}>
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={credentials.password}
                                                onChange={handleChange}
                                                required
                                                style={{ 
                                                    width: '100%',
                                                    background: 'var(--bg-input)', 
                                                    border: errors.password ? '2px solid #ef4444' : '2px solid var(--border-color)', 
                                                    height: '44px', 
                                                    borderRadius: '12px', 
                                                    color: 'var(--text-main)',
                                                    padding: '0 2.75rem 0 1rem',
                                                    fontSize: '0.95rem',
                                                    fontWeight: '400',
                                                    outline: 'none',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = 'var(--primary-500)';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.2)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = errors.password ? '#ef4444' : 'var(--border-color)';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '0.75rem',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: 'var(--primary-500)',
                                                    cursor: 'pointer',
                                                    padding: '0.5rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                                                    e.currentTarget.style.color = 'var(--primary-400)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                                                    e.currentTarget.style.color = 'var(--primary-500)';
                                                }}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{ 
                                                    color: '#fca5a5', 
                                                    fontSize: '0.8rem', 
                                                    fontWeight: '400',
                                                    marginTop: '0.25rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}
                                            >
                                                <AlertCircle size={14} /> {errors.password}
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Remember Me */}
                                    <div className="mb-3">
                                        <label style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '0.4rem',
                                            cursor: 'pointer',
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.9rem',
                                            fontWeight: '400'
                                        }}>
                                            <input 
                                                type="checkbox" 
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                style={{
                                                    width: '14px',
                                                    height: '14px',
                                                    cursor: 'pointer',
                                                    accentColor: '#60a5fa'
                                                }}
                                            />
                                            Remember me
                                        </label>
                                    </div>

                                    {/* Sign In Button */}
                                    <MDBBtn 
                                        className="w-100 mb-3" 
                                        size='lg' 
                                        disabled={loading} 
                                        type="submit"
                                        style={{
                                            background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                                            border: 'none',
                                            color: 'white',
                                            fontWeight: '600',
                                            borderRadius: '50px',
                                            padding: '0.75rem 1.5rem',
                                            textTransform: 'none',
                                            fontSize: '0.95rem',
                                            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!loading) {
                                                e.currentTarget.style.transform = 'scale(1.02)';
                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
                                                e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary-400) 0%, var(--primary-500) 100%)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!loading) {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.4)';
                                                e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)';
                                            }
                                        }}
                                    >
                                        {loading ? (
                                            <span>Logging in...</span>
                                        ) : (
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                Sign In <ArrowRight size={16} />
                                            </span>
                                        )}
                                    </MDBBtn>

                                    {/* Create Account Link - styled as secondary button */}
                                    <p className="text-center mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '400' }}>
                                        Don't have an account?{' '}
                                        <Link
                                            to="/register"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.35rem',
                                                color: 'white',
                                                textDecoration: 'none',
                                                fontWeight: '600',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '50px',
                                                background: 'linear-gradient(135deg, var(--primary-400) 0%, var(--primary-500) 100%)',
                                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                                                e.currentTarget.style.transform = 'scale(1.02)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary-400) 0%, var(--primary-500) 100%)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            Create account
                                        </Link>
                                    </p>
                                </form>
                            </MDBCardBody>
                        </MDBCard>
                    </motion.div>
                </MDBContainer>
            </div>
        </div>
    );
}

export default Login;

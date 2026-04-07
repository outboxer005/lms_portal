
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Home, Eye, EyeOff, AlertCircle, Sparkles, Mail, Lock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import swal from 'sweetalert';

const Login = () => {
    const { theme } = useTheme();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({});
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Forgot Password States
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: Identifier, 2: OTP, 3: New Password
    const [forgotData, setForgotData] = useState({ identifier: '', otp: '', newPassword: '' });
    const [forgotLoading, setForgotLoading] = useState(false);

    const isLight = theme === 'light';

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!credentials.username.trim()) newErrors.username = 'Username or email is required';
        if (!credentials.password) newErrors.password = 'Password is required';
        else if (credentials.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
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

    const handleForgotChange = (e) => {
        setForgotData({ ...forgotData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!forgotData.identifier.trim()) { swal('Error', 'Please enter your registered Email or ID', 'error'); return; }
        
        setForgotLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: forgotData.identifier })
            }).then(r => r.json());

            if (res.message && res.message.toLowerCase().includes('sent')) {
                swal('Success', res.message, 'success');
                setForgotStep(2);
            } else { swal('Error', res.message || 'Failed to send OTP', 'error'); }
        } catch (err) { swal('Error', 'Unable to connect to the server', 'error'); } 
        finally { setForgotLoading(false); }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!forgotData.otp.trim()) { swal('Error', 'Please enter the OTP sent to your email', 'error'); return; }
        setForgotLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: forgotData.identifier, otp: forgotData.otp })
            }).then(r => r.json());

            if (res.token === 'valid') {
                swal('Success', 'OTP Verified successfully.', 'success');
                setForgotStep(3);
            } else { swal('Error', res.message || 'Invalid OTP', 'error'); }
        } catch (err) { swal('Error', 'Unable to connect to the server', 'error'); } 
        finally { setForgotLoading(false); }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!forgotData.newPassword || forgotData.newPassword.length < 6) { swal('Error', 'Password must be at least 6 characters long', 'error'); return; }
        setForgotLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: forgotData.identifier, otp: forgotData.otp, newPassword: forgotData.newPassword })
            }).then(r => r.json());

            if (res.message && res.message.toLowerCase().includes('success')) {
                swal('Success', 'Your password has been reset successfully. You can now login.', 'success').then(() => {
                    setShowForgotPassword(false); setForgotStep(1); setForgotData({ identifier: '', otp: '', newPassword: '' });
                });
            } else { swal('Error', res.message || 'Failed to reset password', 'error'); }
        } catch (err) { swal('Error', 'Unable to connect to the server', 'error'); } 
        finally { setForgotLoading(false); }
    };

    const inputStyles = (errorSpan) => ({
        width: '100%',
        padding: '1rem 3rem',
        background: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.4)',
        border: `2px solid ${errorSpan ? '#ef4444' : isLight ? 'rgba(226, 232, 240, 0.8)' : 'rgba(51, 65, 85, 0.5)'}`,
        borderRadius: '16px',
        color: isLight ? '#0f172a' : '#f8fafc',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        boxShadow: isLight ? 'inset 0 2px 4px rgba(0,0,0,0.02)' : 'inset 0 2px 4px rgba(0,0,0,0.2)'
    });

    const activeInputStyle = {
        borderColor: '#8b5cf6',
        boxShadow: `0 0 0 4px rgba(139, 92, 246, 0.15), ${isLight ? 'inset 0 2px 4px rgba(0,0,0,0.02)' : 'inset 0 2px 4px rgba(0,0,0,0.2)'}`,
        background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.6)'
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            fontFamily: "'Inter', sans-serif",
            background: isLight ? '#f8fafc' : '#030712',
            color: isLight ? '#0f172a' : '#f8fafc',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
        }}>
            {/* Dynamic Mesh Background */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `
                    radial-gradient(at 0% 0%, ${isLight ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.2)'} 0px, transparent 50%),
                    radial-gradient(at 100% 100%, ${isLight ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.2)'} 0px, transparent 50%),
                    radial-gradient(at 100% 0%, ${isLight ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.15)'} 0px, transparent 50%)
                `,
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            {/* Mouse Tracking Glow (Dark Mode) */}
            {!isLight && (
                <div style={{
                    position: 'absolute',
                    top: mousePosition.y - 400,
                    left: mousePosition.x - 400,
                    width: '800px',
                    height: '800px',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 60%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }} />
            )}

             {/* Minimal Nav Link */}
             <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10 }}>
                <Link to="/" style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '50px',
                    background: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.5)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${isLight ? 'rgba(226, 232, 240, 0.8)' : 'rgba(255, 255, 255, 0.05)'}`,
                    color: isLight ? '#475569' : '#94a3b8',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = isLight ? '#0f172a' : '#f8fafc'; e.currentTarget.style.transform = 'translateX(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = isLight ? '#475569' : '#94a3b8'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                    <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Home
                </Link>
            </div>

            {/* Split Layout: Left Presentation (Hidden Mobile), Right Form */}
            <div className="presentation-side" style={{
                flex: 1.2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '4rem',
                position: 'relative',
                zIndex: 1,
            }}>
                <style>{`@media (max-width: 900px) { .presentation-side { display: none !important; } }`}</style>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                        <div style={{ 
                            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                            padding: '12px',
                            borderRadius: '16px',
                            color: 'white',
                            boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
                        }}>
                            <BookOpen size={28} />
                        </div>
                        <span style={{ fontWeight: '800', fontSize: '1.75rem', letterSpacing: '-0.03em' }}>
                            LibPortal
                        </span>
                    </div>
                </div>

                <div style={{ position: 'relative' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h2 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em', maxWidth: '500px' }}>
                            Welcome to the future of learning.
                        </h2>
                        <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '1.25rem', lineHeight: 1.6, maxWidth: '450px' }}>
                            Log in to manage your resources, track your reading history, and explore thousands of digital assets seamlessly.
                        </p>
                    </motion.div>
                </div>

                <div style={{
                    display: 'flex', gap: '2rem',
                    padding: '2rem',
                    borderRadius: '24px',
                    background: isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${isLight ? 'rgba(226, 232, 240, 0.8)' : 'rgba(255, 255, 255, 0.05)'}`,
                    maxWidth: '500px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <ShieldCheck size={24} color="#10b981" />
                        <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Secure Access</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Sparkles size={24} color="#8b5cf6" />
                        <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Personalized</span>
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                zIndex: 2,
                position: 'relative'
            }}>
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                        width: '100%',
                        maxWidth: '480px',
                        background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(17, 24, 39, 0.6)',
                        backdropFilter: 'blur(30px)',
                        '-webkit-backdrop-filter': 'blur(30px)',
                        borderRadius: '32px',
                        padding: '3rem',
                        border: `1px solid ${isLight ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.08)'}`,
                        boxShadow: isLight ? '0 20px 60px rgba(0,0,0,0.05)' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                            {showForgotPassword ? 'Reset Password' : 'Sign In'}
                        </h3>
                        <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '1rem' }}>
                            {showForgotPassword ? 'Follow the steps to secure your account' : 'Enter your credentials to continue'}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {showForgotPassword ? (
                            <motion.div 
                                key="forgot"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                            >
                                {forgotStep === 1 && (
                                    <form onSubmit={handleSendOtp}>
                                        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: isLight ? '#94a3b8' : '#64748b' }}><Mail size={20} /></div>
                                            <input
                                                type='text' name="identifier" value={forgotData.identifier} onChange={handleForgotChange} placeholder="Email or Student ID" required
                                                style={inputStyles(false)}
                                                onFocus={e => Object.assign(e.target.style, activeInputStyle)}
                                                onBlur={e => Object.assign(e.target.style, inputStyles(false))}
                                            />
                                        </div>
                                        <button type="submit" disabled={forgotLoading} style={{
                                            width: '100%', padding: '1.1rem', borderRadius: '16px', border: 'none',
                                            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: 'white', fontWeight: '700', fontSize: '1.05rem', cursor: 'pointer',
                                            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)', transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(59, 130, 246, 0.4)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)'; }}
                                        >
                                            {forgotLoading ? 'Sending...' : 'Send OTP via Email'}
                                        </button>
                                    </form>
                                )}
                                {forgotStep === 2 && (
                                    <form onSubmit={handleVerifyOtp}>
                                        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: isLight ? '#94a3b8' : '#64748b' }}><ShieldCheck size={20} /></div>
                                            <input
                                                type='text' name="otp" value={forgotData.otp} onChange={handleForgotChange} placeholder="Enter 6-digit OTP" required maxLength={6}
                                                style={{...inputStyles(false), letterSpacing: '4px', textAlign: 'center', paddingLeft: '1rem'}}
                                                onFocus={e => Object.assign(e.target.style, activeInputStyle)}
                                                onBlur={e => Object.assign(e.target.style, inputStyles(false))}
                                            />
                                        </div>
                                        <button type="submit" disabled={forgotLoading} style={{
                                            width: '100%', padding: '1.1rem', borderRadius: '16px', border: 'none',
                                            background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: '700', fontSize: '1.05rem', cursor: 'pointer',
                                            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)', transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(16, 185, 129, 0.4)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3)'; }}
                                        >
                                            {forgotLoading ? 'Verifying...' : 'Verify Secure Code'}
                                        </button>
                                    </form>
                                )}
                                {forgotStep === 3 && (
                                    <form onSubmit={handleResetPassword}>
                                        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: isLight ? '#94a3b8' : '#64748b' }}><Lock size={20} /></div>
                                            <input
                                                type='password' name="newPassword" value={forgotData.newPassword} onChange={handleForgotChange} placeholder="Enter New Password" required minLength={6}
                                                style={inputStyles(false)}
                                                onFocus={e => Object.assign(e.target.style, activeInputStyle)}
                                                onBlur={e => Object.assign(e.target.style, inputStyles(false))}
                                            />
                                        </div>
                                        <button type="submit" disabled={forgotLoading} style={{
                                            width: '100%', padding: '1.1rem', borderRadius: '16px', border: 'none',
                                            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: 'white', fontWeight: '700', fontSize: '1.05rem', cursor: 'pointer',
                                            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)', transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(59, 130, 246, 0.4)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)'; }}
                                        >
                                            {forgotLoading ? 'Processing...' : 'Set New Password'}
                                        </button>
                                    </form>
                                )}

                                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                                    <button type="button" onClick={() => { setShowForgotPassword(false); setForgotStep(1); }}
                                        style={{ background: 'none', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}
                                        onMouseEnter={e => e.currentTarget.style.color = isLight ? '#0f172a' : 'white'}
                                        onMouseLeave={e => e.currentTarget.style.color = isLight ? '#64748b' : '#94a3b8'}
                                    >
                                        <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Sign In
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.form 
                                key="login"
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
                                onSubmit={handleSubmit}
                            >
                                {/* Username */}
                                <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: isLight ? '#94a3b8' : '#64748b', zIndex: 10 }}>
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type='text' name="username" value={credentials.username} onChange={handleChange} placeholder="Email or ID" required
                                        style={inputStyles(errors.username)}
                                        onFocus={e => Object.assign(e.target.style, activeInputStyle)}
                                        onBlur={e => Object.assign(e.target.style, inputStyles(errors.username))}
                                    />
                                    {errors.username && (
                                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <AlertCircle size={14} /> {errors.username}
                                        </motion.div>
                                    )}
                                </div>

                                {/* Password */}
                                <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: isLight ? '#94a3b8' : '#64748b', zIndex: 10 }}>
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'} name="password" value={credentials.password} onChange={handleChange} placeholder="Password" required
                                        style={inputStyles(errors.password)}
                                        onFocus={e => Object.assign(e.target.style, activeInputStyle)}
                                        onBlur={e => Object.assign(e.target.style, inputStyles(errors.password))}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: isLight ? '#94a3b8' : '#64748b', cursor: 'pointer', display: 'flex', zIndex: 10 }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#8b5cf6'}
                                        onMouseLeave={e => e.currentTarget.style.color = isLight ? '#94a3b8' : '#64748b'}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                    {errors.password && (
                                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <AlertCircle size={14} /> {errors.password}
                                        </motion.div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.95rem', fontWeight: '500' }}>
                                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                                            style={{ width: '16px', height: '16px', accentColor: '#8b5cf6', cursor: 'pointer' }}
                                        />
                                        Remember me
                                    </label>
                                    <button type="button" onClick={() => setShowForgotPassword(true)}
                                        style={{ color: '#8b5cf6', fontSize: '0.95rem', fontWeight: '600', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <button type="submit" disabled={loading} style={{
                                    width: '100%', padding: '1.2rem', borderRadius: '16px', border: 'none',
                                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: 'white', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)', transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={e => { if(!loading){ e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(59, 130, 246, 0.4)'; } }}
                                onMouseLeave={e => { if(!loading){ e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)'; } }}
                                >
                                    {loading ? 'Authenticating...' : <><Sparkles size={18} /> Sign In to Portal</>}
                                </button>

                                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                                    <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '1rem', fontWeight: '500' }}>
                                        New to LibPortal? {' '}
                                        <Link to="/register" style={{ color: '#8b5cf6', fontWeight: '700', textDecoration: 'none' }}>
                                            Create an account
                                        </Link>
                                    </p>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}

export default Login;


import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Orb from '../components/landing/Orb';
import { useTheme } from '../context/ThemeContext';
import { ArrowRight, BookOpen, Clock, Users, Search, BarChart3, Database, ShieldCheck, LogIn, UserPlus, CheckCircle2, Sun, Moon } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
    const { theme, toggleTheme } = useTheme();
    // Refs for animation
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const modulesRef = useRef(null);
    const statsRef = useRef(null);
    const howItWorksRef = useRef(null);
    const navRef = useRef(null);
    const [showNav, setShowNav] = React.useState(true);
    const [lastScrollY, setLastScrollY] = React.useState(0);

    useEffect(() => {
        // Navbar scroll handler
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY < 10) {
                setShowNav(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                setShowNav(false);
            } else if (currentScrollY < lastScrollY) {
                // Scrolling up
                setShowNav(true);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        // Hero Animation
        if (heroRef.current) {
            gsap.fromTo(heroRef.current.children,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out" }
            );
        }

        // Features Animation
        if (featuresRef.current) {
            gsap.fromTo(featuresRef.current.children,
                { y: 50, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out",
                    scrollTrigger: {
                        trigger: featuresRef.current,
                        start: "top 80%",
                    }
                }
            );
        }

        // Modules Animation
        if (modulesRef.current) {
            gsap.fromTo(modulesRef.current.children,
                { y: 50, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out",
                    scrollTrigger: {
                        trigger: modulesRef.current,
                        start: "top 75%",
                    }
                }
            );
        }

        // How It Works Animation
        if (howItWorksRef.current) {
            gsap.fromTo(howItWorksRef.current.children,
                { x: -50, opacity: 0 },
                {
                    x: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out",
                    scrollTrigger: {
                        trigger: howItWorksRef.current,
                        start: "top 75%",
                    }
                }
            );
        }

        // Stats Animation
        if (statsRef.current) {
            gsap.fromTo(statsRef.current.children,
                { scale: 0.9, opacity: 0 },
                {
                    scale: 1, opacity: 1, duration: 0.8, stagger: 0.2, ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: statsRef.current,
                        start: "top 85%",
                    }
                }
            );
        }

    }, []);

    return (
        <div style={{ background: 'var(--bg-body)', minHeight: '100vh', width: '100%', color: 'var(--text-main)', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
            <style>{`
                @media (max-width: 768px) {
                    .hide-mobile { display: none !important; }
                    .landing-image-strip { grid-template-columns: 1fr !important; }
                }
                @media (min-width: 769px) and (max-width: 1024px) {
                    .landing-image-strip { grid-template-columns: repeat(2, 1fr) !important; }
                }
            `}</style>
            {/* Pill Navbar - Auto-hide on Scroll - Theme aware */}
            <nav ref={navRef} style={{
                position: 'fixed',
                top: showNav ? '20px' : '-100px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                background: theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(20px)',
                padding: '0.75rem 2rem',
                borderRadius: '50px',
                border: theme === 'light' ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '96%',
                maxWidth: '1600px',
                boxShadow: theme === 'light' ? '0 4px 24px rgba(0,0,0,0.08)' : '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                transition: 'top 0.3s ease-in-out'
            }}>
                {/* Logo Area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: 'var(--primary-500)', display: 'flex' }}>
                        <BookOpen size={28} />
                    </div>
                    <span style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '1.4rem', letterSpacing: '-0.02em' }}>LibPortal</span>
                </div>

                {/* Links Area */}
                <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '2rem' }} className="hide-mobile">
                        <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '1rem', fontWeight: '600' }}>Home</Link>
                        <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '1rem', fontWeight: '500', transition: 'color 0.2s' }}>System</Link>
                        <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '1rem', fontWeight: '500', transition: 'color 0.2s' }}>Contact</Link>
                    </div>

                    {/* Theme Toggle & Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button
                            onClick={toggleTheme}
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            style={{
                                padding: '0.5rem',
                                background: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                                border: theme === 'light' ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '50%',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <Link to="/login" style={{
                            padding: '0.6rem 1.4rem',
                            background: 'transparent',
                            color: theme === 'light' ? 'var(--text-main)' : 'white',
                            border: theme === 'light' ? '1px solid var(--border-color)' : '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '50px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = theme === 'light' ? 'var(--gray-100)' : 'rgba(255,255,255,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}>
                            <LogIn size={18} />
                            Login
                        </Link>
                        <Link to="/register" style={{
                            padding: '0.6rem 1.4rem',
                            background: theme === 'light' ? 'var(--primary-600)' : 'white',
                            color: theme === 'light' ? 'white' : 'black',
                            borderRadius: '50px',
                            fontWeight: '700',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: theme === 'light' ? '0 4px 14px rgba(234, 88, 12, 0.35)' : '0 4px 15px rgba(255, 255, 255, 0.3)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.03)';
                            e.currentTarget.style.boxShadow = theme === 'light' ? '0 6px 20px rgba(234, 88, 12, 0.4)' : '0 6px 20px rgba(255, 255, 255, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = theme === 'light' ? '0 4px 14px rgba(234, 88, 12, 0.35)' : '0 4px 15px rgba(255, 255, 255, 0.3)';
                        }}>
                            <UserPlus size={18} />
                            Register
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section Container */}
            <div style={{
                position: 'relative',
                minHeight: '115vh', /* Increased height */
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                textAlign: 'center',
                padding: '0 1rem',
                marginTop: '-90px'
            }}>
                {/* Full-screen image - visible on left & right edges only, masked in center */}
                <div
                    className="hero-edge-image"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 0,
                        maskImage: 'linear-gradient(to right, black 0%, transparent 20%, transparent 72%, black 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 28%, transparent 72%, black 100%)',
                        maskSize: '100% 100%',
                        maskRepeat: 'no-repeat'
                    }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80"
                        alt=""
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                        }}
                    />
                </div>
                {/* Background Orb - center behind content (image visible only on edges via mask above) */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
                    <Orb
                        hue={theme === 'light' ? 20 : 0}
                        hoverIntensity={theme === 'light' ? 0.15 : 0.2}
                        rotateOnHover={true}
                        forceHoverState={false}
                        backgroundColor={theme === 'light' ? '#f8fafc' : '#0f172a'}
                    />
                </div>

                {/* Hero Content - no background on container to avoid theme-switch box glitch */}
                <div ref={heroRef} style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', width: '100%', background: 'transparent' }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '0.6rem 1.25rem',
                        borderRadius: '50px',
                        border: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.2)'}`,
                        background: theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        marginBottom: '2rem',
                        fontSize: '0.95rem',
                        color: theme === 'light' ? '#334155' : '#e2e8f0',
                        fontWeight: '600',
                        cursor: 'default',
                        boxShadow: theme === 'light' ? '0 4px 20px rgba(0,0,0,0.08)' : '0 8px 30px -5px rgba(0, 0, 0, 0.5)'
                    }}>
                        <span style={{ display: 'block', width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 12px #a855f7' }}></span>
                        Infosys Library Management System
                    </div>

                    {/* Title - use color for main line to prevent gradient box glitch on theme switch */}
                    <h1 style={{
                        fontSize: 'clamp(3rem, 6vw, 4.5rem)',
                        fontWeight: '800',
                        lineHeight: 1.1,
                        marginBottom: '1.5rem',
                        letterSpacing: '-0.03em',
                        color: 'transparent',
                        background: 'none',
                        margin: '0 0 1.5rem 0'
                    }}>
                        <span style={{ color: theme === 'light' ? '#0f172a' : '#f1f5f9' }}>Smart Library</span>
                        <br />
                        <span style={{
                            background: 'linear-gradient(to right, #c084fc, #a855f7, #60a5fa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>Explore & Learn!</span>
                    </h1>

                    <p style={{
                        fontSize: '1.25rem',
                        color: theme === 'light' ? '#475569' : '#cbd5e1',
                        marginBottom: '3rem',
                        maxWidth: '750px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        lineHeight: 1.6,
                        fontWeight: '400'
                    }}>
                        A comprehensive digital ecosystem for modern libraries. Streamline cataloging, enhance user engagement, and drive educational growth with our advanced portal.
                    </p>

                    {/* CTA Buttons */}
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link to="/register" style={{   
                            padding: '1rem 2.5rem',
                            background: theme === 'light' ? 'var(--primary-600)' : 'white',
                            color: theme === 'light' ? 'white' : 'black',
                            borderRadius: '50px',
                            fontWeight: '700',
                            textDecoration: 'none',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.3s ease',
                            boxShadow: theme === 'light' ? '0 4px 20px rgba(234, 88, 12, 0.35)' : '0 0 20px rgba(255, 255, 255, 0.3)'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.03)';
                                e.currentTarget.style.boxShadow = theme === 'light' ? '0 6px 24px rgba(234, 88, 12, 0.4)' : '0 0 30px rgba(255, 255, 255, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = theme === 'light' ? '0 4px 20px rgba(234, 88, 12, 0.35)' : '0 0 20px rgba(255, 255, 255, 0.3)';
                            }}
                        >
                            Get Started
                            <ArrowRight size={20} />
                        </Link>
                        <Link to="/login" style={{
                            padding: '1rem 2.5rem',
                            background: theme === 'light' ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
                            border: theme === 'light' ? '2px solid var(--primary-500)' : '1px solid rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            color: theme === 'light' ? 'var(--primary-600)' : 'white',
                            borderRadius: '50px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.3s ease'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = theme === 'light' ? 'var(--primary-50)' : 'rgba(255, 255, 255, 0.2)';
                                e.currentTarget.style.transform = 'scale(1.03)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = theme === 'light' ? 'transparent' : 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            Member Login
                        </Link>
                    </div>
                </div>
            </div>

            {/* Full-width hero image strip */}
            <div style={{
                width: '100%',
                padding: 0,
                margin: 0,
                background: theme === 'light' ? 'var(--gray-100)' : 'rgba(15, 23, 42, 0.5)',
                borderTop: `1px solid ${theme === 'light' ? 'var(--border-color)' : 'rgba(255,255,255,0.06)'}`,
                borderBottom: `1px solid ${theme === 'light' ? 'var(--border-color)' : 'rgba(255,255,255,0.06)'}`
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 0,
                    maxWidth: '1600px',
                    margin: '0 auto',
                    overflow: 'hidden'
                }}
                    className="landing-image-strip"
                >
                    <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                        <img
                            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop"
                            alt="Library shelves"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                    </div>
                    <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                        <img
                            src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&h=400&fit=crop"
                            alt="Reading space"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                    </div>
                    <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                        <img
                            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=400&fit=crop"
                            alt="Books and study"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                    </div>
                </div>
            </div>

            {/* How it works - full width with images */}
            <div ref={howItWorksRef} style={{
                width: '100%',
                padding: '6rem 2rem',
                background: theme === 'light' ? 'white' : 'var(--bg-body)',
                borderBottom: `1px solid ${theme === 'light' ? 'var(--border-color)' : 'rgba(255,255,255,0.06)'}`
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.75rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>How it works</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '560px', margin: '0 auto' }}>
                            Get started in three simple steps.
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'start' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ marginBottom: '1.5rem', borderRadius: '20px', overflow: 'hidden', boxShadow: theme === 'light' ? '0 10px 40px rgba(0,0,0,0.1)' : '0 10px 40px rgba(0,0,0,0.3)' }}>
                                <img src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=260&fit=crop" alt="Register" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            </div>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: '800', fontSize: '1.25rem' }}>1</div>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Register</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>Create your account as a student or staff member and submit your details.</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ marginBottom: '1.5rem', borderRadius: '20px', overflow: 'hidden', boxShadow: theme === 'light' ? '0 10px 40px rgba(0,0,0,0.1)' : '0 10px 40px rgba(0,0,0,0.3)' }}>
                                <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=260&fit=crop" alt="Get approved" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            </div>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: '800', fontSize: '1.25rem' }}>2</div>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Get approved</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>Admin reviews your registration and you receive your login credentials.</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ marginBottom: '1.5rem', borderRadius: '20px', overflow: 'hidden', boxShadow: theme === 'light' ? '0 10px 40px rgba(0,0,0,0.1)' : '0 10px 40px rgba(0,0,0,0.3)' }}>
                                <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=260&fit=crop" alt="Explore" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            </div>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: '800', fontSize: '1.25rem' }}>3</div>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Explore & learn</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>Access the portal, search books, and manage your library experience.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section - Theme aware */}
            <div ref={featuresRef} style={{ 
                padding: '8rem 2rem', 
                maxWidth: '1200px', 
                margin: '0 auto',
                background: theme === 'light' ? 'var(--gray-50)' : 'transparent'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>Everything you need</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
                        Powerful tools designed to modernize your library operations and enhance the learning experience.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
                    {[
                        { icon: <Search size={32} color="#3b82f6" />, title: "Smart Search", desc: "Advanced filtering and instant results for thousands of resources." },
                        { icon: <Clock size={32} color="#8b5cf6" />, title: "Real-time Availability", desc: "Check book status instantly and reserve materials online." },
                        { icon: <Users size={32} color="#ec4899" />, title: "User Management", desc: "Comprehensive profiles for students and staff with history tracking." },
                        { icon: <BarChart3 size={32} color="#10b981" />, title: "Analytics Dashboard", desc: "Visual insights into circulation trends and resource utilization." },
                        { icon: <Database size={32} color="#f59e0b" />, title: "Digital Archives", desc: "Secure storage and easy access for digital journals and papers." },
                        { icon: <ShieldCheck size={32} color="#ef4444" />, title: "Secure Access", desc: "Role-based authentication keeping data safe and private." }
                    ].map((feature, index) => (
                        <div key={index} style={{
                            padding: '2.5rem',
                            background: theme === 'light' ? 'white' : 'var(--bg-card)',
                            borderRadius: '24px',
                            border: `1px solid ${theme === 'light' ? 'var(--border-color)' : 'rgba(255, 255, 255, 0.08)'}`,
                            boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            cursor: 'default'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = theme === 'light' ? '0 12px 40px rgba(0,0,0,0.08)' : '0 12px 40px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = theme === 'light' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none';
                            }}
                        >
                            <div style={{ marginBottom: '1.5rem', background: theme === 'light' ? 'var(--gray-100)' : 'rgba(255, 255, 255, 0.05)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {feature.icon}
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modules Preview - Theme aware */}
            <div ref={modulesRef} style={{ 
                background: theme === 'light' ? 'linear-gradient(to bottom, #f8fafc, #f1f5f9)' : 'linear-gradient(to bottom, #0f172a, #1e293b)', 
                padding: '8rem 2rem' 
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>Tailored Experiences</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
                            Dedicated portals ensuring specialized efficiency for every role.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem' }}>
                        {[
                            { title: 'Student Portal', role: 'For Learners', desc: 'Browse catalog, track issued books, manage profile, and access digital resources.', color: '#3b82f6', link: '/student/dashboard' },
                            { title: 'Staff Dashboard', role: 'For Librarians', desc: 'Manage inventory, issue/return processing, fine collection, and user oversight.', color: '#10b981', link: '/staff/dashboard' },
                            { title: 'Admin Console', role: 'For Management', desc: 'System configuration, detailed reporting, audit logs, and policy management.', color: '#8b5cf6', link: '/admin/dashboard' }
                        ].map((module, i) => (
                            <div key={i} style={{
                                position: 'relative',
                                background: theme === 'light' ? 'white' : 'var(--bg-card)',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                border: theme === 'light' ? '1px solid var(--border-color)' : '1px solid rgba(255,255,255,0.08)',
                                boxShadow: theme === 'light' ? '0 4px 20px rgba(0,0,0,0.06)' : '0 4px 20px rgba(0,0,0,0.2)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = theme === 'light' ? '0 16px 40px rgba(0,0,0,0.1)' : '0 16px 40px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = theme === 'light' ? '0 4px 20px rgba(0,0,0,0.06)' : '0 4px 20px rgba(0,0,0,0.2)';
                            }}>
                                <div style={{ height: '6px', width: '100%', background: module.color }}></div>
                                <div style={{ padding: '3rem' }}>
                                    <span style={{ color: module.color, fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '1rem' }}>{module.role}</span>
                                    <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-main)' }}>{module.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6, flexGrow: 1 }}>{module.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Section - Theme aware */}
            <div ref={statsRef} style={{ 
                padding: '8rem 2rem', 
                background: theme === 'light' ? 'var(--bg-body)' : '#0f172a',
                borderTop: theme === 'light' ? '1px solid var(--border-color)' : 'none'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: 'center' }}>
                    {[
                        { num: '50k+', label: 'Digital Resources' },
                        { num: '10k+', label: 'Active Users' },
                        { num: '99%', label: 'Uptime' },
                        { num: '24/7', label: 'Support' }
                    ].map((stat, i) => (
                        <div key={i}>
                            <div style={{
                                fontSize: '4rem',
                                fontWeight: '800',
                                marginBottom: '0.5rem',
                                ...(theme === 'light'
                                    ? { background: 'linear-gradient(to bottom, var(--primary-600), var(--primary-500))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
                                    : { color: 'var(--text-main)' })
                            }}>{stat.num}</div>
                            <div style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '1.2rem' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer - Theme aware */}
            <footer style={{ 
                background: theme === 'light' ? 'var(--gray-100)' : '#0f172a', 
                padding: '6rem 2rem 3rem', 
                borderTop: theme === 'light' ? '1px solid var(--border-color)' : '1px solid rgba(255,255,255,0.08)' 
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '5rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                                <BookOpen size={28} color="var(--primary-500)" />
                                <span style={{ fontWeight: '800', fontSize: '1.5rem', color: 'var(--text-main)' }}>LibPortal</span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                Empowering institutions with cutting-edge library management solutions.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Platform</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Features</a></li>
                                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Modules</a></li>
                                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Integration</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Company</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>About Us</a></li>
                                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Careers</a></li>
                                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Legal</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a></li>
                                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div style={{ borderTop: theme === 'light' ? '1px solid var(--border-color)' : '1px solid rgba(255,255,255,0.08)', paddingTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        &copy; 2024 LibPortal Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;

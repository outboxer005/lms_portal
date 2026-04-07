
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Orb from '../components/landing/Orb';
import { useTheme } from '../context/ThemeContext';
import { ArrowRight, BookOpen, Clock, Users, Search, BarChart3, Database, ShieldCheck, LogIn, UserPlus, Sun, Moon, Sparkles, Zap, Globe, Cpu, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ChatWidget from '../components/ChatWidget';
import { motion, useScroll, useTransform } from 'motion/react';

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
    const [showNav, setShowNav] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

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
            const tl = gsap.timeline();
            tl.fromTo(heroRef.current.querySelector('.badge-pill'),
                { y: -30, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.5)", delay: 0.2 }
            )
            .fromTo(heroRef.current.querySelector('h1'),
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power4.out" },
                "-=0.4"
            )
            .fromTo(heroRef.current.querySelector('.hero-desc'),
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
                "-=0.6"
            )
            .fromTo(heroRef.current.querySelector('.hero-actions'),
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
                "-=0.6"
            );
        }

        // Features Animation
        if (featuresRef.current) {
            gsap.fromTo(featuresRef.current.querySelectorAll('.feature-card'),
                { y: 60, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out",
                    scrollTrigger: {
                        trigger: featuresRef.current,
                        start: "top 80%",
                    }
                }
            );
        }

        // Modules Animation
        if (modulesRef.current) {
            gsap.fromTo(modulesRef.current.querySelectorAll('.module-card'),
                { y: 50, opacity: 0, scale: 0.95 },
                {
                    y: 0, opacity: 1, scale: 1, duration: 1, stagger: 0.2, ease: "expo.out",
                    scrollTrigger: {
                        trigger: modulesRef.current,
                        start: "top 75%",
                    }
                }
            );
        }

        // Stats Animation
        if (statsRef.current) {
             gsap.fromTo(statsRef.current.querySelectorAll('.stat-item'),
                { scale: 0.8, opacity: 0, y: 30 },
                {
                    scale: 1, opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "elastic.out(1, 0.7)",
                    scrollTrigger: {
                        trigger: statsRef.current,
                        start: "top 85%",
                    }
                }
            );
        }

    }, []);

    const isLight = theme === 'light';

    return (
        <div style={{ 
            background: isLight ? '#f8fafc' : '#030712', 
            minHeight: '100vh', 
            width: '100%', 
            color: isLight ? '#0f172a' : '#f8fafc', 
            fontFamily: "'Inter', sans-serif", 
            overflowX: 'hidden' 
        }}>
            <style>{`
                ::selection {
                    background: rgba(139, 92, 246, 0.3);
                    color: ${isLight ? '#0f172a' : '#ffffff'};
                }
                .glass-nav {
                    background: ${isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.5)'};
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid ${isLight ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.05)'};
                }
                .text-gradient {
                    background: linear-gradient(135deg, ${isLight ? '#4f46e5, #ec4899' : '#8b5cf6, #3b82f6, #2dd4bf'});
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .gradient-bg {
                    background: linear-gradient(135deg, ${isLight ? '#4f46e5, #ec4899' : '#8b5cf6, #3b82f6'});
                }
                .mesh-bg {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-image: 
                        radial-gradient(at 40% 20%, ${isLight ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.15)'} 0px, transparent 50%),
                        radial-gradient(at 80% 0%, ${isLight ? 'rgba(236, 72, 153, 0.08)' : 'rgba(236, 72, 153, 0.15)'} 0px, transparent 50%),
                        radial-gradient(at 0% 50%, ${isLight ? 'rgba(56, 189, 248, 0.1)' : 'rgba(56, 189, 248, 0.15)'} 0px, transparent 50%);
                    z-index: 0;
                    pointer-events: none;
                }
                .glass-card {
                    background: ${isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(17, 24, 39, 0.4)'};
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid ${isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.05)'};
                    box-shadow: ${isLight ? '0 10px 30px rgba(0,0,0,0.03)' : '0 10px 30px rgba(0,0,0,0.2)'};
                }
                .nav-link {
                    position: relative;
                }
                .nav-link::after {
                    content: '';
                    position: absolute;
                    width: 0; height: 2px;
                    bottom: -4px; left: 0;
                    background: ${isLight ? '#4f46e5' : '#8b5cf6'};
                    transition: width 0.3s ease;
                }
                .nav-link:hover::after { width: 100%; }
                
                @media (max-width: 768px) {
                    .hide-mobile { display: none !important; }
                    .stack-mobile { flex-direction: column !important; }
                    h1 { font-size: 3rem !important; }
                }
            `}</style>
            
            {/* Ambient Mouse Tracking Glow (Only in Dark Mode) */}
            {!isLight && (
                <div style={{
                    position: 'fixed',
                    top: mousePosition.y - 300,
                    left: mousePosition.x - 300,
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                    transition: 'opacity 0.3s ease'
                }} />
            )}

            {/* Pill Navbar */}
            <nav ref={navRef} className="glass-nav" style={{
                position: 'fixed',
                top: showNav ? '20px' : '-100px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                padding: '0.8rem 1.5rem',
                borderRadius: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '95%',
                maxWidth: '1200px',
                transition: 'top 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isLight ? '0 10px 40px rgba(0,0,0,0.05)' : '0 10px 40px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                        padding: '8px',
                        borderRadius: '12px',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
                    }}>
                        <BookOpen size={20} className="w-5 h-5" />
                    </div>
                    <span style={{ fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.03em' }}>
                        LibPortal
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '2rem' }} className="hide-mobile">
                        <Link to="/" className="nav-link" style={{ color: isLight ? '#1e293b' : '#f8fafc', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600' }}>Home</Link>
                        <Link to="/" className="nav-link" style={{ color: isLight ? '#64748b' : '#94a3b8', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>Features</Link>
                        <Link to="/" className="nav-link" style={{ color: isLight ? '#64748b' : '#94a3b8', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>Contact</Link>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button
                            onClick={toggleTheme}
                            style={{
                                padding: '0.6rem',
                                background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
                                border: 'none',
                                borderRadius: '50%',
                                color: isLight ? '#1e293b' : '#f8fafc',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)'}
                        >
                            {isLight ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                        <Link to="/login" style={{
                            padding: '0.6rem 1.2rem',
                            color: isLight ? '#1e293b' : '#f8fafc',
                            fontWeight: '600',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            borderRadius: '50px',
                        }}
                        className="hide-mobile"
                        onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            Log In
                        </Link>
                        <Link to="/register" style={{
                            padding: '0.6rem 1.4rem',
                            background: isLight ? '#0f172a' : '#f8fafc',
                            color: isLight ? '#ffffff' : '#0f172a',
                            borderRadius: '50px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            boxShadow: isLight ? '0 4px 14px rgba(0,0,0,0.1)' : '0 4px 20px rgba(255,255,255,0.15)',
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = isLight ? '0 8px 20px rgba(0,0,0,0.15)' : '0 8px 25px rgba(255,255,255,0.25)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = isLight ? '0 4px 14px rgba(0,0,0,0.1)' : '0 4px 20px rgba(255,255,255,0.15)';
                            }}>
                            Sign Up
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <motion.div 
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="mesh-bg"
            />
            
            <div style={{
                position: 'relative',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '0 1rem',
                paddingTop: '80px', // offset for nav
                zIndex: 10
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, opacity: isLight ? 0.6 : 0.8 }}>
                    <Orb hue={isLight ? 230 : 260} hoverIntensity={0.1} backgroundColor="transparent" forceHoverState={false} />
                </div>

                <div ref={heroRef} style={{ maxWidth: '1000px', width: '100%', zIndex: 10, position: 'relative' }}>
                    {/* Pill Badge */}
                    <div className="badge-pill" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '0.5rem 1rem',
                        borderRadius: '50px',
                        background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(30, 41, 59, 0.5)',
                        border: `1px solid ${isLight ? 'rgba(226, 232, 240, 0.8)' : 'rgba(51, 65, 85, 0.8)'}`,
                        backdropFilter: 'blur(12px)',
                        marginBottom: '2rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: isLight ? '#475569' : '#cbd5e1',
                        boxShadow: `0 4px 20px ${isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.2)'}`
                    }}>
                        <Sparkles size={16} color="#8b5cf6" />
                        <span>Next-Gen Library Management</span>
                        <div style={{ width: '1px', height: '12px', background: isLight ? '#cbd5e1' : '#475569' }}></div>
                        <span style={{ color: '#8b5cf6' }}>Infosys Platform</span>
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(3.5rem, 8vw, 5.5rem)',
                        fontWeight: '800',
                        lineHeight: 1.05,
                        letterSpacing: '-0.04em',
                        marginBottom: '2rem'
                    }}>
                        Organize knowledge. <br className="hide-mobile" />
                        <span className="text-gradient">Empower discovery.</span>
                    </h1>

                    <p className="hero-desc" style={{
                        fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
                        color: isLight ? '#475569' : '#94a3b8',
                        marginBottom: '3rem',
                        maxWidth: '650px',
                        margin: '0 auto 3rem auto',
                        lineHeight: 1.7,
                        fontWeight: '400'
                    }}>
                        A stunningly beautiful, high-performance ecosystem for modern libraries. Streamline cataloging, engage readers, and build a digital hub.
                    </p>

                    <div className="hero-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" style={{
                            padding: '1.2rem 2.5rem',
                            background: isLight ? '#0f172a' : '#f8fafc',
                            color: isLight ? '#ffffff' : '#0f172a',
                            borderRadius: '50px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            boxShadow: isLight ? '0 10px 30px rgba(0,0,0,0.15)' : '0 10px 30px rgba(255,255,255,0.15)'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = isLight ? '0 20px 40px rgba(0,0,0,0.2)' : '0 20px 40px rgba(255,255,255,0.25)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = isLight ? '0 10px 30px rgba(0,0,0,0.15)' : '0 10px 30px rgba(255,255,255,0.15)'; }}
                        >
                            Start Exploring
                            <ArrowRight size={20} />
                        </Link>
                        
                        <Link to="/login" className="glass-card" style={{
                            padding: '1.2rem 2.5rem',
                            color: isLight ? '#0f172a' : '#f8fafc',
                            borderRadius: '50px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.3s ease'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = isLight ? 'rgba(255,255,255,1)' : 'rgba(30, 41, 59, 0.8)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(17, 24, 39, 0.4)'; }}
                        >
                            Member Login
                        </Link>
                    </div>
                </div>
            </div>

            {/* Dashboard Preview Image */}
            <div style={{ position: 'relative', marginTop: '-10vh', zIndex: 20, padding: '0 2rem' }}>
                <div className="glass-card" style={{
                    maxWidth: '1100px',
                    margin: '0 auto',
                    borderRadius: '24px',
                    padding: '1rem',
                    transform: 'perspective(1000px) rotateX(2deg)',
                    boxShadow: isLight ? '0 30px 60px rgba(0,0,0,0.12)' : '0 30px 60px rgba(0,0,0,0.6)',
                }}>
                    <img 
                        src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80" 
                        alt="Library Dashboard" 
                        style={{ width: '100%', height: 'auto', borderRadius: '16px', display: 'block', objectFit: 'cover', maxHeight: '500px' }}
                    />
                </div>
            </div>

            {/* Features Grid */}
            <div ref={featuresRef} style={{ position: 'relative', padding: '10rem 2rem 5rem', zIndex: 10 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                        <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
                            Everything you need. <br />
                            <span style={{ color: isLight ? '#64748b' : '#94a3b8' }}>Nothing you don't.</span>
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                        {[
                            { icon: <Search size={28} />, color: '#3b82f6', title: "Lightning Fast Search", desc: "Find any book, journal, or paper instantly with advanced indexing and filters." },
                            { icon: <Globe size={28} />, color: '#8b5cf6', title: "Digital Anywhere", desc: "Access the entire library catalog from any device, anywhere in the world." },
                            { icon: <Zap size={28} />, color: '#ec4899', title: "Real-time sync", desc: "Availability, reservations, and fine calculations are updated in real-time." },
                            { icon: <Cpu size={28} />, color: '#10b981', title: "Smart Automation", desc: "Automate overdue notices, reservations, and inventory management effortlessly." },
                        ].map((feat, i) => (
                            <div key={i} className="feature-card glass-card" style={{
                                padding: '2.5rem',
                                borderRadius: '24px',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ 
                                    width: '60px', height: '60px', 
                                    borderRadius: '16px', 
                                    background: `rgba(${feat.color === '#3b82f6' ? '59, 130, 246' : feat.color === '#8b5cf6' ? '139, 92, 246' : feat.color === '#ec4899' ? '236, 72, 153' : '16, 185, 129'}, 0.1)`, 
                                    color: feat.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '2rem'
                                }}>
                                    {feat.icon}
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>{feat.title}</h3>
                                <p style={{ color: isLight ? '#64748b' : '#94a3b8', lineHeight: 1.6, fontSize: '1.1rem' }}>{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modules Section */}
            <div ref={modulesRef} style={{ padding: '8rem 2rem', position: 'relative' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                        {[
                            {
                                role: "For Students",
                                title: "Your personal academic hub.",
                                desc: "Track your reading history, reserve books ahead of time, pay fines, and request new materials all from a sleek, personalized dashboard.",
                                img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
                                reverse: false
                            },
                            {
                                role: "For Staff & Admin",
                                title: "Complete control, simplified.",
                                desc: "Manage thousands of physical and digital assets, process loans, generate analytics reports, and communicate with users seamlessly.",
                                img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
                                reverse: true
                            }
                        ].map((mod, i) => (
                            <div key={i} className={`module-card stack-mobile`} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4rem',
                                flexDirection: mod.reverse ? 'row-reverse' : 'row'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ color: '#8b5cf6', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem', fontSize: '0.9rem' }}>{mod.role}</h4>
                                    <h3 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>{mod.title}</h3>
                                    <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '2rem' }}>{mod.desc}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontWeight: '600', cursor: 'pointer' }}>
                                        Learn more <ChevronRight size={18} />
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: isLight ? '0 20px 40px rgba(0,0,0,0.1)' : '0 20px 40px rgba(0,0,0,0.4)', transform: mod.reverse ? 'rotate(2deg)' : 'rotate(-2deg)', transition: 'transform 0.4s ease' }}
                                         onMouseEnter={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)'}
                                         onMouseLeave={e => e.currentTarget.style.transform = mod.reverse ? 'rotate(2deg)' : 'rotate(-2deg)'}
                                    >
                                        <img src={mod.img} alt={mod.role} style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '4/3', objectFit: 'cover' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div ref={statsRef} style={{ padding: '6rem 2rem', borderTop: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`, borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}` }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: 'center' }}>
                    {[
                        { num: "50K+", label: "Digital Assets" },
                        { num: "10K+", label: "Active Students" },
                        { num: "99.9%", label: "Uptime SLA" },
                        { num: "24/7", label: "Smart Support" }
                    ].map((stat, i) => (
                        <div key={i} className="stat-item">
                            <div className="text-gradient" style={{ fontSize: '4rem', fontWeight: '800', lineHeight: 1, marginBottom: '0.5rem' }}>{stat.num}</div>
                            <div style={{ color: isLight ? '#64748b' : '#94a3b8', fontWeight: '600', fontSize: '1.1rem' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer style={{ padding: '4rem 2rem 2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <BookOpen size={24} color="#8b5cf6" />
                        <span style={{ fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.03em' }}>LibPortal</span>
                    </div>
                    <p style={{ color: isLight ? '#64748b' : '#94a3b8', marginBottom: '3rem', maxWidth: '400px' }}>
                        The most beautiful and powerful library management system ever built.
                    </p>
                    <div style={{ color: isLight ? '#94a3b8' : '#475569', fontSize: '0.9rem' }}>
                        &copy; 2026 Infosys. All rights reserved.
                    </div>
                </div>
            </footer>

            <ChatWidget />
        </div>
    );
};

export default Home;

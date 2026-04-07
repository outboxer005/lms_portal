import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { authAPI, libraryAPI, membershipAPI, bookRequestAPI, paymentAPI } from '../services/api';
import PaymentModal from '../components/PaymentModal';
import {
    BookOpen, Clock, AlertCircle, Search, Lock, Eye, EyeOff, X,
    RotateCcw, Filter, Calendar, User, Star, CreditCard, ClipboardList, CheckCircle, DollarSign, History, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

// ============================================================
// STUDENT DASHBOARD
// ============================================================
const StudentDashboard = () => {
    const { user, token, updateUser } = useAuth();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        if (user?.mustChangePassword === true) setShowPasswordModal(true);
    }, [user]);

    return (
        <DashboardLayout role="STUDENT">
            <div style={{ maxWidth: '100%', width: '100%', margin: '0 auto', padding: '0 0.5rem' }}>
                <AnimatePresence>
                    {showPasswordModal && (
                        <PasswordResetModal
                            onClose={() => setShowPasswordModal(false)}
                            onSuccess={() => { updateUser({ mustChangePassword: false }); setShowPasswordModal(false); }}
                        />
                    )}
                </AnimatePresence>
                {activeTab === 'overview' && <StudentOverview user={user} />}
                {(activeTab === 'search' || activeTab === 'library' || activeTab === 'request-book') && <RequestBookTab />}
                {activeTab === 'mybooks' && <MyBooks />}
                {activeTab === 'membership' && <StudentMembershipTab userId={user?.id} />}
                {activeTab === 'payments' && <StudentPaymentsTab userId={user?.id} />}
                {activeTab === 'profile' && <SharedProfileTab user={user} role="STUDENT" onPasswordChangeClick={() => setShowPasswordModal(true)} />}
            </div>
        </DashboardLayout>
    );
};

// ============================================================
// PASSWORD RESET MODAL
// ============================================================
const PasswordResetModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [show, setShow] = useState({ current: false, new: false, confirm: false });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.currentPassword) e.currentPassword = 'Required';
        if (!form.newPassword || form.newPassword.length < 6) e.newPassword = 'Min 6 characters';
        if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await authAPI.changePassword({ oldPassword: form.currentPassword, newPassword: form.newPassword });
            toast.success('Password changed!');
            onSuccess?.();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally { setLoading(false); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '440px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Lock size={22} color="#60a5fa" />
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Change Your Password</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    You must change your default password before continuing.
                </p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                        { key: 'currentPassword', label: 'Current Password', showKey: 'current' },
                        { key: 'newPassword', label: 'New Password', showKey: 'new' },
                        { key: 'confirmPassword', label: 'Confirm New Password', showKey: 'confirm' },
                    ].map(f => (
                        <div key={f.key}>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '500' }}>{f.label}</label>
                            <div style={{ position: 'relative' }}>
                                <input type={show[f.showKey] ? 'text' : 'password'} value={form[f.key]}
                                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                    style={{ width: '100%', padding: '0.75rem 2.8rem 0.75rem 1rem', background: 'var(--bg-input)', border: `1px solid ${errors[f.key] ? '#ef4444' : 'var(--border-color)'}`, borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                                <button type="button" onClick={() => setShow(p => ({ ...p, [f.showKey]: !p[f.showKey] }))}
                                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    {show[f.showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors[f.key] && <p style={{ margin: '0.3rem 0 0', color: '#ef4444', fontSize: '0.78rem' }}>{errors[f.key]}</p>}
                        </div>
                    ))}
                    <button type="submit" disabled={loading}
                        style={{ padding: '0.85rem', background: 'var(--primary-500)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '700', cursor: 'pointer', opacity: loading ? 0.7 : 1, marginTop: '0.5rem' }}>
                        {loading ? 'Saving...' : 'Change Password'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
};

// ============================================================
// STUDENT OVERVIEW
// ============================================================
const StudentOverview = ({ user }) => {
    const [issuances, setIssuances] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unpaidFines, setUnpaidFines] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const loadData = useCallback(() => {
        Promise.all([
            libraryAPI.getMyBooks().catch(() => ({ data: [] })),
            libraryAPI.getBooks().catch(() => ({ data: [] })),
            paymentAPI.getUnpaidFines().catch(() => ({ data: [] })),
            paymentAPI.getPaymentHistory().catch(() => ({ data: [] })),
        ]).then(([myRes, booksRes, finesRes, histRes]) => {
            setIssuances(myRes.data || []);
            setAllBooks(booksRes.data || []);
            setUnpaidFines(finesRes.data || []);
            setPaymentHistory(histRes.data || []);
        }).finally(() => setLoading(false));
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const active = issuances.filter(i => i.status === 'ISSUED');
    const now = new Date();
    const overdue = active.filter(i => new Date(i.dueDate) < now);
    const dueSoon = active.filter(i => {
        const d = new Date(i.dueDate); return d >= now && (d - now) / 86400000 <= 3;
    });
    const returned = issuances.filter(i => i.status === 'RETURNED');
    const totalUnpaid = unpaidFines.reduce((s, f) => s + (f.penaltyAmount || 0), 0);

    const openPayFine = (issuance) => {
        setSelectedPayment({
            paymentType: 'FINE_PAYMENT',
            amount: issuance.penaltyAmount,
            referenceId: issuance.id,
            description: `Late fine for "${issuance.book?.title}"`,
            userName: user ? `${user.firstName} ${user.lastName}` : '',
            userEmail: user?.email || '',
        });
        setShowPaymentModal(true);
    };

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            {/* Payment Modal */}
            {showPaymentModal && selectedPayment && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    paymentData={selectedPayment}
                    onSuccess={() => { loadData(); toast.success('Fine paid! You can now borrow books.'); }}
                />
            )}

            {/* Welcome Banner */}
            <GlassCard style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(96,165,250,0.12) 0%, rgba(168,85,247,0.12) 100%)', border: '1px solid rgba(96,165,250,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)' }}>
                            Welcome back, {user?.firstName || user?.username || 'Student'}
                        </h2>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            Your library portal — borrow, track and discover books.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <a href="/student/dashboard?tab=request-book" style={{ padding: '0.65rem 1.25rem', background: 'var(--primary-500)', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <BookOpen size={16} /> Browse & Request
                        </a>
                        <a href="/student/dashboard?tab=mybooks" style={{ padding: '0.65rem 1.25rem', background: 'var(--accent-subtle)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>My Books</a>
                    </div>
                </div>
            </GlassCard>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <StatCard label="Currently Borrowed" value={active.length} icon={BookOpen} color="#60a5fa" sub="active books" />
                <StatCard label="Due Soon" value={dueSoon.length} icon={Clock} color="#f59e0b" sub="within 3 days" />
                <StatCard label="Overdue" value={overdue.length} icon={AlertCircle} color="#ef4444" sub="need to return" />
                <StatCard label="Returned" value={returned.length} icon={RotateCcw} color="#10b981" sub="total returned" />
            </div>

            {/* Membership Widget */}
            <MembershipWidget userId={user?.id} />

            {/* Unpaid Fines Alert */}
            {unpaidFines.length > 0 && (
                <GlassCard style={{ marginBottom: '1.5rem', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.4)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <DollarSign size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 0.25rem', color: '#dc2626', fontSize: '1rem', fontWeight: '700' }}>
                                Unpaid Fines — Total: ₹{totalUnpaid.toFixed(2)}
                            </h4>
                            <p style={{ margin: '0 0 0.85rem', color: '#fca5a5', fontSize: '0.85rem' }}>
                                You have {unpaidFines.length} unpaid fine(s). Pay before borrowing new books.
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                {unpaidFines.map(issuance => (
                                    <div key={issuance.id} style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem', flex: '1 1 auto', minWidth: '240px' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#dc2626', fontSize: '0.88rem' }}>{issuance.book?.title}</div>
                                            <div style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                                                Returned: {issuance.returnDate} · Fine: ₹{issuance.penaltyAmount}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openPayFine(issuance)}
                                            style={{ padding: '0.5rem 1rem', background: '#dc2626', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                            Pay ₹{issuance.penaltyAmount}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Overdue Alert */}
            {overdue.length > 0 && (
                <GlassCard style={{ marginBottom: '1.5rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.35)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <AlertCircle size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <h4 style={{ margin: '0 0 0.4rem', color: '#ef4444', fontSize: '1rem', fontWeight: '700' }}>
                                {overdue.length} book(s) overdue
                            </h4>
                            <p style={{ margin: 0, color: '#fca5a5', fontSize: '0.88rem' }}>
                                A fine of ₹5 per day is being charged. Please return your books immediately to avoid additional charges.
                            </p>
                            <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {overdue.map(i => {
                                    const daysLate = Math.floor((now - new Date(i.dueDate)) / 86400000);
                                    return (
                                        <span key={i.id} style={{ padding: '0.3rem 0.75rem', background: 'rgba(239,68,68,0.15)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.82rem', fontWeight: '600' }}>
                                            {i.book?.title} — {daysLate}d late (₹{daysLate * 5})
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Due Soon Alert */}
            {!overdue.length && dueSoon.length > 0 && (
                <GlassCard style={{ marginBottom: '1.5rem', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.35)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Clock size={22} color="#f59e0b" />
                        <div>
                            <h4 style={{ margin: '0 0 0.25rem', color: '#fbbf24', fontSize: '0.95rem', fontWeight: '700' }}>
                                {dueSoon.length} book(s) due within 3 days
                            </h4>
                            <p style={{ margin: 0, color: '#fcd34d', fontSize: '0.85rem' }}>
                                Please return on time to avoid late fines.
                            </p>
                        </div>
                    </div>
                </GlassCard>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
                {/* Currently Borrowed */}
                <GlassCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>Currently Borrowed</h3>
                        <a href="/student/dashboard?tab=mybooks" style={{ color: 'var(--primary-500)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>View All →</a>
                    </div>
                    {loading ? <Spinner /> : active.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {active.slice(0, 5).map(i => {
                                const isOv = new Date(i.dueDate) < now;
                                const daysLeft = Math.ceil((new Date(i.dueDate) - now) / 86400000);
                                return (
                                    <div key={i.id} style={{ padding: '0.9rem 1rem', background: isOv ? 'rgba(239,68,68,0.07)' : 'var(--accent-subtle)', borderRadius: '12px', border: `1px solid ${isOv ? 'rgba(239,68,68,0.25)' : 'var(--border-color)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', overflow: 'hidden' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', flexShrink: 0 }}>
                                                <BookOpen size={18} />
                                            </div>
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.book?.title}</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.775rem' }}>{i.book?.author}</div>
                                            </div>
                                        </div>
                                        <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                            <span style={{ display: 'block', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.73rem', fontWeight: '700', background: isOv ? 'rgba(239,68,68,0.15)' : daysLeft <= 3 ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)', color: isOv ? '#ef4444' : daysLeft <= 3 ? '#f59e0b' : '#60a5fa' }}>
                                                {isOv ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <EmptyState icon={BookOpen} message="No books borrowed yet" sub="Visit staff to borrow a book." />}
                </GlassCard>

                {/* Library Catalog Preview */}
                <GlassCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>Library Catalog</h3>
                        <a href="/student/dashboard?tab=request-book" style={{ color: 'var(--primary-500)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>Browse All →</a>
                    </div>
                    {loading ? <Spinner /> : allBooks.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {allBooks.slice(0, 6).map(b => (
                                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.9rem', background: 'var(--accent-subtle)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.775rem' }}>{b.author}{b.genre ? ` • ${b.genre}` : ''}</div>
                                    </div>
                                    <span style={{ padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.73rem', fontWeight: '700', flexShrink: 0, background: b.availableCopies > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: b.availableCopies > 0 ? '#10b981' : '#ef4444' }}>
                                        {b.availableCopies > 0 ? `${b.availableCopies} avail.` : 'Unavailable'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : <EmptyState icon={Search} message="Library catalog is empty" />}
                </GlassCard>
            </div>

            {/* Payment History */}
            {paymentHistory.length > 0 && (
                <GlassCard style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={18} /> Recent Payment History
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px', minWidth: 500 }}>
                            <thead>
                                <tr style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textAlign: 'left' }}>
                                    {['Receipt ID', 'Type', 'Description', 'Amount', 'Status', 'Date'].map(h => (
                                        <th key={h} style={{ padding: '0.4rem 1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paymentHistory.slice(0, 10).map(p => (
                                    <tr key={p.id} style={{ background: 'var(--accent-subtle)' }}>
                                        <td style={{ padding: '0.65rem 1rem', borderRadius: '8px 0 0 8px', fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{p.receiptId}</td>
                                        <td style={{ padding: '0.65rem 1rem', fontSize: '0.82rem' }}>
                                            <span style={{ padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', background: p.paymentType === 'FINE_PAYMENT' ? 'rgba(239,68,68,0.12)' : 'rgba(96,165,250,0.12)', color: p.paymentType === 'FINE_PAYMENT' ? '#ef4444' : '#60a5fa' }}>
                                                {p.paymentType === 'FINE_PAYMENT' ? 'Fine' : 'Membership'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.65rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description || '—'}</td>
                                        <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#10b981', fontSize: '0.95rem' }}>₹{p.amount}</td>
                                        <td style={{ padding: '0.65rem 1rem' }}>
                                            <span style={{ padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', background: p.status === 'SUCCESS' ? 'rgba(16,185,129,0.15)' : p.status === 'PENDING' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', color: p.status === 'SUCCESS' ? '#10b981' : p.status === 'PENDING' ? '#f59e0b' : '#ef4444' }}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.65rem 1rem', borderRadius: '0 8px 8px 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                            {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

// ============================================================
// SEARCH BOOKS — full search by title, author, genre, ISBN, publisher, year, availability
// ============================================================
const SearchBooks = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [authorFilter, setAuthorFilter] = useState('');
    const [genreFilter, setGenreFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [availOnly, setAvailOnly] = useState(false);
    const [books, setBooks] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('title');

    useEffect(() => {
        libraryAPI.getGenres().then(r => setGenres(r.data || [])).catch(() => { });
        handleSearch(); // load all on mount
    }, []);

    const handleSearch = useCallback(async () => {
        setLoading(true);
        setSearched(true);
        try {
            const params = {};
            if (searchTerm.trim()) params.query = searchTerm.trim();
            if (genreFilter) params.genre = genreFilter;
            if (availOnly) params.status = 'AVAILABLE';
            const res = await libraryAPI.getBooks(params);
            let results = res.data || [];
            // Client-side filter by author / year
            if (authorFilter.trim()) results = results.filter(b => b.author?.toLowerCase().includes(authorFilter.toLowerCase()));
            if (yearFilter.trim()) results = results.filter(b => String(b.publicationYear) === yearFilter.trim());
            // Sort
            results = [...results].sort((a, b) => {
                if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
                if (sortBy === 'author') return (a.author || '').localeCompare(b.author || '');
                if (sortBy === 'year') return (b.publicationYear || 0) - (a.publicationYear || 0);
                return 0;
            });
            setBooks(results);
        } catch { toast.error('Search failed'); } finally { setLoading(false); }
    }, [searchTerm, genreFilter, authorFilter, yearFilter, availOnly, sortBy]);

    const clearFilters = () => { setSearchTerm(''); setAuthorFilter(''); setGenreFilter(''); setYearFilter(''); setAvailOnly(false); setSortBy('title'); };

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            <GlassCard>
                <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Search size={18} /> Search Library Catalog
                </h2>

                {/* Main search row */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <input type="text" placeholder="Search by title, author, ISBN, genre, publisher..."
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
                        <Search size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    </div>
                    <button onClick={() => setShowFilters(f => !f)}
                        style={{ padding: '0.85rem 1.25rem', background: showFilters ? 'var(--accent-subtle)' : 'transparent', border: `1px solid ${showFilters ? 'var(--primary-500)' : 'var(--border-color)'}`, borderRadius: '12px', color: showFilters ? 'var(--primary-500)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                        <Filter size={16} /> Filters {showFilters ? '▲' : '▼'}
                    </button>
                    <button onClick={handleSearch}
                        style={{ padding: '0.85rem 1.75rem', background: 'var(--primary-500)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                        Search
                    </button>
                </div>

                {/* Advanced Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden', marginBottom: '1rem' }}>
                            <div style={{ padding: '1.25rem', background: 'var(--accent-subtle)', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                                <FilterField label="Author" icon={User} value={authorFilter} onChange={setAuthorFilter} placeholder="e.g. J.K. Rowling" />
                                <div>
                                    <label style={labelStyle}>Genre</label>
                                    <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)} style={selectStyle}>
                                        <option value="">All Genres</option>
                                        {genres.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <FilterField label="Publication Year" icon={Calendar} value={yearFilter} onChange={setYearFilter} placeholder="e.g. 2023" />
                                <div>
                                    <label style={labelStyle}>Sort By</label>
                                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
                                        <option value="title">Title (A-Z)</option>
                                        <option value="author">Author (A-Z)</option>
                                        <option value="year">Newest First</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.88rem', fontWeight: '500' }}>
                                        <input type="checkbox" checked={availOnly} onChange={e => setAvailOnly(e.target.checked)}
                                            style={{ width: 16, height: 16, accentColor: 'var(--primary-500)' }} />
                                        Available only
                                    </label>
                                    <button onClick={clearFilters} style={{ padding: '0.55rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem' }}>
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Genre Quick Pills */}
                {genres.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                        <Pill label="All" active={!genreFilter} onClick={() => { setGenreFilter(''); }} />
                        {genres.slice(0, 8).map(g => <Pill key={g} label={g} active={genreFilter === g} onClick={() => setGenreFilter(genreFilter === g ? '' : g)} />)}
                    </div>
                )}

                {/* Results */}
                {loading ? <div style={{ padding: '3rem', textAlign: 'center' }}><Spinner /></div>
                    : searched && books.length === 0 ? <EmptyState icon={Search} message="No books found" sub="Try different search terms or clear filters." />
                        : books.length > 0 ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{books.length} book{books.length !== 1 ? 's' : ''} found</span>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', minWidth: '650px' }}>
                                        <thead>
                                            <tr style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'left' }}>
                                                <th style={thStyle}>Title</th>
                                                <th style={thStyle}>Author</th>
                                                <th style={thStyle}>Genre</th>
                                                <th style={thStyle}>Year</th>
                                                <th style={thStyle}>ISBN</th>
                                                <th style={thStyle}>Copies</th>
                                                <th style={thStyle}>Status</th>
                                                <th style={thStyle}>Rating</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {books.map(b => (
                                                <tr key={b.id} style={{ background: 'var(--accent-subtle)' }}>
                                                    <td style={tdStyle}><span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{b.title}</span></td>
                                                    <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{b.author}</span></td>
                                                    <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{b.genre || '—'}</span></td>
                                                    <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{b.publicationYear || '—'}</span></td>
                                                    <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'monospace' }}>{b.isbn || '—'}</span></td>
                                                    <td style={tdStyle}><span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{b.availableCopies}/{b.totalCopies}</span></td>
                                                    <td style={tdStyle}>
                                                        <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', background: b.availableCopies > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: b.availableCopies > 0 ? '#10b981' : '#ef4444', border: `1px solid ${b.availableCopies > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                                                            {b.availableCopies > 0 ? 'AVAILABLE' : 'UNAVAILABLE'}
                                                        </span>
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <BookRatingCell bookId={b.id} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : null}
            </GlassCard>
        </div>
    );
};

// ============================================================
// MY BOOKS — with rating feature for returned books
// ============================================================
const MyBooks = () => {
    const { user } = useAuth();
    const [issuances, setIssuances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [ratingModal, setRatingModal] = useState(null);
    const [myRatings, setMyRatings] = useState({});
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const load = async () => {
        try {
            const r = await libraryAPI.getMyBooks();
            const data = r.data || [];
            setIssuances(data);
            const ratingMap = {};
            await Promise.all(
                data.filter(i => i.status === 'RETURNED').map(async i => {
                    try {
                        const rr = await libraryAPI.getMyRatingForBook(i.book?.id);
                        if (rr.status === 200 && rr.data) ratingMap[i.book?.id] = rr.data;
                    } catch { /* 204 = not rated, skip */ }
                })
            );
            setMyRatings(ratingMap);
        } catch { setIssuances([]); } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openPayFine = (issuance) => {
        const amount = issuance.penaltyAmount || 0;
        if (amount <= 0) {
            toast.error('No payable fine found for this issuance');
            return;
        }
        setSelectedPayment({
            paymentType: 'FINE_PAYMENT',
            amount,
            referenceId: issuance.id,
            description: `Late fine for "${issuance.book?.title}"`,
            userName: user ? `${user.firstName} ${user.lastName}` : '',
            userEmail: user?.email || '',
        });
        setShowPaymentModal(true);
    };

    const now = new Date();
    const filtered = issuances.filter(i => filter === 'ALL' ? true : i.status === filter);
    const activeCount = issuances.filter(i => i.status === 'ISSUED').length;
    const overdueCount = issuances.filter(i => i.status === 'ISSUED' && new Date(i.dueDate) < now).length;
    const returnedCount = issuances.filter(i => i.status === 'RETURNED').length;
    const totalPenalty = issuances.reduce((acc, i) => acc + (i.penaltyAmount || 0), 0);

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            {showPaymentModal && selectedPayment && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    paymentData={selectedPayment}
                    onSuccess={() => {
                        load();
                        toast.success('Fine paid successfully!');
                    }}
                />
            )}

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard label="Active Borrows" value={activeCount} icon={BookOpen} color="#60a5fa" />
                <StatCard label="Overdue" value={overdueCount} icon={AlertCircle} color="#ef4444" />
                <StatCard label="Returned" value={returnedCount} icon={RotateCcw} color="#10b981" />
                <StatCard label="Total Fines" value={`₹${totalPenalty}`} icon={AlertCircle} color="#f59e0b" isText />
            </div>

            <GlassCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>My Borrowed Books</h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['ALL', 'ISSUED', 'RETURNED'].map(s => (
                            <button key={s} onClick={() => setFilter(s)}
                                style={{ padding: '0.45rem 1rem', borderRadius: '10px', border: filter === s ? '1px solid var(--primary-500)' : '1px solid var(--border-color)', background: filter === s ? 'var(--accent-subtle)' : 'transparent', color: filter === s ? 'var(--primary-500)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? <div style={{ padding: '3rem', textAlign: 'center' }}><Spinner /></div>
                    : filtered.length === 0 ? <EmptyState icon={BookOpen} message="No records found" sub="Your borrowing history will appear here." />
                        : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', minWidth: '680px' }}>
                                    <thead>
                                        <tr style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'left' }}>
                                            <th style={thStyle}>#</th>
                                            <th style={thStyle}>Book Title</th>
                                            <th style={thStyle}>Author</th>
                                            <th style={thStyle}>Issue Date</th>
                                            <th style={thStyle}>Due Date</th>
                                            <th style={thStyle}>Return Date</th>
                                            <th style={thStyle}>Status</th>
                                            <th style={thStyle}>Fine (₹)</th>
                                            <th style={thStyle}>Your Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((i, idx) => {
                                            const isOverdue = i.status === 'ISSUED' && new Date(i.dueDate) < now;
                                            const daysLate = isOverdue ? Math.floor((now - new Date(i.dueDate)) / 86400000) : 0;
                                            const penalty = i.penaltyAmount || (isOverdue ? daysLate * 5 : 0);
                                            const myRating = myRatings[i.book?.id];
                                            return (
                                                <tr key={i.id} style={{ background: isOverdue ? 'rgba(239,68,68,0.06)' : 'var(--accent-subtle)' }}>
                                                    <td style={{ ...tdStyle, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{idx + 1}</td>
                                                    <td style={tdStyle}><span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{i.book?.title}</span></td>
                                                    <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{i.book?.author}</span></td>
                                                    <td style={tdStyle}><DateBadge value={i.issueDate} /></td>
                                                    <td style={tdStyle}><DateBadge value={i.dueDate} danger={isOverdue} /></td>
                                                    <td style={tdStyle}><DateBadge value={i.returnDate} empty="—" /></td>
                                                    <td style={tdStyle}><StatusBadge status={i.status} overdue={isOverdue} /></td>
                                                    <td style={tdStyle}>
                                                        {penalty > 0 ? (
                                                            i.isPenaltyPaid ? (
                                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                    <span style={{ fontWeight: '700', color: '#10b981' }}>₹{penalty}</span>
                                                                    <span style={{ padding: '0.15rem 0.45rem', borderRadius: '6px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.72rem', fontWeight: '700' }}>
                                                                        PAID
                                                                    </span>
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => openPayFine(i)}
                                                                    style={{ padding: '0.32rem 0.75rem', background: '#dc2626', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                                                                    Pay ₹{penalty}
                                                                </button>
                                                            )
                                                        ) : (
                                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>—</span>
                                                        )}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        {i.status === 'RETURNED' ? (
                                                            myRating ? (
                                                                <button onClick={() => setRatingModal(i)} title="Update rating"
                                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', gap: '2px' }}>
                                                                    <StarRow value={myRating.rating} size={15} />
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => setRatingModal(i)}
                                                                    style={{ padding: '0.28rem 0.7rem', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: '8px', color: '#f59e0b', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                                    <Star size={13} /> Rate
                                                                </button>
                                                            )
                                                        ) : <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>—</span>}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
            </GlassCard>

            <AnimatePresence>
                {ratingModal && (
                    <RatingModal
                        issuance={ratingModal}
                        existingRating={myRatings[ratingModal.book?.id]}
                        onClose={() => setRatingModal(null)}
                        onSaved={(rating) => {
                            setMyRatings(p => ({ ...p, [ratingModal.book?.id]: rating }));
                            setRatingModal(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// ============================================================
// RATING COMPONENTS
// ============================================================

/** Read-only star row */
const StarRow = ({ value = 0, size = 16, color = '#f59e0b' }) => (
    <span style={{ display: 'inline-flex', gap: '1px' }}>
        {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={size}
                fill={s <= value ? color : 'none'}
                stroke={s <= value ? color : '#6b7280'}
                strokeWidth={1.5} />
        ))}
    </span>
);

/** Interactive star picker */
const StarPicker = ({ value, onChange }) => {
    const [hover, setHover] = useState(0);
    return (
        <span style={{ display: 'inline-flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={32}
                    fill={(hover || value) >= s ? '#f59e0b' : 'none'}
                    stroke={(hover || value) >= s ? '#f59e0b' : '#6b7280'}
                    strokeWidth={1.5}
                    style={{ cursor: 'pointer', transition: 'all 0.1s' }}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(s)} />
            ))}
        </span>
    );
};

/** Inline cell that lazily fetches rating summary for a book */
const BookRatingCell = ({ bookId }) => {
    const [summary, setSummary] = useState(null);
    useEffect(() => {
        libraryAPI.getBookRatingSummary(bookId)
            .then(r => setSummary(r.data))
            .catch(() => setSummary({ average: 0, count: 0 }));
    }, [bookId]);
    if (!summary) return <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>...</span>;
    if (summary.count === 0) return <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>No ratings</span>;
    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <StarRow value={Math.round(summary.average)} size={13} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{summary.average} ({summary.count})</span>
        </span>
    );
};

/** Full-screen rating modal */
const RatingModal = ({ issuance, existingRating, onClose, onSaved }) => {
    const [stars, setStars] = useState(existingRating?.rating || 0);
    const [review, setReview] = useState(existingRating?.review || '');
    const [loading, setLoading] = useState(false);

    const label = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

    const handleSubmit = async () => {
        if (!stars) { toast.error('Please select a star rating'); return; }
        setLoading(true);
        try {
            const res = await libraryAPI.submitRating({
                issuanceId: issuance.id,
                rating: stars,
                review: review.trim() || null,
            });
            toast.success(existingRating ? 'Rating updated!' : 'Thanks for your rating!');
            onSaved(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data || 'Failed to submit rating');
        } finally { setLoading(false); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.85, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 24 }}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '460px', position: 'relative' }}>

                <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>

                {/* Book info */}
                <div style={{ marginBottom: '1.75rem' }}>
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rate this book</p>
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1.2 }}>{issuance.book?.title}</h2>
                    <p style={{ margin: '0.3rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>by {issuance.book?.author}</p>
                </div>

                {/* Star picker */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', marginBottom: '1.75rem', padding: '1.5rem', background: 'var(--accent-subtle)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <StarPicker value={stars} onChange={setStars} />
                    <span style={{ fontSize: '1rem', fontWeight: '700', color: '#f59e0b', minHeight: '1.4rem' }}>
                        {stars > 0 ? label[stars] : 'Tap a star to rate'}
                    </span>
                </div>

                {/* Review text */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600' }}>Write a review <span style={{ fontWeight: '400' }}>(optional)</span></label>
                    <textarea value={review} onChange={e => setReview(e.target.value)}
                        placeholder="Share your thoughts about this book…"
                        rows={3}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={onClose}
                        style={{ flex: 1, padding: '0.85rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600' }}>
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={loading || !stars}
                        style={{ flex: 2, padding: '0.85rem', background: stars ? 'linear-gradient(135deg,#f59e0b,#f97316)' : 'var(--accent-subtle)', border: 'none', borderRadius: '12px', color: stars ? '#fff' : 'var(--text-secondary)', cursor: stars ? 'pointer' : 'default', fontWeight: '700', fontSize: '0.95rem', transition: 'background 0.2s', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Submitting…' : existingRating ? 'Update Rating' : 'Submit Rating'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ============================================================
// SHARED UI COMPONENTS
// ============================================================

const AnimatedCounter = ({ value, duration = 1.5 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = parseInt(value, 10);
        if (isNaN(end)) { 
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCount(value); 
            return; 
        }

        const incrementTime = (duration / end) * 1000;
        let timer = setInterval(() => {
            start += Math.ceil(end / 20); // increment by chunks for large numbers
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, incrementTime);
        return () => clearInterval(timer);
    }, [value, duration]);
    return <span>{count}</span>;
};

const GlassCard = ({ children, style = {} }) => (
    <div style={{ background: 'var(--bg-card)', backdropFilter: 'blur(16px)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.5rem', ...style }}>
        {children}
    </div>
);

// eslint-disable-next-line no-unused-vars
const StatCard = ({ label, value, icon: Icon, color, sub, isText }) => (
    <GlassCard>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                <Icon size={18} />
            </div>
        </div>
        <div style={{ fontSize: isText ? '1.6rem' : '2.2rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>
            {isText ? value : (typeof value === 'number' || !isNaN(Number(value)) ? <AnimatedCounter value={value} /> : value)}
        </div>
        {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>{sub}</div>}
    </GlassCard>
);

// eslint-disable-next-line no-unused-vars
const EmptyState = ({ icon: Icon, message, sub }) => (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'var(--accent-subtle)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--text-secondary)' }}>
            <Icon size={26} />
        </div>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.95rem' }}>{message}</p>
        {sub && <p style={{ margin: '0.4rem 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{sub}</p>}
    </div>
);

const Spinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border-color)', borderTopColor: 'var(--primary-500)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes slideUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }`}</style>
    </div>
);

const Pill = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{ padding: '0.35rem 0.85rem', borderRadius: '999px', background: active ? 'var(--accent-subtle)' : 'transparent', border: active ? '1px solid var(--primary-500)' : '1px solid var(--border-color)', color: active ? 'var(--primary-500)' : 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: active ? '700' : '500', cursor: 'pointer', transition: 'all 0.15s' }}>
        {label}
    </button>
);

const FilterField = ({ label, icon: Icon, value, onChange, placeholder }) => (
    <div>
        <label style={labelStyle}>{label}</label>
        <div style={{ position: 'relative' }}>
            {Icon && <Icon size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />}
            <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                style={{ width: '100%', padding: `0.65rem 0.9rem 0.65rem ${Icon ? '2.2rem' : '0.9rem'}`, background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
        </div>
    </div>
);

const StatusBadge = ({ status, overdue }) => {
    const label = overdue && status === 'ISSUED' ? 'OVERDUE' : status;
    const color = label === 'RETURNED' ? '#10b981' : label === 'OVERDUE' ? '#ef4444' : '#60a5fa';
    return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', background: `${color}20`, color, border: `1px solid ${color}40` }}>{label}</span>;
};

const DateBadge = ({ value, danger, empty = '' }) => (
    <span style={{ color: danger ? '#ef4444' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: danger ? '700' : '400' }}>
        {value || empty}
    </span>
);

const labelStyle = { display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '500' };
const selectStyle = { width: '100%', padding: '0.65rem 0.9rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' };
const thStyle = { padding: '0.5rem 1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.75rem' };
const tdStyle = { padding: '0.9rem 1rem' };



// ============================================================
// SHARED PROFILE TAB (for all dashboards)
// ============================================================
export const SharedProfileTab = ({ user, role, onPasswordChangeClick }) => {
    if (!user) return null;

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out', maxWidth: '800px', margin: '0 auto' }}>
            <GlassCard style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(135deg, rgba(96,165,250,0.15) 0%, rgba(168,85,247,0.15) 100%)', zIndex: 0 }}></div>

                <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '2.5rem', border: '4px solid var(--bg-card)', zIndex: 1, boxShadow: 'var(--shadow-md)', marginBottom: '1rem', marginTop: '40px' }}>
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>

                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', zIndex: 1 }}>
                    {user?.personalDetails?.firstName || user?.firstName || user?.username} {user?.personalDetails?.lastName || user?.lastName || ''}
                </h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', background: 'var(--accent-subtle)', border: '1px solid var(--border-color)', borderRadius: '999px', color: 'var(--primary-500)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '2rem', zIndex: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <User size={14} /> {role}
                </div>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 1, textAlign: 'left' }}>
                    <div style={{ padding: '1.25rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'rgba(96,165,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}><Lock size={20} /></div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Username / ID</div>
                            <div style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: '600' }}>{user.username}</div>
                        </div>
                    </div>

                    <div style={{ padding: '1.25rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>@</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Email Address</div>
                            <div style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: '600' }}>{user.personalDetails?.email || user.email || '—'}</div>
                        </div>
                    </div>
                </div>

                <div style={{ width: '100%', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', zIndex: 1, display: 'flex', justifyContent: 'center' }}>
                    <button onClick={onPasswordChangeClick} style={{ padding: '0.85rem 1.75rem', background: 'var(--primary-500)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <Lock size={18} /> Change Password
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};

// ============================================================
// MEMBERSHIP WIDGET (shown in overview)
// ============================================================
const MembershipWidget = ({ userId }) => {
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(!userId);
    useEffect(() => {
        if (!userId) return;
        membershipAPI.getActiveMembership(userId)
            .then(r => setMembership(r.data))
            .catch(() => setMembership(null))
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) return null;
    const tierColors = { BASIC: '#60a5fa', STANDARD: '#a855f7', PREMIUM: '#f59e0b', UNLIMITED: '#10b981' };

    return (
        <GlassCard style={{ marginBottom: '1.5rem', background: membership ? 'linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(168,85,247,0.08) 100%)' : undefined, border: membership ? `1px solid ${tierColors[membership.plan?.tier] || 'var(--border-color)'}50` : '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: membership ? `${tierColors[membership.plan?.tier] || '#60a5fa'}20` : 'var(--accent-subtle)', border: `1px solid ${membership ? tierColors[membership.plan?.tier] || '#60a5fa' : 'var(--border-color)'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {membership ? (
                            <CreditCard size={22} style={{ color: tierColors[membership.plan?.tier] || '#60a5fa' }} />
                        ) : (
                            <CreditCard size={22} style={{ color: 'var(--text-secondary)' }} />
                        )}
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1rem' }}>
                            {membership ? `${membership.plan?.name} Membership` : 'No Membership Plan'}
                        </div>
                        {membership ? (
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', marginTop: '0.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <BookOpen size={14} /> {membership.plan?.bookAllowance} books allowed
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Clock size={14} /> {membership.plan?.loanDurationDays} day loan
                                </span>
                                <span style={{ padding: '0.1rem 0.5rem', borderRadius: '4px', background: `${tierColors[membership.plan?.tier] || '#60a5fa'}20`, color: tierColors[membership.plan?.tier] || '#60a5fa', fontWeight: '700', fontSize: '0.75rem' }}>
                                    {membership.plan?.tier}
                                </span>
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Contact staff to get a library membership plan</div>
                        )}
                    </div>
                </div>
                {membership && <span style={{ padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', background: membership.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: membership.status === 'ACTIVE' ? '#10b981' : '#ef4444' }}>{membership.status}</span>}
            </div>
        </GlassCard>
    );
};

// ============================================================
// REQUEST BOOK TAB (Combines Library/Search with Request Feature)
// ============================================================
const RequestBookTab = () => {
    const [books, setBooks] = useState([]);
    const [genres, setGenres] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [genreFilter, setGenreFilter] = useState('');
    const [search, setSearch] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);
    const [requestNote, setRequestNote] = useState('');
    const [mode, setMode] = useState('browse'); // browse, requests

    const loadData = useCallback(() => {
        setLoading(true);
        Promise.all([
            libraryAPI.getBooks().catch(() => ({ data: [] })),
            libraryAPI.getGenres().catch(() => ({ data: [] })),
            bookRequestAPI.getMyRequests().catch(() => ({ data: [] }))
        ]).then(([br, gr, reqs]) => {
            setBooks(br.data || []);
            setGenres(gr.data || []);
            setMyRequests((reqs.data || []).sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate)));
        }).finally(() => setLoading(false));
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filtered = books.filter(b => {
        const q = search.toLowerCase();
        const matchSearch = !search || b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q);
        const matchGenre = !genreFilter || b.genre === genreFilter;
        return matchSearch && matchGenre;
    });

    const fallbackCover = (title) => {
        const letter = title ? title.charAt(0).toUpperCase() : 'B';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280">
            <rect width="200" height="280" fill="#1e293b"/>
            <rect x="10" y="0" width="180" height="280" fill="#334155"/>
            <rect x="25" y="0" width="165" height="280" fill="#0f172a"/>
            <text x="100" y="140" font-family="sans-serif" font-size="72" font-weight="bold" fill="#60a5fa" text-anchor="middle" dominant-baseline="middle">${letter}</text>
            <text x="100" y="200" font-family="sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">${(title || 'Book').slice(0, 20)}</text>
        </svg>`;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    };

    const handleRequestSubmit = async () => {
        if (!selectedBook) return;
        setSubmitting(true);
        try {
            await bookRequestAPI.submitRequest({ bookId: selectedBook.id, notes: requestNote });
            toast.success('Book request submitted successfully!');
            setSelectedBook(null);
            setRequestNote('');
            loadData(); // Refresh requests
            setMode('requests');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <button onClick={() => setMode('browse')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', color: mode === 'browse' ? 'var(--primary-500)' : 'var(--text-secondary)', fontWeight: '600', borderBottom: mode === 'browse' ? '2px solid var(--primary-500)' : '2px solid transparent' }}>Library Catalog</button>
                <button onClick={() => setMode('requests')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', color: mode === 'requests' ? 'var(--primary-500)' : 'var(--text-secondary)', fontWeight: '600', borderBottom: mode === 'requests' ? '2px solid var(--primary-500)' : '2px solid transparent' }}>My Requests ({myRequests.length})</button>
            </div>

            {mode === 'browse' && (
                <>
                    <GlassCard style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <BookOpen size={18} /> Browse & Request Books
                        </h2>
                        {/* Filters */}
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                                <input type="text" placeholder="Search by title or author..." value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.4rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            </div>
                            <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)}
                                style={{ padding: '0.7rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}>
                                <option value=''>All Genres</option>
                                {genres.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        {/* Genre pills */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                            <Pill label="All" active={!genreFilter} onClick={() => setGenreFilter('')} />
                            {genres.slice(0, 8).map(g => <Pill key={g} label={g} active={genreFilter === g} onClick={() => setGenreFilter(genreFilter === g ? '' : g)} />)}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{filtered.length} book{filtered.length !== 1 ? 's' : ''} found</div>
                    </GlassCard>

                    {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState icon={BookOpen} message="No books found" sub="Try different search terms." /> : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.25rem' }}>
                            {filtered.map(b => (
                                <div key={b.id} onClick={() => setSelectedBook(b)}
                                    style={{ cursor: 'pointer', borderRadius: '14px', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-color)', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)'; e.currentTarget.style.borderColor = 'var(--primary-500)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
                                    <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                                        <img src={b.coverImageUrl || fallbackCover(b.title)} alt={b.title}
                                            onError={e => { e.target.src = fallbackCover(b.title); }}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-end' }}>
                                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '700', background: b.availableCopies > 0 ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                                                {b.availableCopies > 0 ? `${b.availableCopies} avail.` : 'Unavail.'}
                                            </span>
                                            {b.premiumBook && (
                                                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '700', background: 'rgba(245,158,11,0.9)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                                                    Premium
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ padding: '0.75rem' }}>
                                        <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: 1.3, marginBottom: '0.3rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{b.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.author}</div>
                                        {b.genre && <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}>{b.genre}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Book Detail Modal */}
                    <AnimatePresence>
                        {selectedBook && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                                onClick={() => setSelectedBook(null)}>
                                <motion.div initial={{ scale: 0.87 }} animate={{ scale: 1 }} exit={{ scale: 0.87 }}
                                    onClick={e => e.stopPropagation()}
                                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '700px', maxHeight: '88vh', overflowY: 'auto', position: 'relative' }}>
                                    <button onClick={() => setSelectedBook(null)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
                                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                        <div style={{ flexShrink: 0 }}>
                                            <img src={selectedBook.coverImageUrl || fallbackCover(selectedBook.title)} alt={selectedBook.title}
                                                onError={e => { e.target.src = fallbackCover(selectedBook.title); }}
                                                style={{ width: 140, height: 200, objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border-color)' }} />
                                            {selectedBook.frontPageImageUrl && (
                                                <div style={{ marginTop: '0.75rem' }}>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: '600' }}>FRONT PAGE</div>
                                                    <img src={selectedBook.frontPageImageUrl} alt="front page"
                                                        onError={e => e.target.style.display = 'none'}
                                                        style={{ width: 140, height: 100, objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 200 }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {selectedBook.genre && <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(96,165,250,0.15)', color: '#60a5fa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{selectedBook.genre}</span>}
                                                {selectedBook.premiumBook && <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Premium Book</span>}
                                            </div>
                                            <h2 style={{ margin: '0.75rem 0 0.4rem', fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1.2 }}>{selectedBook.title}</h2>
                                            <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>by <strong>{selectedBook.author}</strong></p>
                                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                {selectedBook.publisher && <span>🏢 {selectedBook.publisher}</span>}
                                                {selectedBook.publicationYear && <span>📅 {selectedBook.publicationYear}</span>}
                                                {selectedBook.isbn && <span>🔖 {selectedBook.isbn}</span>}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                                                <div style={{ padding: '0.6rem 1rem', background: 'var(--accent-subtle)', borderRadius: '10px', textAlign: 'center' }}>
                                                    <div style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--text-main)' }}>{selectedBook.availableCopies}</div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Available</div>
                                                </div>
                                                <div style={{ padding: '0.6rem 1rem', background: 'var(--accent-subtle)', borderRadius: '10px', textAlign: 'center' }}>
                                                    <div style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--text-main)' }}>{selectedBook.totalCopies}</div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Total</div>
                                                </div>
                                                <span style={{ padding: '0.6rem 1rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', alignSelf: 'center', background: selectedBook.availableCopies > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: selectedBook.availableCopies > 0 ? '#10b981' : '#ef4444' }}>
                                                    {selectedBook.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                                                </span>
                                            </div>
                                            {selectedBook.description && <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65, borderTop: '1px solid var(--border-color)', paddingTop: '1rem', paddingBottom: '1rem' }}>{selectedBook.description}</p>}

                                            <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'var(--accent-subtle)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                                                <h4 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: 'var(--text-main)' }}>Request to Borrow</h4>
                                                <textarea value={requestNote} onChange={e => setRequestNote(e.target.value)} rows={2}
                                                    placeholder="Optional note for the staff (why you need it, duration, etc.)..."
                                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '0.75rem' }} />
                                                <button onClick={handleRequestSubmit} disabled={submitting || selectedBook.availableCopies <= 0}
                                                    style={{ width: '100%', padding: '0.85rem', background: selectedBook.availableCopies > 0 ? 'var(--primary-500)' : 'var(--accent-subtle)', border: 'none', borderRadius: '10px', color: selectedBook.availableCopies > 0 ? '#fff' : 'var(--text-secondary)', fontWeight: '700', cursor: selectedBook.availableCopies > 0 ? 'pointer' : 'not-allowed', opacity: submitting ? 0.7 : 1 }}>
                                                    {submitting ? 'Submitting...' : selectedBook.availableCopies > 0 ? 'Submit Request' : 'Unavaible to Request'}
                                                </button>
                                                {selectedBook.premiumBook && (
                                                    <p style={{ margin: '0.75rem 0 0', color: '#f59e0b', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                                                        <AlertCircle size={14} /> Requires STANDARD, PREMIUM, or UNLIMITED plan
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}

            {mode === 'requests' && (
                <GlassCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <ClipboardList size={18} /> My Requests
                        </h2>
                        <button onClick={loadData} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><RefreshCw size={16} /></button>
                    </div>
                    {loading ? <Spinner /> : myRequests.length === 0 ? <EmptyState icon={ClipboardList} message="No pending requests" sub="Browse the catalog to request books." /> : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', minWidth: 600 }}>
                                <thead>
                                    <tr style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textAlign: 'left' }}>
                                        <th style={thStyle}>Date</th>
                                        <th style={thStyle}>Book</th>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>My Note</th>
                                        <th style={thStyle}>Staff Reply</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myRequests.map(r => (
                                        <tr key={r.id} style={{ background: 'var(--accent-subtle)' }}>
                                            <td style={tdStyle}><DateBadge value={r.requestDate ? new Date(r.requestDate).toLocaleDateString() : ''} /></td>
                                            <td style={tdStyle}><span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{r.book?.title}</span></td>
                                            <td style={tdStyle}><StatusBadge status={r.status} /></td>
                                            <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{r.studentNotes || '—'}</span></td>
                                            <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{r.staffNote || '—'}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </GlassCard>
            )}
        </div>
    );
};

// ============================================================
// MEMBERSHIP PAGE (STUDENT)
// ============================================================
const StudentMembershipTab = ({ userId }) => {
    const { user } = useAuth();
    const [membership, setMembership] = useState(null);
    const [unpaidMemberships, setUnpaidMemberships] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const tierColors = { BASIC: '#60a5fa', STANDARD: '#a855f7', PREMIUM: '#f59e0b', UNLIMITED: '#10b981' };
    const tierIcons = { BASIC: '🎓', STANDARD: '⭐', PREMIUM: '🏆', UNLIMITED: '♾️' };

    const loadMembership = useCallback(() => {
        if (!userId) {
            setMembership(null);
            setPlans([]);
            setUnpaidMemberships([]);
            return;
        }
        setLoading(true);
        Promise.all([
            membershipAPI.getMyLatestMembership().catch(() => ({ data: null })),
            membershipAPI.getActivePlans().catch(() => ({ data: [] })),
            paymentAPI.getUnpaidMemberships().catch(() => ({ data: [] })),
        ]).then(([mRes, pRes, unpaidRes]) => {
            setMembership(mRes.data || null);
            setPlans(pRes.data || []);
            const unpaid = Array.isArray(unpaidRes?.data) ? unpaidRes.data : [];
            setUnpaidMemberships(unpaid);
        }).finally(() => setLoading(false));
    }, [userId]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { loadMembership(); }, [loadMembership]);

    const handlePayMembership = (targetMembership = membership) => {
        if (!targetMembership?.id) {
            toast.error('No pending membership found to pay');
            return;
        }
        const amount = targetMembership.plan?.monthlyFee || 0;
        if (amount <= 0) {
            toast.error('Selected plan does not require payment');
            return;
        }
        setPaymentData({
            paymentType: 'MEMBERSHIP_PAYMENT',
            amount,
            referenceId: targetMembership.id,
            description: `Membership fee for ${targetMembership.plan?.name} plan`,
            userName: user ? `${user.firstName} ${user.lastName}` : '',
            userEmail: user?.email || '',
        });
        setShowPaymentModal(true);
    };

    if (loading) return <Spinner />;

    const pendingMemberships = unpaidMemberships.length
        ? unpaidMemberships
        : (membership && membership.status === 'SUSPENDED' && !membership.isPaymentCompleted ? [membership] : []);
    const isPendingPayment = pendingMemberships.length > 0;
    const primaryPendingMembership = pendingMemberships[0] || null;

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            {showPaymentModal && paymentData && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    paymentData={paymentData}
                    onSuccess={() => { loadMembership(); toast.success('Membership activated!'); }}
                />
            )}

            {/* Pending Payment Banner */}
            {isPendingPayment && (
                <GlassCard style={{ marginBottom: '1.5rem', background: 'rgba(245,158,11,0.08)', border: '2px solid rgba(245,158,11,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 42, height: 42, borderRadius: '10px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CreditCard size={22} color="#f59e0b" />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 0.2rem', color: '#f59e0b', fontSize: '1rem', fontWeight: '700' }}>
                                    Payment Required — {primaryPendingMembership?.plan?.name}
                                </h4>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    Complete payment to activate your <strong>{primaryPendingMembership?.plan?.tier}</strong> membership plan.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => handlePayMembership(primaryPendingMembership)}
                            style={{ padding: '0.75rem 1.75rem', background: '#f59e0b', border: 'none', borderRadius: '10px', color: '#000', fontWeight: '800', cursor: 'pointer', fontSize: '0.95rem' }}>
                            Pay ₹{primaryPendingMembership?.plan?.monthlyFee || 0} to Activate
                        </button>
                    </div>
                </GlassCard>
            )}

            {/* Pending Membership Dues */}
            {pendingMemberships.length > 1 && (
                <GlassCard style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        Pending Membership Dues
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {pendingMemberships.map(pm => (
                            <div key={pm.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'var(--accent-subtle)' }}>
                                <div>
                                    <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>{pm.plan?.name}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                                        Status: {pm.status} • Start: {pm.startDate || '—'}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handlePayMembership(pm)}
                                    style={{ padding: '0.45rem 0.85rem', background: '#f59e0b', border: 'none', borderRadius: '8px', color: '#111827', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                    Pay ₹{pm.plan?.monthlyFee || 0}
                                </button>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}

            {/* Current Membership Card */}
            <GlassCard style={{ marginBottom: '1.5rem', background: membership ? 'linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(168,85,247,0.08) 100%)' : undefined, border: membership ? `2px solid ${tierColors[membership.plan?.tier] || 'var(--primary-500)'}40` : '1px solid var(--border-color)' }}>
                <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={20} /> My Membership Plan
                </h2>
                {membership ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ padding: '1.5rem', background: `${tierColors[membership.plan?.tier] || '#60a5fa'}15`, borderRadius: '16px', border: `1px solid ${tierColors[membership.plan?.tier] || '#60a5fa'}30` }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', fontWeight: '600' }}>Current Plan</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: tierColors[membership.plan?.tier] || 'var(--primary-500)', marginBottom: '0.5rem' }}>{membership.plan?.name}</div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ padding: '0.25rem 0.7rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', background: `${tierColors[membership.plan?.tier] || '#60a5fa'}25`, color: tierColors[membership.plan?.tier] || '#60a5fa' }}>{membership.plan?.tier}</span>
                                <span style={{ padding: '0.25rem 0.7rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700',
                                    background: membership.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : membership.status === 'SUSPENDED' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                                    color: membership.status === 'ACTIVE' ? '#10b981' : membership.status === 'SUSPENDED' ? '#f59e0b' : '#ef4444' }}>
                                    {membership.status === 'SUSPENDED' && !membership.isPaymentCompleted ? 'PAYMENT PENDING' : membership.status}
                                </span>
                            </div>
                            {membership.plan?.monthlyFee > 0 && (
                                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Monthly Fee: <strong style={{ color: 'var(--text-main)' }}>₹{membership.plan.monthlyFee}</strong>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', justifyContent: 'center' }}>
                            {[
                                { icon: BookOpen, color: '#60a5fa', label: `${membership.plan?.bookAllowance} Books`, sub: 'Maximum borrowing allowance' },
                                { icon: Clock, color: '#f59e0b', label: `${membership.plan?.loanDurationDays} Days`, sub: 'Standard loan duration' },
                                { icon: RotateCcw, color: '#a855f7', label: `${membership.plan?.maxRenewals} Renewals`, sub: 'Allowed per book' },
                                { icon: Star, color: '#10b981', label: ['STANDARD', 'PREMIUM', 'UNLIMITED'].includes(membership.plan?.tier) ? 'Yes' : 'No', sub: 'Premium book access' },
                            // eslint-disable-next-line no-unused-vars
                            ].map(({ icon: Icon, color, label, sub }) => (
                                <div key={sub} style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={18} /></div>
                                    <div>
                                        <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' }}>{label}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '1.5rem', background: 'var(--accent-subtle)', borderRadius: '14px', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
                        <CreditCard size={40} style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', opacity: 0.4 }} />
                        <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.4rem' }}>No Membership Plan</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>You currently do not have an active membership. Contact library staff to get enrolled.</div>
                    </div>
                )}
            </GlassCard>

            {/* Available Plans */}
            <GlassCard>
                <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ClipboardList size={18} /> Available Membership Plans
                </h3>
                {plans.length === 0 ? (
                    <EmptyState icon={CreditCard} message="No plans available" sub="Check back later or contact library staff." />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                        {plans.map(p => {
                            const isActive = membership?.plan?.id === p.id && membership?.status === 'ACTIVE';
                            const isPending = membership?.plan?.id === p.id && membership?.status === 'SUSPENDED';
                            return (
                                <div key={p.id} style={{
                                    padding: '1.25rem', borderRadius: '16px',
                                    background: isActive ? `${tierColors[p.tier] || '#60a5fa'}12` : isPending ? 'rgba(245,158,11,0.08)' : 'var(--accent-subtle)',
                                    border: `2px solid ${isActive ? (tierColors[p.tier] || 'var(--primary-500)') : isPending ? 'rgba(245,158,11,0.5)' : 'var(--border-color)'}${isActive || isPending ? '' : '40'}`,
                                    position: 'relative', transition: 'all 0.2s'
                                }}>
                                    {isActive && (
                                        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px', background: 'rgba(16,185,129,0.18)', color: '#10b981', fontSize: '0.7rem', fontWeight: '800' }}>YOUR PLAN</div>
                                    )}
                                    {isPending && (
                                        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px', background: 'rgba(245,158,11,0.18)', color: '#f59e0b', fontSize: '0.7rem', fontWeight: '800' }}>PAYMENT DUE</div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                                        <span style={{ fontSize: '1.5rem' }}>{tierIcons[p.tier] || '📋'}</span>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)' }}>{p.name}</div>
                                            <span style={{ padding: '0.1rem 0.45rem', borderRadius: '5px', fontSize: '0.7rem', fontWeight: '700', background: `${tierColors[p.tier] || '#60a5fa'}20`, color: tierColors[p.tier] || '#60a5fa' }}>{p.tier}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                                        <span>📚 <strong style={{ color: 'var(--text-main)' }}>{p.bookAllowance}</strong> books at a time</span>
                                        <span>🕐 <strong style={{ color: 'var(--text-main)' }}>{p.loanDurationDays}</strong> day loan duration</span>
                                        <span>🔄 <strong style={{ color: 'var(--text-main)' }}>{p.maxRenewals}</strong> renewals per book</span>
                                        <span>⭐ Premium books: <strong style={{ color: ['STANDARD', 'PREMIUM', 'UNLIMITED'].includes(p.tier) ? '#10b981' : '#ef4444' }}>{['STANDARD', 'PREMIUM', 'UNLIMITED'].includes(p.tier) ? 'Yes' : 'No'}</strong></span>
                                        {p.monthlyFee > 0 && <span>💳 Fee: <strong style={{ color: 'var(--text-main)' }}>₹{p.monthlyFee}/month</strong></span>}
                                    </div>
                                    {p.description && <p style={{ margin: '0.75rem 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{p.description}</p>}
                                </div>
                            );
                        })}
                    </div>
                )}
                <p style={{ margin: '1.25rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    To change or get a membership plan, please contact the library staff.
                </p>
            </GlassCard>
        </div>
    );
};

// ============================================================
// STUDENT PAYMENTS PAGE
// ============================================================
const StudentPaymentsTab = ({ userId }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [assigningPlanId, setAssigningPlanId] = useState(null);
    const [unpaidMemberships, setUnpaidMemberships] = useState([]);
    const [unpaidFines, setUnpaidFines] = useState([]);
    const [history, setHistory] = useState([]);
    const [availablePlans, setAvailablePlans] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState(null);

    const loadData = useCallback(() => {
        if (!userId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        Promise.all([
            paymentAPI.getUnpaidMemberships().catch(() => ({ data: [] })),
            paymentAPI.getUnpaidFines().catch(() => ({ data: [] })),
            paymentAPI.getPaymentHistory().catch(() => ({ data: [] })),
            membershipAPI.getActivePlans().catch(() => ({ data: [] })),
        ]).then(([membershipRes, finesRes, historyRes, plansRes]) => {
            setUnpaidMemberships(Array.isArray(membershipRes?.data) ? membershipRes.data : []);
            setUnpaidFines(Array.isArray(finesRes?.data) ? finesRes.data : []);
            setHistory(Array.isArray(historyRes?.data) ? historyRes.data : []);
            setAvailablePlans(Array.isArray(plansRes?.data) ? plansRes.data : []);
        }).finally(() => setLoading(false));
    }, [userId]);

    useEffect(() => { loadData(); }, [loadData]);

    const startMembershipPayment = (membership) => {
        const amount = membership?.plan?.monthlyFee || 0;
        if (!membership?.id || amount <= 0) {
            toast.error('Invalid membership payment details');
            return;
        }
        setPaymentData({
            paymentType: 'MEMBERSHIP_PAYMENT',
            amount,
            referenceId: membership.id,
            description: `Membership fee for ${membership.plan?.name} plan`,
            userName: user ? `${user.firstName} ${user.lastName}` : '',
            userEmail: user?.email || '',
        });
        setShowPaymentModal(true);
    };

    const startFinePayment = (issuance) => {
        const amount = issuance?.penaltyAmount || 0;
        if (!issuance?.id || amount <= 0) {
            toast.error('Invalid fine payment details');
            return;
        }
        setPaymentData({
            paymentType: 'FINE_PAYMENT',
            amount,
            referenceId: issuance.id,
            description: `Late fine for "${issuance.book?.title}"`,
            userName: user ? `${user.firstName} ${user.lastName}` : '',
            userEmail: user?.email || '',
        });
        setShowPaymentModal(true);
    };

    const handleSelectPlanAndContinue = async (plan) => {
        if (!plan?.id) {
            toast.error('Invalid plan selection');
            return;
        }

        const existingUnpaid = unpaidMemberships.find(m => m.plan?.id === plan.id);
        if (existingUnpaid) {
            startMembershipPayment(existingUnpaid);
            return;
        }

        try {
            setAssigningPlanId(plan.id);
            const res = await membershipAPI.selfAssignMembership({
                planId: plan.id,
                notes: 'Self-selected from payment page',
            });
            const createdMembership = res?.data;

            if (!createdMembership?.id) {
                throw new Error('Membership assignment failed');
            }

            if ((createdMembership.plan?.monthlyFee || 0) > 0) {
                toast.success('Membership selected. Complete payment to activate it.');
                startMembershipPayment(createdMembership);
            } else {
                toast.success('Membership activated successfully. No payment required for this plan.');
            }

            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data || 'Failed to select membership plan');
        } finally {
            setAssigningPlanId(null);
        }
    };

    const membershipDueTotal = unpaidMemberships.reduce((sum, m) => sum + (m?.plan?.monthlyFee || 0), 0);
    const fineDueTotal = unpaidFines.reduce((sum, f) => sum + (f?.penaltyAmount || 0), 0);
    const totalDue = membershipDueTotal + fineDueTotal;

    if (loading) return <Spinner />;

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            {showPaymentModal && paymentData && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    paymentData={paymentData}
                    onSuccess={() => {
                        loadData();
                        toast.success('Payment recorded successfully');
                    }}
                />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard label="Total Due" value={`₹${totalDue.toFixed(2)}`} icon={DollarSign} color="#ef4444" isText />
                <StatCard label="Membership Due" value={`₹${membershipDueTotal.toFixed(2)}`} icon={CreditCard} color="#f59e0b" isText />
                <StatCard label="Fine Due" value={`₹${fineDueTotal.toFixed(2)}`} icon={AlertCircle} color="#dc2626" isText />
                <StatCard label="Paid Transactions" value={history.filter(h => h.status === 'SUCCESS').length} icon={CheckCircle} color="#10b981" />
            </div>

            <GlassCard style={{ marginBottom: '1.5rem', background: totalDue > 0 ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${totalDue > 0 ? 'rgba(245,158,11,0.35)' : 'rgba(16,185,129,0.35)'}` }}>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <CreditCard size={19} /> Payment Center
                </h2>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {totalDue > 0
                        ? `You have pending dues of ₹${totalDue.toFixed(2)}. Complete your payments to keep your account fully active.`
                        : 'No outstanding dues right now. Your account is clear.'}
                </p>
            </GlassCard>

            <GlassCard style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        Membership Selection and Payment
                    </h3>
                    <button onClick={loadData} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.4rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {unpaidMemberships.length === 0 ? (
                    <div style={{ padding: '1rem', borderRadius: '10px', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                        No unpaid memberships found. Select a plan below to auto-assign membership and continue to payment.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {unpaidMemberships.map(m => (
                            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'var(--accent-subtle)' }}>
                                <div>
                                    <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.92rem' }}>{m.plan?.name} ({m.plan?.tier})</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                                        Allowance: {m.plan?.bookAllowance} books • Duration: {m.plan?.loanDurationDays} days • Status: {m.status}
                                    </div>
                                </div>
                                <button
                                    onClick={() => startMembershipPayment(m)}
                                    style={{ padding: '0.5rem 0.9rem', border: 'none', borderRadius: '8px', background: '#f59e0b', color: '#111827', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                    Pay ₹{m.plan?.monthlyFee || 0}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {availablePlans.length > 0 && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.55rem' }}>
                            Available plans. Select a plan to auto-assign and continue with payment.
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.7rem' }}>
                            {availablePlans.map(p => (
                                <div key={p.id} style={{ padding: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'var(--accent-subtle)' }}>
                                    <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>{p.name}</div>
                                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                        {p.tier} • {p.bookAllowance} books • {p.loanDurationDays} days
                                    </div>
                                    <div style={{ marginTop: '0.45rem', fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: '700' }}>
                                        ₹{p.monthlyFee || 0}/month
                                    </div>
                                    <button
                                        disabled={assigningPlanId === p.id}
                                        onClick={() => handleSelectPlanAndContinue(p)}
                                        style={{ marginTop: '0.6rem', width: '100%', padding: '0.45rem 0.65rem', border: 'none', borderRadius: '8px', background: 'var(--primary-500)', color: '#fff', fontWeight: '700', fontSize: '0.8rem', cursor: assigningPlanId === p.id ? 'not-allowed' : 'pointer', opacity: assigningPlanId === p.id ? 0.7 : 1 }}>
                                        {assigningPlanId === p.id ? 'Assigning...' : 'Select Plan and Continue'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </GlassCard>

            <GlassCard style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    Fine Payment
                </h3>
                {unpaidFines.length === 0 ? (
                    <EmptyState icon={CheckCircle} message="No unpaid fines" sub="Great, you do not have any pending late fee." />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                        {unpaidFines.map(f => (
                            <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#dc2626', fontSize: '0.9rem' }}>{f.book?.title}</div>
                                    <div style={{ color: '#fca5a5', fontSize: '0.78rem' }}>Returned: {f.returnDate || '—'} • Issuance #{f.id}</div>
                                </div>
                                <button
                                    onClick={() => startFinePayment(f)}
                                    style={{ padding: '0.5rem 0.9rem', border: 'none', borderRadius: '8px', background: '#dc2626', color: '#fff', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                    Pay ₹{f.penaltyAmount || 0}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>

            <GlassCard>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <History size={17} /> Payment History
                </h3>
                {history.length === 0 ? (
                    <EmptyState icon={History} message="No payment history" sub="Your completed and pending payments will appear here." />
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 7px', minWidth: 640 }}>
                            <thead>
                                <tr style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textAlign: 'left' }}>
                                    {['Receipt', 'Type', 'Description', 'Amount', 'Status', 'Date'].map(h => (
                                        <th key={h} style={{ padding: '0.45rem 0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(p => (
                                    <tr key={p.id} style={{ background: 'var(--accent-subtle)' }}>
                                        <td style={{ padding: '0.65rem 0.85rem', borderRadius: '8px 0 0 8px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.78rem' }}>{p.receiptId || '-'}</td>
                                        <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-main)', fontSize: '0.82rem' }}>{p.paymentType === 'FINE_PAYMENT' ? 'Fine' : 'Membership'}</td>
                                        <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{p.description || '—'}</td>
                                        <td style={{ padding: '0.65rem 0.85rem', color: '#10b981', fontWeight: '700' }}>₹{p.amount}</td>
                                        <td style={{ padding: '0.65rem 0.85rem' }}>
                                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', background: p.status === 'SUCCESS' ? 'rgba(16,185,129,0.15)' : p.status === 'PENDING' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', color: p.status === 'SUCCESS' ? '#10b981' : p.status === 'PENDING' ? '#f59e0b' : '#ef4444' }}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.65rem 0.85rem', borderRadius: '0 8px 8px 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                            {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default StudentDashboard;

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { authAPI, libraryAPI, adminAPI, membershipAPI, bookRequestAPI, userAPI } from '../services/api';
import { SharedProfileTab } from './StudentDashboard';
import {
    BookOpen, Clock, AlertCircle, Search, RotateCcw, PlusCircle,
    Edit, Trash2, CheckCircle, Eye, EyeOff, Lock, X, Package,
    TrendingUp, Users, Filter, RefreshCw, ClipboardList, CreditCard, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const StaffDashboard = () => {
    const { user, updateUser } = useAuth();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        if (user?.mustChangePassword === true) setShowPasswordModal(true);
    }, [user]);

    return (
        <DashboardLayout role="STAFF">
            <div style={{ maxWidth: '100%', width: '100%', margin: '0 auto', padding: '0 0.5rem' }}>
                <AnimatePresence>
                    {showPasswordModal && (
                        <PasswordModal
                            onClose={() => setShowPasswordModal(false)}
                            onSuccess={() => { updateUser({ mustChangePassword: false }); setShowPasswordModal(false); }}
                        />
                    )}
                </AnimatePresence>
                {activeTab === 'overview' && <StaffOverview />}
                {activeTab === 'books' && <ManageBooks />}
                {activeTab === 'issue-return' && <IssueReturnTab />}
                {activeTab === 'members' && <MembershipManagement />}
                {activeTab === 'plans' && <ManagePlansTab />}
                {activeTab === 'book-requests' && <BookRequestsTab />}
                {activeTab === 'profile' && <SharedProfileTab user={user} role="STAFF" onPasswordChangeClick={() => setShowPasswordModal(true)} />}
            </div>
        </DashboardLayout>
    );
};

// ── Password Modal ──────────────────────────────────────────────────────────
const PasswordModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [show, setShow] = useState({ c: false, n: false, cf: false });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.currentPassword) e.currentPassword = 'Required';
        if (!form.newPassword || form.newPassword.length < 6) e.newPassword = 'Min 6 chars';
        if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
        setErrors(e); return !Object.keys(e).length;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault(); if (!validate()) return; setLoading(true);
        try {
            await authAPI.changePassword({ oldPassword: form.currentPassword, newPassword: form.newPassword });
            toast.success('Password changed!'); onSuccess?.();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setLoading(false); }
    };

    const fields = [
        { key: 'currentPassword', label: 'Current Password', sk: 'c' },
        { key: 'newPassword', label: 'New Password', sk: 'n' },
        { key: 'confirmPassword', label: 'Confirm Password', sk: 'cf' },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '440px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Lock size={22} color="#60a5fa" />
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>Change Default Password</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {fields.map(f => (
                        <div key={f.key}>
                            <label style={labelStyle}>{f.label}</label>
                            <div style={{ position: 'relative' }}>
                                <input type={show[f.sk] ? 'text' : 'password'} value={form[f.key]}
                                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                    style={{ width: '100%', padding: '0.75rem 2.8rem 0.75rem 1rem', background: 'var(--bg-input)', border: `1px solid ${errors[f.key] ? '#ef4444' : 'var(--border-color)'}`, borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                                <button type="button" onClick={() => setShow(p => ({ ...p, [f.sk]: !p[f.sk] }))}
                                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    {show[f.sk] ? <EyeOff size={16} /> : <Eye size={16} />}
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

// ── Staff Overview ─────────────────────────────────────────────────────────
export const StaffOverview = () => {
    const [stats, setStats] = useState({});
    const [recentIssuances, setRecentIssuances] = useState([]);
    const [overdueList, setOverdueList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = () => {
            Promise.all([
                libraryAPI.getStats().catch(() => ({ data: {} })),
                libraryAPI.getAllIssuances('ISSUED').catch(() => ({ data: [] })),
                libraryAPI.getOverdueIssuances().catch(() => ({ data: [] })),
            ]).then(([sRes, iRes, oRes]) => {
                setStats(sRes.data || {});
                setRecentIssuances((iRes.data || []).slice(0, 5));
                setOverdueList(oRes.data || []);
            }).finally(() => setLoading(false));
        };

        // Initial load
        fetchData();

        // Lightweight polling so charts and cards stay fresh after issue/return
        const intervalId = setInterval(fetchData, 10000); // every 10s
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <StatCard label="Total Books" value={stats.totalBooks ?? '—'} icon={BookOpen} color="#60a5fa" />
                <StatCard label="Available" value={stats.availableBooks ?? '—'} icon={CheckCircle} color="#10b981" />
                <StatCard label="Currently Issued" value={stats.booksIssued ?? '—'} icon={TrendingUp} color="#a855f7" />
                <StatCard label="Overdue" value={stats.overdueBooks ?? '—'} icon={AlertCircle} color="#ef4444" />
            </div>

            {/* Quick Actions */}
            <GlassCard style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                    <ActionBtn href="/staff/dashboard?tab=issue-return" icon={PlusCircle} label="Issue a Book" color="#60a5fa" />
                    <ActionBtn href="/staff/dashboard?tab=issue-return" icon={RotateCcw} label="Process Return" color="#10b981" />
                    <ActionBtn href="/staff/dashboard?tab=books" icon={Package} label="Add New Book" color="#a855f7" />
                    <ActionBtn href="/staff/dashboard?tab=books" icon={BookOpen} label="View Catalog" color="#f59e0b" />
                </div>
            </GlassCard>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
                {/* Recent Issuances */}
                <GlassCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>Active Issuances</h3>
                        <a href="/staff/dashboard?tab=issue-return" style={{ color: 'var(--primary-500)', fontSize: '0.83rem', textDecoration: 'none', fontWeight: '600' }}>View All →</a>
                    </div>
                    {loading ? <Spinner /> : recentIssuances.length > 0 ? recentIssuances.map(i => {
                        const overdue = new Date(i.dueDate) < new Date();
                        return (
                            <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', background: overdue ? 'rgba(239,68,68,0.07)' : 'var(--accent-subtle)', borderRadius: '10px', marginBottom: '0.5rem', border: `1px solid ${overdue ? 'rgba(239,68,68,0.25)' : 'var(--border-color)'}` }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.88rem' }}>{i.book?.title}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                                        {i.student?.username || i.student?.firstName} • Due: {i.dueDate}
                                    </div>
                                </div>
                                <StatusBadge status={i.status} overdue={overdue} />
                            </div>
                        );
                    }) : <EmptyState icon={BookOpen} message="No active issuances" />}
                </GlassCard>

                {/* Overdue */}
                <GlassCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <AlertCircle size={18} /> Overdue Books
                        </h3>
                        <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', borderRadius: '999px', padding: '0.15rem 0.6rem', fontSize: '0.78rem', fontWeight: '700' }}>{overdueList.length}</span>
                    </div>
                    {loading ? <Spinner /> : overdueList.length > 0 ? overdueList.slice(0, 6).map(i => {
                        const daysLate = Math.floor((new Date() - new Date(i.dueDate)) / 86400000);
                        return (
                            <div key={i.id} style={{ padding: '0.8rem 1rem', background: 'rgba(239,68,68,0.07)', borderRadius: '10px', marginBottom: '0.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.88rem' }}>{i.book?.title}</span>
                                    <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.82rem' }}>₹{daysLate * 5}</span>
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                                    {i.student?.username} • {daysLate}d overdue
                                </div>
                            </div>
                        );
                    }) : <EmptyState icon={CheckCircle} message="No overdue books" />}
                </GlassCard>
            </div>
        </div>
    );
};

// ── Manage Books ───────────────────────────────────────────────────────────
export const ManageBooks = () => {
    const [books, setBooks] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [genreFilter, setGenreFilter] = useState('');
    const [availFilter, setAvailFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editBook, setEditBook] = useState(null);
    const [form, setForm] = useState(emptyBook());
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    function emptyBook() { return { title: '', author: '', isbn: '', publisher: '', genre: '', publicationYear: '', totalCopies: 1, description: '', coverImageUrl: '', premiumBook: false }; }

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.query = search;
            if (genreFilter) params.genre = genreFilter;
            if (availFilter) params.status = availFilter;
            const [br, gr] = await Promise.all([libraryAPI.getBooks(params), libraryAPI.getGenres()]);
            setBooks(br.data || []); setGenres(gr.data || []);
        } catch { toast.error('Failed to load books'); } finally { setLoading(false); }
    }, [search, genreFilter, availFilter]);

    useEffect(() => { load(); }, []);

    const openAdd = () => { setForm(emptyBook()); setEditBook(null); setShowModal(true); };
    const openEdit = (b) => { setForm({ title: b.title || '', author: b.author || '', isbn: b.isbn || '', publisher: b.publisher || '', genre: b.genre || '', publicationYear: b.publicationYear || '', totalCopies: b.totalCopies || 1, description: b.description || '', coverImageUrl: b.coverImageUrl || '', premiumBook: b.premiumBook || false }); setEditBook(b); setShowModal(true); };

    const handleSave = async () => {
        const e = {};
        if (!form.title.trim()) e.title = 'Title is required';
        if (!form.author.trim()) e.author = 'Author is required';
        if (form.totalCopies < 1) e.totalCopies = 'At least 1 copy required';
        setErrors(e);
        if (Object.keys(e).length > 0) { toast.error('Please fix the errors'); return; }

        setSaving(true);
        try {
            const payload = { ...form, totalCopies: parseInt(form.totalCopies) || 1, publicationYear: form.publicationYear ? parseInt(form.publicationYear) : undefined };
            if (editBook) { await libraryAPI.updateBook(editBook.id, payload); toast.success('Book updated!'); }
            else { await libraryAPI.addBook(payload); toast.success('Book added!'); }
            setShowModal(false); load();
        } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); } finally { setSaving(false); }
    };

    const handleDelete = async (b) => {
        swal({
            title: 'Are you sure?',
            text: `Delete "${b.title}"? This cannot be undone.`,
            icon: 'warning',
            buttons: ['Cancel', 'Yes, Delete'],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                try {
                    await libraryAPI.deleteBook(b.id);
                    toast.success('Deleted!');
                    load();
                } catch (e) {
                    toast.error(e.response?.data?.message || 'Cannot delete');
                }
            }
        });
    };

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            <GlassCard>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <BookOpen size={22} /> Book Catalog
                    </h2>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={load} style={{ ...iconBtnStyle, width: '44px', height: '44px' }}><RefreshCw size={18} /></button>
                        <button onClick={openAdd} style={{ padding: '0.75rem 1.5rem', background: 'var(--primary-500)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem' }}><PlusCircle size={18} /> Add Book</button>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <input type="text" placeholder="Search by title, author, ISBN..." value={search}
                            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
                            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.4rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
                        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    </div>
                    <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)} style={{ ...selectStyle, minWidth: 130 }}>
                        <option value="">All Genres</option>
                        {genres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <select value={availFilter} onChange={e => setAvailFilter(e.target.value)} style={{ ...selectStyle, minWidth: 130 }}>
                        <option value="">All Status</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="UNAVAILABLE">Out of Stock</option>
                    </select>
                    <button onClick={load} style={{ padding: '0.65rem 1.25rem', background: 'var(--primary-500)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>Search</button>
                </div>

                {/* Table */}
                {loading ? <Spinner /> : books.length === 0 ? <EmptyState icon={BookOpen} message="No books found" /> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', minWidth: 700 }}>
                            <thead>
                                <tr style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textAlign: 'left' }}>
                                    {['Title', 'Author', 'Genre', 'ISBN', 'Copies', 'Status', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {books.map(b => (
                                    <tr key={b.id} style={{ background: 'var(--accent-subtle)' }}>
                                        <td style={tdStyle}><span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{b.title}</span><br /><span style={{ fontSize: '0.77rem', color: 'var(--text-secondary)' }}>{b.publisher}</span></td>
                                        <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{b.author}</span></td>
                                        <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{b.genre || '—'}</span></td>
                                        <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'monospace' }}>{b.isbn || '—'}</span></td>
                                        <td style={tdStyle}><span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{b.availableCopies}/{b.totalCopies}</span></td>
                                        <td style={tdStyle}>
                                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.73rem', fontWeight: '700', background: b.availableCopies > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: b.availableCopies > 0 ? '#10b981' : '#ef4444' }}>
                                                {b.availableCopies > 0 ? 'AVAILABLE' : 'OUT'}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                <IconBtn icon={Edit} color="#60a5fa" onClick={() => openEdit(b)} title="Edit" />
                                                <IconBtn icon={Trash2} color="#ef4444" onClick={() => handleDelete(b)} title="Delete" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <Modal title={editBook ? 'Edit Book' : 'Add New Book'} onClose={() => setShowModal(false)}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            {[
                                { key: 'title', label: 'Title *', full: true, required: true },
                                { key: 'author', label: 'Author *', full: true, required: true },
                                { key: 'isbn', label: 'ISBN', placeholder: '978-0-123456-78-9' },
                                { key: 'genre', label: 'Genre', placeholder: 'Fiction, Mystery, etc.' },
                                { key: 'publisher', label: 'Publisher' },
                                { key: 'publicationYear', label: 'Year', type: 'number' },
                                { key: 'totalCopies', label: 'Total Copies', type: 'number', required: true },
                                { key: 'coverImageUrl', label: 'Cover Image URL', full: true, placeholder: 'https://example.com/cover.jpg' },
                            ].map(f => (
                                <div key={f.key} style={{ gridColumn: f.full ? '1/-1' : 'auto' }}>
                                    <label style={labelStyle}>{f.label}</label>
                                    <input
                                        type={f.type || 'text'}
                                        value={form[f.key]}
                                        onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); if (errors[f.key]) setErrors(p => ({ ...p, [f.key]: '' })); }}
                                        placeholder={f.placeholder}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            background: 'var(--bg-input)',
                                            border: `2px solid ${errors[f.key] ? '#ef4444' : 'var(--border-color)'}`,
                                            borderRadius: '10px',
                                            color: 'var(--text-main)',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            transition: 'border-color 0.2s'
                                        }}
                                    />
                                    {errors[f.key] && <p style={{ margin: '0.25rem 0 0', color: '#ef4444', fontSize: '0.75rem', fontWeight: '600' }}>{errors[f.key]}</p>}
                                </div>
                            ))}
                            <div style={{ gridColumn: '1/-1' }}>
                                <label style={labelStyle}>Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    rows={3}
                                    placeholder="Brief description of the book..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'var(--bg-input)',
                                        border: '2px solid var(--border-color)',
                                        borderRadius: '10px',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        resize: 'vertical',
                                        boxSizing: 'border-box',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                            <div style={{ gridColumn: '1/-1' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', ...labelStyle, marginBottom: '0.6rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={form.premiumBook}
                                        onChange={e => setForm(p => ({ ...p, premiumBook: e.target.checked }))}
                                        style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary-500)', cursor: 'pointer' }}
                                    />
                                    <span>Premium Book (Requires Membership)</span>
                                </label>
                            </div>
                            {form.coverImageUrl && (
                                <div style={{ gridColumn: '1/-1' }}>
                                    <p style={{ ...labelStyle, marginBottom: '0.6rem' }}>Cover Preview</p>
                                    <img
                                        src={form.coverImageUrl}
                                        alt="cover"
                                        onError={e => e.target.style.display = 'none'}
                                        style={{ height: 140, borderRadius: 10, border: '2px solid var(--border-color)', objectFit: 'cover' }}
                                    />
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
                            <button
                                onClick={() => { setShowModal(false); setErrors({}); }}
                                style={{ padding: '0.8rem 1.6rem', background: 'transparent', border: '2px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '700', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-secondary)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    padding: '0.8rem 1.6rem',
                                    background: 'var(--primary-500)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: '800',
                                    opacity: saving ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'opacity 0.2s'
                                }}
                            >
                                {saving ? <Spinner /> : (editBook ? 'Update Book' : 'Add Book')}
                            </button>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Combined Issue & Return ───────────────────────────────────────────────
export const IssueReturnTab = () => {
    const [subTab, setSubTab] = useState('issue');
    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <button onClick={() => setSubTab('issue')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', color: subTab === 'issue' ? 'var(--primary-500)' : 'var(--text-secondary)', fontWeight: '600', borderBottom: subTab === 'issue' ? '2px solid var(--primary-500)' : '2px solid transparent' }}>Issue a Book</button>
                <button onClick={() => setSubTab('returns')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', color: subTab === 'returns' ? 'var(--primary-500)' : 'var(--text-secondary)', fontWeight: '600', borderBottom: subTab === 'returns' ? '2px solid var(--primary-500)' : '2px solid transparent' }}>Returns & Fines</button>
            </div>
            {subTab === 'issue' && <IssueBook />}
            {subTab === 'returns' && <PendingReturns />}
        </div>
    );
};

// ── Issue Book ─────────────────────────────────────────────────────────────
export const IssueBook = () => {
    const [books, setBooks] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentIdInput, setStudentIdInput] = useState('');
    const [bookSearch, setBookSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [submittingBooks, setSubmittingBooks] = useState({});
    const [selectedBooks, setSelectedBooks] = useState([]);
    const [dueDate, setDueDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0]; });
    const [notes, setNotes] = useState('');
    const [showBulkIssue, setShowBulkIssue] = useState(false);
    const [studentMembership, setStudentMembership] = useState(null);
    const [studentAllowance, setStudentAllowance] = useState(null);
    const [studentIssuances, setStudentIssuances] = useState([]);
    const [loadingStudentInfo, setLoadingStudentInfo] = useState(false);

    const defaultDue = () => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0]; };
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

    // Load basic available book list
    useEffect(() => {
        const loadBooks = async () => {
            setLoading(true);
            try {
                const res = await libraryAPI.getBooks({ status: 'AVAILABLE' }).catch(() => ({ data: [] }));
                setBooks(res.data || []);
            } finally {
                setLoading(false);
            }
        };
        loadBooks();
    }, []);

    // When a student is selected, load their library summary (membership + issuances)
    useEffect(() => {
        if (!selectedStudent) {
            setStudentMembership(null);
            setStudentAllowance(null);
            setStudentIssuances([]);
            return;
        }
        setLoadingStudentInfo(true);
        Promise.all([
            membershipAPI.getStudentMemberships(selectedStudent.id).catch(() => ({ data: [] })),
            membershipAPI.getStudentAllowance(selectedStudent.id).catch(() => ({ data: { bookAllowance: null } })),
            libraryAPI.getStudentIssuances(selectedStudent.id).catch(() => ({ data: [] })),
        ])
            .then(([mRes, aRes, iRes]) => {
                const allMemberships = mRes.data || [];
                const active = allMemberships.find(m => m.status === 'ACTIVE') || null;
                setStudentMembership(active);
                setStudentAllowance(aRes.data?.bookAllowance ?? null);
                setStudentIssuances(iRes.data || []);
            })
            .finally(() => setLoadingStudentInfo(false));
    }, [selectedStudent]);

    const handleSearchStudent = async () => {
        if (!studentIdInput.trim()) { toast.error('Enter a student ID or username'); return; }
        setLoadingStudents(true);
        try {
            const allStudents = await userAPI.getUsers('STUDENT').catch(() => ({ data: [] }));
            const students = allStudents.data || [];
            const found = students.find(s =>
                String(s.id) === studentIdInput ||
                s.username?.toLowerCase() === studentIdInput.toLowerCase()
            );
            if (found) {
                setSelectedStudent(found);
                setSelectedBooks([]);
                toast.success(`Found: ${found.firstName} ${found.lastName}`);
            } else {
                setSelectedStudent(null);
                toast.error('Student not found. Check ID or username.');
            }
        } catch (err) {
            toast.error('Failed to search student');
        } finally {
            setLoadingStudents(false);
        }
    };

    const filteredBooks = books.filter(b =>
        b.title?.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.author?.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.isbn?.includes(bookSearch)
    );

    const handleIssueBook = async (book) => {
        if (!selectedStudent) { toast.error('Select a student first'); return; }
        setSubmittingBooks(p => ({ ...p, [book.id]: true }));
        try {
            await libraryAPI.issueBook({
                bookId: book.id,
                studentId: selectedStudent.id,
                dueDate: dueDate,
                notes: notes
            });
            toast.success(`"${book.title}" issued to ${selectedStudent.firstName}!`);
            // Refresh books
            const res = await libraryAPI.getBooks({ status: 'AVAILABLE' });
            setBooks(res.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to issue book');
        } finally {
            setSubmittingBooks(p => ({ ...p, [book.id]: false }));
        }
    };

    const handleBulkIssue = async () => {
        if (!selectedStudent) { toast.error('Select a student first'); return; }
        if (selectedBooks.length === 0) { toast.error('Select at least one book'); return; }

        setSubmittingBooks(Object.fromEntries(selectedBooks.map(id => [id, true])));
        let issued = 0;
        for (const bookId of selectedBooks) {
            try {
                const book = books.find(b => b.id === bookId);
                await libraryAPI.issueBook({
                    bookId: bookId,
                    studentId: selectedStudent.id,
                    dueDate: dueDate,
                    notes: notes
                });
                issued++;
            } catch (err) {
                toast.error(`Failed to issue one book: ${err.response?.data?.message || ''}`);
            }
        }
        toast.success(`${issued}/${selectedBooks.length} books issued!`);
        setShowBulkIssue(false);
        setSelectedBooks([]);
        // Refresh books
        const res = await libraryAPI.getBooks({ status: 'AVAILABLE' });
        setBooks(res.data || []);
        setSubmittingBooks({});
    };

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            <GlassCard>
                <h2 style={{ margin: '0 0 2rem', fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <BookOpen size={20} /> Issue Books to Student
                </h2>

                {/* Step 1: Student Selection */}
                <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'var(--accent-subtle)', border: '2px solid var(--primary-500)', borderRadius: '14px' }}>
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ background: '#60a5fa', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.85rem' }}>1</span>
                        Select Student
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Student ID or Username *</label>
                            <input
                                type="text"
                                placeholder="Enter student ID (e.g., 5) or username (e.g., john_doe)"
                                value={studentIdInput}
                                onChange={e => setStudentIdInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearchStudent()}
                                disabled={loadingStudents}
                                style={{
                                    width: '100%',
                                    padding: '0.85rem 1rem 0.85rem 2.6rem',
                                    background: 'var(--bg-input)',
                                    border: '2px solid var(--border-color)',
                                    borderRadius: '12px',
                                    color: 'var(--text-main)',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    position: 'relative'
                                }}
                            />
                            <Search size={18} style={{ position: 'absolute', left: '1rem', marginTop: '-2.8rem', color: 'var(--text-secondary)' }} />
                        </div>
                        <button
                            onClick={handleSearchStudent}
                            disabled={loadingStudents || !studentIdInput.trim()}
                            style={{
                                padding: '0.85rem 1.8rem',
                                background: selectedStudent ? '#10b981' : 'var(--primary-500)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontWeight: '800',
                                cursor: loadingStudents || !studentIdInput.trim() ? 'not-allowed' : 'pointer',
                                opacity: loadingStudents ? 0.7 : 1,
                                fontSize: '0.95rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {loadingStudents ? '...' : selectedStudent ? 'Found' : 'Search'}
                        </button>
                    </div>

                    {/* Selected Student Display */}
                    {selectedStudent ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'rgba(34,197,94,0.1)', border: '2px solid #10b981', borderRadius: '12px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontWeight: '800', color: '#10b981', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Student Found</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                                        {selectedStudent.firstName} {selectedStudent.lastName}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        @{selectedStudent.username} • ID: {selectedStudent.id}
                                    </div>
                                    {selectedStudent.email && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>📧 {selectedStudent.email}</div>}
                                </div>
                                <button
                                    onClick={() => { setSelectedStudent(null); setStudentIdInput(''); setSelectedBooks([]); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.2rem' }}
                                >
                                    ✕
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(96,165,250,0.08)', border: '1px dashed var(--border-color)', borderRadius: '10px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Enter student ID or username and click Search
                        </div>
                    )}
                </div>

                {/* Student Library Summary */}
                {selectedStudent && (
                    <div style={{ marginBottom: '2rem', padding: '1.25rem', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>
                                    Student Library Overview
                                </h3>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <div>Active books: <strong>{studentIssuances.filter(i => i.status === 'ISSUED').length}</strong></div>
                                    <div>
                                        Overdue: <strong style={{ color: '#ef4444' }}>
                                            {studentIssuances.filter(i => i.status === 'ISSUED' && new Date(i.dueDate) < new Date()).length}
                                        </strong>
                                    </div>
                                    <div>
                                        Total fines so far:{' '}
                                        <strong style={{ color: '#f59e0b' }}>
                                            ₹{studentIssuances.reduce((sum, i) => sum + (i.penaltyAmount || 0), 0)}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>Membership</h4>
                                {loadingStudentInfo ? (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Loading membership…</div>
                                ) : studentMembership ? (
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                        <div style={{ marginBottom: '0.2rem' }}>
                                            <strong>{studentMembership.plan?.name}</strong>{' '}
                                            <span style={{ padding: '0.1rem 0.45rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700', background: 'rgba(96,165,250,0.15)', color: 'var(--primary-500)' }}>
                                                {studentMembership.plan?.tier}
                                            </span>
                                        </div>
                                        <div>Allowance: <strong>{studentAllowance ?? studentMembership.plan?.bookAllowance} books</strong></div>
                                        <div>Loan duration: <strong>{studentMembership.plan?.loanDurationDays} days</strong></div>
                                        <div>Status: <strong style={{ color: studentMembership.status === 'ACTIVE' ? '#10b981' : '#f97316' }}>{studentMembership.status}</strong></div>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        No active membership. Default allowance from system rules will apply.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {selectedStudent && (
                    <>
                        {/* Step 2: Book Search */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ background: '#60a5fa', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.85rem' }}>2</span>
                                Search & Select Books
                            </h3>

                            {/* Search Field */}
                            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Search by title, author, or ISBN..."
                                    value={bookSearch}
                                    onChange={e => setBookSearch(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem 1rem 0.85rem 2.6rem',
                                        background: 'var(--bg-input)',
                                        border: '2px solid var(--border-color)',
                                        borderRadius: '12px',
                                        color: 'var(--text-main)',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            </div>

                            {/* Due Date and Notes */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>Due Date *</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={e => setDueDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{
                                            width: '100%',
                                            padding: '0.85rem 1rem',
                                            background: 'var(--bg-input)',
                                            border: '2px solid var(--border-color)',
                                            borderRadius: '12px',
                                            color: 'var(--text-main)',
                                            fontSize: '0.95rem',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Notes (optional)</label>
                                    <input
                                        type="text"
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="e.g., Renewal, Lost copy, etc."
                                        style={{
                                            width: '100%',
                                            padding: '0.85rem 1rem',
                                            background: 'var(--bg-input)',
                                            border: '2px solid var(--border-color)',
                                            borderRadius: '12px',
                                            color: 'var(--text-main)',
                                            fontSize: '0.95rem',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Available Books */}
                            {loading ? <Spinner /> : filteredBooks.length === 0 ? (
                                <EmptyState icon={BookOpen} message={books.length === 0 ? "No available books" : "No books match your search"} />
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', minWidth: 700 }}>
                                        <thead>
                                            <tr style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textAlign: 'left' }}>
                                                <th style={{ ...thStyle, width: '40px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedBooks.length === filteredBooks.length && filteredBooks.length > 0}
                                                        onChange={e => {
                                                            if (e.target.checked) {
                                                                setSelectedBooks(filteredBooks.map(b => b.id));
                                                            } else {
                                                                setSelectedBooks([]);
                                                            }
                                                        }}
                                                        style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary-500)', cursor: 'pointer' }}
                                                    />
                                                </th>
                                                <th style={thStyle}>Title</th>
                                                <th style={thStyle}>Author</th>
                                                <th style={thStyle}>Genre</th>
                                                <th style={thStyle}>Available</th>
                                                <th style={thStyle}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBooks.map(b => (
                                                <tr key={b.id} style={{ background: selectedBooks.includes(b.id) ? 'rgba(96,165,250,0.1)' : 'var(--accent-subtle)' }}>
                                                    <td style={tdStyle}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedBooks.includes(b.id)}
                                                            onChange={e => {
                                                                if (e.target.checked) {
                                                                    setSelectedBooks(p => [...p, b.id]);
                                                                } else {
                                                                    setSelectedBooks(p => p.filter(id => id !== b.id));
                                                                }
                                                            }}
                                                            style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary-500)', cursor: 'pointer' }}
                                                        />
                                                    </td>
                                                    <td style={tdStyle}><span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{b.title}</span></td>
                                                    <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{b.author}</span></td>
                                                    <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{b.genre || '—'}</span></td>
                                                    <td style={tdStyle}><span style={{ fontWeight: '700', color: '#10b981' }}>{b.availableCopies}</span></td>
                                                    <td style={tdStyle}>
                                                        <button
                                                            onClick={() => handleIssueBook(b)}
                                                            disabled={submittingBooks[b.id]}
                                                            style={{
                                                                padding: '0.5rem 1rem',
                                                                background: 'rgba(34,197,94,0.15)',
                                                                border: '1px solid rgba(34,197,94,0.3)',
                                                                borderRadius: '8px',
                                                                color: '#10b981',
                                                                cursor: submittingBooks[b.id] ? 'not-allowed' : 'pointer',
                                                                fontWeight: '700',
                                                                fontSize: '0.82rem',
                                                                opacity: submittingBooks[b.id] ? 0.6 : 1
                                                            }}
                                                        >
                                                            {submittingBooks[b.id] ? '...' : 'Issue'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Bulk Issue Section */}
                            {selectedBooks.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(34,197,94,0.08)', border: '2px solid rgba(34,197,94,0.3)', borderRadius: '12px' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>{selectedBooks.length} book(s) selected</span>
                                            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>These books will be issued to {selectedStudent.firstName} {selectedStudent.lastName}</p>
                                        </div>
                                        <button
                                            onClick={handleBulkIssue}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                background: '#10b981',
                                                border: 'none',
                                                borderRadius: '10px',
                                                color: '#fff',
                                                fontWeight: '800',
                                                cursor: 'pointer',
                                                fontSize: '0.95rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <CheckCircle size={18} /> Issue All ({selectedBooks.length})
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </>
                )}

                {/* Info Box */}
                {!selectedStudent && (
                    <div style={{ padding: '1.5rem', background: 'rgba(96,165,250,0.08)', border: '2px dashed var(--border-color)', borderRadius: '12px', textAlign: 'center' }}>
                        <BookOpen size={32} style={{ color: 'var(--text-secondary)', margin: '0 auto 0.75rem', opacity: 0.5 }} />
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.95rem' }}>
                            Select a student above to see available books
                        </p>
                        <p style={{ margin: '0.4rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Enter their student ID (e.g., 5) or username (e.g., john_student)
                        </p>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

// ── Pending Returns ────────────────────────────────────────────────────────
export const PendingReturns = () => {
    const [issuances, setIssuances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ISSUED');
    const [search, setSearch] = useState('');
    const [processing, setProcessing] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = filter === 'OVERDUE'
                ? await libraryAPI.getOverdueIssuances()
                : await libraryAPI.getAllIssuances(filter === 'ISSUED' ? 'ISSUED' : '');
            setIssuances(res.data || []);
        } catch { toast.error('Failed to load'); } finally { setLoading(false); }
    }, [filter]);

    useEffect(() => { load(); }, [load]);

    const handleReturn = async (i) => {
        if (!window.confirm(`Process return for "${i.book?.title}"?`)) return;
        setProcessing(i.id);
        try {
            await libraryAPI.returnBook(i.id);
            toast.success('Book returned!'); load();
        } catch (err) { toast.error(err.response?.data?.message || 'Return failed'); } finally { setProcessing(null); }
    };

    const now = new Date();
    const filtered = issuances.filter(i => {
        if (!search) return true;
        const q = search.toLowerCase();
        return i.book?.title?.toLowerCase().includes(q) ||
            i.student?.username?.toLowerCase().includes(q) ||
            i.student?.firstName?.toLowerCase().includes(q);
    });

    const overdueCount = issuances.filter(i => i.status === 'ISSUED' && new Date(i.dueDate) < now).length;

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            <GlassCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <RotateCcw size={18} /> Returns Management
                        </h2>
                        {overdueCount > 0 && <span style={{ fontSize: '0.82rem', color: '#ef4444', fontWeight: '600' }}>{overdueCount} overdue</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {['ISSUED', 'OVERDUE', 'ALL'].map(s => (
                            <button key={s} onClick={() => setFilter(s)}
                                style={{ padding: '0.45rem 1rem', borderRadius: '10px', border: filter === s ? '1px solid var(--primary-500)' : '1px solid var(--border-color)', background: filter === s ? 'var(--accent-subtle)' : 'transparent', color: filter === s ? 'var(--primary-500)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                    <input type="text" placeholder="Search by book title or student name..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
                    <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                </div>

                {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState icon={RotateCcw} message="No records found" /> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', minWidth: 700 }}>
                            <thead>
                                <tr style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textAlign: 'left' }}>
                                    {['Book', 'Student', 'Issue Date', 'Due Date', 'Status', 'Fine (₹)', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(i => {
                                    const overdue = i.status === 'ISSUED' && new Date(i.dueDate) < now;
                                    const daysLate = overdue ? Math.floor((now - new Date(i.dueDate)) / 86400000) : 0;
                                    const fine = i.penaltyAmount || (overdue ? daysLate * 5 : 0);
                                    return (
                                        <tr key={i.id} style={{ background: overdue ? 'rgba(239,68,68,0.06)' : 'var(--accent-subtle)' }}>
                                            <td style={tdStyle}><span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.88rem' }}>{i.book?.title}</span><br /><span style={{ fontSize: '0.77rem', color: 'var(--text-secondary)' }}>{i.book?.author}</span></td>
                                            <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{i.student?.firstName} {i.student?.lastName}<br /><span style={{ fontSize: '0.77rem' }}>@{i.student?.username}</span></span></td>
                                            <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{i.issueDate}</span></td>
                                            <td style={tdStyle}><span style={{ color: overdue ? '#ef4444' : 'var(--text-secondary)', fontWeight: overdue ? '700' : '400', fontSize: '0.85rem' }}>{i.dueDate} {overdue && `(${daysLate}d)`}</span></td>
                                            <td style={tdStyle}><StatusBadge status={i.status} overdue={overdue} /></td>
                                            <td style={tdStyle}><span style={{ fontWeight: '700', color: fine > 0 ? '#ef4444' : 'var(--text-secondary)' }}>{fine > 0 ? `₹${fine}` : '—'}</span></td>
                                            <td style={tdStyle}>
                                                {i.status === 'ISSUED' ? (
                                                    <button onClick={() => handleReturn(i)} disabled={processing === i.id}
                                                        style={{ padding: '0.4rem 0.9rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#10b981', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem', opacity: processing === i.id ? 0.6 : 1 }}>
                                                        {processing === i.id ? '...' : 'Return'}
                                                    </button>
                                                ) : <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Returned</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

// ── New Arrivals (Add Book) ─────────────────────────────────────────────────
// ── Membership Management ──────────────────────────────────────────────────
export const MembershipManagement = ({ initialSection = 'assign' }) => {
    const [plans, setPlans] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState(initialSection);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editPlan, setEditPlan] = useState(null);
    const [planForm, setPlanForm] = useState({ name: '', tier: 'BASIC', bookAllowance: 2, loanDurationDays: 14, maxRenewals: 0, monthlyFee: 0, description: '', active: true });
    const [assignForm, setAssignForm] = useState({ studentId: '', planId: '', notes: '', endDate: '' });
    const [saving, setSaving] = useState(false);
    const [studentSearch, setStudentSearch] = useState('');
    const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [pr, mr, sr] = await Promise.all([
                membershipAPI.getAllPlans().catch(() => ({ data: [] })),
                membershipAPI.getAllMemberships().catch(() => ({ data: [] })),
                userAPI.getUsers('STUDENT').catch(() => ({ data: [] })),
            ]);
            setPlans(pr.data || []); setMemberships(mr.data || []); setStudents(sr.data || []);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openAddPlan = () => { setPlanForm({ name: '', tier: 'BASIC', bookAllowance: 2, loanDurationDays: 14, maxRenewals: 0, monthlyFee: 0, description: '', active: true }); setEditPlan(null); setShowPlanModal(true); };
    const openEditPlan = (p) => { setPlanForm({ name: p.name, tier: p.tier, bookAllowance: p.bookAllowance, loanDurationDays: p.loanDurationDays, maxRenewals: p.maxRenewals || 0, monthlyFee: p.monthlyFee || 0, description: p.description || '', active: p.active }); setEditPlan(p); setShowPlanModal(true); };

    const handleSavePlan = async () => {
        if (!planForm.name.trim()) { toast.error('Plan name is required'); return; }
        setSaving(true);
        try {
            const payload = { ...planForm, bookAllowance: parseInt(planForm.bookAllowance), loanDurationDays: parseInt(planForm.loanDurationDays), maxRenewals: parseInt(planForm.maxRenewals), monthlyFee: parseFloat(planForm.monthlyFee) };
            if (editPlan) { await membershipAPI.updatePlan(editPlan.id, payload); toast.success('Plan updated!'); }
            else { await membershipAPI.createPlan(payload); toast.success('Plan created!'); }
            setShowPlanModal(false); load();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed'); } finally { setSaving(false); }
    };

    const handleDeletePlan = async (p) => {
        if (!window.confirm(`Delete plan "${p.name}"?`)) return;
        try { await membershipAPI.deletePlan(p.id); toast.success('Deleted!'); load(); }
        catch (e) { toast.error(e.response?.data?.message || 'Cannot delete'); }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!assignForm.studentId || !assignForm.planId) { toast.error('Select student and plan'); return; }
        setSaving(true);
        try {
            await membershipAPI.assignMembership({ studentId: parseInt(assignForm.studentId), planId: parseInt(assignForm.planId), notes: assignForm.notes, endDate: assignForm.endDate || null });
            toast.success('Membership assigned!');
            setAssignForm({ studentId: '', planId: '', notes: '', endDate: '' });
            setSelectedStudent(null); setStudentSearch('');
            load();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed'); } finally { setSaving(false); }
    };

    const filteredStudents = students.filter(s => {
        const q = studentSearch.toLowerCase();
        return !q || `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || s.username?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
    });

    const handleRevoke = async (m) => {
        if (!window.confirm(`Revoke membership for ${m.student?.firstName}?`)) return;
        try { await membershipAPI.revokeMembership(m.id); toast.success('Revoked!'); load(); }
        catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    };

    const tierColors = { BASIC: '#60a5fa', STANDARD: '#a855f7', PREMIUM: '#f59e0b', UNLIMITED: '#10b981' };

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            {/* Section Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {[['assign', 'Assign'], ['plans', 'Plans'], ['list', 'All Memberships']].map(([k, l]) => (
                    <button key={k} onClick={() => setActiveSection(k)}
                        style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', border: activeSection === k ? '1px solid var(--primary-500)' : '1px solid var(--border-color)', background: activeSection === k ? 'var(--accent-subtle)' : 'transparent', color: activeSection === k ? 'var(--primary-500)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem' }}>
                        {l}
                    </button>
                ))}
            </div>

            {loading ? <Spinner /> : (
                <>
                    {/* ASSIGN */}
                    {activeSection === 'assign' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
                            <GlassCard>
                                <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <CreditCard size={18} /> Assign Membership Plan
                                </h2>
                                <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Student search picker */}
                                    <div style={{ position: 'relative' }}>
                                        <label style={labelStyle}>Student *</label>
                                        {selectedStudent ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1rem', background: 'var(--bg-input)', border: '2px solid var(--primary-500)', borderRadius: '10px' }}>
                                                <span style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.9rem' }}>
                                                    {selectedStudent.firstName} {selectedStudent.lastName}
                                                    <span style={{ color: 'var(--text-secondary)', fontWeight: '400', marginLeft: '0.5rem', fontSize: '0.8rem' }}>@{selectedStudent.username}</span>
                                                </span>
                                                <button type='button' onClick={() => { setSelectedStudent(null); setAssignForm(p => ({ ...p, studentId: '' })); setStudentSearch(''); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-secondary)', display: 'flex' }}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div onBlur={() => setTimeout(() => setStudentDropdownOpen(false), 150)}>
                                                <div style={{ position: 'relative' }}>
                                                    <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                                    <input
                                                        type='text'
                                                        value={studentSearch}
                                                        onChange={e => { setStudentSearch(e.target.value); setStudentDropdownOpen(true); }}
                                                        onFocus={() => setStudentDropdownOpen(true)}
                                                        placeholder='Search by name, username or email...'
                                                        style={{ ...selectStyle, paddingLeft: '2.2rem' }}
                                                    />
                                                </div>
                                                {studentDropdownOpen && (
                                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', maxHeight: 220, overflowY: 'auto', marginTop: 4 }}>
                                                        {filteredStudents.length === 0 ? (
                                                            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No students found</div>
                                                        ) : filteredStudents.slice(0, 20).map(s => (
                                                            <div key={s.id}
                                                                onClick={() => { setSelectedStudent(s); setAssignForm(p => ({ ...p, studentId: s.id })); setStudentDropdownOpen(false); setStudentSearch(''); }}
                                                                style={{ padding: '0.7rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-subtle)'}
                                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                                <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>{s.firstName} {s.lastName}</div>
                                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>@{s.username} · {s.email}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div><label style={labelStyle}>Membership Plan *</label>
                                        <select value={assignForm.planId} onChange={e => setAssignForm(p => ({ ...p, planId: e.target.value }))} style={selectStyle}>
                                            <option value=''>-- Select Plan --</option>
                                            {plans.filter(p => p.active).map(p => <option key={p.id} value={p.id}>{p.name} ({p.tier} · {p.bookAllowance} books, {p.loanDurationDays} days)</option>)}
                                        </select></div>
                                    <div><label style={labelStyle}>End Date (optional)</label>
                                        <input type='date' value={assignForm.endDate} onChange={e => setAssignForm(p => ({ ...p, endDate: e.target.value }))} style={selectStyle} /></div>
                                    <div><label style={labelStyle}>Notes</label>
                                        <textarea value={assignForm.notes} onChange={e => setAssignForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder='Any remarks...' style={{ ...selectStyle, resize: 'none', fontFamily: 'inherit' }} /></div>
                                    <button type='submit' disabled={saving || !assignForm.studentId || !assignForm.planId}
                                        style={{ padding: '0.85rem', background: assignForm.studentId && assignForm.planId ? 'var(--primary-500)' : 'var(--accent-subtle)', border: 'none', borderRadius: '12px', color: assignForm.studentId && assignForm.planId ? '#fff' : 'var(--text-secondary)', fontWeight: '700', cursor: assignForm.studentId && assignForm.planId ? 'pointer' : 'default', opacity: saving ? 0.7 : 1, transition: 'all 0.2s' }}>
                                        {saving ? 'Assigning...' : 'Assign Membership'}
                                    </button>
                                </form>
                            </GlassCard>
                            <GlassCard>
                                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>Available Plans</h3>
                                {plans.filter(p => p.active).map(p => (
                                    <div key={p.id} style={{ padding: '1rem', background: 'var(--accent-subtle)', borderRadius: '12px', marginBottom: '0.75rem', border: `1px solid ${tierColors[p.tier] || 'var(--border-color)'}40` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                            <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{p.name}</span>
                                            <span style={{ padding: '0.15rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', background: `${tierColors[p.tier] || '#60a5fa'}20`, color: tierColors[p.tier] || '#60a5fa' }}>{p.tier}</span>
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            <span><BookOpen size={14} style={{ marginRight: 4 }} /> {p.bookAllowance} books</span>
                                            <span><Calendar size={14} style={{ marginRight: 4 }} /> {p.loanDurationDays} days</span>
                                            <span><RotateCcw size={14} style={{ marginRight: 4 }} /> {p.maxRenewals} renewals</span>
                                        </div>
                                        {p.description && <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.description}</p>}
                                    </div>
                                ))}
                            </GlassCard>
                        </div>
                    )}

                    {/* MANAGE PLANS */}
                    {activeSection === 'plans' && (
                        <GlassCard>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <ClipboardList size={18} /> Membership Plans
                                </h2>
                                <button onClick={openAddPlan} style={{ padding: '0.65rem 1.25rem', background: 'var(--primary-500)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PlusCircle size={16} /> Add Plan</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                {plans.map(p => (
                                    <div key={p.id} style={{ padding: '1.25rem', background: 'var(--accent-subtle)', borderRadius: '14px', border: `2px solid ${p.active ? (tierColors[p.tier] || 'var(--border-color)') : 'var(--border-color)'}40` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>{p.name}</div>
                                                <span style={{ padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', background: `${tierColors[p.tier] || '#60a5fa'}20`, color: tierColors[p.tier] || '#60a5fa' }}>{p.tier}</span>
                                            </div>
                                            {!p.active && <span style={{ padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>INACTIVE</span>}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            <span><BookOpen size={14} style={{ marginRight: 4 }} /> Book Allowance: <strong style={{ color: 'var(--text-main)' }}>{p.bookAllowance}</strong></span>
                                            <span><Calendar size={14} style={{ marginRight: 4 }} /> Loan Duration: <strong style={{ color: 'var(--text-main)' }}>{p.loanDurationDays} days</strong></span>
                                            <span><RotateCcw size={14} style={{ marginRight: 4 }} /> Max Renewals: <strong style={{ color: 'var(--text-main)' }}>{p.maxRenewals}</strong></span>
                                        </div>
                                        {p.description && <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.description}</p>}
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <IconBtn icon={Edit} color='#60a5fa' onClick={() => openEditPlan(p)} title='Edit' />
                                            <IconBtn icon={Trash2} color='#ef4444' onClick={() => handleDeletePlan(p)} title='Delete' />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {/* ALL MEMBERSHIPS */}
                    {activeSection === 'list' && (
                        <GlassCard>
                            <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Users size={18} /> Student Memberships
                            </h2>
                            {memberships.length === 0 ? <EmptyState icon={Users} message='No memberships assigned yet' /> : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', minWidth: 700 }}>
                                        <thead><tr style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                                            {['Student', 'Plan', 'Allowance', 'Start', 'End', 'Status', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                                        </tr></thead>
                                        <tbody>{memberships.map(m => (
                                            <tr key={m.id} style={{ background: 'var(--accent-subtle)' }}>
                                                <td style={tdStyle}><span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.88rem' }}>{m.student?.firstName} {m.student?.lastName}</span><br /><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@{m.student?.username}</span></td>
                                                <td style={tdStyle}><span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', background: `${tierColors[m.plan?.tier] || '#60a5fa'}20`, color: tierColors[m.plan?.tier] || '#60a5fa' }}>{m.plan?.name}</span></td>
                                                <td style={tdStyle}><span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{m.plan?.bookAllowance} books</span></td>
                                                <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{m.startDate}</span></td>
                                                <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{m.endDate || '—'}</span></td>
                                                <td style={tdStyle}><span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.73rem', fontWeight: '700', background: m.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : m.status === 'EXPIRED' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: m.status === 'ACTIVE' ? '#10b981' : m.status === 'EXPIRED' ? '#ef4444' : '#f59e0b' }}>{m.status}</span></td>
                                                <td style={tdStyle}>{m.status === 'ACTIVE' && <button onClick={() => handleRevoke(m)} style={{ padding: '0.35rem 0.8rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600' }}>Revoke</button>}</td>
                                            </tr>
                                        ))}</tbody>
                                    </table>
                                </div>
                            )}
                        </GlassCard>
                    )}
                </>
            )}

            {/* Plan Modal */}
            <AnimatePresence>
                {showPlanModal && (
                    <Modal title={editPlan ? 'Edit Plan' : 'Create Membership Plan'} onClose={() => setShowPlanModal(false)}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {[{ key: 'name', label: 'Plan Name *', full: true }, { key: 'bookAllowance', label: 'Book Allowance', type: 'number' }, { key: 'loanDurationDays', label: 'Loan Days', type: 'number' }, { key: 'maxRenewals', label: 'Max Renewals', type: 'number' }, { key: 'monthlyFee', label: 'Monthly Fee (₹)', type: 'number' }].map(f => (
                                <div key={f.key} style={{ gridColumn: f.full ? '1/-1' : 'auto' }}>
                                    <label style={labelStyle}>{f.label}</label>
                                    <input type={f.type || 'text'} value={planForm[f.key]} onChange={e => setPlanForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.9rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            ))}
                            <div><label style={labelStyle}>Tier</label>
                                <select value={planForm.tier} onChange={e => setPlanForm(p => ({ ...p, tier: e.target.value }))} style={selectStyle}>
                                    {['BASIC', 'STANDARD', 'PREMIUM', 'UNLIMITED'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select></div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.2rem' }}>
                                <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    <input type='checkbox' checked={planForm.active} onChange={e => setPlanForm(p => ({ ...p, active: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--primary-500)' }} /> Active
                                </label>
                            </div>
                            <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Description</label>
                                <textarea value={planForm.description} onChange={e => setPlanForm(p => ({ ...p, description: e.target.value }))} rows={2} style={{ width: '100%', padding: '0.65rem 0.9rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowPlanModal(false)} style={{ padding: '0.7rem 1.5rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                            <button onClick={handleSavePlan} disabled={saving} style={{ padding: '0.7rem 1.5rem', background: 'var(--primary-500)', border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontWeight: '700', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : editPlan ? 'Update Plan' : 'Create Plan'}</button>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
};

export const ManagePlansTab = () => <MembershipManagement initialSection="plans" />;

// ── Book Requests ────────────────────────────────────────────────────────
export const BookRequestsTab = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await bookRequestAPI.getAllRequests();
            setRequests(res.data || []);
        } catch (err) {
            toast.error('Failed to load book requests');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, []);

    const handleAction = async (id, action) => {
        const note = window.prompt(`Optional note for ${action}:`);
        if (note === null) return; // cancelled
        try {
            if (action === 'approve') await bookRequestAPI.approveRequest(id, note);
            else await bookRequestAPI.rejectRequest(id, note);
            toast.success(`Request ${action}d!`);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${action}`);
        }
    };

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            <GlassCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-main)' }}>📋 Student Book Requests</h2>
                    <button onClick={load} style={iconBtnStyle}><RefreshCw size={16} /></button>
                </div>
                {loading ? <Spinner /> : requests.length === 0 ? <EmptyState icon={ClipboardList} message="No pending requests" /> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', minWidth: 700 }}>
                            <thead>
                                <tr style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textAlign: 'left' }}>
                                    <th style={thStyle}>Date</th>
                                    <th style={thStyle}>Student</th>
                                    <th style={thStyle}>Book</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Notes</th>
                                    <th style={thStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(r => (
                                    <tr key={r.id} style={{ background: 'var(--accent-subtle)' }}>
                                        <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(r.requestDate).toLocaleDateString()}</span></td>
                                        <td style={tdStyle}><span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{r.student?.username}</span></td>
                                        <td style={tdStyle}><span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{r.book?.title}</span></td>
                                        <td style={tdStyle}>
                                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.73rem', fontWeight: '700', background: r.status === 'APPROVED' ? 'rgba(16,185,129,0.15)' : r.status === 'REJECTED' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: r.status === 'APPROVED' ? '#10b981' : r.status === 'REJECTED' ? '#ef4444' : '#f59e0b' }}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td style={tdStyle}><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{r.studentNotes || '—'}</span></td>
                                        <td style={tdStyle}>
                                            {r.status === 'PENDING' && (
                                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                    <button onClick={() => handleAction(r.id, 'approve')} style={{ padding: '0.4rem 0.8rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>Approve</button>
                                                    <button onClick={() => handleAction(r.id, 'reject')} style={{ padding: '0.4rem 0.8rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>Reject</button>
                                                </div>
                                            )}
                                            {r.status !== 'PENDING' && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Staff: {r.staffNote || '—'}</span>}
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

export const NewArrivals = () => {
    const [form, setForm] = useState({ title: '', author: '', isbn: '', publisher: '', genre: '', publicationYear: '', totalCopies: 1, description: '', coverImageUrl: '', frontPageImageUrl: '', premiumBook: false });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [recentBooks, setRecentBooks] = useState([]);

    useEffect(() => {
        libraryAPI.getBooks().then(r => {
            const sorted = (r.data || []).sort((a, b) => (b.id || 0) - (a.id || 0));
            setRecentBooks(sorted.slice(0, 8));
        }).catch(() => { });
    }, []);

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = 'Title is required';
        if (!form.author.trim()) e.author = 'Author is required';
        setErrors(e); return !Object.keys(e).length;
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); if (!validate()) return; setLoading(true);
        try {
            const payload = { ...form, totalCopies: parseInt(form.totalCopies) || 1, publicationYear: form.publicationYear ? parseInt(form.publicationYear) : undefined };
            await libraryAPI.addBook(payload);
            toast.success(`"${form.title}" added to catalog!`);
            setForm({ title: '', author: '', isbn: '', publisher: '', genre: '', publicationYear: '', totalCopies: 1, description: '', coverImageUrl: '', frontPageImageUrl: '', premiumBook: false });
            setErrors({});
            const r = await libraryAPI.getBooks();
            setRecentBooks((r.data || []).sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 8));
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to add book'); } finally { setLoading(false); }
    };

    const fields = [
        { key: 'title', label: 'Title *', full: true },
        { key: 'author', label: 'Author *', full: true },
        { key: 'isbn', label: 'ISBN' },
        { key: 'genre', label: 'Genre' },
        { key: 'publisher', label: 'Publisher' },
        { key: 'publicationYear', label: 'Year', type: 'number' },
        { key: 'totalCopies', label: 'Copies', type: 'number' },
        { key: 'coverImageUrl', label: 'Cover Image URL', full: true },
        { key: 'frontPageImageUrl', label: 'Front Page Image URL', full: true },
        { key: 'premiumBook', label: 'Premium Book (Requires Membership)', type: 'checkbox', full: true },
    ];

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
                <GlassCard>
                    <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <BookOpen size={18} /> Add New Book
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            {fields.map(f => (
                                <div key={f.key} style={{ gridColumn: f.full ? '1/-1' : 'auto' }}>
                                    {f.type === 'checkbox' ? (
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', ...labelStyle, marginBottom: 0 }}>
                                            <input type="checkbox" checked={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.checked }))} style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary-500)', cursor: 'pointer' }} />
                                            {f.label}
                                        </label>
                                    ) : (
                                        <>
                                            <label style={labelStyle}>{f.label}</label>
                                            <input type={f.type || 'text'} value={form[f.key]}
                                                onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); if (errors[f.key]) setErrors(p => ({ ...p, [f.key]: '' })); }}
                                                style={{ width: '100%', padding: '0.65rem 0.9rem', background: 'var(--bg-input)', border: `1px solid ${errors[f.key] ? '#ef4444' : 'var(--border-color)'}`, borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                                            {errors[f.key] && <p style={{ margin: '0.25rem 0 0', color: '#ef4444', fontSize: '0.78rem' }}>{errors[f.key]}</p>}
                                        </>
                                    )}
                                </div>
                            ))}
                            <div style={{ gridColumn: '1/-1' }}>
                                <label style={labelStyle}>Description</label>
                                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                                    style={{ width: '100%', padding: '0.65rem 0.9rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            style={{ width: '100%', padding: '0.9rem', background: 'var(--primary-500)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '700', cursor: 'pointer', opacity: loading ? 0.7 : 1, fontSize: '0.95rem' }}>
                            {loading ? 'Adding...' : '+ Add to Catalog'}
                        </button>
                    </form>
                </GlassCard>

                <GlassCard>
                    <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>Recent Additions</h2>
                    {recentBooks.length > 0 ? recentBooks.map(b => (
                        <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--accent-subtle)', borderRadius: '10px', marginBottom: '0.5rem', border: '1px solid var(--border-color)' }}>
                            <div>
                                <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.88rem' }}>{b.title}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{b.author}{b.genre ? ` • ${b.genre}` : ''}</div>
                            </div>
                            <span style={{ padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.73rem', fontWeight: '700', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>{b.totalCopies} copies</span>
                        </div>
                    )) : <EmptyState icon={Package} message="No books added yet" />}
                </GlassCard>
            </div>
        </div>
    );
};

// ── Shared UI ─────────────────────────────────────────────────────────────
const AnimatedCounter = ({ value, duration = 1.5 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = parseInt(value, 10);
        if (isNaN(end)) { setCount(value); return; }

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
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.5rem', backdropFilter: 'blur(16px)', ...style }}>{children}</div>
);
const StatCard = ({ label, value, icon: Icon, color }) => (
    <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
            <div style={{ width: 34, height: 34, borderRadius: '9px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}><Icon size={17} /></div>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {typeof value === 'number' || !isNaN(Number(value)) ? <AnimatedCounter value={value} /> : value}
        </div>
    </GlassCard>
);
const EmptyState = ({ icon: Icon, message, sub }) => (
    <div style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'var(--accent-subtle)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--text-secondary)' }}><Icon size={24} /></div>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>{message}</p>
        {sub && <p style={{ margin: '0.3rem 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{sub}</p>}
    </div>
);
const Spinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: 30, height: 30, border: '3px solid var(--border-color)', borderTopColor: 'var(--primary-500)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
);
const StatusBadge = ({ status, overdue }) => {
    const label = overdue && status === 'ISSUED' ? 'OVERDUE' : status;
    const c = label === 'RETURNED' ? '#10b981' : label === 'OVERDUE' ? '#ef4444' : '#60a5fa';
    return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.73rem', fontWeight: '700', background: `${c}20`, color: c, border: `1px solid ${c}40` }}>{label}</span>;
};
const Modal = ({ title, onClose, children }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>{title}</h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>
            {children}
        </motion.div>
    </motion.div>
);
const ActionBtn = ({ href, icon: Icon, label, color }) => (
    <a href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', padding: '1.25rem', background: 'var(--accent-subtle)', border: '1px solid var(--border-color)', borderRadius: '14px', textDecoration: 'none', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.88rem', transition: 'all 0.2s', textAlign: 'center' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; }}>
        <Icon size={22} style={{ color }} />{label}
    </a>
);
const IconBtn = ({ icon: Icon, color, onClick, title }) => (
    <button onClick={onClick} title={title}
        style={{ width: 32, height: 32, borderRadius: '8px', background: `${color}15`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color }}>
        <Icon size={14} />
    </button>
);
const InfoBlock = ({ title, children }) => (
    <div style={{ padding: '1rem', background: 'var(--accent-subtle)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>{title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>{children}</div>
    </div>
);
const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{value}</span>
    </div>
);

const labelStyle = { display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '500' };
const selectStyle = { width: '100%', padding: '0.65rem 0.9rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' };
const inputStyle = { width: '100%', padding: '0.65rem 0.9rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
const thStyle = { padding: '0.5rem 1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.73rem' };
const tdStyle = { padding: '0.85rem 1rem' };
const iconBtnStyle = { width: 36, height: 36, borderRadius: '9px', background: 'var(--accent-subtle)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' };

export default StaffDashboard;

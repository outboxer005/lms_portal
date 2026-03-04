import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import ApprovalModal from '../components/ApprovalModal';
import { useAuth } from '../context/AuthContext';
import { adminAPI, authAPI } from '../services/api';
import { ManageBooks, IssueReturnTab, BookRequestsTab, MembershipManagement, ManagePlansTab } from './StaffDashboard';
import { SharedProfileTab } from './StudentDashboard';
import { Users, BookOpen, FileText, CheckCircle, XCircle, Bell, Send, Filter, Search, Trash2, Eye, EyeOff, UserCheck, UserX, TrendingUp, Calendar, Activity, Package, User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import swal from 'sweetalert';

const CHART_COLORS = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];

const AdminDashboard = () => {
    const { user, token, updateUser } = useAuth();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        if (user?.mustChangePassword === true) setShowPasswordModal(true);
    }, [user]);

    const [stats, setStats] = useState({
        totalStudents: 0,
        totalStaff: 0,
        pendingApprovals: 0,
        booksIssued: 0,
        activeAlerts: 0
    });

    useEffect(() => {
        if (token) fetchDashboardStats();
    }, [token]);

    // Moved to AdminOverview to avoid double fetching data
    const fetchDashboardStats = () => { };

    return (
        <DashboardLayout role="ADMIN">
            <div style={{ maxWidth: '100%', width: '100%', margin: '0 auto', padding: '0 0.5rem' }}>
                <AnimatePresence>
                    {showPasswordModal && (
                        <PasswordModal // We need to import PasswordModal from StaffDashboard or use a shared one (we will copy it here briefly or import if exported)
                            onClose={() => setShowPasswordModal(false)}
                            onSuccess={() => { updateUser && updateUser({ mustChangePassword: false }); setShowPasswordModal(false); }}
                        />
                    )}
                </AnimatePresence>
                {activeTab === 'overview' && <AdminOverview stats={stats} token={token} />}
                {activeTab === 'requests-students' && <RequestNewStudents token={token} />}
                {activeTab === 'requests-staff' && <RequestNewStaff token={token} />}
                {activeTab === 'users' && <ManageUsersTab token={token} />}
                {activeTab === 'books' && <ManageBooks />}
                {activeTab === 'issue-return' && <IssueReturnTab />}
                {activeTab === 'members' && <MembershipManagement />}
                {activeTab === 'plans' && <ManagePlansTab />}
                {activeTab === 'book-requests' && <BookRequestsTab />}
                {activeTab === 'profile' && <SharedProfileTab user={user} role="ADMIN" onPasswordChangeClick={() => setShowPasswordModal(true)} />}
                {activeTab === 'reports' && <ReportsView token={token} />}
            </div>
        </DashboardLayout>
    );
};

// ============= MANAGE USERS TAB =============
const ManageUsersTab = ({ token }) => {
    const [subTab, setSubTab] = useState('students');
    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <button onClick={() => setSubTab('students')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', color: subTab === 'students' ? 'var(--primary-500)' : 'var(--text-secondary)', fontWeight: '600', borderBottom: subTab === 'students' ? '2px solid var(--primary-500)' : '2px solid transparent' }}>Manage Students</button>
                <button onClick={() => setSubTab('staff')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', color: subTab === 'staff' ? 'var(--primary-500)' : 'var(--text-secondary)', fontWeight: '600', borderBottom: subTab === 'staff' ? '2px solid var(--primary-500)' : '2px solid transparent' }}>Manage Staff</button>
            </div>
            {subTab === 'students' && <ManageStudents token={token} />}
            {subTab === 'staff' && <ManageStaff token={token} />}
        </div>
    );
};

// ============= ADMIN OVERVIEW =============
const AdminOverview = ({ stats, token }) => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeStudents, setActiveStudents] = useState([]);
    const [activeStaff, setActiveStaff] = useState([]);
    const [membersLoading, setMembersLoading] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        fetchRecentRegistrations();
        fetchDashboardStats(); // Now fetches both stats and members
    }, [token]);

    const fetchRecentRegistrations = async () => {
        if (!token) { setLoading(false); return; }
        try {
            const response = await adminAPI.getStudentRegistrations();
            const data = response.data || [];
            setRegistrations(data.slice(0, 5));
        } catch (error) {
            setRegistrations([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardStats = async () => {
        if (!token) return;
        try {
            const [statsRes, studentsRes, staffRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getUsers('STUDENT').catch(() => ({ data: [] })),
                adminAPI.getUsers('STAFF').catch(() => ({ data: [] }))
            ]);
            const data = statsRes.data || {};
            const students = studentsRes.data || [];
            const staff = staffRes.data || [];

            setActiveStudents(students);
            setActiveStaff(staff);

            setStats({
                totalStudents: students.length,
                totalStaff: staff.length,
                pendingApprovals: data.pendingApprovals ?? 0,
                booksIssued: data.booksIssued ?? 0,
                activeAlerts: prev => prev?.activeAlerts || 0
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            setStats(prev => ({ ...prev, pendingApprovals: 0 }));
        }
    };

    const barData = [
        { name: 'Students', count: activeStudents.length, fill: CHART_COLORS[0] },
        { name: 'Staff', count: activeStaff.length, fill: CHART_COLORS[1] },
        { name: 'Pending', count: stats.pendingApprovals || 0, fill: CHART_COLORS[2] },
        { name: 'Books', count: stats.booksIssued || 0, fill: CHART_COLORS[3] },
    ];
    const pieData = [
        { name: 'Students', value: activeStudents.length, fill: CHART_COLORS[0] },
        { name: 'Staff', value: activeStaff.length, fill: CHART_COLORS[1] },
        { name: 'Pending', value: stats.pendingApprovals || 0, fill: CHART_COLORS[2] },
    ].filter(d => d.value > 0);

    return (
        <div style={{ animation: 'slideUp 0.5s ease-out' }}>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard label="Total Students" value={stats.totalStudents || 0} icon={Users} color="#60a5fa" trend="Active members" />
                <StatCard label="Total Staff" value={stats.totalStaff || 0} icon={UserCheck} color="#a855f7" trend="Active members" />
                <StatCard label="Pending Approvals" value={stats.pendingApprovals || 0} icon={Bell} color="#f59e0b" trend="Requires action" />
                <StatCard label="Books Issued" value={stats.booksIssued || 0} icon={BookOpen} color="#10b981" trend="Current circulation" />
            </div>

            {/* Chart and Activity Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Bar Chart */}
                <GlassCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '600', color: 'var(--text-main)' }}>Overview (Bar)</h3>
                        <Activity size={22} style={{ color: 'var(--primary-500)' }} />
                    </div>
                    <div style={{ height: '260px', minHeight: 200 }}>
                        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 13 }} stroke="var(--border-color)" />
                                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 13 }} stroke="var(--border-color)" />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, fontSize: 14 }} labelStyle={{ color: 'var(--text-main)' }} />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Pie Chart */}
                <GlassCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '600', color: 'var(--text-main)' }}>Member Distribution</h3>
                        <TrendingUp size={22} style={{ color: 'var(--primary-500)' }} />
                    </div>
                    <div style={{ height: '260px', minHeight: 200 }}>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                                        {pieData.map((entry, i) => (
                                            <Cell key={i} fill={entry.fill} stroke="var(--bg-card)" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, fontSize: 14 }} />
                                    <Legend wrapperStyle={{ fontSize: 13 }} formatter={(v) => <span style={{ color: 'var(--text-main)' }}>{v}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '1rem' }}>No data yet</div>
                        )}
                    </div>
                </GlassCard>

                {/* Quick Actions */}
                <GlassCard>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.35rem', fontWeight: '600', color: 'var(--text-main)' }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <ActionButton icon={Send} label="Broadcast Alert" onClick={() => toast('Alerts broadcasting coming soon!', { icon: '📢' })} />
                        <Link to="/admin/dashboard?tab=reports" style={{ textDecoration: 'none' }}>
                            <ActionButton icon={FileText} label="Generate Report" />
                        </Link>
                        <Link to="/admin/dashboard?tab=requests-staff" style={{ textDecoration: 'none' }}>
                            <ActionButton icon={Users} label="Add Staff Member" />
                        </Link>
                        <Link to="/admin/dashboard?tab=books" style={{ textDecoration: 'none' }}>
                            <ActionButton icon={BookOpen} label="Add New Book" />
                        </Link>
                    </div>
                </GlassCard>
            </div>

            {/* Recent Registrations */}
            <GlassCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '600', color: 'var(--text-main)' }}>Recent Student Registrations</h3>
                    <Link to="/admin/dashboard?tab=requests-students" style={{ color: 'var(--primary-500)', textDecoration: 'none', fontSize: '1rem', fontWeight: '500' }}>
                        View All →
                    </Link>
                </div>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : registrations.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                            <thead>
                                <tr style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Name</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Email</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Date</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrations.map((reg, idx) => (
                                    <tr key={reg.id ?? idx} style={{ background: 'var(--accent-subtle)', transition: 'all 0.2s' }}>
                                        <td style={{ padding: '1rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', color: 'var(--text-main)', fontWeight: '500' }}>
                                            {reg.personalDetails?.firstName} {reg.personalDetails?.lastName}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{reg.personalDetails?.email}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            {new Date(reg.registrationDate).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                                            <StatusBadge status={reg.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <Users size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p style={{ margin: 0 }}>No recent registrations</p>
                    </div>
                )}
            </GlassCard>

            {/* Active Members */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <GlassCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>Available Students</h3>
                        <Users size={20} style={{ color: 'var(--primary-500)' }} />
                    </div>
                    {membersLoading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
                    ) : activeStudents.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                <thead>
                                    <tr style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'left' }}>
                                        <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Name</th>
                                        <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Student ID</th>
                                        <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeStudents.slice(0, 6).map((student) => (
                                        <tr key={student.id} style={{ background: 'var(--accent-subtle)', transition: 'all 0.2s' }}>
                                            <td style={{ padding: '0.75rem 1rem', color: 'var(--text-main)', fontWeight: '600' }}>
                                                {student.firstName} {student.lastName}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <div style={{
                                                    padding: '0.3rem 0.6rem',
                                                    background: 'rgba(59, 130, 246, 0.15)',
                                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                                    borderRadius: '6px',
                                                    color: 'var(--primary-500)',
                                                    fontWeight: '600',
                                                    fontSize: '0.8rem',
                                                    display: 'inline-block',
                                                    fontFamily: 'monospace'
                                                }}>
                                                    {student.username}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                {student.email}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No approved students yet
                        </div>
                    )}
                </GlassCard>

                <GlassCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>Available Staff</h3>
                        <UserCheck size={20} style={{ color: 'var(--secondary-500)' }} />
                    </div>
                    {membersLoading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
                    ) : activeStaff.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                <thead>
                                    <tr style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'left' }}>
                                        <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Name</th>
                                        <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Staff ID</th>
                                        <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeStaff.slice(0, 6).map((staff) => (
                                        <tr key={staff.id} style={{ background: 'var(--accent-subtle)', transition: 'all 0.2s' }}>
                                            <td style={{ padding: '0.75rem 1rem', color: 'var(--text-main)', fontWeight: '600' }}>
                                                {staff.firstName} {staff.lastName}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <div style={{
                                                    padding: '0.3rem 0.6rem',
                                                    background: 'rgba(139, 92, 246, 0.15)',
                                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                                    borderRadius: '6px',
                                                    color: 'var(--secondary-500)',
                                                    fontWeight: '600',
                                                    fontSize: '0.8rem',
                                                    display: 'inline-block',
                                                    fontFamily: 'monospace'
                                                }}>
                                                    {staff.username}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                {staff.email}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No approved staff yet
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};

// ============= REQUEST NEW STUDENTS (Pending registrations to approve) =============
const RequestNewStudents = ({ token }) => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!token) return;
        fetchRegistrations();
    }, [token]);

    const fetchRegistrations = async () => {
        if (!token) { setLoading(false); return; }
        try {
            const response = await adminAPI.getStudentRegistrations();
            setRegistrations(response.data || []);
        } catch (error) {
            console.error('Failed to fetch registrations:', error);
            toast.error('Failed to load registrations');
            setRegistrations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!token) { swal('Authentication required', 'Please log in again.', 'error'); return; }
        try {
            const response = await adminAPI.approveRegistration(id);
            swal('Student approved', `Login ID: ${response.data?.username || id}. They will receive an email with credentials.`, 'success', { button: 'OK' });
            fetchRegistrations();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to approve student';
            swal('Approval failed', errorMsg, 'error');
        }
    };

    const handleReject = async (id) => {
        if (!token) return;
        const reason = window.prompt('Please provide a reason for rejection:');
        if (!reason?.trim()) { toast.error('Rejection reason is required'); return; }
        try {
            await adminAPI.rejectRegistration(id, { rejectionReason: reason });
            toast.success('Student rejected');
            fetchRegistrations();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject');
        }
    };

    const pending = registrations.filter(r => r.status === 'PENDING');
    const filtered = pending.filter(reg => {
        const s = searchTerm.toLowerCase();
        const p = reg.personalDetails || {};
        return p.firstName?.toLowerCase().includes(s) || p.lastName?.toLowerCase().includes(s) || p.email?.toLowerCase().includes(s);
    });

    return (
        <div style={{ animation: 'slideUp 0.5s ease-out' }}>
            <GlassCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '600', color: 'var(--text-main)' }}>New Student Requests</h2>
                    <div style={{ position: 'relative', minWidth: '260px' }}>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem',
                                background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                                borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none'
                            }}
                        />
                        <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    </div>
                </div>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : filtered.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                            <thead>
                                <tr style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Student</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Email</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Phone</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((reg) => (
                                    <tr key={reg.id} style={{ background: 'var(--accent-subtle)', borderRadius: '8px' }}>
                                        <td style={{ padding: '1rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', color: 'var(--text-main)', fontWeight: '600' }}>
                                            {reg.personalDetails?.firstName} {reg.personalDetails?.lastName}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{reg.personalDetails?.email}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{reg.personalDetails?.phone || 'N/A'}</td>
                                        <td style={{ padding: '1rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <IconButton icon={CheckCircle} color="#10b981" onClick={() => handleApprove(reg.id)} title="Approve" />
                                                <IconButton icon={XCircle} color="#ef4444" onClick={() => handleReject(reg.id)} title="Reject" />
                                                <IconButton icon={Eye} color="var(--primary-500)" onClick={() => { setSelectedRegistration(reg); setShowModal(true); }} title="View Details" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <Users size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                        <p style={{ margin: 0 }}>No pending student requests</p>
                    </div>
                )}
            </GlassCard>
            <AnimatePresence>
                {showModal && selectedRegistration && (
                    <ApprovalModal
                        registration={selectedRegistration}
                        onClose={() => { setShowModal(false); setSelectedRegistration(null); }}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        token={token}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// ============= REQUEST NEW STAFF (Pending staff registrations) =============
const RequestNewStaff = ({ token }) => {
    const [staffMembers, setStaffMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!token) return;
        fetchStaff();
    }, [token]);

    const fetchStaff = async () => {
        if (!token) { setLoading(false); return; }
        try {
            const response = await adminAPI.getStaffRegistrations();
            setStaffMembers(response.data || []);
        } catch (error) {
            toast.error('Failed to load staff requests');
            setStaffMembers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!token) return;
        try {
            const response = await adminAPI.approveRegistration(id);
            swal('Staff approved', `Staff ID: ${response.data?.username || id}. They will receive an email with credentials.`, 'success', { button: 'OK' });
            fetchStaff();
        } catch (error) {
            swal('Approval failed', error.response?.data?.message || 'Failed to approve staff', 'error');
        }
    };

    const handleReject = async (id) => {
        if (!token) return;
        const reason = window.prompt('Please provide a reason for rejection:');
        if (!reason?.trim()) { toast.error('Rejection reason is required'); return; }
        try {
            await adminAPI.rejectRegistration(id, { rejectionReason: reason });
            toast.success('Staff rejected');
            fetchStaff();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject');
        }
    };

    const pending = staffMembers.filter(s => s.status === 'PENDING');
    const filtered = pending.filter(staff => {
        const s = searchTerm.toLowerCase();
        const p = staff.personalDetails || {};
        return p.firstName?.toLowerCase().includes(s) || p.lastName?.toLowerCase().includes(s) || p.email?.toLowerCase().includes(s);
    });

    return (
        <div style={{ animation: 'slideUp 0.5s ease-out' }}>
            <GlassCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '600', color: 'var(--text-main)' }}>New Staff Requests</h2>
                    <div style={{ position: 'relative', minWidth: '260px' }}>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem',
                                background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                                borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none'
                            }}
                        />
                        <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    </div>
                </div>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : filtered.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                            <thead>
                                <tr style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Staff</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Email</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Phone</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((reg) => (
                                    <tr key={reg.id} style={{ background: 'var(--accent-subtle)', borderRadius: '8px' }}>
                                        <td style={{ padding: '1rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', color: 'var(--text-main)', fontWeight: '600' }}>
                                            {reg.personalDetails?.firstName} {reg.personalDetails?.lastName}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{reg.personalDetails?.email}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{reg.personalDetails?.phone || 'N/A'}</td>
                                        <td style={{ padding: '1rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <IconButton icon={CheckCircle} color="#10b981" onClick={() => handleApprove(reg.id)} title="Approve" />
                                                <IconButton icon={XCircle} color="#ef4444" onClick={() => handleReject(reg.id)} title="Reject" />
                                                <IconButton icon={Eye} color="var(--primary-500)" onClick={() => { setSelectedRegistration(reg); setShowModal(true); }} title="View Details" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <User size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                        <p style={{ margin: 0 }}>No pending staff requests</p>
                    </div>
                )}
            </GlassCard>
            <AnimatePresence>
                {showModal && selectedRegistration && (
                    <ApprovalModal
                        registration={selectedRegistration}
                        onClose={() => { setShowModal(false); setSelectedRegistration(null); }}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        token={token}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// ============= USER DETAILS MODAL (Simple view for approved users) =============
const UserDetailsModal = ({ user, onClose, title }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '2rem', overflowY: 'auto'
        }}
        onClick={onClose}
    >
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
                background: 'var(--bg-card)', borderRadius: '16px',
                padding: '2rem', maxWidth: '420px', width: '100%',
                boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>{title}</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <DetailRow label="Name" value={`${user.firstName || ''} ${user.lastName || ''}`.trim()} />
                <DetailRow label="Username / ID" value={user.username} />
                <DetailRow label="Email" value={user.email} />
                <DetailRow label="Phone" value={user.phoneNumber || 'N/A'} />
                <DetailRow label="Role" value={user.role || '—'} />
            </div>
            <button
                onClick={onClose}
                style={{
                    marginTop: '1.5rem', width: '100%', padding: '0.75rem',
                    borderRadius: '12px', border: '1px solid var(--border-color)',
                    background: 'var(--accent-subtle)', color: 'var(--primary-500)',
                    fontWeight: '600', cursor: 'pointer'
                }}
            >
                Close
            </button>
        </motion.div>
    </motion.div>
);

const DetailRow = ({ label, value }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</span>
        <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '500' }}>{value || '—'}</span>
    </div>
);

// ============= MANAGE STUDENTS (Approved only, view details) =============
const ManageStudents = ({ token }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (!token) return;
        fetchStudents();
    }, [token]);

    const fetchStudents = async () => {
        if (!token) { setLoading(false); return; }
        try {
            const response = await adminAPI.getUsers('STUDENT');
            setStudents(response.data || []);
        } catch (error) {
            toast.error('Failed to load students');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = students.filter(s => {
        const q = searchTerm.toLowerCase();
        return (s.firstName + ' ' + s.lastName).toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.username?.toLowerCase().includes(q);
    });

    return (
        <div style={{ animation: 'slideUp 0.5s ease-out' }}>
            <GlassCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '600', color: 'var(--text-main)' }}>Approved Students</h2>
                    <div style={{ position: 'relative', minWidth: '260px' }}>
                        <input
                            type="text"
                            placeholder="Search by name, email or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem',
                                background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                                borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none'
                            }}
                        />
                        <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    </div>
                </div>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : filtered.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                            <thead>
                                <tr style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Name</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Student ID</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Email</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Phone</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s) => (
                                    <tr key={s.id} style={{ background: 'var(--accent-subtle)' }}>
                                        <td style={{ padding: '1rem', color: 'var(--text-main)', fontWeight: '600' }}>{s.firstName} {s.lastName}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '0.3rem 0.6rem', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', color: 'var(--primary-500)', fontWeight: '600', fontSize: '0.85rem', fontFamily: 'monospace' }}>{s.username}</span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{s.email}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{s.phoneNumber || 'N/A'}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <IconButton icon={Eye} color="var(--primary-500)" onClick={() => setSelectedUser(s)} title="View Details" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <Users size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                        <p style={{ margin: 0 }}>No approved students</p>
                    </div>
                )}
            </GlassCard>
            <AnimatePresence>
                {selectedUser && (
                    <UserDetailsModal key={selectedUser.id} user={selectedUser} onClose={() => setSelectedUser(null)} title="Student Details" />
                )}
            </AnimatePresence>
        </div>
    );
};

// ============= MANAGE STAFF (Approved only, view details) =============
const ManageStaff = ({ token }) => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (!token) return;
        fetchStaff();
    }, [token]);

    const fetchStaff = async () => {
        if (!token) { setLoading(false); return; }
        try {
            const response = await adminAPI.getUsers('STAFF');
            setStaff(response.data || []);
        } catch (error) {
            toast.error('Failed to load staff');
            setStaff([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = staff.filter(s => {
        const q = searchTerm.toLowerCase();
        return (s.firstName + ' ' + s.lastName).toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.username?.toLowerCase().includes(q);
    });

    return (
        <div style={{ animation: 'slideUp 0.5s ease-out' }}>
            <GlassCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '600', color: 'var(--text-main)' }}>Approved Staff</h2>
                    <div style={{ position: 'relative', minWidth: '260px' }}>
                        <input
                            type="text"
                            placeholder="Search by name, email or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem',
                                background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                                borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none'
                            }}
                        />
                        <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    </div>
                </div>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : filtered.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                            <thead>
                                <tr style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Name</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Staff ID</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Email</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Phone</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s) => (
                                    <tr key={s.id} style={{ background: 'var(--accent-subtle)' }}>
                                        <td style={{ padding: '1rem', color: 'var(--text-main)', fontWeight: '600' }}>{s.firstName} {s.lastName}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '0.3rem 0.6rem', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px', color: 'var(--secondary-500)', fontWeight: '600', fontSize: '0.85rem', fontFamily: 'monospace' }}>{s.username}</span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{s.email}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{s.phoneNumber || 'N/A'}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <IconButton icon={Eye} color="var(--secondary-500)" onClick={() => setSelectedUser(s)} title="View Details" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <UserCheck size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                        <p style={{ margin: 0 }}>No approved staff</p>
                    </div>
                )}
            </GlassCard>
            <AnimatePresence>
                {selectedUser && (
                    <UserDetailsModal key={selectedUser.id} user={selectedUser} onClose={() => setSelectedUser(null)} title="Staff Details" />
                )}
            </AnimatePresence>
        </div>
    );
};

// ============= LIBRARY MANAGEMENT =============
const LibraryManagement = ({ token }) => {
    const [libTab, setLibTab] = useState('books');
    return (
        <div style={{ animation: 'slideUp 0.5s ease-out' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {[
                    { key: 'books', label: 'Books Catalog' },
                    { key: 'issue', label: 'Issue a Book' },
                    { key: 'issuances', label: 'All Issuances' },
                    { key: 'overdue', label: 'Overdue' },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setLibTab(t.key)}
                        style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '10px',
                            border: libTab === t.key ? '1px solid var(--primary-500)' : '1px solid var(--border-color)',
                            background: libTab === t.key ? 'var(--accent-subtle)' : 'transparent',
                            color: libTab === t.key ? 'var(--primary-500)' : 'var(--text-secondary)',
                            cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s'
                        }}
                    >{t.label}</button>
                ))}
            </div>
            {libTab === 'books' && <AdminBooksTab token={token} />}
            {libTab === 'issue' && <IssueBookTab token={token} />}
            {libTab === 'issuances' && <IssuancesTab token={token} />}
            {libTab === 'overdue' && <OverdueTab token={token} />}
        </div>
    );
};

// ---- Admin Books Tab ----
const AdminBooksTab = ({ token }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [genreFilter, setGenreFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [genres, setGenres] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editBook, setEditBook] = useState(null);
    const [form, setForm] = useState({ title: '', author: '', isbn: '', publisher: '', genre: '', publicationYear: '', totalCopies: 1, description: '' });

    useEffect(() => { fetchBooks(); fetchGenres(); }, []);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const { libraryAPI } = await import('../services/api');
            const params = {};
            if (search) params.query = search;
            if (genreFilter) params.genre = genreFilter;
            if (statusFilter) params.status = statusFilter;
            const res = await libraryAPI.getBooks(params);
            setBooks(res.data || []);
        } catch { setBooks([]); } finally { setLoading(false); }
    };

    const fetchGenres = async () => {
        try {
            const { libraryAPI } = await import('../services/api');
            const res = await libraryAPI.getGenres();
            setGenres(res.data || []);
        } catch { setGenres([]); }
    };

    const handleSave = async () => {
        try {
            const { libraryAPI } = await import('../services/api');
            const payload = { ...form, totalCopies: parseInt(form.totalCopies) || 1, publicationYear: form.publicationYear ? parseInt(form.publicationYear) : undefined };
            if (editBook) { await libraryAPI.updateBook(editBook.id, payload); toast.success('Book updated!'); }
            else { await libraryAPI.addBook(payload); toast.success('Book added!'); }
            setShowForm(false); setEditBook(null); setForm({ title: '', author: '', isbn: '', publisher: '', genre: '', publicationYear: '', totalCopies: 1, description: '' });
            fetchBooks(); fetchGenres();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed to save book'); }
    };

    const handleDelete = async (id) => {
        const ok = window.confirm('Delete this book? This cannot be undone.');
        if (!ok) return;
        try {
            const { libraryAPI } = await import('../services/api');
            await libraryAPI.deleteBook(id); toast.success('Book deleted'); fetchBooks();
        } catch (e) { toast.error(e.response?.data?.message || 'Cannot delete book'); }
    };

    const openEdit = (book) => {
        setEditBook(book);
        setForm({ title: book.title || '', author: book.author || '', isbn: book.isbn || '', publisher: book.publisher || '', genre: book.genre || '', publicationYear: book.publicationYear || '', totalCopies: book.totalCopies || 1, description: book.description || '' });
        setShowForm(true);
    };

    return (
        <>
            <GlassCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-main)' }}>Books Catalog</h2>
                    <button onClick={() => { setShowForm(true); setEditBook(null); setForm({ title: '', author: '', isbn: '', publisher: '', genre: '', publicationYear: '', totalCopies: 1, description: '' }); }}
                        style={{ padding: '0.65rem 1.2rem', borderRadius: '12px', background: 'var(--primary-500)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                        + Add Book
                    </button>
                </div>
                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <input type="text" placeholder="Search title, author, ISBN..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchBooks()}
                            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.4rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }} />
                        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    </div>
                    <select value={genreFilter} onChange={e => { setGenreFilter(e.target.value); }} style={{ padding: '0.6rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', cursor: 'pointer', outline: 'none' }}>
                        <option value="">All Genres</option>
                        {genres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0.6rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', cursor: 'pointer', outline: 'none' }}>
                        <option value="">All Status</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="UNAVAILABLE">Unavailable</option>
                    </select>
                    <button onClick={fetchBooks} style={{ padding: '0.6rem 1.1rem', borderRadius: '10px', background: 'var(--accent-subtle)', border: '1px solid var(--border-color)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>Search</button>
                </div>
                {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
                    : books.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                <thead>
                                    <tr style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textAlign: 'left' }}>
                                        <th style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>Title</th>
                                        <th style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>Author</th>
                                        <th style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>Genre</th>
                                        <th style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>ISBN</th>
                                        <th style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>Copies</th>
                                        <th style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>Status</th>
                                        <th style={{ padding: '0.6rem 1rem', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {books.map(b => (
                                        <tr key={b.id} style={{ background: 'var(--accent-subtle)' }}>
                                            <td style={{ padding: '0.9rem 1rem', color: 'var(--text-main)', fontWeight: '600', maxWidth: '200px' }}>{b.title}</td>
                                            <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{b.author}</td>
                                            <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{b.genre || '—'}</td>
                                            <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem', fontFamily: 'monospace' }}>{b.isbn || '—'}</td>
                                            <td style={{ padding: '0.9rem 1rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>{b.availableCopies}/{b.totalCopies}</td>
                                            <td style={{ padding: '0.9rem 1rem' }}>
                                                <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '600', background: b.status === 'AVAILABLE' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: b.status === 'AVAILABLE' ? '#10b981' : '#ef4444', border: `1px solid ${b.status === 'AVAILABLE' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}` }}>{b.status}</span>
                                            </td>
                                            <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <IconButton icon={Eye} color="var(--primary-500)" onClick={() => openEdit(b)} title="Edit" />
                                                    <IconButton icon={Trash2} color="#ef4444" onClick={() => handleDelete(b.id)} title="Delete" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                            <p style={{ margin: 0 }}>No books found. Add your first book!</p>
                        </div>
                    )}
            </GlassCard>

            {/* Book Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}
                        onClick={() => setShowForm(false)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '2rem', maxWidth: '560px', width: '100%', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>{editBook ? 'Edit Book' : 'Add New Book'}</h3>
                                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {[
                                    { key: 'title', label: 'Title *', full: true },
                                    { key: 'author', label: 'Author *' },
                                    { key: 'isbn', label: 'ISBN' },
                                    { key: 'publisher', label: 'Publisher' },
                                    { key: 'genre', label: 'Genre' },
                                    { key: 'publicationYear', label: 'Year', type: 'number' },
                                    { key: 'totalCopies', label: 'Total Copies', type: 'number' },
                                ].map(f => (
                                    <div key={f.key} style={{ gridColumn: f.full ? 'span 2' : 'span 1' }}>
                                        <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '500' }}>{f.label}</label>
                                        <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                            style={{ width: '100%', padding: '0.65rem 0.9rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                ))}
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '500' }}>Description</label>
                                    <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={3}
                                        style={{ width: '100%', padding: '0.65rem 0.9rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                <button onClick={handleSave} style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: 'var(--primary-500)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem' }}>
                                    {editBook ? 'Update Book' : 'Add Book'}
                                </button>
                                <button onClick={() => setShowForm(false)} style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'var(--accent-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// ---- Issue Book Tab ----
const IssueBookTab = ({ token }) => {
    const [books, setBooks] = useState([]);
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState({ bookId: '', studentId: '', dueDate: '', notes: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const { libraryAPI } = await import('../services/api');
                const [booksRes, studentsRes] = await Promise.all([
                    libraryAPI.getBooks({ status: 'AVAILABLE' }),
                    adminAPI.getUsers('STUDENT'),
                ]);
                setBooks(booksRes.data || []);
                setStudents(studentsRes.data || []);
            } catch { }
        };
        loadData();
    }, []);

    const handleIssue = async () => {
        if (!form.bookId || !form.studentId || !form.dueDate) { toast.error('Book, student, and due date are required'); return; }
        setLoading(true);
        try {
            const { libraryAPI } = await import('../services/api');
            await libraryAPI.issueBook({ bookId: parseInt(form.bookId), studentId: parseInt(form.studentId), dueDate: form.dueDate, notes: form.notes });
            toast.success('Book issued successfully!');
            setForm({ bookId: '', studentId: '', dueDate: '', notes: '' });
            // Refresh available books
            const res = await libraryAPI.getBooks({ status: 'AVAILABLE' });
            setBooks(res.data || []);
        } catch (e) { toast.error(e.response?.data?.message || 'Failed to issue book'); }
        finally { setLoading(false); }
    };

    const defaultDue = new Date(); defaultDue.setDate(defaultDue.getDate() + 14);
    const defaultDueStr = defaultDue.toISOString().split('T')[0];

    return (
        <GlassCard>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-main)' }}>Issue a Book to Student</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', maxWidth: '800px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '500' }}>Book *</label>
                    <select value={form.bookId} onChange={e => setForm(p => ({ ...p, bookId: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.9rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}>
                        <option value="">— Select Available Book —</option>
                        {books.map(b => <option key={b.id} value={b.id}>{b.title} by {b.author} ({b.availableCopies} left)</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '500' }}>Student *</label>
                    <select value={form.studentId} onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.9rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}>
                        <option value="">— Select Student —</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.username})</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '500' }}>Due Date *</label>
                    <input type="date" value={form.dueDate || defaultDueStr} min={new Date().toISOString().split('T')[0]} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                        style={{ width: '100%', padding: '0.65rem 0.9rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '500' }}>Notes</label>
                    <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." style={{ width: '100%', padding: '0.65rem 0.9rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
            </div>
            <button onClick={handleIssue} disabled={loading} style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', borderRadius: '12px', background: 'var(--primary-500)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Issuing...' : '✅ Issue Book'}
            </button>
        </GlassCard>
    );
};

// ---- Issuances Tab ----
const IssuancesTab = ({ token }) => {
    const [issuances, setIssuances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => { fetchIssuances(); }, [statusFilter]);

    const fetchIssuances = async () => {
        setLoading(true);
        try {
            const { libraryAPI } = await import('../services/api');
            const res = await libraryAPI.getAllIssuances(statusFilter || undefined);
            setIssuances(res.data || []);
        } catch { setIssuances([]); } finally { setLoading(false); }
    };

    const handleReturn = async (issuanceId) => {
        try {
            const { libraryAPI } = await import('../services/api');
            const res = await libraryAPI.returnBook(issuanceId);
            const penalty = res.data?.penaltyAmount;
            if (penalty > 0) toast.success(`Book returned! Penalty: ₹${penalty}`);
            else toast.success('Book returned successfully!');
            fetchIssuances();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed to return book'); }
    };

    return (
        <GlassCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-main)' }}>All Issuances</h2>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0.6rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', cursor: 'pointer', outline: 'none' }}>
                    <option value="">All Status</option>
                    <option value="ISSUED">Issued</option>
                    <option value="RETURNED">Returned</option>
                </select>
            </div>
            {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
                : issuances.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                            <thead>
                                <tr style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textAlign: 'left' }}>
                                    <th style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>Book</th>
                                    <th style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>Student</th>
                                    <th style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>Issued</th>
                                    <th style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>Due</th>
                                    <th style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>Status</th>
                                    <th style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>Penalty</th>
                                    <th style={{ padding: '0.6rem 1rem', fontWeight: '600', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issuances.map(i => {
                                    const isOverdue = i.status === 'ISSUED' && new Date(i.dueDate) < new Date();
                                    return (
                                        <tr key={i.id} style={{ background: 'var(--accent-subtle)' }}>
                                            <td style={{ padding: '0.9rem 1rem', color: 'var(--text-main)', fontWeight: '600', maxWidth: 180 }}>{i.book?.title}</td>
                                            <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{i.student?.firstName} {i.student?.lastName}</td>
                                            <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{i.issueDate}</td>
                                            <td style={{ padding: '0.9rem 1rem', color: isOverdue ? '#ef4444' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: isOverdue ? '700' : '400' }}>{i.dueDate}</td>
                                            <td style={{ padding: '0.9rem 1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '600',
                                                    background: i.status === 'RETURNED' ? 'rgba(16,185,129,0.15)' : isOverdue ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
                                                    color: i.status === 'RETURNED' ? '#10b981' : isOverdue ? '#ef4444' : '#60a5fa',
                                                    border: `1px solid ${i.status === 'RETURNED' ? 'rgba(16,185,129,0.4)' : isOverdue ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.4)'}`
                                                }}>
                                                    {isOverdue && i.status === 'ISSUED' ? 'OVERDUE' : i.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.9rem 1rem', color: i.penaltyAmount > 0 ? '#ef4444' : 'var(--text-secondary)', fontWeight: i.penaltyAmount > 0 ? '700' : '400', fontSize: '0.9rem' }}>
                                                {i.penaltyAmount > 0 ? `₹${i.penaltyAmount}` : '—'}
                                            </td>
                                            <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                                                {i.status === 'ISSUED' && (
                                                    <button onClick={() => handleReturn(i.id)} style={{ padding: '0.4rem 0.85rem', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>Return</button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p style={{ margin: 0 }}>No issuance records found.</p>
                    </div>
                )}
        </GlassCard>
    );
};

// ---- Overdue Tab ----
const OverdueTab = ({ token }) => {
    const [overdues, setOverdues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { libraryAPI } = await import('../services/api');
                const res = await libraryAPI.getOverdueIssuances();
                setOverdues(res.data || []);
            } catch { setOverdues([]); } finally { setLoading(false); }
        };
        fetch();
    }, []);

    const handleReturn = async (issuanceId) => {
        try {
            const { libraryAPI } = await import('../services/api');
            const res = await libraryAPI.returnBook(issuanceId);
            toast.success(`Book returned! Penalty: ₹${res.data?.penaltyAmount || 0}`);
            setOverdues(prev => prev.filter(o => o.id !== issuanceId));
        } catch (e) { toast.error(e.response?.data?.message || 'Failed to return'); }
    };

    return (
        <GlassCard>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={20} /> Overdue Books
            </h2>
            {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
                : overdues.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                            <thead>
                                <tr style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textAlign: 'left' }}>
                                    <th style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>Book</th>
                                    <th style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>Student</th>
                                    <th style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>Due Date</th>
                                    <th style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>Days Overdue</th>
                                    <th style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>Est. Penalty</th>
                                    <th style={{ padding: '0.6rem 1rem', fontWeight: '600', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {overdues.map(o => {
                                    const daysLate = Math.ceil((new Date() - new Date(o.dueDate)) / (1000 * 60 * 60 * 24));
                                    return (
                                        <tr key={o.id} style={{ background: 'rgba(239,68,68,0.06)' }}>
                                            <td style={{ padding: '0.9rem 1rem', color: 'var(--text-main)', fontWeight: '600' }}>{o.book?.title}</td>
                                            <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{o.student?.firstName} {o.student?.lastName}</td>
                                            <td style={{ padding: '0.9rem 1rem', color: '#ef4444', fontWeight: '600' }}>{o.dueDate}</td>
                                            <td style={{ padding: '0.9rem 1rem', color: '#ef4444', fontWeight: '700' }}>{daysLate} days</td>
                                            <td style={{ padding: '0.9rem 1rem', color: '#ef4444', fontWeight: '700' }}>₹{daysLate * 5}</td>
                                            <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                                                <button onClick={() => handleReturn(o.id)} style={{ padding: '0.4rem 0.85rem', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>Return</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#10b981' }}>
                        <CheckCircle size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                        <p style={{ margin: 0, fontWeight: '600' }}>No overdue books!</p>
                    </div>
                )}
        </GlassCard>
    );
};

// ============= REPORTS VIEW =============
const ReportsView = ({ token }) => {
    const reportBarData = [
        { name: 'Jan', value: 12 },
        { name: 'Feb', value: 19 },
        { name: 'Mar', value: 15 },
        { name: 'Apr', value: 22 },
        { name: 'May', value: 18 },
        { name: 'Jun', value: 25 },
    ];
    const reportPieData = [
        { name: 'Students', value: 45, fill: CHART_COLORS[0] },
        { name: 'Staff', value: 15, fill: CHART_COLORS[1] },
        { name: 'Books', value: 120, fill: CHART_COLORS[2] },
        { name: 'Issued', value: 38, fill: CHART_COLORS[3] },
    ];
    return (
        <div style={{ animation: 'slideUp 0.5s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
                <GlassCard>
                    <h2 style={{ margin: '0 0 2rem 0', fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-main)' }}>Monthly Activity</h2>
                    <div style={{ height: '280px', minHeight: 200 }}>
                        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                            <BarChart data={reportBarData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 14 }} stroke="var(--border-color)" />
                                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 14 }} stroke="var(--border-color)" />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, fontSize: 14 }} />
                                <Bar dataKey="value" fill="var(--primary-500)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
                <GlassCard>
                    <h2 style={{ margin: '0 0 2rem 0', fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-main)' }}>Resource Distribution</h2>
                    <div style={{ height: '280px', minHeight: 200 }}>
                        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                            <PieChart>
                                <Pie data={reportPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                                    {reportPieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} stroke="var(--bg-card)" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, fontSize: 14 }} />
                                <Legend formatter={(v) => <span style={{ color: 'var(--text-main)', fontSize: 14 }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

// ============= REUSABLE COMPONENTS =============
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
    <div style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '2rem',
        ...style
    }}>
        {children}
    </div>
);

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
    <GlassCard style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: `${color}20`,
                border: `1px solid ${color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color
            }}>
                <Icon size={28} strokeWidth={2.5} />
            </div>
        </div>
        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '2.2rem', fontWeight: '700', color: 'var(--text-main)' }}>
            {typeof value === 'number' || !isNaN(Number(value)) ? <AnimatedCounter value={value} /> : value}
        </h3>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-main)', fontWeight: '500' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{trend}</p>
    </GlassCard>
);

const ActionButton = ({ icon: Icon, label }) => (
    <button style={{
        padding: '1rem',
        background: 'var(--accent-subtle)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        color: 'var(--text-main)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        transition: 'all 0.2s',
        fontWeight: '500',
        fontSize: '0.9rem'
    }}
        onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-subtle)';
            e.currentTarget.style.borderColor = 'var(--primary-500)';
            e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--accent-subtle)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.transform = 'translateY(0)';
        }}
    >
        <Icon size={24} style={{ color: 'var(--primary-500)' }} />
        <span>{label}</span>
    </button>
);

const StatusBadge = ({ status }) => {
    const styles = {
        PENDING: { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.4)', color: '#fbbf24' },
        APPROVED: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', color: '#10b981' },
        REJECTED: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }
    };
    const style = styles[status] || styles.PENDING;

    return (
        <span style={{
            padding: '0.375rem 0.875rem',
            borderRadius: '999px',
            background: style.bg,
            border: `1px solid ${style.border}`,
            color: style.color,
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'inline-block'
        }}>
            {status}
        </span>
    );
};

const IconButton = ({ icon: Icon, color, onClick, title }) => (
    <button
        onClick={onClick}
        title={title}
        style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: color,
            transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.background = `${color}20`;
            e.currentTarget.style.borderColor = `${color}60`;
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--accent-subtle)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
        }}
    >
        <Icon size={18} />
    </button>
);

// Global Animation Styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(styleSheet);

export default AdminDashboard;

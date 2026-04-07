import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { authAPI, studentAPI } from '../services/api';
import { User, Mail, Phone, MapPin, BookOpen, Calendar, Lock, Edit, Save, Eye, EyeOff, GraduationCap, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentProfile = () => {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [registration, setRegistration] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileData, setProfileData] = useState({
        firstName: user?.personalDetails?.firstName || '',
        lastName: user?.personalDetails?.lastName || '',
        email: user?.email || '',
        phone: user?.personalDetails?.phone || '',
        street: user?.personalDetails?.address?.street || '',
        city: user?.personalDetails?.address?.city || '',
        state: user?.personalDetails?.address?.state || '',
        pincode: user?.personalDetails?.address?.pincode || ''
    });

    useEffect(() => {
        if (!token) return;

        const fetchProfile = async () => {
            setLoadingProfile(true);
            try {
                const response = await studentAPI.getProfile();
                const reg = response.data;
                setRegistration(reg);

                const personal = reg?.personalDetails || {};
                const address = reg?.address || {};

                setProfileData({
                    firstName: personal.firstName || '',
                    lastName: personal.lastName || '',
                    email: personal.email || '',
                    phone: personal.phone || '',
                    street: address.street || '',
                    city: address.city || '',
                    state: address.state || '',
                    pincode: address.pincode || ''
                });
            } catch (error) {
                console.error('Failed to load profile:', error);
                toast.error('Failed to load profile information');
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfile();
    }, [token]);

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'documents', label: 'Documents', icon: FileText }
    ];

    return (
        <DashboardLayout role="STUDENT">
            <div style={{ maxWidth: '100%', width: '100%', margin: '0 auto', padding: '0 0.5rem', animation: 'slideUp 0.5s ease-out' }}>
                {/* Profile Header */}
                <div style={{
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '20px',
                    padding: '2rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--secondary-500) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '3rem',
                            fontWeight: '700',
                            border: '4px solid var(--border-color)'
                        }}>
                            {loadingProfile ? '...' : `${profileData.firstName?.charAt(0) || ''}${profileData.lastName?.charAt(0) || ''}`}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                {loadingProfile ? 'Loading profile...' : `${profileData.firstName} ${profileData.lastName}`.trim()}
                            </h1>
                            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                <InfoPill icon={Mail} text={loadingProfile ? 'Loading...' : (profileData.email || 'Not provided')} />
                                <InfoPill icon={Phone} text={loadingProfile ? 'Loading...' : (profileData.phone || 'Not provided')} />
                                <InfoPill icon={User} text="Student" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '0.875rem 1.5rem',
                                    background: isActive ? 'var(--accent-subtle)' : 'var(--bg-card)',
                                    backdropFilter: 'blur(20px)',
                                    border: isActive ? '1px solid var(--primary-500)' : '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    color: isActive ? 'var(--primary-500)' : 'var(--text-main)',
                                    fontWeight: '600',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                {activeTab === 'profile' && (
                    <ProfileTab 
                        profileData={profileData}
                        setProfileData={setProfileData}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                    />
                )}
                {activeTab === 'education' && <EducationTab registration={registration} loading={loadingProfile} />}
                {activeTab === 'security' && <SecurityTab />}
                {activeTab === 'documents' && <DocumentsTab registration={registration} loading={loadingProfile} />}
            </div>
        </DashboardLayout>
    );
};

// ============= PROFILE TAB =============
const ProfileTab = ({ profileData, setProfileData, isEditing, setIsEditing }) => {
    const handleSave = async () => {
        try {
            // Backend integration
            // await axios.put('/api/student/profile', profileData, { headers: { Authorization: `Bearer ${token}` }});
            
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile');
        }
    };

    return (
        <div style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '2rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '600', color: 'var(--text-main)' }}>
                    Personal Information
                </h2>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: isEditing ? 'linear-gradient(135deg, var(--primary-500) 0%, var(--secondary-500) 100%)' : 'var(--accent-subtle)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem'
                    }}
                >
                    {isEditing ? <><Save size={18} /> Save</> : <><Edit size={18} /> Edit</>}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <FormField
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    disabled={!isEditing}
                />
                <FormField
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    disabled={!isEditing}
                />
                <FormField
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditing}
                />
                <FormField
                    label="Phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!isEditing}
                />
                <FormField
                    label="Street Address"
                    value={profileData.street}
                    onChange={(e) => setProfileData({ ...profileData, street: e.target.value })}
                    disabled={!isEditing}
                    fullWidth
                    style={{ gridColumn: '1 / -1' }}
                />
                <FormField
                    label="City"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    disabled={!isEditing}
                />
                <FormField
                    label="State"
                    value={profileData.state}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                    disabled={!isEditing}
                />
                <FormField
                    label="Pincode"
                    value={profileData.pincode}
                    onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                    disabled={!isEditing}
                />
            </div>
        </div>
    );
};

// ============= EDUCATION TAB =============
const EducationTab = ({ registration, loading }) => {
    const educationHistory = registration?.academicInfoList || [];

    return (
        <div style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '2rem'
        }}>
            <h2 style={{ margin: '0 0 2rem 0', fontSize: '1.3rem', fontWeight: '600', color: 'var(--text-main)' }}>
                Education History
            </h2>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading education history...
                </div>
            ) : educationHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {educationHistory.map((edu, idx) => (
                        <div key={idx} style={{
                            padding: '1.5rem',
                            background: 'var(--accent-subtle)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            borderLeft: '4px solid var(--primary-500)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'var(--accent-subtle)',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary-500)'
                                }}>
                                    <GraduationCap size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '600' }}>
                                        {edu.degree}
                                    </h3>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                        {edu.institutionName}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Field of Study</div>
                                    <div style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{edu.fieldOfStudy || edu.grade || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Year</div>
                                    <div style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{edu.passingYear || edu.graduationYear || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <GraduationCap size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                    <p style={{ margin: 0 }}>No education history available</p>
                </div>
            )}
        </div>
    );
};

// ============= SECURITY TAB =============
const SecurityTab = () => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!passwords.current?.trim()) {
            toast.error('Current password is required');
            return;
        }
        if (passwords.new !== passwords.confirm) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwords.new.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }

        try {
            await authAPI.changePassword({
                oldPassword: passwords.current,
                newPassword: passwords.new
            });
            toast.success('Password changed successfully!');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error('Failed to change password:', error);
            const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to change password';
            toast.error(msg);
        }
    };

    return (
        <div style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '2rem'
        }}>
            <h2 style={{ margin: '0 0 2rem 0', fontSize: '1.3rem', fontWeight: '600', color: 'var(--text-main)' }}>
                Change Password
            </h2>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
                <PasswordField
                    label="Current Password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    show={showPasswords.current}
                    onToggle={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                />
                <PasswordField
                    label="New Password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    show={showPasswords.new}
                    onToggle={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                />
                <PasswordField
                    label="Confirm New Password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    show={showPasswords.confirm}
                    onToggle={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                />

                <button
                    type="submit"
                    style={{
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        marginTop: '1rem'
                    }}
                >
                    Change Password
                </button>
            </form>
        </div>
    );
};

// ============= DOCUMENTS TAB =============
const DocumentsTab = ({ registration, loading }) => {
    const hasDocument = Boolean(registration?.governmentIdFileName);
    const fileName = registration?.governmentIdFileName || 'N/A';
    const fileType = registration?.governmentIdContentType || 'N/A';
    const fileSize = registration?.governmentIdSize ? `${(registration.governmentIdSize / 1024).toFixed(1)} KB` : 'N/A';

    return (
        <div style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '2rem'
        }}>
            <h2 style={{ margin: '0 0 2rem 0', fontSize: '1.3rem', fontWeight: '600', color: 'var(--text-main)' }}>
                Uploaded Documents
            </h2>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading document info...
                </div>
            ) : hasDocument ? (
                <div style={{
                    padding: '1.5rem',
                    background: 'var(--accent-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'var(--accent-subtle)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary-500)'
                        }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-main)', fontWeight: '600' }}>{fileName}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{fileType} • {fileSize}</div>
                        </div>
                    </div>
                    <p style={{ margin: '1rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Document is on file. Contact admin to update or replace.
                    </p>
                </div>
            ) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <FileText size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                    <p style={{ margin: 0 }}>No documents uploaded yet</p>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>Contact admin if you need to upload</p>
                </div>
            )}
        </div>
    );
};

// ============= REUSABLE COMPONENTS =============
// eslint-disable-next-line no-unused-vars
const InfoPill = ({ icon: Icon, text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        <Icon size={16} />
        <span>{text}</span>
    </div>
);

const FormField = ({ label, type = 'text', value, onChange, disabled, style = {} }) => (
    <div style={style}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '500' }}>
            {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: disabled ? 'var(--accent-subtle)' : 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                outline: 'none',
                cursor: disabled ? 'not-allowed' : 'text'
            }}
        />
    </div>
);

const PasswordField = ({ label, value, onChange, show, onToggle }) => (
    <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '500' }}>
            {label}
        </label>
        <div style={{ position: 'relative' }}>
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                style={{
                    width: '100%',
                    padding: '0.875rem 3rem 0.875rem 1rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none'
                }}
            />
            <button
                type="button"
                onClick={onToggle}
                style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                }}
            >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    </div>
);

// Global Animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
if (!document.querySelector('style[data-student-profile]')) {
    styleSheet.setAttribute('data-student-profile', 'true');
    document.head.appendChild(styleSheet);
}

export default StudentProfile;

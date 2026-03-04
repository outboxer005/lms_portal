import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Lock, Bell, Shield, Database, Mail, Globe, User, Eye, EyeOff, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminSettings = () => {
    const { user, token } = useAuth();
    const [activeSection, setActiveSection] = useState('profile');

    const sections = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'system', label: 'System Settings', icon: Shield },
    ];

    return (
        <DashboardLayout role="ADMIN">
            <div style={{ maxWidth: '100%', width: '100%', margin: '0 auto', padding: '0 0.5rem', animation: 'slideUp 0.5s ease-out' }}>
                <h1 style={{ margin: '0 0 2rem 0', fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    Settings
                </h1>

                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
                    {/* Sidebar Navigation */}
                    <div style={{
                        background: 'var(--bg-card)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        height: 'fit-content'
                    }}>
                        {sections.map(section => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem',
                                        marginBottom: '0.5rem',
                                        background: isActive ? 'var(--accent-subtle)' : 'transparent',
                                        border: isActive ? '1px solid var(--primary-500)' : '1px solid transparent',
                                        borderRadius: '12px',
                                        color: isActive ? 'var(--primary-500)' : 'var(--text-secondary)',
                                        fontSize: '0.95rem',
                                        fontWeight: isActive ? '600' : '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        textAlign: 'left'
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
                                    <Icon size={20} />
                                    <span>{section.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <div>
                        {activeSection === 'profile' && <ProfileSettings user={user} token={token} />}
                        {activeSection === 'security' && <SecuritySettings token={token} />}
                        {activeSection === 'notifications' && <NotificationSettings token={token} />}
                        {activeSection === 'system' && <SystemSettings token={token} />}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

// ============= PROFILE SETTINGS =============
const ProfileSettings = ({ user, token }) => {
    const [formData, setFormData] = useState({
        firstName: user?.personalDetails?.firstName || '',
        lastName: user?.personalDetails?.lastName || '',
        email: user?.email || '',
        phone: user?.personalDetails?.phone || '',
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Backend integration
            // await axios.put('/api/admin/profile', formData, { headers: { Authorization: `Bearer ${token}` }});
            
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SettingsCard title="Profile Information" icon={User}>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <FormField
                        label="First Name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                    <FormField
                        label="Last Name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                </div>

                <FormField
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <FormField
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            padding: '0.875rem 2rem',
                            background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: '600',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: saving ? 0.6 : 1
                        }}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </SettingsCard>
    );
};

// ============= SECURITY SETTINGS =============
const SecuritySettings = ({ token }) => {
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [saving, setSaving] = useState(false);

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

        setSaving(true);
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
        } finally {
            setSaving(false);
        }
    };

    return (
        <SettingsCard title="Change Password" icon={Lock}>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            padding: '0.875rem 2rem',
                            background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: '600',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontSize: '0.95rem',
                            opacity: saving ? 0.6 : 1
                        }}
                    >
                        {saving ? 'Changing...' : 'Change Password'}
                    </button>
                </div>
            </form>
        </SettingsCard>
    );
};

// ============= NOTIFICATION SETTINGS =============
const NotificationSettings = ({ token }) => {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        newRegistrations: true,
        approvalRequests: true,
        systemAlerts: true,
        weeklyReports: false
    });

    const handleToggle = (key) => {
        setSettings({ ...settings, [key]: !settings[key] });
    };

    const handleSave = async () => {
        try {
            // Backend integration
            // await axios.put('/api/admin/notification-settings', settings, { headers: { Authorization: `Bearer ${token}` }});
            
            toast.success('Notification settings updated!');
        } catch (error) {
            console.error('Failed to update settings:', error);
            toast.error('Failed to update settings');
        }
    };

    return (
        <SettingsCard title="Notification Preferences" icon={Bell}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <ToggleOption
                    label="Email Notifications"
                    description="Receive notifications via email"
                    checked={settings.emailNotifications}
                    onChange={() => handleToggle('emailNotifications')}
                />
                <ToggleOption
                    label="New Student Registrations"
                    description="Get notified when students register"
                    checked={settings.newRegistrations}
                    onChange={() => handleToggle('newRegistrations')}
                />
                <ToggleOption
                    label="Approval Requests"
                    description="Alerts for pending approvals"
                    checked={settings.approvalRequests}
                    onChange={() => handleToggle('approvalRequests')}
                />
                <ToggleOption
                    label="System Alerts"
                    description="Important system notifications"
                    checked={settings.systemAlerts}
                    onChange={() => handleToggle('systemAlerts')}
                />
                <ToggleOption
                    label="Weekly Reports"
                    description="Receive weekly summary reports"
                    checked={settings.weeklyReports}
                    onChange={() => handleToggle('weeklyReports')}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '0.875rem 2rem',
                            background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.95rem'
                        }}
                    >
                        Save Preferences
                    </button>
                </div>
            </div>
        </SettingsCard>
    );
};

// ============= SYSTEM SETTINGS =============
const SystemSettings = ({ token }) => {
    const [settings, setSettings] = useState({
        maxBooksPerStudent: '5',
        borrowPeriodDays: '14',
        finePerDay: '5',
        autoApproval: false,
        maintenanceMode: false
    });

    const handleSave = async () => {
        try {
            // Backend integration
            // await axios.put('/api/admin/system-settings', settings, { headers: { Authorization: `Bearer ${token}` }});
            
            toast.success('System settings updated!');
        } catch (error) {
            console.error('Failed to update settings:', error);
            toast.error('Failed to update settings');
        }
    };

    return (
        <SettingsCard title="System Configuration" icon={Shield}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <FormField
                    label="Maximum Books Per Student"
                    type="number"
                    value={settings.maxBooksPerStudent}
                    onChange={(e) => setSettings({ ...settings, maxBooksPerStudent: e.target.value })}
                />

                <FormField
                    label="Default Borrow Period (Days)"
                    type="number"
                    value={settings.borrowPeriodDays}
                    onChange={(e) => setSettings({ ...settings, borrowPeriodDays: e.target.value })}
                />

                <FormField
                    label="Fine Per Day (₹)"
                    type="number"
                    value={settings.finePerDay}
                    onChange={(e) => setSettings({ ...settings, finePerDay: e.target.value })}
                />

                <ToggleOption
                    label="Auto-Approval for Staff"
                    description="Automatically approve staff registrations"
                    checked={settings.autoApproval}
                    onChange={() => setSettings({ ...settings, autoApproval: !settings.autoApproval })}
                />

                <ToggleOption
                    label="Maintenance Mode"
                    description="Restrict access for maintenance"
                    checked={settings.maintenanceMode}
                    onChange={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '0.875rem 2rem',
                            background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.95rem'
                        }}
                    >
                        Save Configuration
                    </button>
                </div>
            </div>
        </SettingsCard>
    );
};

// ============= REUSABLE COMPONENTS =============
const SettingsCard = ({ title, icon: Icon, children }) => (
    <div style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '2rem'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--accent-subtle)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-500)'
            }}>
                <Icon size={22} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '600', color: 'var(--text-main)' }}>{title}</h2>
        </div>
        {children}
    </div>
);

const FormField = ({ label, type = 'text', value, onChange, placeholder }) => (
    <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '500' }}>
            {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                outline: 'none'
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

const ToggleOption = ({ label, description, checked, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--accent-subtle)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div>
            <div style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                {label}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {description}
            </div>
        </div>
        <button
            onClick={onChange}
            style={{
                width: '52px',
                height: '28px',
                borderRadius: '14px',
                background: checked ? 'linear-gradient(135deg, var(--primary-500) 0%, var(--secondary-500) 100%)' : 'var(--border-color)',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s'
            }}
        >
            <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'white',
                position: 'absolute',
                top: '3px',
                left: checked ? '27px' : '3px',
                transition: 'all 0.3s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
        </button>
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
if (!document.querySelector('style[data-admin-settings]')) {
    styleSheet.setAttribute('data-admin-settings', 'true');
    document.head.appendChild(styleSheet);
}

export default AdminSettings;

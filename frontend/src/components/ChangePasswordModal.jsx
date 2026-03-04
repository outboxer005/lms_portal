import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { Lock, X, Check, Eye, EyeOff } from 'lucide-react';

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            await authAPI.changePassword({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });
            setSuccess('Password changed successfully');
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => {
                onClose();
                setSuccess('');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
        }}>
            <div className="card slide-up" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2rem',
                position: 'relative',
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--gray-500)',
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'var(--primary-100)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-600)',
                        margin: '0 auto 1rem',
                    }}>
                        <Lock size={30} />
                    </div>
                    <h3 style={{ marginBottom: '0.5rem' }}>Change Password</h3>
                    <p style={{ color: 'var(--gray-600)', margin: 0 }}>
                        Update your account password
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'var(--error-50)',
                        color: 'var(--error-700)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        border: '1px solid var(--error-200)',
                    }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        background: 'var(--success-50)',
                        color: 'var(--success-700)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        border: '1px solid var(--success-200)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}>
                        <Check size={16} />
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Current Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="oldPassword"
                                className="form-input"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--gray-400)',
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="newPassword"
                            className="form-input"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            placeholder="Min. 6 characters"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            className="form-input"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;

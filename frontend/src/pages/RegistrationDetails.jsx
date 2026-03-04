import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { User, Mail, Phone, MapPin, GraduationCap, Briefcase, FileText, CheckCircle, XCircle, Download, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import swal from 'sweetalert';

const RegistrationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRegistration();
    }, [id]);

    const fetchRegistration = async () => {
        try {
            const response = await adminAPI.getRegistrationDetails(id);
            setRegistration(response.data);
        } catch (err) {
            setError('Failed to load registration details');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!window.confirm('Approve this registration? The applicant will receive an email with login credentials.')) return;

        setProcessing(true);
        try {
            await adminAPI.approveRegistration(id);
            await swal('Approved', 'Registration approved successfully. Login credentials have been sent to the applicant via email.', 'success', { button: 'OK' });
            navigate('/admin/dashboard');
        } catch (err) {
            swal('Error', err.response?.data?.message || 'Failed to approve registration.', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            swal('Required', 'Please provide a reason for rejection.', 'warning');
            return;
        }

        setProcessing(true);
        try {
            await adminAPI.rejectRegistration(id, { rejectionReason });
            await swal('Rejected', 'Registration has been rejected. The applicant may reapply with updated information.', 'success', { button: 'OK' });
            navigate('/admin/dashboard');
        } catch (err) {
            swal('Error', err.response?.data?.message || 'Failed to reject registration.', 'error');
        } finally {
            setProcessing(false);
            setShowRejectModal(false);
        }
    };

    const handleDownloadDocument = async () => {
        try {
            const response = await adminAPI.downloadDocument(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `government_id_${registration.registrationId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            swal('Download failed', 'Could not download the document. Please try again.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (error || !registration) {
        return (
            <div className="container" style={{ padding: '4rem 0' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <XCircle size={60} style={{ color: 'var(--error-500)', margin: '0 auto var(--spacing-lg)' }} />
                    <h2 style={{ color: 'var(--error-600)' }}>{error || 'Registration not found'}</h2>
                    <button onClick={() => navigate('/admin/dashboard')} className="btn btn-primary" style={{ marginTop: 'var(--spacing-lg)' }}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: <span className="badge badge-pending"><FileText size={16} /> Pending Review</span>,
            APPROVED: <span className="badge badge-approved"><CheckCircle size={16} /> Approved</span>,
            REJECTED: <span className="badge badge-rejected"><XCircle size={16} /> Rejected</span>,
        };
        return badges[status] || status;
    };

    return (
        <DashboardLayout role="ADMIN">
            <div style={{ padding: '1rem 0', minHeight: '100%', background: 'var(--bg-body)' }}>
                <div className="container">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="btn"
                        style={{
                            background: 'var(--bg-card)',
                            color: 'var(--gray-700)',
                            marginBottom: 'var(--spacing-lg)',
                            border: '1px solid var(--gray-300)',
                        }}
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>

                    {/* Header Card */}
                    <div className="card slide-up" style={{
                        background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-900) 100%)',
                        color: 'white',
                        marginBottom: 'var(--spacing-xl)',
                    }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 style={{ color: 'white', marginBottom: 'var(--spacing-sm)' }}>
                                    {registration.personalDetails?.firstName} {registration.personalDetails?.lastName}
                                </h2>
                                <div style={{ opacity: 0.9, marginBottom: 'var(--spacing-md)' }}>
                                    Registration ID: <code style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: 'var(--radius-sm)',
                                        fontWeight: '700',
                                    }}>
                                        {registration.registrationId}
                                    </code>
                                </div>
                                <div style={{ opacity: 0.9, marginBottom: 'var(--spacing-md)' }}>
                                    Role: <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                        {registration.role || 'STUDENT'}
                                    </span>
                                </div>
                                <div>
                                    {getStatusBadge(registration.status)}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ opacity: 0.8, fontSize: '0.875rem' }}>Registered On</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                                    {new Date(registration.registrationDate).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {registration.status === 'PENDING' && (
                            <div style={{
                                marginTop: 'var(--spacing-xl)',
                                paddingTop: 'var(--spacing-lg)',
                                borderTop: '1px solid rgba(255,255,255,0.2)',
                                display: 'flex',
                                gap: 'var(--spacing-md)',
                            }}>
                                <button
                                    onClick={handleApprove}
                                    disabled={processing}
                                    className="btn btn-success"
                                    style={{ flex: 1 }}
                                >
                                    {processing ? (
                                        <>
                                            <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={20} />
                                            Approve Registration
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={processing}
                                    className="btn btn-error"
                                    style={{ flex: 1 }}
                                >
                                    <XCircle size={20} />
                                    Reject Registration
                                </button>
                            </div>
                        )}

                        {registration.status === 'APPROVED' && registration.generatedUsername && (
                            <div style={{
                                marginTop: 'var(--spacing-xl)',
                                paddingTop: 'var(--spacing-lg)',
                                borderTop: '1px solid rgba(255,255,255,0.2)',
                            }}>
                                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Generated Username:</div>
                                <code style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '1.125rem',
                                    fontWeight: '700',
                                }}>
                                    {registration.generatedUsername}
                                </code>
                            </div>
                        )}

                        {registration.status === 'REJECTED' && registration.rejectionReason && (
                            <div style={{
                                marginTop: 'var(--spacing-xl)',
                                paddingTop: 'var(--spacing-lg)',
                                borderTop: '1px solid rgba(255,255,255,0.2)',
                            }}>
                                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Rejection Reason:</div>
                                <div style={{ opacity: 0.9 }}>{registration.rejectionReason}</div>
                            </div>
                        )}
                    </div>

                    {/* Personal Information */}
                    <div className="card slide-up">
                        <div className="card-header">
                            <h3 className="card-title">
                                <User size={24} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                Personal Information
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label style={{ fontWeight: '600', color: 'var(--gray-600)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                                    Full Name
                                </label>
                                <p style={{ margin: 0, fontSize: '1.125rem' }}>
                                    {registration.personalDetails?.firstName} {registration.personalDetails?.lastName}
                                </p>
                            </div>
                            <div>
                                <label style={{ fontWeight: '600', color: 'var(--gray-600)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                                    <Mail size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                    Email
                                </label>
                                <p style={{ margin: 0 }}>{registration.personalDetails?.email}</p>
                            </div>
                            <div>
                                <label style={{ fontWeight: '600', color: 'var(--gray-600)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                                    <Phone size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                    Phone
                                </label>
                                <p style={{ margin: 0 }}>{registration.personalDetails?.phone}</p>
                            </div>
                            {registration.personalDetails?.contactNo && (
                                <div>
                                    <label style={{ fontWeight: '600', color: 'var(--gray-600)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                                        Contact Number
                                    </label>
                                    <p style={{ margin: 0 }}>{registration.personalDetails.contactNo}</p>
                                </div>
                            )}
                            {registration.personalDetails?.gender && (
                                <div>
                                    <label style={{ fontWeight: '600', color: 'var(--gray-600)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                                        Gender
                                    </label>
                                    <p style={{ margin: 0 }}>{registration.personalDetails.gender}</p>
                                </div>
                            )}
                            {registration.personalDetails?.maritalStatus && (
                                <div>
                                    <label style={{ fontWeight: '600', color: 'var(--gray-600)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                                        Marital Status
                                    </label>
                                    <p style={{ margin: 0 }}>{registration.personalDetails.maritalStatus}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <div className="card slide-up">
                        <div className="card-header">
                            <h3 className="card-title">
                                <MapPin size={24} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                Address
                            </h3>
                        </div>

                        <p style={{ margin: 0, lineHeight: 1.8 }}>
                            {registration.address?.street}<br />
                            {registration.address?.city}, {registration.address?.state}<br />
                            Pincode: {registration.address?.pincode}
                        </p>
                    </div>

                    {/* Academic Information */}
                    {registration.academicInfoList && registration.academicInfoList.length > 0 && (
                        <div className="card slide-up">
                            <div className="card-header">
                                <h3 className="card-title">
                                    <GraduationCap size={24} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                    Academic Information
                                </h3>
                            </div>

                            {registration.academicInfoList.map((academic, index) => (
                                <div key={index} style={{
                                    background: 'var(--gray-50)',
                                    padding: 'var(--spacing-lg)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: index < registration.academicInfoList.length - 1 ? 'var(--spacing-md)' : 0,
                                }}>
                                    <h4 style={{ marginBottom: 'var(--spacing-md)' }}>{academic.degree}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label style={{ fontWeight: '600', color: 'var(--gray-600)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                                                Institution
                                            </label>
                                            <p style={{ margin: 0 }}>{academic.institutionName}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: '600', color: 'var(--gray-600)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                                                Passing Year
                                            </label>
                                            <p style={{ margin: 0 }}>{academic.passingYear}</p>
                                        </div>
                                        {academic.grade && (
                                            <div>
                                                <label style={{ fontWeight: '600', color: 'var(--gray-600)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                                                    Grade
                                                </label>
                                                <p style={{ margin: 0 }}>{academic.grade}</p>
                                            </div>
                                        )}
                                        {academic.gradeInPercentage && (
                                            <div>
                                                <label style={{ fontWeight: '600', color: 'var(--gray-600)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                                                    Percentage
                                                </label>
                                                <p style={{ margin: 0 }}>{academic.gradeInPercentage}%</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Work Experience */}
                    {registration.workExperienceList && registration.workExperienceList.length > 0 && (
                        <div className="card slide-up">
                            <div className="card-header">
                                <h3 className="card-title">
                                    <Briefcase size={24} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                    Work Experience
                                </h3>
                            </div>

                            {registration.workExperienceList.map((work, index) => (
                                <div key={index} style={{
                                    background: 'var(--gray-50)',
                                    padding: 'var(--spacing-lg)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: index < registration.workExperienceList.length - 1 ? 'var(--spacing-md)' : 0,
                                }}>
                                    <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>{work.designation}</h4>
                                    <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-md)' }}>
                                        {work.companyName}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label style={{ fontWeight: '600', color: 'var(--gray-600)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                                                Duration
                                            </label>
                                            <p style={{ margin: 0 }}>
                                                {new Date(work.startDate).toLocaleDateString()} - {work.currentlyWorking ? 'Present' : new Date(work.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {work.ctc && (
                                            <div>
                                                <label style={{ fontWeight: '600', color: 'var(--gray-600)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                                                    CTC
                                                </label>
                                                <p style={{ margin: 0 }}>{work.ctc} LPA</p>
                                            </div>
                                        )}
                                    </div>

                                    {work.reasonForLeaving && (
                                        <div style={{ marginTop: 'var(--spacing-md)' }}>
                                            <label style={{ fontWeight: '600', color: 'var(--gray-600)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                                                Reason for Leaving
                                            </label>
                                            <p style={{ margin: 0 }}>{work.reasonForLeaving}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Government ID Document */}
                    <div className="card slide-up">
                        <div className="card-header">
                            <h3 className="card-title">
                                <FileText size={24} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                Government ID Document
                            </h3>
                        </div>

                        <div style={{
                            background: 'var(--gray-50)',
                            padding: 'var(--spacing-lg)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: '600', marginBottom: '0.25rem' }}>
                                    {registration.governmentIdFileName || 'government_id.pdf'}
                                </p>
                                <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                                    {registration.governmentIdContentType}
                                </p>
                            </div>
                            <button
                                onClick={handleDownloadDocument}
                                className="btn btn-primary"
                            >
                                <Download size={20} />
                                Download Document
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reject Modal */}
                {showRejectModal && (
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
                        zIndex: 9999,
                    }}>
                        <div className="card" style={{
                            maxWidth: '500px',
                            width: '90%',
                            margin: 'var(--spacing-lg)',
                        }}>
                            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Reject Registration</h3>
                            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-lg)' }}>
                                Please provide a reason for rejecting this registration. This will be sent to the student.
                            </p>

                            <div className="form-group">
                                <label className="form-label">Rejection Reason *</label>
                                <textarea
                                    className="form-textarea"
                                    rows="4"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter the reason for rejection..."
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectionReason('');
                                    }}
                                    className="btn"
                                    style={{ background: 'var(--gray-200)', color: 'var(--gray-700)' }}
                                    disabled={processing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="btn btn-error"
                                    disabled={processing || !rejectionReason.trim()}
                                >
                                    {processing ? (
                                        <>
                                            <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={20} />
                                            Confirm Rejection
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default RegistrationDetails;

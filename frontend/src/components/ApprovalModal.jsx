import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { X, User, Mail, Phone, MapPin, GraduationCap, Briefcase, FileText, CheckCircle, XCircle, Download, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const ApprovalModal = ({ registration, onClose, onApprove, onReject, token }) => {
    const [activeTab, setActiveTab] = useState('personal');
    const [idCardUrl, setIdCardUrl] = useState(null);
    const [loadingImage, setLoadingImage] = useState(false);

    const tabs = [
        { id: 'personal', label: 'Personal', icon: User },
        { id: 'address', label: 'Address', icon: MapPin },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'work', label: 'Work', icon: Briefcase },
        { id: 'document', label: 'ID Card', icon: FileText }
    ];

    const loadIdCard = async () => {
        if (idCardUrl) return; // Already loaded
        
        setLoadingImage(true);
        try {
            const response = await adminAPI.downloadDocument(registration.id);
            const imageUrl = URL.createObjectURL(response.data);
            setIdCardUrl(imageUrl);
        } catch (error) {
            console.error('Failed to load ID card:', error);
            toast.error('Failed to load ID card image');
        } finally {
            setLoadingImage(false);
        }
    };

    const handleApprove = () => {
        onApprove(registration.id);
        onClose();
    };

    const handleReject = () => {
        onReject(registration.id);
        onClose();
    };

    // Load ID card when document tab is selected
    React.useEffect(() => {
        if (activeTab === 'document' && registration.governmentIdImage) {
            loadIdCard();
        }
    }, [activeTab]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '2rem',
                overflowY: 'auto'
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'rgba(15, 23, 42, 0.98)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '24px',
                    maxWidth: '900px',
                    width: '100%',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '2rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div>
                        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                            Registration Details
                        </h2>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                            {registration.personalDetails?.firstName} {registration.personalDetails?.lastName} - {registration.role}
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Link
                            to={`/admin/registration/${registration.id}`}
                            onClick={onClose}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(96, 165, 250, 0.2)',
                                border: '1px solid rgba(96, 165, 250, 0.4)',
                                borderRadius: '12px',
                                color: '#60a5fa',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}
                        >
                            <ExternalLink size={18} />
                            Full Page
                        </Link>
                        <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >
                        <X size={20} />
                    </button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '1rem', overflowX: 'auto' }}>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    background: isActive ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
                                    border: isActive ? '1px solid rgba(96, 165, 250, 0.4)' : '1px solid transparent',
                                    borderRadius: '12px',
                                    color: isActive ? '#60a5fa' : '#94a3b8',
                                    fontWeight: isActive ? '600' : '500',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    {activeTab === 'personal' && <PersonalTab data={registration.personalDetails} role={registration.role} />}
                    {activeTab === 'address' && <AddressTab data={registration.address} />}
                    {activeTab === 'education' && <EducationTab data={registration.academicInfoList} />}
                    {activeTab === 'work' && <WorkTab data={registration.workExperienceList} />}
                    {activeTab === 'document' && <DocumentTab idCardUrl={idCardUrl} loading={loadingImage} registrationId={registration.id} token={token} />}
                </div>

                {/* Footer Actions */}
                <div style={{
                    padding: '1.5rem 2rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            padding: '0.5rem 1rem',
                            background: registration.status === 'PENDING' ? 'rgba(251, 191, 36, 0.15)' : 
                                       registration.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : 
                                       'rgba(239, 68, 68, 0.15)',
                            border: registration.status === 'PENDING' ? '1px solid rgba(251, 191, 36, 0.4)' : 
                                   registration.status === 'APPROVED' ? '1px solid rgba(16, 185, 129, 0.4)' : 
                                   '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: '999px',
                            color: registration.status === 'PENDING' ? '#fbbf24' : 
                                  registration.status === 'APPROVED' ? '#10b981' : 
                                  '#ef4444',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                        }}>
                            {registration.status}
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            Registered: {new Date(registration.registrationDate).toLocaleDateString()}
                        </span>
                    </div>
                    
                    {registration.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={handleReject}
                                style={{
                                    padding: '0.875rem 1.5rem',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.4)',
                                    borderRadius: '12px',
                                    color: '#ef4444',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <XCircle size={18} />
                                Reject
                            </button>
                            <button
                                onClick={handleApprove}
                                style={{
                                    padding: '0.875rem 1.5rem',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <CheckCircle size={18} />
                                Approve & Send Credentials
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

// ============= TAB COMPONENTS =============

const PersonalTab = ({ data, role }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <InfoField label="First Name" value={data?.firstName} />
        <InfoField label="Last Name" value={data?.lastName} />
        <InfoField label="Email" value={data?.email} icon={Mail} />
        <InfoField label="Phone" value={data?.phone} icon={Phone} />
        {role === 'STUDENT' && data?.studentId && (
            <InfoField label="Student ID" value={data?.studentId} highlight />
        )}
        <InfoField label="Gender" value={data?.gender || 'Not specified'} />
        <InfoField label="Marital Status" value={data?.maritalStatus || 'Not specified'} />
    </div>
);

const AddressTab = ({ data }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <InfoField label="Street" value={data?.street} fullWidth style={{ gridColumn: '1 / -1' }} />
        <InfoField label="City" value={data?.city} />
        <InfoField label="State" value={data?.state} />
        <InfoField label="Pincode" value={data?.pincode} />
    </div>
);

const EducationTab = ({ data }) => (
    <div>
        {data && data.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {data.map((edu, idx) => (
                    <div key={idx} style={{
                        padding: '1.5rem',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        borderLeft: '4px solid #60a5fa'
                    }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: 'white', fontSize: '1.1rem', fontWeight: '600' }}>
                            {edu.degree}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <InfoField label="Institution" value={edu.institutionName} compact />
                            <InfoField label="Passing Year" value={edu.passingYear} compact />
                            <InfoField label="Grade" value={edu.grade || 'N/A'} compact />
                            <InfoField label="Percentage" value={edu.gradeInPercentage ? `${edu.gradeInPercentage}%` : 'N/A'} compact />
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <EmptyState icon={GraduationCap} message="No education details provided" />
        )}
    </div>
);

const WorkTab = ({ data }) => (
    <div>
        {data && data.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {data.map((work, idx) => (
                    <div key={idx} style={{
                        padding: '1.5rem',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        borderLeft: '4px solid #a855f7'
                    }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: 'white', fontSize: '1.1rem', fontWeight: '600' }}>
                            {work.designation}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <InfoField label="Company" value={work.companyName} compact />
                            <InfoField label="Duration" value={`${work.startDate} to ${work.currentlyWorking ? 'Present' : work.endDate}`} compact />
                            {work.ctc && <InfoField label="CTC" value={`₹${work.ctc}`} compact />}
                            {work.reasonForLeaving && <InfoField label="Reason for Leaving" value={work.reasonForLeaving} compact fullWidth style={{ gridColumn: '1 / -1' }} />}
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <EmptyState icon={Briefcase} message="No work experience provided" />
        )}
    </div>
);

const DocumentTab = ({ idCardUrl, loading, registrationId, token }) => {
    const handleDownload = async () => {
        try {
            const response = await adminAPI.downloadDocument(registrationId);
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = `id_card_${registrationId}.jpg`;
            link.click();
            window.URL.revokeObjectURL(url);
            
            toast.success('ID card downloaded');
        } catch (error) {
            console.error('Failed to download:', error);
            toast.error('Failed to download ID card');
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {loading ? (
                <div style={{ padding: '3rem', color: '#94a3b8' }}>
                    <ImageIcon size={48} style={{ marginBottom: '1rem', opacity: 0.3, animation: 'pulse 2s infinite' }} />
                    <p>Loading ID card...</p>
                </div>
            ) : idCardUrl ? (
                <div>
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        <img 
                            src={idCardUrl} 
                            alt="ID Card" 
                            style={{ 
                                maxWidth: '100%', 
                                maxHeight: '500px', 
                                borderRadius: '8px',
                                objectFit: 'contain'
                            }} 
                        />
                    </div>
                    <button
                        onClick={handleDownload}
                        style={{
                            padding: '0.875rem 1.5rem',
                            background: 'rgba(96, 165, 250, 0.15)',
                            border: '1px solid rgba(96, 165, 250, 0.4)',
                            borderRadius: '12px',
                            color: '#60a5fa',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Download size={18} />
                        Download ID Card
                    </button>
                </div>
            ) : (
                <EmptyState icon={FileText} message="No ID card uploaded" />
            )}
        </div>
    );
};

// ============= REUSABLE COMPONENTS =============

const InfoField = ({ label, value, icon: Icon, highlight, compact, fullWidth, style = {} }) => (
    <div style={{ ...style }}>
        <div style={{ 
            color: '#94a3b8', 
            fontSize: compact ? '0.8rem' : '0.85rem', 
            marginBottom: '0.5rem', 
            fontWeight: '500' 
        }}>
            {label}
        </div>
        <div style={{
            padding: compact ? '0.5rem 0.75rem' : '0.75rem 1rem',
            background: highlight ? 'rgba(96, 165, 250, 0.1)' : 'rgba(255,255,255,0.05)',
            border: highlight ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: highlight ? '#60a5fa' : 'white',
            fontSize: compact ? '0.9rem' : '0.95rem',
            fontWeight: highlight ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: highlight ? 'monospace' : 'inherit'
        }}>
            {Icon && <Icon size={16} />}
            {value || 'Not provided'}
        </div>
    </div>
);

const EmptyState = ({ icon: Icon, message }) => (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <Icon size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
        <p style={{ margin: 0 }}>{message}</p>
    </div>
);

// Animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
    }
`;
if (!document.querySelector('style[data-approval-modal]')) {
    styleSheet.setAttribute('data-approval-modal', 'true');
    document.head.appendChild(styleSheet);
}

export default ApprovalModal;

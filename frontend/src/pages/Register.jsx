import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { UserPlus, CheckCircle, ArrowLeft, LogIn, ChevronRight, Menu, X, Home, AlertCircle, BookOpen, Sun, Moon } from 'lucide-react';
import swal from 'sweetalert';
import {
    MDBBtn,
    MDBContainer,
    MDBCard,
    MDBCardBody,
    MDBCol,
    MDBRow,
    MDBInput,
    MDBCheckbox,
    MDBIcon
} from 'mdb-react-ui-kit';
import Stepper, { Step } from '../components/Stepper';
import { motion, AnimatePresence } from 'motion/react';

const Register = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [registrationId, setRegistrationId] = useState('');
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [navExpanded, setNavExpanded] = useState(false);

    const [formData, setFormData] = useState({
        role: 'STUDENT',
        personalDetails: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            contactNo: '',
            studentId: '',
            dateOfBirth: '',
            gender: '',
            maritalStatus: '',
        },
        address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
        },
        academicInfoList: [
            {
                institutionName: '',
                degree: '',
                passingYear: new Date().getFullYear(),
                grade: '',
                gradeInPercentage: '',
            },
        ],
        workExperienceList: [],
    });

    const [uploadedDocument, setUploadedDocument] = useState(null);

    const handleRoleChange = (e) => {
        setFormData({ ...formData, role: e.target.value });
    };

    const handlePersonalInfoChange = (e) => {
        const updates = {
            [e.target.name]: e.target.value,
        };

        // If phone is updated, also update contactNo (backend requires it)
        if (e.target.name === 'phone') {
            updates.contactNo = e.target.value;
        }

        setFormData({
            ...formData,
            personalDetails: {
                ...formData.personalDetails,
                ...updates,
            },
        });
    };

    const handleAddressChange = (e) => {
        setFormData({
            ...formData,
            address: {
                ...formData.address,
                [e.target.name]: e.target.value,
            },
        });
    };

    const addAcademicInfo = () => {
        setFormData({
            ...formData,
            academicInfoList: [
                ...formData.academicInfoList,
                {
                    institutionName: '',
                    degree: '',
                    passingYear: new Date().getFullYear(),
                    grade: '',
                    gradeInPercentage: '',
                },
            ],
        });
    };

    const removeAcademicInfo = (index) => {
        setFormData({
            ...formData,
            academicInfoList: formData.academicInfoList.filter((_, i) => i !== index),
        });
    };

    const handleAcademicInfoChange = (index, field, value) => {
        const updated = [...formData.academicInfoList];
        updated[index][field] = value;
        setFormData({ ...formData, academicInfoList: updated });
    };

    const addWorkExperience = () => {
        setFormData({
            ...formData,
            workExperienceList: [
                ...formData.workExperienceList,
                {
                    companyName: '',
                    designation: '',
                    startDate: '',
                    endDate: '',
                    currentlyWorking: false,
                    ctc: '',
                    reasonForLeaving: '',
                },
            ],
        });
    };

    const removeWorkExperience = (index) => {
        setFormData({
            ...formData,
            workExperienceList: formData.workExperienceList.filter((_, i) => i !== index),
        });
    };

    const handleWorkExperienceChange = (index, field, value) => {
        const updated = [...formData.workExperienceList];
        updated[index][field] = value;
        setFormData({ ...formData, workExperienceList: updated });
    };

    const handleDocumentChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setError('Please upload only JPG, PNG, or PDF files');
                return;
            }
            setUploadedDocument(file);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Note: Stepper logic (onFinalStepCompleted) handles this call, avoid duplicate e.preventDefault if not event based
        setLoading(true);
        setError('');

        try {
            // Filter out incomplete work experience (backend requires companyName, designation, startDate)
            const validWorkExp = (formData.workExperienceList || []).filter(
                (w) => w.companyName?.trim() && w.designation?.trim() && w.startDate
            );
            const payload = { ...formData, workExperienceList: validWorkExp };

            const submitData = new FormData();
            const registrationBlob = new Blob([JSON.stringify(payload)], {
                type: 'application/json',
            });
            submitData.append('registration', registrationBlob);

            if (uploadedDocument) {
                submitData.append('document', uploadedDocument);
            }

            const response = await studentAPI.register(submitData);
            setRegistrationId(response.data.registrationId);
            const isStaff = formData.role === 'STAFF';
            const successTitle = isStaff ? 'Application received' : 'Registration Successful!';
            const successMsg = isStaff
                ? 'Your staff application has been submitted. Our team will review it and email you with login details once your account is approved.'
                : 'Please check your email for further instructions. You will be notified once your registration is reviewed.';
            swal(successTitle, successMsg, 'success', { button: 'OK' });
            setSuccess(true);
        } catch (err) {
            let errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
            if (errorMessage.length > 120 || errorMessage.includes('Duplicate entry') || errorMessage.includes('constraint') || errorMessage.includes('insert into')) {
                errorMessage = 'This email or another detail is already registered. Please use different details or contact admin.';
            }
            setError(errorMessage);
            swal('Registration Failed', errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const validateStep = (step) => {
        setError("");

        if (step === 1) {
            // Validate Personal Details
            const { firstName, lastName, email, phone, studentId } = formData.personalDetails;

            if (!firstName?.trim()) {
                setError("First Name is required");
                swal('Validation Error', 'First Name is required', 'error');
                return false;
            }
            if (!lastName?.trim()) {
                setError("Last Name is required");
                swal('Validation Error', 'Last Name is required', 'error');
                return false;
            }
            if (!email?.trim()) {
                setError("Email is required");
                swal('Validation Error', 'Email is required', 'error');
                return false;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError("Please enter a valid email address");
                swal('Validation Error', 'Please enter a valid email address', 'error');
                return false;
            }
            if (!phone?.trim()) {
                setError("Phone number is required");
                swal('Validation Error', 'Phone number is required', 'error');
                return false;
            }
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phone.replace(/[-\s]/g, ''))) {
                setError("Please enter a valid 10-digit phone number");
                swal('Validation Error', 'Please enter a valid 10-digit phone number', 'error');
                return false;
            }
            if (formData.role === 'STUDENT' && !studentId?.trim()) {
                setError("Student ID is required");
                swal('Validation Error', 'Student ID is required', 'error');
                return false;
            }
        } else if (step === 2) {
            // Validate Address
            const { street, city, state, pincode } = formData.address;

            if (!street?.trim()) {
                setError("Street address is required");
                swal('Validation Error', 'Street address is required', 'error');
                return false;
            }
            if (!city?.trim()) {
                setError("City is required");
                swal('Validation Error', 'City is required', 'error');
                return false;
            }
            if (!state?.trim()) {
                setError("State is required");
                swal('Validation Error', 'State is required', 'error');
                return false;
            }
            if (!pincode?.trim()) {
                setError("Pincode is required");
                swal('Validation Error', 'Pincode is required', 'error');
                return false;
            }
            // Pincode validation
            const pincodeRegex = /^[0-9]{6}$/;
            if (!pincodeRegex.test(pincode)) {
                setError("Please enter a valid 6-digit pincode");
                swal('Validation Error', 'Please enter a valid 6-digit pincode', 'error');
                return false;
            }
        } else if (step === 3) {
            // Validate Education - at least one entry
            if (formData.academicInfoList.length === 0) {
                setError("Please add at least one education entry");
                swal('Validation Error', 'Please add at least one education entry', 'error');
                return false;
            }
            // Validate each education entry
            for (let i = 0; i < formData.academicInfoList.length; i++) {
                const edu = formData.academicInfoList[i];
                if (!edu.institutionName?.trim()) {
                    setError(`Education #${i + 1}: Institution name is required`);
                    swal('Validation Error', `Education #${i + 1}: Institution name is required`, 'error');
                    return false;
                }
                if (!edu.degree?.trim()) {
                    setError(`Education #${i + 1}: Degree is required`);
                    swal('Validation Error', `Education #${i + 1}: Degree is required`, 'error');
                    return false;
                }
            }
        } else if (step === 5) {
            // Validate Document Upload
            if (!uploadedDocument) {
                setError("Please upload your ID proof document");
                swal('Validation Error', 'Please upload your ID proof document', 'error');
                return false;
            }
        }

        return true;
    };

    return (
        <div className="register-page" style={{
            background: 'var(--bg-body)',
            minHeight: '100dvh',
            height: '100%',
            width: '100%',
            color: 'var(--text-main)',
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'stretch'
        }}>
            {/* Custom Scrollbar & Mobile Layout */}
            <style>{`
                @media (max-width: 768px) {
                    .hide-mobile { display: none !important; }
                    .register-right-panel { min-width: 100% !important; flex: 1 1 100% !important; min-height: 100dvh !important; }
                }
                @media (max-height: 700px) {
                    .register-form-card .card-body { padding: 1rem 1.25rem !important; }
                    .register-form-card h2 { font-size: 1.5rem !important; }
                    .register-form-card h4 { font-size: 1.1rem !important; }
                }
                .register-page .register-form-card .card-body { padding: 1rem 1.5rem !important; }
                .register-page .register-form-card h2 { margin-bottom: 0.5rem !important; }
                .register-page .register-form-card .text-center.mb-3 { margin-bottom: 1rem !important; }
                .register-page .register-form-card .text-center.mb-3 > p { margin-bottom: 0.25rem !important; }
                .register-page .register-form-card .mb-3 { margin-bottom: 0.75rem !important; }
                .register-page .register-form-card .mb-4 { margin-bottom: 1rem !important; }
                .register-page .register-form-card .card .card-body { padding: 1rem !important; }
                .register-page .register-form-card .step-default .mb-3 { margin-bottom: 0.75rem !important; }
                .register-page .footer-container .footer-nav { margin-top: 1.25rem !important; }
                .register-page .step-indicator-row { margin-bottom: 1rem !important; }
                .register-page .step-circle-container.pb-4 { padding-bottom: 0.75rem !important; }
                .register-form-container { max-width: min(820px, calc(100vw - 2rem)) !important; }
                @media (max-width: 600px) {
                    .register-form-container { max-width: 100% !important; padding: 0 !important; }
                    .register-right-panel { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
                }
                /* Custom Scrollbar for Webkit browsers */
                ::-webkit-scrollbar {
                    width: 12px;
                    height: 12px;
                }
                
                ::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.5);
                    border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: rgba(96, 165, 250, 0.3);
                    border-radius: 10px;
                    border: 2px solid rgba(15, 23, 42, 0.5);
                    transition: background 0.3s ease;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(96, 165, 250, 0.5);
                }
                
                ::-webkit-scrollbar-thumb:active {
                    background: rgba(96, 165, 250, 0.7);
                }
                
                /* Firefox scrollbar */
                * {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(96, 165, 250, 0.3) rgba(15, 23, 42, 0.5);
                }
            `}</style>

            {/* Toast Notifications */}
            {/* Left Panel - Welcome / Image (desktop) */}
            <div style={{
                flex: '1 1 40%',
                minHeight: '100dvh',
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem clamp(1rem, 4vw, 3rem)',
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(76, 29, 149, 0.8) 100%)',
                backgroundImage: 'url(https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=1000&h=800&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                borderRight: '1px solid var(--border-color)'
            }} className="hide-mobile">
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(49, 46, 129, 0.8) 0%, rgba(88, 28, 135, 0.7) 100%)', backdropFilter: 'blur(8px)' }} />
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'white', maxWidth: '420px', padding: '2.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '24px', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)', padding: '1rem', borderRadius: '50%', boxShadow: '0 0 30px rgba(129, 140, 248, 0.5)' }}>
                            <BookOpen size={48} color="white" />
                        </div>
                    </div>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.02em', textShadow: '0 2px 20px rgba(0,0,0,0.4)', background: 'linear-gradient(to right, #ffffff, #e2e8f0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Join LibPortal</h3>
                    <p style={{ color: '#e2e8f0', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>Create your account to access the library, borrow books, and explore resources.</p>
                    
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '16px', gap: '0.5rem' }}>
                        <button 
                            onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                            style={{ 
                                flex: 1, 
                                padding: '0.875rem', 
                                background: formData.role === 'STUDENT' ? 'rgba(255,255,255,0.15)' : 'transparent', 
                                border: '1px solid',
                                borderColor: formData.role === 'STUDENT' ? 'rgba(255,255,255,0.3)' : 'transparent',
                                borderRadius: '12px', 
                                color: formData.role === 'STUDENT' ? 'white' : '#cbd5e1',
                                fontWeight: formData.role === 'STUDENT' ? '600' : '400',
                                transition: 'all 0.3s ease',
                                boxShadow: formData.role === 'STUDENT' ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                             }}
                        >
                            Students
                        </button>
                        <button 
                            onClick={() => setFormData({ ...formData, role: 'STAFF' })}
                            style={{ 
                                flex: 1, 
                                padding: '0.875rem', 
                                background: formData.role === 'STAFF' ? 'rgba(255,255,255,0.15)' : 'transparent', 
                                border: '1px solid',
                                borderColor: formData.role === 'STAFF' ? 'rgba(255,255,255,0.3)' : 'transparent',
                                borderRadius: '12px', 
                                color: formData.role === 'STAFF' ? 'white' : '#cbd5e1',
                                fontWeight: formData.role === 'STAFF' ? '600' : '400',
                                transition: 'all 0.3s ease',
                                boxShadow: formData.role === 'STAFF' ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                             }}
                        >
                            Staff
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="register-right-panel" style={{
                flex: '1 1 60%',
                minHeight: '100dvh',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: 'clamp(0.75rem, 3vh, 1.5rem) clamp(1rem, 4vw, 2rem)',
                paddingTop: 'clamp(4rem, 5vh, 4.75rem)',
                position: 'relative',
                zIndex: 5,
                background: 'var(--bg-body)',
                overflowY: 'auto',
                overflowX: 'hidden'
            }}>
                {/* Collapsible Navbar */}
                <div style={{ position: 'fixed', top: '12px', left: '20px', zIndex: 100 }}>
                    <motion.button
                        onClick={() => setNavExpanded(!navExpanded)}
                        style={{
                            background: 'var(--bg-card)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '50%',
                            width: '56px',
                            height: '56px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                            transition: 'all 0.3s ease'
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {navExpanded ? <X size={24} /> : <Menu size={24} />}
                    </motion.button>

                    {/* Expanded Navbar */}
                    <AnimatePresence>
                        {navExpanded && (
                            <motion.nav
                                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    position: 'absolute',
                                    top: '70px',
                                    left: '0',
                                    background: 'var(--bg-card)',
                                    backdropFilter: 'blur(24px)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '28px',
                                    padding: '1.5rem',
                                    minWidth: '250px',
                                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button
                                        onClick={toggleTheme}
                                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            width: '100%', padding: '0.75rem', background: 'transparent', border: 'none',
                                            borderRadius: '12px', cursor: 'pointer', color: 'var(--text-main)',
                                            fontSize: '1.2rem', fontWeight: '500', textAlign: 'left'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                                        <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
                                    </button>
                                    <Link
                                        to="/"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            textDecoration: 'none',
                                            color: 'var(--text-main)',
                                            padding: '0.75rem',
                                            borderRadius: '12px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Home size={20} />
                                        <span style={{ fontWeight: '600' }}>Home</span>
                                    </Link>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '0.75rem',
                                        borderTop: '1px solid var(--border-color)',
                                        paddingTop: '1rem',
                                        marginTop: '0.5rem'
                                    }}>
                                        <div style={{ color: 'var(--primary-500)', display: 'flex' }}>
                                            <BookOpen size={24} />
                                        </div>
                                        <span style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>LibPortal</span>
                                    </div>

                                    <Link
                                        to="/login"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            background: theme === 'light' ? 'var(--primary-600)' : 'white',
                                            color: theme === 'light' ? 'white' : 'black',
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '50px',
                                            fontWeight: '700',
                                            textDecoration: 'none',
                                            fontSize: '1.2rem',
                                            transition: 'all 0.2s ease',
                                            boxShadow: theme === 'light' ? '0 4px 14px rgba(234, 88, 12, 0.35)' : '0 4px 15px rgba(255, 255, 255, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 255, 255, 0.3)';
                                        }}
                                    >
                                        <LogIn size={18} />
                                        Login
                                    </Link>
                                </div>
                            </motion.nav>
                        )}
                    </AnimatePresence>
                </div>

                <MDBContainer className="register-form-container" style={{ position: 'relative', zIndex: 10, maxWidth: '820px', width: '100%', margin: 0, padding: 0, boxSizing: 'border-box' }}>

                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className='w-100 justify-content-center row'
                        >
                            <div className="col-12 col-md-8 col-lg-6">
                                <MDBCard className='mx-auto shadow-5 register-form-card' style={{ background: 'var(--bg-card)', backdropFilter: 'blur(24px)', border: '2px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                                    <MDBCardBody className="text-center" style={{ padding: '2.5rem 1.5rem' }}>
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            margin: '0 auto 1.5rem',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
                                        }}>
                                            <CheckCircle size={40} color="white" />
                                        </div>
                                        <h2 className="mb-3" style={{ letterSpacing: '-0.02em', fontSize: '1.8rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                            {formData.role === 'STAFF' ? 'Application Received' : 'Registration Successful!'}
                                        </h2>
                                        <p className="mb-3" style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '400' }}>
                                            {formData.role === 'STAFF' ? 'Your application reference:' : 'Your reference ID is:'}
                                        </p>
                                        <div className="p-3 rounded-4 mb-4" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', display: 'inline-block' }}>
                                            <code className="text-success" style={{ letterSpacing: '0.05em', fontSize: '1.2rem', fontWeight: '700' }}>{registrationId}</code>
                                        </div>
                                        <p className="mb-5" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '400', maxWidth: '400px', margin: '0 auto' }}>
                                            {formData.role === 'STAFF'
                                                ? 'Your staff application has been received. Our team will review it and send you an email with login details once your account is approved.'
                                                : 'You will receive an email once your registration is reviewed by an administrator.'}
                                        </p>
                                        <MDBBtn onClick={() => navigate('/')} size='lg' style={{
                                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                            color: 'white',
                                            fontWeight: '600',
                                            padding: '0.875rem 2.5rem',
                                            fontSize: '1rem',
                                            borderRadius: '50px',
                                            textTransform: 'none',
                                            boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
                                            border: 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 15px 25px -5px rgba(99, 102, 241, 0.5)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(99, 102, 241, 0.4)';
                                            }}>
                                            Return to Home
                                        </MDBBtn>
                                    </MDBCardBody>
                                </MDBCard>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className='w-100 justify-content-center row'
                        >
                            <div className="col-12">
                                <MDBCard className='mx-auto shadow-none register-form-card' style={{ background: 'transparent', border: 'none' }}>
                                    <MDBCardBody className='text-start' style={{ padding: '0 0 2rem 0' }}>

                                        <div className="mb-4">
                                            <h2 className="mb-2" style={{ fontSize: '2.2rem', letterSpacing: '-0.02em', color: 'var(--text-main)', fontWeight: '700' }}>Create Account</h2>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: '400' }}>
                                                {formData.role === 'STAFF' ? 'Apply for a staff account to manage the library.' : 'Register as a student to access library resources.'}
                                            </p>
                                        </div>

                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-center mb-3"
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    color: '#fca5a5',
                                                    borderRadius: '12px',
                                                    padding: '0.75rem',
                                                    fontSize: '0.85rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                <AlertCircle size={16} /> {error}
                                            </motion.div>
                                        )}

                                        <div className="text-dark">
                                            <style>{`
                                            .form-label { 
                                                color: var(--text-main) !important; 
                                                font-weight: 500 !important; 
                                                font-size: 0.95rem !important; 
                                                margin-bottom: 0.35rem;
                                                display: block;
                                            }
                                            
                                            .form-control { 
                                                background: var(--bg-card) !important; 
                                                border: 1px solid var(--border-color) !important; 
                                                color: var(--text-main) !important; 
                                                height: 48px;
                                                border-radius: 12px !important;
                                                font-size: 1rem !important;
                                                font-weight: 400 !important;
                                                padding: 0 1rem !important;
                                                transition: all 0.25s ease !important;
                                            }
                                            
                                            .form-control::placeholder {
                                                color: var(--text-secondary) !important;
                                            }
                                            
                                            .form-control:focus {
                                                border-color: var(--primary-500) !important;
                                                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
                                                outline: none !important;
                                            }
                                            
                                            .form-select {
                                                background-color: var(--bg-card) !important; 
                                                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e") !important;
                                                background-repeat: no-repeat !important;
                                                background-position: right 1rem center !important;
                                                background-size: 12px 8px !important;
                                                border: 1px solid var(--border-color) !important; 
                                                color: var(--text-main) !important;
                                                height: 48px;
                                                border-radius: 12px !important;
                                                font-size: 1rem !important;
                                                font-weight: 400 !important;
                                                padding: 0 2rem 0 1rem !important;
                                                transition: all 0.25s ease !important;
                                                cursor: pointer !important;
                                            }
                                            
                                            .form-select:focus {
                                                border-color: var(--primary-500) !important;
                                                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
                                                outline: none !important;
                                            }
                                            
                                            .form-select option {
                                                background-color: var(--bg-card) !important;
                                                color: var(--text-main) !important;
                                                padding: 0.75rem !important;
                                            }
                                            
                                            .card { 
                                                background: var(--gray-50) !important; 
                                                border: 2px solid var(--border-color) !important; 
                                                border-radius: 12px !important;
                                                box-shadow: none !important;
                                                transition: all 0.25s ease !important;
                                            }
                                            
                                            .card:hover {
                                                border-color: var(--primary-400) !important;
                                            }
                                            
                                            .card-title { 
                                                color: var(--text-main) !important; 
                                                font-weight: 400; 
                                                font-size: 0.9rem; 
                                            }
                                            
                                            .card-body { padding: 1.25rem !important; }
                                            
                                            .form-check-label {
                                                color: var(--text-secondary) !important;
                                                font-weight: 400 !important;
                                                font-size: 0.85rem !important;
                                                cursor: pointer !important;
                                                user-select: none !important;
                                            }
                                            
                                            .form-check-input {
                                                cursor: pointer !important;
                                                width: 18px !important;
                                                height: 18px !important;
                                                border: 2px solid var(--border-color) !important;
                                            }
                                            
                                            .form-check-input:checked {
                                                background-color: var(--primary-500) !important;
                                                border-color: var(--primary-500) !important;
                                            }
                                            
                                            .form-check-input:focus {
                                                box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2) !important;
                                            }
                                            
                                            .btn-stepper-back {
                                                border-radius: 50px !important;
                                                padding: 0.6rem 2rem !important;
                                                color: var(--text-main) !important;
                                                background: transparent !important;
                                                border: 2px solid var(--border-color) !important;
                                                font-weight: 500 !important;
                                                transition: all 0.3s ease !important;
                                            }
                                            
                                            .btn-stepper-back:hover {
                                                background: var(--bg-input) !important;
                                                border-color: var(--text-secondary) !important;
                                            }
                                            
                                            .btn-stepper-next {
                                                border-radius: 50px !important;
                                                padding: 0.6rem 2rem !important;
                                                color: white !important;
                                                background: var(--primary-500) !important;
                                                border: none !important;
                                                font-weight: 600 !important;
                                                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
                                                transition: all 0.3s ease !important;
                                            }
                                            
                                            .btn-stepper-next:hover {
                                                background: var(--primary-600) !important;
                                                box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4) !important;
                                                transform: translateY(-1px) !important;
                                            }
                                            
                                            button span { color: inherit !important; }
                                            input[type="file"] { cursor: pointer !important; }
                                            
                                            input[type="date"],
                                            input[type="number"] {
                                                color-scheme: dark !important;
                                            }
                                        `}</style>

                                            <Stepper
                                                initialStep={currentStep}
                                                onBeforeNext={() => validateStep(currentStep)}
                                                onStepChange={(step) => setCurrentStep(step)}
                                                onFinalStepCompleted={(e) => handleSubmit({ preventDefault: () => { } })}
                                                backButtonText="Back"
                                                nextButtonText="Next Step"
                                                stepCircleContainerClassName="pb-4"
                                                footerClassName="pt-4 border-top border-secondary mt-2 border-opacity-25"
                                                backButtonProps={{
                                                    className: "btn-stepper-back"
                                                }}
                                                nextButtonProps={{
                                                    className: "btn-stepper-next"
                                                }}
                                                disableStepIndicators={false}
                                            >
                                                <Step>
                                                    <MDBRow>
                                                        <MDBCol md='12'>
                                                            <div className="mb-4">
                                                                <label className='form-label mb-2' style={{ fontSize: '1.05rem', fontWeight: '600' }}>Select your role</label>
                                                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                                    <label style={{
                                                                        flex: 1, minWidth: '200px', cursor: 'pointer', padding: '1.25rem', border: formData.role === 'STUDENT' ? '2px solid var(--primary-500)' : '1px solid var(--border-color)', borderRadius: '16px', background: formData.role === 'STUDENT' ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-card)', transition: 'all 0.2s', position: 'relative', boxShadow: formData.role === 'STUDENT' ? '0 10px 25px -5px rgba(99, 102, 241, 0.15)' : 'none'
                                                                    }}>
                                                                        <input type="radio" name="role" value="STUDENT" checked={formData.role === 'STUDENT'} onChange={handleRoleChange} style={{ position: 'absolute', opacity: 0 }} />
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                                            <span style={{ fontWeight: '600', fontSize: '1.1rem', color: formData.role === 'STUDENT' ? 'var(--primary-600)' : 'var(--text-main)' }}>Student</span>
                                                                            {formData.role === 'STUDENT' && <CheckCircle size={24} color="var(--primary-500)" />}
                                                                        </div>
                                                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                                            Browse the library catalog, request physical books, view digital resources, and track your borrowing history.
                                                                        </p>
                                                                    </label>
                                                                    <label style={{
                                                                        flex: 1, minWidth: '200px', cursor: 'pointer', padding: '1.25rem', border: formData.role === 'STAFF' ? '2px solid var(--primary-500)' : '1px solid var(--border-color)', borderRadius: '16px', background: formData.role === 'STAFF' ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-card)', transition: 'all 0.2s', position: 'relative', boxShadow: formData.role === 'STAFF' ? '0 10px 25px -5px rgba(99, 102, 241, 0.15)' : 'none'
                                                                    }}>
                                                                        <input type="radio" name="role" value="STAFF" checked={formData.role === 'STAFF'} onChange={handleRoleChange} style={{ position: 'absolute', opacity: 0 }} />
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                                            <span style={{ fontWeight: '600', fontSize: '1.1rem', color: formData.role === 'STAFF' ? 'var(--primary-600)' : 'var(--text-main)' }}>Staff</span>
                                                                            {formData.role === 'STAFF' && <CheckCircle size={24} color="var(--primary-500)" />}
                                                                        </div>
                                                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                                            Manage book inventory, process book issues and returns, oversee student accounts, and handle late fines.
                                                                        </p>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </MDBCol>
                                                    </MDBRow>
                                                    <MDBRow>
                                                        <MDBCol md='6'>
                                                            <div className="mb-4">
                                                                <label className="form-label">First Name <span className='text-danger'>*</span></label>
                                                                <input className="form-control" id='firstName' name="firstName" type='text' value={formData.personalDetails.firstName} onChange={handlePersonalInfoChange} required placeholder="John" />
                                                            </div>
                                                        </MDBCol>
                                                        <MDBCol md='6'>
                                                            <div className="mb-4">
                                                                <label className="form-label">Last Name <span className='text-danger'>*</span></label>
                                                                <input className="form-control" id='lastName' name="lastName" type='text' value={formData.personalDetails.lastName} onChange={handlePersonalInfoChange} required placeholder="Doe" />
                                                            </div>
                                                        </MDBCol>
                                                    </MDBRow>
                                                    <div className="mb-4">
                                                        <label className="form-label">Email <span className='text-danger'>*</span></label>
                                                        <input className="form-control" id='email' name="email" type='email' value={formData.personalDetails.email} onChange={handlePersonalInfoChange} required placeholder="john.doe@example.com" />
                                                    </div>
                                                    <MDBRow>
                                                        <MDBCol md='6'>
                                                            <div className="mb-4">
                                                                <label className="form-label">Phone <span className='text-danger'>*</span></label>
                                                                <input className="form-control" id='phone' name="phone" type='tel' value={formData.personalDetails.phone} onChange={handlePersonalInfoChange} required placeholder="1234567890" />
                                                            </div>
                                                        </MDBCol>
                                                        <MDBCol md='6'>
                                                            <div className="mb-4">
                                                                <label className="form-label">Date of Birth</label>
                                                                <input className="form-control" id='dateOfBirth' name="dateOfBirth" type='date' value={formData.personalDetails.dateOfBirth} onChange={handlePersonalInfoChange} />
                                                            </div>
                                                        </MDBCol>
                                                        <MDBCol md='6'>
                                                            <div className="mb-4">
                                                                <label className="form-label">Gender</label>
                                                                <select
                                                                    name="gender"
                                                                    value={formData.personalDetails.gender}
                                                                    onChange={handlePersonalInfoChange}
                                                                    className="form-select"
                                                                >
                                                                    <option value="">Select Gender</option>
                                                                    <option value="Male">Male</option>
                                                                    <option value="Female">Female</option>
                                                                    <option value="Other">Other</option>
                                                                </select>
                                                            </div>
                                                        </MDBCol>
                                                        <MDBCol md='6'>
                                                            <div className="mb-4">
                                                                <label className='form-label'>Marital Status</label>
                                                                <select className='form-select' name="maritalStatus" value={formData.personalDetails.maritalStatus} onChange={handlePersonalInfoChange}>
                                                                    <option value="">Select Status</option>
                                                                    <option value="Single">Single</option>
                                                                    <option value="Married">Married</option>
                                                                </select>
                                                            </div>
                                                        </MDBCol>
                                                    </MDBRow>
                                                    <MDBRow>
                                                        {formData.role === 'STUDENT' && (
                                                            <MDBCol md='12'>
                                                                <div className="mb-4">
                                                                    <label className='form-label'>Student ID <span className='text-danger'>*</span></label>
                                                                    <input
                                                                        className="form-control"
                                                                        id='studentId'
                                                                        name="studentId"
                                                                        type='text'
                                                                        value={formData.personalDetails.studentId}
                                                                        onChange={handlePersonalInfoChange}
                                                                        placeholder="Enter your student ID"
                                                                        required
                                                                    />
                                                                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
                                                                        This will be your login ID
                                                                    </small>
                                                                </div>
                                                            </MDBCol>
                                                        )}
                                                    </MDBRow>
                                                </Step>

                                                <Step>
                                                    <h4 className='mb-4' style={{ fontWeight: '600', fontSize: '1.2rem', color: 'var(--text-main)' }}>Address Details</h4>
                                                    <div className="mb-4">
                                                        <label className="form-label">Street Address <span className='text-danger'>*</span></label>
                                                        <input className="form-control" id='street' name="street" type='text' value={formData.address.street} onChange={handleAddressChange} required placeholder="123 Main St, Apt 4B" />
                                                    </div>
                                                    <MDBRow>
                                                        <MDBCol md='4'>
                                                            <div className="mb-4">
                                                                <label className="form-label">City <span className='text-danger'>*</span></label>
                                                                <input className="form-control" id='city' name="city" type='text' value={formData.address.city} onChange={handleAddressChange} required placeholder="New York" />
                                                            </div>
                                                        </MDBCol>
                                                        <MDBCol md='4'>
                                                            <div className="mb-4">
                                                                <label className="form-label">State <span className='text-danger'>*</span></label>
                                                                <input className="form-control" id='state' name="state" type='text' value={formData.address.state} onChange={handleAddressChange} required placeholder="NY" />
                                                            </div>
                                                        </MDBCol>
                                                        <MDBCol md='4'>
                                                            <div className="mb-4">
                                                                <label className="form-label">Pincode <span className='text-danger'>*</span></label>
                                                                <input className="form-control" id='pincode' name="pincode" type='text' value={formData.address.pincode} onChange={handleAddressChange} required placeholder="10001" />
                                                            </div>
                                                        </MDBCol>
                                                    </MDBRow>
                                                </Step>

                                                <Step>
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <h4 className='mb-0' style={{ fontWeight: '600', fontSize: '1.2rem', color: 'var(--text-main)' }}>Education</h4>
                                                        <MDBBtn size='sm' onClick={addAcademicInfo} style={{ borderRadius: '50px', padding: '0.6rem 1.5rem', color: 'white', border: '2px solid var(--primary-500)', background: 'var(--primary-500)' }}>
                                                            <MDBIcon icon="plus" className="me-2" /> Add Education
                                                        </MDBBtn>
                                                    </div>
                                                    <p className="mb-3" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>At least one education entry is required. You can add more using the button above.</p>
                                                    {formData.academicInfoList.map((academic, index) => (
                                                        <MDBCard key={index} className="mb-4">
                                                            <MDBCardBody className="position-relative p-4">
                                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                                    <h6 className="card-title mb-0" style={{ color: 'var(--primary-600)', fontWeight: '600' }}>Education #{index + 1}</h6>
                                                                    {formData.academicInfoList.length > 1 && (
                                                                        <MDBBtn
                                                                            color="danger"
                                                                            size="sm"
                                                                            className="shadow-0"
                                                                            onClick={() => removeAcademicInfo(index)}
                                                                            floating
                                                                            style={{ opacity: 0.8 }}
                                                                        >
                                                                            <MDBIcon icon="trash" />
                                                                        </MDBBtn>
                                                                    )}
                                                                </div>
                                                                    <div className="mb-4">
                                                                        <label className="form-label">Institution</label>
                                                                        <input className="form-control" type="text" value={academic.institutionName} onChange={(e) => handleAcademicInfoChange(index, 'institutionName', e.target.value)} placeholder="University Name" />
                                                                    </div>
                                                                    <MDBRow>
                                                                        <MDBCol md='4'>
                                                                            <div className="mb-4">
                                                                                <label className="form-label">Degree</label>
                                                                                <input className="form-control" type="text" value={academic.degree} onChange={(e) => handleAcademicInfoChange(index, 'degree', e.target.value)} placeholder="e.g. B.Tech" />
                                                                            </div>
                                                                        </MDBCol>
                                                                        <MDBCol md='4'>
                                                                            <div className="mb-4">
                                                                                <label className="form-label">Year</label>
                                                                                <input className="form-control" type="number" value={academic.passingYear} onChange={(e) => handleAcademicInfoChange(index, 'passingYear', parseInt(e.target.value))} placeholder="e.g. 2024" />
                                                                            </div>
                                                                        </MDBCol>
                                                                        <MDBCol md='4'>
                                                                            <div className="mb-4">
                                                                                <label className="form-label">Grade</label>
                                                                                <input className="form-control" type="text" value={academic.grade} onChange={(e) => handleAcademicInfoChange(index, 'grade', e.target.value)} placeholder="e.g. 8.5 CGPA" />
                                                                            </div>
                                                                        </MDBCol>
                                                                    </MDBRow>
                                                                </MDBCardBody>
                                                        </MDBCard>
                                                    ))}
                                                </Step>

                                                <Step>
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <h4 className='mb-0' style={{ fontWeight: '600', fontSize: '1.2rem', color: 'var(--text-main)' }}>Experience</h4>
                                                        <MDBBtn size='sm' outline onClick={addWorkExperience} style={{ borderRadius: '50px', padding: '0.6rem 1.5rem', color: 'var(--text-main)', borderColor: 'var(--border-color)', background: 'var(--bg-input)' }}>
                                                            <MDBIcon icon="plus" className="me-2" style={{ color: 'inherit' }} /> <span>Add Experience</span>
                                                        </MDBBtn>
                                                    </div>
                                                    {formData.workExperienceList.map((work, index) => (
                                                        <MDBCard key={index} className="mb-4">
                                                            <MDBCardBody className="position-relative p-4">
                                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                                    <h6 className="card-title mb-0" style={{ color: 'var(--primary-600)', fontWeight: '600' }}>Work #{index + 1}</h6>
                                                                    <MDBBtn
                                                                        color="danger"
                                                                        size="sm"
                                                                        className="shadow-0"
                                                                        onClick={() => removeWorkExperience(index)}
                                                                        floating
                                                                        style={{ opacity: 0.8 }}
                                                                    >
                                                                        <MDBIcon icon="trash" />
                                                                    </MDBBtn>
                                                                </div>
                                                                    <div className="mb-4">
                                                                        <label className="form-label">Company</label>
                                                                        <input className="form-control" type="text" value={work.companyName} onChange={(e) => handleWorkExperienceChange(index, 'companyName', e.target.value)} placeholder="Company Name" />
                                                                    </div>
                                                                    <MDBRow>
                                                                        <MDBCol md='4'>
                                                                            <div className="mb-4">
                                                                                <label className="form-label">Designation</label>
                                                                                <input className="form-control" type="text" value={work.designation} onChange={(e) => handleWorkExperienceChange(index, 'designation', e.target.value)} placeholder="Software Engineer" />
                                                                            </div>
                                                                        </MDBCol>
                                                                        <MDBCol md='4'>
                                                                            <div className="mb-4">
                                                                                <label className="form-label">Start Date</label>
                                                                                <input className="form-control" type="date" value={work.startDate} onChange={(e) => handleWorkExperienceChange(index, 'startDate', e.target.value)} />
                                                                            </div>
                                                                        </MDBCol>
                                                                        <MDBCol md='4'>
                                                                            <div className="mb-4">
                                                                                <label className="form-label">End Date</label>
                                                                                <input className="form-control" type="date" value={work.endDate} onChange={(e) => handleWorkExperienceChange(index, 'endDate', e.target.value)} disabled={work.currentlyWorking} />
                                                                            </div>
                                                                        </MDBCol>
                                                                    </MDBRow>
                                                                    <MDBCheckbox label='Currently Working' checked={work.currentlyWorking} onChange={(e) => handleWorkExperienceChange(index, 'currentlyWorking', e.target.checked)} wrapperClass='mb-0' labelStyle={{ color: 'var(--text-secondary)' }} />
                                                                </MDBCardBody>
                                                            </MDBCard>
                                                    ))}
                                                    {formData.workExperienceList.length === 0 && <p className="text-center py-5 border rounded-4" style={{ borderStyle: 'dashed', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>No work experience added.</p>}
                                                </Step>

                                                <Step>
                                                    <h4 className='mb-3 text-center' style={{ fontWeight: '600', fontSize: '1.2rem', color: 'var(--text-main)' }}>Documents</h4>
                                                    <div className="d-flex justify-content-center">
                                                        <div
                                                            className="border rounded-4 p-5 text-center transition-all"
                                                            style={{
                                                                borderStyle: 'dashed',
                                                                backgroundColor: uploadedDocument ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-card)',
                                                                borderColor: uploadedDocument ? 'var(--primary-500)' : 'var(--border-color)',
                                                                cursor: 'pointer',
                                                                width: '100%',
                                                                maxWidth: '500px',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onClick={() => document.getElementById('doc-upload').click()}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = uploadedDocument ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-card)'}
                                                        >
                                                            <input
                                                                type="file"
                                                                id="doc-upload"
                                                                className="d-none"
                                                                onChange={handleDocumentChange}
                                                                accept=".jpg,.jpeg,.png,.pdf"
                                                            />
                                                            <div className="mb-3">
                                                                <MDBIcon
                                                                    icon={uploadedDocument ? "check-circle" : "cloud-upload-alt"}
                                                                    size="4x"
                                                                    className={`mb-3 ${uploadedDocument ? "text-success" : "text-primary"}`}
                                                                />
                                                            </div>
                                                            <h5 className="mb-2" style={{ color: 'var(--text-main)' }}>{uploadedDocument ? uploadedDocument.name : "Upload ID Proof"}</h5>
                                                            <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>Max 10MB (PDF, JPG, PNG)</p>
                                                        </div>
                                                    </div>
                                                </Step>

                                            </Stepper>
                                        </div>

                                    </MDBCardBody>
                                </MDBCard>
                            </div>
                        </motion.div>
                    )}
                </MDBContainer>
            </div>
        </div>
    );
};

export default Register;

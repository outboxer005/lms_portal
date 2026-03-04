
import React, { useState, Children, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';

import './Stepper.css';

export default function Stepper({
    children,
    initialStep = 1,
    onStepChange = () => { },
    onBeforeNext = null,
    onFinalStepCompleted = () => { },
    stepCircleContainerClassName = '',
    stepContainerClassName = '',
    contentClassName = '',
    footerClassName = '',
    backButtonProps = {},
    nextButtonProps = {},
    backButtonText = 'Back',
    nextButtonText = 'Continue',
    disableStepIndicators = false,
    renderStepIndicator,
    ...rest
}) {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [direction, setDirection] = useState(0);
    const stepsArray = Children.toArray(children);
    const totalSteps = stepsArray.length;
    const isCompleted = currentStep > totalSteps;
    const isLastStep = currentStep === totalSteps;

    const updateStep = newStep => {
        setDirection(newStep > currentStep ? 1 : -1);
        setCurrentStep(newStep);
        if (newStep > totalSteps) {
            onFinalStepCompleted();
        } else {
            onStepChange(newStep);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            updateStep(currentStep - 1);
        }
    };

    const handleNext = () => {
        if (onBeforeNext && !onBeforeNext(currentStep)) return;
        if (!isLastStep) {
            updateStep(currentStep + 1);
        } else {
            onFinalStepCompleted();
        }
    };

    return (
        <div className="outer-container" {...rest}>
            <div className={`step-circle-container ${stepCircleContainerClassName}`} style={{ border: 'none', boxShadow: 'none' }}>
                <div className={`step-indicator-row ${stepContainerClassName}`}>
                    {stepsArray.map((_, index) => {
                        const stepNumber = index + 1;
                        const isNotLastStep = index < totalSteps - 1;
                        return (
                            <React.Fragment key={stepNumber}>
                                {renderStepIndicator ? (
                                    renderStepIndicator({
                                        step: stepNumber,
                                        currentStep,
                                        onStepClick: clicked => {
                                            if (!disableStepIndicators) updateStep(clicked);
                                        }
                                    })
                                ) : (
                                    <StepIndicator
                                        step={stepNumber}
                                        disableStepIndicators={disableStepIndicators}
                                        currentStep={currentStep}
                                        onClickStep={clicked => {
                                            if (!disableStepIndicators) updateStep(clicked);
                                        }}
                                    />
                                )}
                                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
                            </React.Fragment>
                        );
                    })}
                </div>

                <StepContentWrapper
                    isCompleted={isCompleted}
                    currentStep={currentStep}
                    direction={direction}
                    className={`step-content-default ${contentClassName}`}
                >
                    {stepsArray[currentStep - 1]}
                </StepContentWrapper>

                {!isCompleted && (
                    <div className={`footer-container ${footerClassName}`}>
                        <div className={`footer-nav ${currentStep === 1 ? 'end' : 'spread'}`} style={{ display: 'flex', justifyContent: currentStep === 1 ? 'flex-end' : 'space-between', marginTop: '2rem' }}>
                            {currentStep > 1 && (
                                <button
                                    onClick={handleBack}
                                    className={`back-button ${backButtonProps.className || ''}`}
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.5rem', 
                                        fontSize: '1rem',
                                        ...backButtonProps.style 
                                    }}
                                >
                                    <ChevronLeft size={20} />
                                    {backButtonText}
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className={`next-button ${nextButtonProps.className || ''}`}
                                style={{
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '1.1rem',
                                    ...nextButtonProps.style
                                }}
                            >
                                {isLastStep ? 'Complete Registration' : nextButtonText}
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StepContentWrapper({ isCompleted, currentStep, direction, children, className }) {
    const [parentHeight, setParentHeight] = useState('auto');

    return (
        <motion.div
            className={className}
            style={{ position: 'relative', overflow: 'hidden' }}
            animate={{ height: isCompleted ? 0 : parentHeight }}
            transition={{ type: 'spring', duration: 0.4 }}
        >
            <AnimatePresence initial={false} mode="wait" custom={direction}>
                {!isCompleted && (
                    <SlideTransition key={currentStep} direction={direction} onHeightReady={h => setParentHeight(h)}>
                        {children}
                    </SlideTransition>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function SlideTransition({ children, direction, onHeightReady }) {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        if (containerRef.current) {
            // Add a small delay/timeout to ensure content is rendered before measuring
            setTimeout(() => {
                if (containerRef.current) onHeightReady(containerRef.current.offsetHeight);
            }, 50);
        }
    }, [children, onHeightReady]);

    return (
        <motion.div
            ref={containerRef}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            style={{ width: '100%' }}
        >
            {children}
        </motion.div>
    );
}

const stepVariants = {
    enter: dir => ({
        x: dir >= 0 ? 20 : -20,
        opacity: 0,
        position: 'absolute'
    }),
    center: {
        x: 0,
        opacity: 1,
        position: 'relative'
    },
    exit: dir => ({
        x: dir >= 0 ? -20 : 20,
        opacity: 0,
        position: 'absolute'
    })
};

export function Step({ children }) {
    return <div className="step-default">{children}</div>;
}

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators }) {
    const status = currentStep === step ? 'active' : currentStep > step ? 'complete' : 'inactive';

    const handleClick = () => {
        if (step !== currentStep && !disableStepIndicators) onClickStep(step);
    };

    return (
        <motion.div
            onClick={handleClick}
            className="step-indicator"
            status={status}
            initial={false}
            style={{ cursor: disableStepIndicators ? 'default' : 'pointer' }}
        >
            <motion.div
                transition={{ duration: 0.3 }}
                className="step-indicator-inner"
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: '600',
                    border: '2px solid'
                }}
            >
                {status === 'complete' ? (
                    <Check className="check-icon" size={20} />
                ) : (
                    <span className="step-number">{step}</span>
                )}
            </motion.div>
        </motion.div>
    );
}

function StepConnector({ isComplete }) {
    const lineVariants = {
        incomplete: { width: 0, backgroundColor: 'transparent' },
        complete: { width: '100%', backgroundColor: '#10b981' }
    };

    return (
        <div className="step-connector" style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.1)', margin: '0 1rem' }}>
            <motion.div
                className="step-connector-inner"
                variants={lineVariants}
                initial={false}
                animate={isComplete ? 'complete' : 'incomplete'}
                transition={{ duration: 0.4 }}
                style={{ height: '100%' }}
            />
        </div>
    );
}

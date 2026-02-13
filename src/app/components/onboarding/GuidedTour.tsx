import React, { useEffect, useState, useCallback } from 'react';
import { useGuidedTour, TourStep } from '../../hooks/useGuidedTour';
import './GuidedTour.css';

interface TourTooltipProps {
    step: TourStep;
    currentStep: number;
    totalSteps: number;
    targetRect: DOMRect | null;
    onNext: () => void;
    onSkip: () => void;
}

const TourTooltip: React.FC<TourTooltipProps> = ({
    step,
    currentStep,
    totalSteps,
    targetRect,
    onNext,
    onSkip,
}) => {
    const isLastStep = currentStep === totalSteps - 1;

    // Calculate tooltip position based on target element
    const getTooltipStyle = (): React.CSSProperties => {
        if (!targetRect) {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            };
        }

        const padding = 16;
        const style: React.CSSProperties = {};

        switch (step.position) {
            case 'right':
                style.left = `${targetRect.right + padding}px`;
                style.top = `${targetRect.top + targetRect.height / 2}px`;
                style.transform = 'translateY(-50%)';
                break;
            case 'left':
                style.right = `${window.innerWidth - targetRect.left + padding}px`;
                style.top = `${targetRect.top + targetRect.height / 2}px`;
                style.transform = 'translateY(-50%)';
                break;
            case 'bottom':
                style.top = `${targetRect.bottom + padding}px`;
                style.left = `${targetRect.left + targetRect.width / 2}px`;
                style.transform = 'translateX(-50%)';
                break;
            case 'top':
                style.bottom = `${window.innerHeight - targetRect.top + padding}px`;
                style.left = `${targetRect.left + targetRect.width / 2}px`;
                style.transform = 'translateX(-50%)';
                break;
        }

        return style;
    };

    return (
        <div className={`tour-tooltip tour-tooltip-${step.position}`} style={getTooltipStyle()}>
            <div className="tour-tooltip-header">
                <span className="tour-tooltip-title">{step.title}</span>
                <button className="tour-tooltip-close" onClick={onSkip} aria-label="Close tour">
                    ✕
                </button>
            </div>
            <p className="tour-tooltip-description">{step.description}</p>
            <div className="tour-tooltip-footer">
                <div className="tour-tooltip-progress">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <span
                            key={i}
                            className={`tour-progress-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
                        />
                    ))}
                </div>
                <div className="tour-tooltip-actions">
                    <button className="tour-btn-skip" onClick={onSkip}>
                        Skip
                    </button>
                    <button className="tour-btn-next" onClick={onNext}>
                        {isLastStep ? 'Finish' : 'Next →'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const GuidedTour: React.FC = () => {
    const { isActive, currentStep, totalSteps, step, nextStep, skipTour } = useGuidedTour();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    // Find target element and update its rect
    const updateTargetRect = useCallback(() => {
        if (!step) return;
        const el = document.querySelector(step.targetSelector);
        if (el) {
            setTargetRect(el.getBoundingClientRect());
        } else {
            setTargetRect(null);
        }
    }, [step]);

    // Update when step changes
    useEffect(() => {
        if (!isActive || !step) return;
        updateTargetRect();
    }, [isActive, step, updateTargetRect]);

    // Update rect on resize/scroll
    useEffect(() => {
        if (!isActive) return;
        const handleUpdate = () => updateTargetRect();
        window.addEventListener('resize', handleUpdate);
        window.addEventListener('scroll', handleUpdate, true);
        return () => {
            window.removeEventListener('resize', handleUpdate);
            window.removeEventListener('scroll', handleUpdate, true);
        };
    }, [isActive, updateTargetRect]);

    // Timer to re-measure after DOM settles
    useEffect(() => {
        if (!isActive) return;
        const timer = setTimeout(updateTargetRect, 100);
        return () => clearTimeout(timer);
    }, [isActive, currentStep, updateTargetRect]);

    if (!isActive || !step) return null;

    // Calculate spotlight clip path
    const getSpotlightClipPath = () => {
        if (!targetRect) return 'none';
        const padding = 8;
        const x = targetRect.left - padding;
        const y = targetRect.top - padding;
        const w = targetRect.width + padding * 2;
        const h = targetRect.height + padding * 2;
        const r = 8;

        return `polygon(
      0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
      ${x}px ${y + r}px,
      ${x + r}px ${y}px,
      ${x + w - r}px ${y}px,
      ${x + w}px ${y + r}px,
      ${x + w}px ${y + h - r}px,
      ${x + w - r}px ${y + h}px,
      ${x + r}px ${y + h}px,
      ${x}px ${y + h - r}px,
      ${x}px ${y + r}px
    )`;
    };

    return (
        <div className="guided-tour-overlay">
            <div
                className="guided-tour-backdrop"
                style={{ clipPath: getSpotlightClipPath() }}
                onClick={skipTour}
            />
            {targetRect && (
                <div
                    className="guided-tour-spotlight"
                    style={{
                        left: targetRect.left - 8,
                        top: targetRect.top - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16,
                    }}
                />
            )}
            <TourTooltip
                step={step}
                currentStep={currentStep}
                totalSteps={totalSteps}
                targetRect={targetRect}
                onNext={nextStep}
                onSkip={skipTour}
            />
        </div>
    );
};

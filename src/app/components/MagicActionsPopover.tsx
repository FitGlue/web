import React, { useRef, useEffect, useState } from 'react';
import { RepostActionsMenu } from './RepostActionsMenu';
import { SynchronizedActivity } from '../services/ActivitiesService';

interface MagicActionsPopoverProps {
    activity: SynchronizedActivity;
    onSuccess: () => void;
}

export const MagicActionsPopover: React.FC<MagicActionsPopoverProps> = ({ activity, onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [isOpen]);

    return (
        <div ref={containerRef} className="magic">
            <button
                className="magic__trigger"
                onClick={() => setIsOpen(prev => !prev)}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                ✨ MAGIC ACTIONS <span>▾</span>
            </button>
            {isOpen && (
                <div className="magic__pop">
                    <RepostActionsMenu
                        activity={activity}
                        onSuccess={() => { onSuccess(); setIsOpen(false); }}
                        isPro={true}
                        inline
                    />
                </div>
            )}
        </div>
    );
};

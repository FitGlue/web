import React, { useState, useRef } from 'react';
import { PluginManifest } from '../types/plugin';
import './EnricherTimeline.css';

interface SelectedEnricher {
    manifest: PluginManifest;
    config: Record<string, string>;
}

interface Props {
    enrichers: SelectedEnricher[];
    onReorder: (enrichers: SelectedEnricher[]) => void;
    onRemove: (index: number) => void;
    onInfoClick: (manifest: PluginManifest) => void;
}

export const EnricherTimeline: React.FC<Props> = ({ enrichers, onReorder, onRemove, onInfoClick }) => {
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Desktop drag handlers
    const handleDragStart = (index: number) => (e: React.DragEvent) => {
        setDragIndex(index);
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (index: number) => (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = (dropIndex: number) => () => {
        if (dragIndex === null || dragIndex === dropIndex) {
            handleDragEnd();
            return;
        }
        const reordered = [...enrichers];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(dropIndex, 0, moved);
        onReorder(reordered);
        handleDragEnd();
    };

    const handleDragEnd = () => {
        setDragIndex(null);
        setDragOverIndex(null);
        setIsDragging(false);
    };

    // Mobile: long-press to enable drag
    const handleTouchStart = (index: number) => () => {
        longPressTimer.current = setTimeout(() => {
            setIsDragging(true);
            setDragIndex(index);
        }, 500);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        if (isDragging && dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
            const reordered = [...enrichers];
            const [moved] = reordered.splice(dragIndex, 1);
            reordered.splice(dragOverIndex, 0, moved);
            onReorder(reordered);
        }
        handleDragEnd();
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
        const node = elements.find(el => el.classList.contains('timeline-node'));
        if (node) {
            const idx = parseInt(node.getAttribute('data-index') || '-1');
            if (idx >= 0) setDragOverIndex(idx);
        }
    };

    if (enrichers.length === 0) return null;

    return (
        <div className="enricher-timeline">
            <div className="timeline-label">
                <span className="timeline-label-icon">⚡</span>
                <span>Pipeline Order</span>
                <span className="timeline-hint">(drag to reorder)</span>
            </div>
            <div className="timeline-track" onTouchMove={handleTouchMove}>
                {enrichers.map((e, i) => (
                    <React.Fragment key={e.manifest.id}>
                        <div
                            className={`timeline-node ${dragIndex === i ? 'dragging' : ''} ${dragOverIndex === i && dragIndex !== i ? 'drag-over' : ''}`}
                            data-index={i}
                            draggable
                            onDragStart={handleDragStart(i)}
                            onDragOver={handleDragOver(i)}
                            onDrop={handleDrop(i)}
                            onDragEnd={handleDragEnd}
                            onTouchStart={handleTouchStart(i)}
                            onTouchEnd={handleTouchEnd}
                        >
                            <span className="timeline-order">{i + 1}</span>
                            <span className="timeline-icon-emoji">{e.manifest.icon}</span>
                            <span className="timeline-name">{e.manifest.name}</span>
                            <div className="timeline-actions">
                                <button
                                    className="timeline-btn timeline-btn-info"
                                    onClick={(ev) => { ev.stopPropagation(); onInfoClick(e.manifest); }}
                                    title="Learn more about this booster"
                                    aria-label="Info"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="12" y1="16" x2="12" y2="12"/>
                                        <circle cx="12" cy="8" r="0.5" fill="currentColor"/>
                                    </svg>
                                </button>
                                <button
                                    className="timeline-btn timeline-btn-remove"
                                    onClick={(ev) => { ev.stopPropagation(); onRemove(i); }}
                                    title="Remove"
                                    aria-label="Remove"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        {i < enrichers.length - 1 && <></>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default EnricherTimeline;

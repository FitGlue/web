import React, { useState, useRef } from 'react';
import { PluginManifest } from '../types/plugin';
import { Stack } from './library/layout/Stack';
import { Card } from './library/ui/Card';
import { Button } from './library/ui/Button';
import { Paragraph } from './library/ui/Paragraph';
import { PluginIcon } from './library/ui/PluginIcon';
import { EnricherConfigForm } from './EnricherConfigForm';
import { LogicGateConfigForm } from './LogicGateConfigForm';
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
    /** Optional: When provided, enables inline config editing with expand/collapse */
    onConfigChange?: (index: number, config: Record<string, string>) => void;
}

/**
 * Drag handle component with grip dots pattern
 */
const DragHandle: React.FC = () => (
    <div className="timeline-drag-handle" title="Drag to reorder">
        <div className="timeline-drag-handle__dots">
            <span className="timeline-drag-handle__dot" />
            <span className="timeline-drag-handle__dot" />
            <span className="timeline-drag-handle__dot" />
            <span className="timeline-drag-handle__dot" />
            <span className="timeline-drag-handle__dot" />
            <span className="timeline-drag-handle__dot" />
        </div>
    </div>
);

export const EnricherTimeline: React.FC<Props> = ({ enrichers, onReorder, onRemove, onInfoClick, onConfigChange }) => {
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [longPressing, setLongPressing] = useState<number | null>(null);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const hasConfig = (e: SelectedEnricher) => (e.manifest.configSchema?.length ?? 0) > 0;
    const canEditConfig = !!onConfigChange;

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
        setLongPressing(null);
    };

    // Mobile: long-press to enable drag with visual feedback
    const handleTouchStart = (index: number) => () => {
        setLongPressing(index);
        longPressTimer.current = setTimeout(() => {
            setIsDragging(true);
            setDragIndex(index);
            setLongPressing(null);
        }, 500);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        setLongPressing(null);
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
        <Card>
            <Stack gap="md">
                <div className="enricher-timeline__header">
                    <Paragraph inline>⚡</Paragraph>
                    <span className="enricher-timeline__title">Pipeline Order</span>
                    <span className="enricher-timeline__hint">Drag handle to reorder</span>
                </div>
                {/* Using div wrapper for touch events - Stack doesn't support event handlers */}
                <div onTouchMove={handleTouchMove}>
                    <Stack gap="xs">
                        {enrichers.map((e, i) => {
                            const nodeClasses = [
                                'timeline-node',
                                dragIndex === i && 'dragging',
                                dragOverIndex === i && dragIndex !== i && 'drag-over',
                                longPressing === i && 'long-pressing',
                            ].filter(Boolean).join(' ');

                            const isExpanded = expandedIndex === i;
                            const showConfigButton = canEditConfig && hasConfig(e);

                            return (
                                <div
                                    key={`${e.manifest.id}-${i}`}
                                    className={`${nodeClasses}${isExpanded ? ' expanded' : ''}`}
                                    data-index={i}
                                    draggable={!isExpanded}
                                    onDragStart={isExpanded ? undefined : handleDragStart(i)}
                                    onDragOver={handleDragOver(i)}
                                    onDrop={handleDrop(i)}
                                    onDragEnd={handleDragEnd}
                                    onTouchStart={isExpanded ? undefined : handleTouchStart(i)}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    <Card variant={dragIndex === i || isExpanded ? 'elevated' : 'default'}>
                                        <div className="timeline-node__content">
                                            <DragHandle />
                                            <div className="timeline-order-badge">{i + 1}</div>
                                            <div className="timeline-plugin-info">
                                                <PluginIcon
                                                    icon={e.manifest.icon}
                                                    iconType={e.manifest.iconType}
                                                    iconPath={e.manifest.iconPath}
                                                    size="small"
                                                />
                                                <span className="timeline-plugin-name">{e.manifest.name}</span>
                                            </div>
                                            <div className="timeline-actions">
                                                {showConfigButton && (
                                                    <Button
                                                        variant="text"
                                                        size="small"
                                                        onClick={(ev) => {
                                                            ev.stopPropagation();
                                                            setExpandedIndex(isExpanded ? null : i);
                                                        }}
                                                        title={isExpanded ? 'Close settings' : 'Configure settings'}
                                                        aria-label="Settings"
                                                        className={`timeline-config-btn${isExpanded ? ' active' : ''}`}
                                                    >
                                                        ⚙️
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    onClick={(ev) => { ev.stopPropagation(); onInfoClick(e.manifest); }}
                                                    title="Learn more about this booster"
                                                    aria-label="Info"
                                                >
                                                    ⓘ
                                                </Button>
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    onClick={(ev) => { ev.stopPropagation(); onRemove(i); }}
                                                    title="Remove"
                                                    aria-label="Remove"
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        </div>
                                        {/* Expanded config form */}
                                        {isExpanded && onConfigChange && (
                                            <div className="timeline-config-panel">
                                                {e.manifest.id === 'logic-gate' ? (
                                                    <LogicGateConfigForm
                                                        initialValues={e.config}
                                                        onChange={(config) => onConfigChange(i, config)}
                                                    />
                                                ) : (
                                                    <EnricherConfigForm
                                                        schema={e.manifest.configSchema ?? []}
                                                        initialValues={e.config}
                                                        onChange={(config) => onConfigChange(i, config)}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            );
                        })}
                    </Stack>
                </div>
            </Stack>
        </Card>
    );
};

export default EnricherTimeline;

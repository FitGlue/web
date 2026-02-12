import React, { useState, useRef } from 'react';
import { PluginManifest } from '../types/plugin';
import { Stack } from './library/layout/Stack';
import { Card } from './library/ui/Card';
import { Badge } from './library/ui/Badge';
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
    <Stack className="timeline-drag-handle" title="Drag to reorder">
        <Stack className="timeline-drag-handle__dots" direction="horizontal" gap="xs">
            <Paragraph inline className="timeline-drag-handle__dot" />
            <Paragraph inline className="timeline-drag-handle__dot" />
            <Paragraph inline className="timeline-drag-handle__dot" />
            <Paragraph inline className="timeline-drag-handle__dot" />
            <Paragraph inline className="timeline-drag-handle__dot" />
            <Paragraph inline className="timeline-drag-handle__dot" />
        </Stack>
    </Stack>
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
                <Stack direction="horizontal" className="enricher-timeline__header" gap="xs" align="center">
                    <Paragraph inline>⚡</Paragraph>
                    <Paragraph inline className="enricher-timeline__title">Pipeline Order</Paragraph>
                    <Paragraph inline className="enricher-timeline__hint">Drag handle to reorder</Paragraph>
                </Stack>
                <Stack gap="none" onTouchMove={handleTouchMove}>
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
                                        <Stack direction="horizontal" className="timeline-node__content" align="center" gap="sm">
                                            <DragHandle />
                                            <Badge className="timeline-order-badge">{i + 1}</Badge>
                                            <Stack direction="horizontal" className="timeline-plugin-info" align="center" gap="xs">
                                                <PluginIcon
                                                    icon={e.manifest.icon}
                                                    iconType={e.manifest.iconType}
                                                    iconPath={e.manifest.iconPath}
                                                    size="small"
                                                />
                                                <Paragraph inline className="timeline-plugin-name">{e.manifest.name}</Paragraph>
                                            </Stack>
                                            <Stack direction="horizontal" className="timeline-actions" gap="xs">
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
                                            </Stack>
                                        </Stack>
                                        {/* Expanded config form */}
                                        {isExpanded && onConfigChange && (
                                            <Stack className="timeline-config-panel" gap="sm">
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
                                            </Stack>
                                        )}
                                    </Card>
                                </div>
                            );
                        })}
                    </Stack>
                </Stack>
            </Stack>
        </Card>
    );
};

export default EnricherTimeline;

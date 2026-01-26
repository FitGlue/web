import React, { useState, useRef } from 'react';
import { PluginManifest } from '../types/plugin';
import { Stack } from './library/layout/Stack';
import { Card } from './library/ui/Card';
import { Button } from './library/ui/Button';
import { Paragraph } from './library/ui/Paragraph';
import { Badge } from './library/ui/Badge';

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
        <Card>
            <Stack gap="md">
                <Stack direction="horizontal" gap="sm" align="center">
                    <Paragraph inline>⚡</Paragraph>
                    <Paragraph inline bold>Pipeline Order</Paragraph>
                    <Paragraph inline muted size="sm">(drag to reorder)</Paragraph>
                </Stack>
                {/* Using div wrapper for touch events - Stack doesn't support event handlers */}
                <div onTouchMove={handleTouchMove}>
                    <Stack gap="sm">
                        {enrichers.map((e, i) => (
                            /* Using div for draggable - Card doesn't support drag handlers */
                            <div
                                key={e.manifest.id}
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
                                <Card variant={dragIndex === i ? 'elevated' : 'default'}>
                                    <Stack direction="horizontal" align="center" justify="between">
                                        <Stack direction="horizontal" gap="sm" align="center">
                                            <Badge variant="default" size="sm">{i + 1}</Badge>
                                            <Paragraph inline>{e.manifest.icon}</Paragraph>
                                            <Paragraph inline>{e.manifest.name}</Paragraph>
                                        </Stack>
                                        <Stack direction="horizontal" gap="xs">
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
                                </Card>
                            </div>
                        ))}
                    </Stack>
                </div>
            </Stack>
        </Card>
    );
};

export default EnricherTimeline;

import React, { ReactNode } from 'react';
import { LoadingState } from '../library/ui/LoadingState';
import { Stack } from '../library/layout';

interface DataListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    keyExtractor?: (item: T, index: number) => string | number;
    loading?: boolean;
    loadingMessage?: string;
    emptyState?: ReactNode;
}

export function DataList<T>({
    items,
    renderItem,
    keyExtractor,
    loading = false,
    loadingMessage = 'Loading...',
    emptyState,
}: DataListProps<T>) {
    if (loading && items.length === 0) {
        return <LoadingState message={loadingMessage} />;
    }

    if (items.length === 0 && emptyState) {
        return <>{emptyState}</>;
    }

    return (
        <Stack gap="sm">
            {items.map((item, index) => (
                <React.Fragment key={keyExtractor ? keyExtractor(item, index) : index}>
                    {renderItem(item, index)}
                </React.Fragment>
            ))}
        </Stack>
    );
}

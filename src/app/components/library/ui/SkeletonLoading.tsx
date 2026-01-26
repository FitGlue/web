import React, { ReactNode } from 'react';

interface SkeletonLoadingProps {
  /** Whether data is still loading */
  loading: boolean;
  /** The skeleton to show while loading */
  skeleton: ReactNode;
  /** The actual content to show when loaded */
  children: ReactNode;
}

/**
 * SkeletonLoading - A wrapper component that shows skeleton content while loading
 *
 * @example
 * <SkeletonLoading
 *   loading={!loaded}
 *   skeleton={<CardSkeleton variant="connections" itemCount={4} />}
 * >
 *   <ActualContent />
 * </SkeletonLoading>
 */
export const SkeletonLoading: React.FC<SkeletonLoadingProps> = ({
  loading,
  skeleton,
  children,
}) => {
  if (loading) {
    return <>{skeleton}</>;
  }
  return <>{children}</>;
};

export default SkeletonLoading;

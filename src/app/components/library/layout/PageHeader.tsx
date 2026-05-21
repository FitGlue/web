import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './PageHeader.css';

// Status pill tone names map to CSS modifier classes
type StatusTone = 'green' | 'rose' | 'aurora';

export interface PageHeaderProps {
    // ── New unified API ──────────────────────────────────────────
    /** Breadcrumb trail; last entry is the current page (paper), ancestors are dim links. */
    crumbs?: string[];
    /** Path for each ancestor crumb (index-aligned with crumbs; last entry is current so ignored). */
    crumbLinks?: string[];
    /** Optional status pill rendered after the last crumb. */
    status?: { label: string; tone?: StatusTone };
    /** Right-aligned mono meta text (version, last-edited timestamp…). */
    eyebrow?: string;
    /** Page title rendered in large display type. */
    title?: string | ReactNode;
    /** Optional word appended to title in aurora-gradient text. */
    titleAccent?: string;
    /** Mono dim secondary line beneath the title. */
    meta?: string;
    /** 1–3 <PageAction /> children (or any ReactNode). */
    actions?: ReactNode;
    /** Optional content rendered below meta — stats strip, filter chips, etc. */
    children?: ReactNode;

    // ── Legacy / compat props (still honoured by PageLayout) ─────
    /** @deprecated Use crumbs + crumbLinks. Adds a back-link as first crumb. */
    backTo?: string;
    /** @deprecated Label for the back-link crumb. */
    backLabel?: string;
    /** @deprecated Use meta. */
    subtitle?: string;
    /** @deprecated Use children. Inline stats rendered below the title. */
    stats?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    crumbs,
    crumbLinks,
    status,
    eyebrow,
    title,
    titleAccent,
    meta,
    actions,
    children,
    // legacy
    backTo,
    backLabel,
    subtitle,
    stats,
}) => {
    // ── Derive crumbs from legacy props when new API not supplied ─
    const resolvedCrumbs: string[] = crumbs ?? (
        backTo && backLabel && typeof title === 'string'
            ? [backLabel, title]
            : []
    );
    const resolvedLinks: (string | undefined)[] = crumbLinks ?? (
        backTo && backLabel && typeof title === 'string'
            ? [backTo, undefined]
            : []
    );

    // Legacy subtitle / stats → new meta / children
    const resolvedMeta = meta ?? subtitle;
    const resolvedChildren = children ?? stats;

    // Whether to render the crumbs / status / eyebrow row at all
    const hasCrumbRow = resolvedCrumbs.length > 0 || !!status || !!eyebrow;

    return (
        <div className="page-header">
            {hasCrumbRow && (
                <div className="page-header__crumb-row">
                    {/* Breadcrumb trail */}
                    {resolvedCrumbs.length > 0 && (
                        <nav className="page-header__crumbs" aria-label="Breadcrumb">
                            {resolvedCrumbs.map((crumb, i) => {
                                const isLast = i === resolvedCrumbs.length - 1;
                                const link = resolvedLinks[i];
                                return (
                                    <React.Fragment key={i}>
                                        {i > 0 && (
                                            <span className="page-header__crumb-sep" aria-hidden="true">/</span>
                                        )}
                                        {!isLast && link ? (
                                            <Link to={link} className="page-header__crumb page-header__crumb--link">
                                                {crumb.toUpperCase()}
                                            </Link>
                                        ) : (
                                            <span
                                                className={`page-header__crumb${isLast ? ' page-header__crumb--current' : ''}`}
                                                aria-current={isLast ? 'page' : undefined}
                                            >
                                                {crumb.toUpperCase()}
                                            </span>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </nav>
                    )}

                    {/* Status pill */}
                    {status && (
                        <span className={`page-header__status page-header__status--${status.tone ?? 'green'}`}>
                            {status.label}
                        </span>
                    )}

                    {/* Eyebrow — right-aligned */}
                    {eyebrow && (
                        <span className="page-header__eyebrow">{eyebrow}</span>
                    )}
                </div>
            )}

            {/* Title + actions row */}
            <div className="page-header__body">
                <div className="page-header__left">
                    {title && (
                        <h1 className="page-header__title">
                            {typeof title === 'string' ? title.toUpperCase() : title}
                            {titleAccent && (
                                <>
                                    {' '}
                                    <span className="page-header__title-accent">
                                        {titleAccent.toUpperCase()}
                                    </span>
                                </>
                            )}
                        </h1>
                    )}
                    {resolvedMeta && (
                        <p className="page-header__meta">{resolvedMeta}</p>
                    )}
                    {resolvedChildren && (
                        <div className="page-header__children">{resolvedChildren}</div>
                    )}
                </div>

                {actions && (
                    <div className="page-header__actions">{actions}</div>
                )}
            </div>
        </div>
    );
};

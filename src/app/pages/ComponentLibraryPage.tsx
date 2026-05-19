import React, { useState } from 'react';
import {
    Button,
    Badge,
    Pill,
    StatusPill,
    Card,
    Heading,
    Paragraph,
    EmptyState,
    Modal,
    ConfirmDialog,
    Pagination,
    ProgressBar,
    Avatar,
    Icon,
    SourcePicker,
    DestinationPicker,
    BoosterPicker,
    PlanBand,
    UsageGrid,
    ChangelogEntry,
    ChangelogTagRow,
} from '../components/library/ui';
import type { SourceTile, DestinationChip, BoosterChip, UsageCell } from '../components/library/ui';
import { PageLayout, LegalProse } from '../components/library/layout';
import './ComponentLibraryPage.css';

const Section: React.FC<{ num: string; title: string; children: React.ReactNode }> = ({ num, title, children }) => (
    <section className="cl-section">
        <div className="cl-section__head">
            <span className="cl-section__num">{num}</span>
            <h2 className="cl-section__title">{title}</h2>
        </div>
        <div className="cl-section__body">{children}</div>
    </section>
);

const Specimen: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="cl-specimen">
        <div className="cl-specimen__label">{label}</div>
        <div className="cl-specimen__content">{children}</div>
    </div>
);

const SAMPLE_SOURCES: SourceTile[] = [
    { id: 'strava', name: 'Strava', icon: '🚴', connected: true },
    { id: 'hevy', name: 'Hevy', icon: '🏋️', meta: 'Webhook' },
    { id: 'garmin', name: 'Garmin', icon: '⌚' },
    { id: 'fitbit', name: 'Fitbit', icon: '📱', disabled: true },
];

const SAMPLE_DESTINATIONS: DestinationChip[] = [
    { id: 'strava', name: 'Strava', icon: '🚴', rule: 'always' },
    { id: 'trainingpeaks', name: 'TrainingPeaks', icon: '📈' },
];

const SAMPLE_BOOSTERS: BoosterChip[] = [
    { id: 'pace-calc', name: 'Pace Calc', icon: '⏱️', category: 'Running' },
    { id: 'hr-zones', name: 'HR Zones', icon: '❤️', category: 'Cardio' },
    { id: 'elevation', name: 'Elevation', icon: '⛰️', category: 'Running' },
    { id: 'power-curve', name: 'Power Curve', icon: '⚡', category: 'Cycling' },
    { id: 'cadence', name: 'Cadence', icon: '🔄', category: 'Cycling' },
    { id: 'sleep-score', name: 'Sleep Score', icon: '😴', category: 'Health' },
];

const USAGE_CELLS: UsageCell[] = [
    { value: 42, label: 'Syncs This Month', gradient: true },
    { value: '∞', label: 'Sync Limit', sub: 'Athlete plan' },
    { value: 8, label: 'Connected Sources' },
    { value: 3, label: 'Active Pipelines', gradient: true },
    { value: 25, label: 'Boosters', sub: 'All unlocked' },
    { value: 'ACTIVE', label: 'Status', sub: 'Paid subscription' },
];

const ComponentLibraryPage: React.FC = () => {
    const [selectedSource, setSelectedSource] = useState<string | null>('strava');
    const [selectedBoosters, setSelectedBoosters] = useState<string[]>(['pace-calc']);
    const [boosterCategory, setBoosterCategory] = useState('ALL');
    const [destinations, setDestinations] = useState<DestinationChip[]>(SAMPLE_DESTINATIONS);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [page, setPage] = useState(1);

    const handleBoosterToggle = (id: string) => {
        setSelectedBoosters(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
    };

    const categories = ['ALL', ...Array.from(new Set(SAMPLE_BOOSTERS.map(b => b.category)))];

    return (
        <PageLayout title="Component Library" fullWidth>
            <div className="cl-page">
                <div className="cl-header">
                    <div className="cl-header__title">COMPONENT LIBRARY</div>
                    <div className="cl-header__sub">All library components in all variants · DEV TOOL</div>
                </div>

                {/* 1. Buttons */}
                <Section num="01" title="Buttons">
                    <div className="cl-row">
                        <Specimen label="Primary (aurora)">
                            <Button>SAVE CHANGES</Button>
                        </Specimen>
                        <Specimen label="Outline (ghost border)">
                            <Button variant="outline">CANCEL</Button>
                        </Specimen>
                        <Specimen label="Ghost">
                            <Button variant="ghost">← BACK</Button>
                        </Specimen>
                        <Specimen label="Danger">
                            <Button variant="danger">DELETE</Button>
                        </Specimen>
                        <Specimen label="Ink">
                            <Button variant="ink">MANAGE →</Button>
                        </Specimen>
                        <Specimen label="Paper">
                            <Button variant="paper">CONNECT</Button>
                        </Specimen>
                        <Specimen label="SM">
                            <Button size="sm">COPY</Button>
                        </Specimen>
                        <Specimen label="Large">
                            <Button size="large">UPGRADE →</Button>
                        </Specimen>
                        <Specimen label="Full width">
                            <Button fullWidth>CONNECT FIRST SOURCE →</Button>
                        </Specimen>
                        <Specimen label="Disabled">
                            <Button disabled>UNAVAILABLE</Button>
                        </Specimen>
                    </div>
                </Section>

                {/* 2. Badges */}
                <Section num="02" title="Badges & Pills">
                    <div className="cl-row">
                        <Specimen label="Badge default">
                            <Badge>✦ ATHLETE</Badge>
                        </Specimen>
                        <Specimen label="Badge success">
                            <Badge variant="success">✓ CONNECTED</Badge>
                        </Specimen>
                        <Specimen label="Badge error">
                            <Badge variant="error">✕ FAILED</Badge>
                        </Specimen>
                        <Specimen label="Badge warning">
                            <Badge variant="warning">⚠ TRIAL</Badge>
                        </Specimen>
                        <Specimen label="Pill">
                            <Pill>HOBBYIST</Pill>
                        </Specimen>
                        <Specimen label="StatusPill success">
                            <StatusPill status="completed" />
                        </Specimen>
                        <Specimen label="StatusPill error">
                            <StatusPill status="failed" />
                        </Specimen>
                    </div>
                </Section>

                {/* 3. ChangelogEntry + Tags */}
                <Section num="03" title="Changelog">
                    <ChangelogEntry
                        version="v2.4.0"
                        date="19 May 2026"
                        title="Brutal Aurora reskin + 7 new library components"
                        tags={[
                            { label: 'NEW', variant: 'new' },
                            { label: 'DESIGN', variant: 'change' },
                            { label: 'BREAKING', variant: 'deprecate' },
                        ]}
                    >
                        <p>Major visual overhaul — SourcePicker, DestinationPicker, BoosterPicker, PlanBand, UsageGrid, ChangelogEntry and LegalProse added to the library. Toast left-bar pattern, Modal paper-outline shell, NotFoundPage reskin (auto-redirect removed).</p>
                    </ChangelogEntry>
                    <Specimen label="Tag row standalone">
                        <ChangelogTagRow tags={[
                            { label: 'NEW', variant: 'new' },
                            { label: 'FIX', variant: 'fix' },
                            { label: 'CHANGE', variant: 'change' },
                            { label: 'DEPRECATE', variant: 'deprecate' },
                        ]} />
                    </Specimen>
                </Section>

                {/* 4. SourcePicker */}
                <Section num="04" title="SourcePicker">
                    <SourcePicker
                        sources={SAMPLE_SOURCES}
                        selected={selectedSource}
                        onSelect={setSelectedSource}
                        label="Pick your source"
                    />
                </Section>

                {/* 5. DestinationPicker */}
                <Section num="05" title="DestinationPicker">
                    <DestinationPicker
                        destinations={destinations}
                        onRemove={(id) => setDestinations(prev => prev.filter(d => d.id !== id))}
                        onAdd={() => alert('Add destination clicked')}
                        onConfigure={(id) => alert(`Configure ${id}`)}
                    />
                </Section>

                {/* 6. BoosterPicker */}
                <Section num="06" title="BoosterPicker">
                    <BoosterPicker
                        boosters={SAMPLE_BOOSTERS}
                        selected={selectedBoosters}
                        onToggle={handleBoosterToggle}
                        categories={categories}
                        activeCategory={boosterCategory}
                        onCategoryChange={setBoosterCategory}
                    />
                </Section>

                {/* 7. PlanBand */}
                <Section num="07" title="PlanBand">
                    <Specimen label="Athlete">
                        <PlanBand planName="Athlete" price="£5" period="/month" badge="UNLIMITED SYNCS · ACTIVE" />
                    </Specimen>
                    <Specimen label="Hobbyist">
                        <PlanBand planName="Hobbyist" price="£0" period="/month" badge="42 / 100 SYNCS THIS MONTH" />
                    </Specimen>
                </Section>

                {/* 8. UsageGrid */}
                <Section num="08" title="UsageGrid">
                    <UsageGrid cells={USAGE_CELLS} />
                </Section>

                {/* 9. Card */}
                <Section num="09" title="Cards">
                    <div className="cl-row">
                        <Specimen label="Default">
                            <Card>
                                <Heading level={4}>Card Title</Heading>
                                <Paragraph>Card body content with some text.</Paragraph>
                            </Card>
                        </Specimen>
                        <Specimen label="Elevated">
                            <Card variant="elevated">
                                <Heading level={4}>Elevated Card</Heading>
                                <Paragraph>Slightly elevated surface.</Paragraph>
                            </Card>
                        </Specimen>
                    </div>
                </Section>

                {/* 10. EmptyState */}
                <Section num="10" title="Empty States">
                    <EmptyState
                        icon="🔗"
                        title="No connections yet"
                        description="Hook in Strava, Hevy, Fitbit, Garmin — wherever your activities live."
                        actionLabel="CONNECT A SOURCE →"
                        onAction={() => {}}
                    />
                </Section>

                {/* 11. Modal */}
                <Section num="11" title="Modal">
                    <div className="cl-row">
                        <Specimen label="Default (paper outline)">
                            <Button onClick={() => setModalOpen(true)}>OPEN MODAL</Button>
                        </Specimen>
                        <Specimen label="Danger (rose outline)">
                            <Button variant="danger" onClick={() => setConfirmOpen(true)}>OPEN DANGER CONFIRM</Button>
                        </Specimen>
                    </div>
                    <Modal
                        isOpen={modalOpen}
                        onClose={() => setModalOpen(false)}
                        title="Example Modal"
                        footer={
                            <>
                                <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>CANCEL</Button>
                                <Button size="sm" onClick={() => setModalOpen(false)}>CONFIRM</Button>
                            </>
                        }
                    >
                        <p>This is a modal body. It uses the paper outline (ink-2 bg, 1.5px paper inset) pattern.</p>
                    </Modal>
                    <ConfirmDialog
                        isOpen={confirmOpen}
                        title="Delete this thing?"
                        message="This is permanent and irreversible. Are you sure you want to delete?"
                        confirmLabel="DELETE"
                        cancelLabel="CANCEL"
                        isDestructive
                        onConfirm={() => setConfirmOpen(false)}
                        onCancel={() => setConfirmOpen(false)}
                    />
                </Section>

                {/* 12. Avatar */}
                <Section num="12" title="Avatar">
                    <div className="cl-row">
                        <Specimen label="SM">
                            <Avatar size="sm" initial="J" />
                        </Specimen>
                        <Specimen label="MD">
                            <Avatar size="md" initial="J" />
                        </Specimen>
                        <Specimen label="LG">
                            <Avatar size="lg" initial="J" />
                        </Specimen>
                    </div>
                </Section>

                {/* 13. ProgressBar */}
                <Section num="13" title="ProgressBar">
                    <div className="cl-row">
                        <Specimen label="Default (40%)">
                            <ProgressBar value={40} />
                        </Specimen>
                        <Specimen label="Success (80%)">
                            <ProgressBar value={80} variant="success" />
                        </Specimen>
                        <Specimen label="Error (20%)">
                            <ProgressBar value={20} variant="error" />
                        </Specimen>
                    </div>
                </Section>

                {/* 14. Pagination */}
                <Section num="14" title="Pagination">
                    <Pagination
                        currentPage={page}
                        totalPages={10}
                        onPageChange={setPage}
                    />
                </Section>

                {/* 15. Icon */}
                <Section num="15" title="Icon">
                    <div className="cl-row">
                        {(['check', 'close', 'arrow-right', 'settings', 'refresh', 'search'] as const).map(name => (
                            <Specimen key={name} label={name}>
                                <Icon name={name} />
                            </Specimen>
                        ))}
                    </div>
                </Section>

                {/* 16. LegalProse */}
                <Section num="16" title="LegalProse">
                    <div style={{ background: 'var(--fg-ink-2)', padding: '2px' }}>
                        <LegalProse title="Privacy Policy" lastUpdated="19 May 2026">
                            <h2>Data We Collect</h2>
                            <p>This is an example of the LegalProse wrapper. It sets comfortable font size (1.0625rem), good line-height (1.65), 720px max-width, and does NOT use all-caps body text.</p>
                            <h2>How We Use It</h2>
                            <p>Section headings use display font uppercase. Body text uses body font at normal case. <a href="#">Links are cyan</a>.</p>
                        </LegalProse>
                    </div>
                </Section>
            </div>
        </PageLayout>
    );
};

export default ComponentLibraryPage;

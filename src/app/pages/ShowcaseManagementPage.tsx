import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout, Stack } from '../components/library/layout';
import { Button, Paragraph, Card, Heading, Badge, Link, CardSkeleton } from '../components/library/ui';
import { FormField, Input, Textarea, Toggle } from '../components/library/forms';
import { useApi } from '../hooks/useApi';
import './ShowcaseManagementPage.css';

interface ShowcaseActivity {
    showcaseId: string;
    title: string;
    activityType: string;
    source: string;
    startTime: string;
    createdAt: string;
    inProfile: boolean;
}

interface ShowcaseProfile {
    slug: string;
    displayName: string;
    subtitle: string;
    bio: string;
    profilePictureUrl: string;
    visible: boolean;
    entries: Array<{ showcaseId: string }>;
}

type ToastData = { message: string; type: 'success' | 'error' } | null;

const ShowcaseManagementPage: React.FC = () => {
    const api = useApi();

    // Profile state
    const [profile, setProfile] = useState<ShowcaseProfile | null>(null);
    const [activities, setActivities] = useState<ShowcaseActivity[]>([]);
    const [loading, setLoading] = useState(true);

    // Editable fields
    const [subtitle, setSubtitle] = useState('');
    const [bio, setBio] = useState('');
    const [slug, setSlug] = useState('');
    const [slugError, setSlugError] = useState('');
    const [saving, setSaving] = useState(false);
    const [savingSlug, setSavingSlug] = useState(false);

    // Default destination
    const [defaultDestination, setDefaultDestination] = useState(false);
    const [profileVisible, setProfileVisible] = useState(true);
    const [loadingPrefs, setLoadingPrefs] = useState(true);

    // Toast
    const [toast, setToast] = useState<ToastData>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // Fetch profile data
    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.get('/showcase-management/profile') as {
                profile: ShowcaseProfile | null;
                activities: ShowcaseActivity[];
            };
            setProfile(data.profile);
            setActivities(data.activities || []);
            if (data.profile) {
                setSubtitle(data.profile.subtitle || '');
                setBio(data.profile.bio || '');
                setSlug(data.profile.slug || '');
                setProfileVisible(data.profile.visible !== false);
            }
        } catch (err) {
            console.error('Failed to load showcase profile:', err);
            showToast('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    }, [api, showToast]);

    // Fetch preferences
    const fetchPreferences = useCallback(async () => {
        try {
            const data = await api.get('/showcase-management/preferences') as {
                defaultDestination: boolean;
            };
            setDefaultDestination(data.defaultDestination);
        } catch (err) {
            console.error('Failed to load preferences:', err);
        } finally {
            setLoadingPrefs(false);
        }
    }, [api]);

    useEffect(() => {
        fetchProfile();
        fetchPreferences();
    }, [fetchProfile, fetchPreferences]);

    // Save profile fields
    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await api.patch('/showcase-management/profile', { subtitle, bio });
            showToast('Profile updated');
        } catch (err) {
            console.error('Failed to save profile:', err);
            showToast('Failed to save profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Save slug
    const handleSaveSlug = async () => {
        if (!slug.trim()) return;
        setSavingSlug(true);
        setSlugError('');
        try {
            const result = await api.patch('/showcase-management/profile/slug', { slug }) as { slug: string };
            setSlug(result.slug || slug);
            showToast('Slug updated');
            // Refresh profile to get updated data
            fetchProfile();
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to update slug';
            if (errorMsg.includes('409')) {
                setSlugError('That slug is already taken — try a different one');
            } else {
                setSlugError(errorMsg);
            }
        } finally {
            setSavingSlug(false);
        }
    };

    // Toggle default destination
    const handleToggleDefaultDestination = async () => {
        const newVal = !defaultDestination;
        setDefaultDestination(newVal);
        try {
            await api.patch('/showcase-management/preferences', {
                defaultDestination: newVal,
            });
            showToast(newVal ? 'Showcase will be added to new pipelines' : 'Default destination disabled');
        } catch (err) {
            // Revert on failure
            setDefaultDestination(!newVal);
            console.error('Failed to update preference:', err);
            showToast('Failed to update preference', 'error');
        }
    };

    // Toggle profile visibility
    const handleToggleVisibility = async () => {
        const newVal = !profileVisible;
        setProfileVisible(newVal);
        try {
            await api.patch('/showcase-management/profile', { visible: newVal });
            showToast(newVal ? 'Profile is now publicly visible' : 'Profile is now hidden');
        } catch (err) {
            setProfileVisible(!newVal);
            console.error('Failed to update visibility:', err);
            showToast('Failed to update visibility', 'error');
        }
    };

    // Remove activity from profile
    const handleRemoveEntry = async (showcaseId: string) => {
        try {
            await api.delete(`/showcase-management/profile/entries/${showcaseId}`);
            showToast('Entry removed');
            fetchProfile();
        } catch (err) {
            console.error('Failed to remove entry:', err);
            showToast('Failed to remove entry', 'error');
        }
    };

    // Add activity to profile
    const handleAddEntry = async (showcaseId: string) => {
        try {
            await api.post(`/showcase-management/profile/entries/${showcaseId}`);
            showToast('Entry added');
            fetchProfile();
        } catch (err) {
            console.error('Failed to add entry:', err);
            showToast('Failed to add entry', 'error');
        }
    };

    // Picture upload — pick file first, then request signed URL with actual content type
    const handlePictureUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            try {
                // Request signed URL with the file's actual MIME type
                const data = await api.post('/showcase-management/profile/picture', {
                    contentType: file.type || 'image/webp',
                }) as {
                    uploadUrl: string;
                    publicUrl: string;
                    contentType: string;
                };

                // Upload to GCS via signed URL
                await fetch(data.uploadUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': data.contentType },
                    body: file,
                });

                // Update profile with the new URL
                await api.patch('/showcase-management/profile', {
                    profilePictureUrl: data.publicUrl,
                });

                showToast('Profile picture updated');
                fetchProfile();
            } catch (err) {
                console.error('Failed to upload picture:', err);
                showToast('Failed to upload picture', 'error');
            }
        };
        input.click();
    };

    if (loading) {
        return (
            <PageLayout title="Manage Showcase" backTo="/" backLabel="Dashboard">
                <Stack gap="lg">
                    <CardSkeleton variant="integration" />
                    <CardSkeleton variant="integration" />
                    <CardSkeleton variant="integration" />
                </Stack>
            </PageLayout>
        );
    }

    if (!profile) {
        return (
            <PageLayout title="Manage Showcase" backTo="/" backLabel="Dashboard">
                <Stack className="showcase-mgmt__empty" align="center" gap="md">
                    <Paragraph className="showcase-mgmt__empty-icon">🌟</Paragraph>
                    <Paragraph>No showcase profile found.</Paragraph>
                    <Paragraph size="sm">
                        Showcase activities from your pipeline runs to create your public profile.
                    </Paragraph>
                </Stack>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Manage Showcase" backTo="/" backLabel="Dashboard">
            <Stack gap="lg">
                {/* Toast notification */}
                {toast && (
                    <Badge className={`showcase-mgmt__toast showcase-mgmt__toast--${toast.type}`}>
                        {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                    </Badge>
                )}

                {/* Profile Picture & Basic Info */}
                <Card className="showcase-mgmt__section">
                    <Stack gap="md">
                        <Heading level={3} className="showcase-mgmt__section-title">
                            👤 Profile
                        </Heading>
                        <Stack direction="horizontal" className="showcase-mgmt__avatar-section" gap="md" align="center">
                            <Paragraph inline className="showcase-mgmt__avatar-preview">
                                {profile.profilePictureUrl ? '📸' : '🏃'}
                            </Paragraph>
                            <Stack className="showcase-mgmt__avatar-actions" gap="xs">
                                <Button variant="secondary" size="small" onClick={handlePictureUpload}>
                                    Upload Photo
                                </Button>
                                <Paragraph size="sm" muted className="showcase-mgmt__avatar-hint">
                                    WebP recommended • Max 5MB
                                </Paragraph>
                            </Stack>
                        </Stack>

                        <FormField label="Subtitle">
                            <Input
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value.slice(0, 100))}
                                placeholder="e.g. Marathon runner & trail enthusiast"
                                maxLength={100}
                            />
                            <Paragraph inline size="sm" muted className="showcase-mgmt__char-count">{subtitle.length}/100</Paragraph>
                        </FormField>

                        <FormField label="Bio">
                            <Textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                                placeholder="Tell visitors about your fitness journey..."
                                maxLength={500}
                            />
                            <Paragraph inline size="sm" muted className="showcase-mgmt__char-count">{bio.length}/500</Paragraph>
                        </FormField>

                        <Stack className="showcase-mgmt__actions">
                            <Button variant="primary" size="small" onClick={handleSaveProfile} disabled={saving}>
                                {saving ? 'Saving…' : 'Save Profile'}
                            </Button>
                        </Stack>
                    </Stack>
                </Card>

                {/* Slug Management */}
                <Card className="showcase-mgmt__section">
                    <Stack gap="sm">
                        <Heading level={3} className="showcase-mgmt__section-title">
                            🔗 Public URL
                        </Heading>
                        <Stack direction="horizontal" className="showcase-mgmt__slug-row" gap="sm" align="center">
                            <FormField label="">
                                <Stack direction="horizontal" gap="xs" align="center">
                                    <Paragraph inline className="showcase-mgmt__slug-prefix">fitglue.tech/u/</Paragraph>
                                    <Input
                                        value={slug}
                                        onChange={(e) => {
                                            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                                            setSlugError('');
                                        }}
                                        placeholder="your-slug"
                                    />
                                </Stack>
                            </FormField>
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={handleSaveSlug}
                                disabled={savingSlug || slug === profile.slug}
                            >
                                {savingSlug ? 'Updating…' : 'Update Slug'}
                            </Button>
                        </Stack>
                        {slugError && <Paragraph className="showcase-mgmt__slug-error">{slugError}</Paragraph>}
                        {profileVisible ? (
                            <Link
                                href={`/u/${encodeURIComponent(profile.slug)}`}
                                external
                                className="showcase-mgmt__view-link"
                            >
                                View public profile →
                            </Link>
                        ) : (
                            <Paragraph inline className="showcase-mgmt__view-link showcase-mgmt__view-link--hidden">
                                🔒 Profile is hidden — enable visibility in Preferences to share
                            </Paragraph>
                        )}
                    </Stack>
                </Card>

                {/* Showcased Activities */}
                <Card className="showcase-mgmt__section">
                    <Stack gap="md">
                        <Heading level={3} className="showcase-mgmt__section-title">
                            🏆 Showcased Activities ({activities.filter(a => a.inProfile).length})
                        </Heading>

                        {activities.length === 0 ? (
                            <Stack className="showcase-mgmt__empty" align="center">
                                <Paragraph size="sm">
                                    No activities have been showcased yet. Set up a pipeline with the Showcase destination to get started.
                                </Paragraph>
                            </Stack>
                        ) : (
                            <Stack className="showcase-mgmt__activity-list" gap="sm">
                                {activities.map(activity => (
                                    <Card key={activity.showcaseId} className="showcase-mgmt__activity-item">
                                        <Stack direction="horizontal" align="center" justify="between">
                                            <Stack className="showcase-mgmt__activity-info" gap="xs">
                                                <Paragraph className="showcase-mgmt__activity-title">
                                                    {activity.title || 'Untitled Activity'}
                                                </Paragraph>
                                                <Paragraph size="sm" muted className="showcase-mgmt__activity-meta">
                                                    {activity.activityType} • {activity.source}
                                                    {activity.startTime && ` • ${new Date(activity.startTime).toLocaleDateString()}`}
                                                </Paragraph>
                                            </Stack>
                                            <Stack className="showcase-mgmt__activity-actions">
                                                {activity.inProfile ? (
                                                    <Button
                                                        variant="danger"
                                                        size="small"
                                                        onClick={() => handleRemoveEntry(activity.showcaseId)}
                                                    >
                                                        Remove
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="secondary"
                                                        size="small"
                                                        onClick={() => handleAddEntry(activity.showcaseId)}
                                                    >
                                                        Add to Profile
                                                    </Button>
                                                )}
                                            </Stack>
                                        </Stack>
                                    </Card>
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </Card>

                {/* Default Destination Preference */}
                <Card className="showcase-mgmt__section">
                    <Stack gap="md">
                        <Heading level={3} className="showcase-mgmt__section-title">
                            ⚡ Preferences
                        </Heading>
                        <Toggle
                            label="Profile visibility"
                            description={profileVisible
                                ? 'Your profile is publicly visible'
                                : 'Your profile is hidden — visitors will see a 404'}
                            checked={profileVisible}
                            onChange={handleToggleVisibility}
                        />
                        <Toggle
                            label="Default destination for new pipelines"
                            description="Automatically add Showcase as a destination when creating new pipelines"
                            checked={defaultDestination}
                            onChange={handleToggleDefaultDestination}
                            disabled={loadingPrefs}
                        />
                    </Stack>
                </Card>
            </Stack>
        </PageLayout>
    );
};

export default ShowcaseManagementPage;

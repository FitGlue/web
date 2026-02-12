import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout, Stack } from '../components/library/layout';
import { Button, Paragraph } from '../components/library/ui';
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

    // Picture upload
    const handlePictureUpload = async () => {
        try {
            const data = await api.post('/showcase-management/profile/picture') as {
                uploadUrl: string;
                publicUrl: string;
                contentType: string;
            };

            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return;

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
            };
            input.click();
        } catch (err) {
            console.error('Failed to upload picture:', err);
            showToast('Failed to upload picture', 'error');
        }
    };

    if (loading) {
        return (
            <PageLayout title="Manage Showcase" backTo="/" backLabel="Dashboard">
                <Stack gap="lg">
                    <div className="showcase-mgmt__skeleton" style={{ height: 40 }} />
                    <div className="showcase-mgmt__skeleton" style={{ height: 120 }} />
                    <div className="showcase-mgmt__skeleton" style={{ height: 200 }} />
                </Stack>
            </PageLayout>
        );
    }

    if (!profile) {
        return (
            <PageLayout title="Manage Showcase" backTo="/" backLabel="Dashboard">
                <div className="showcase-mgmt__empty">
                    <div className="showcase-mgmt__empty-icon">🌟</div>
                    <Paragraph>No showcase profile found.</Paragraph>
                    <Paragraph size="sm">
                        Showcase activities from your pipeline runs to create your public profile.
                    </Paragraph>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Manage Showcase" backTo="/" backLabel="Dashboard">
            <Stack gap="lg">
                {/* Toast notification */}
                {toast && (
                    <div className={`showcase-mgmt__toast showcase-mgmt__toast--${toast.type}`}>
                        {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                    </div>
                )}

                {/* Profile Picture & Basic Info */}
                <div className="showcase-mgmt__section">
                    <h3 className="showcase-mgmt__section-title">
                        <span>👤</span> Profile
                    </h3>
                    <Stack gap="md">
                        <div className="showcase-mgmt__avatar-section">
                            <div className="showcase-mgmt__avatar-preview">
                                {profile.profilePictureUrl ? (
                                    <img src={profile.profilePictureUrl} alt="Profile" />
                                ) : (
                                    '🏃'
                                )}
                            </div>
                            <div className="showcase-mgmt__avatar-actions">
                                <Button variant="secondary" size="small" onClick={handlePictureUpload}>
                                    Upload Photo
                                </Button>
                                <span className="showcase-mgmt__avatar-hint">
                                    WebP recommended • Max 5MB
                                </span>
                            </div>
                        </div>

                        <div className="showcase-mgmt__field">
                            <label className="showcase-mgmt__label">Subtitle</label>
                            <input
                                type="text"
                                className="showcase-mgmt__input"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value.slice(0, 100))}
                                placeholder="e.g. Marathon runner & trail enthusiast"
                                maxLength={100}
                            />
                            <span className="showcase-mgmt__char-count">{subtitle.length}/100</span>
                        </div>

                        <div className="showcase-mgmt__field">
                            <label className="showcase-mgmt__label">Bio</label>
                            <textarea
                                className="showcase-mgmt__input showcase-mgmt__textarea"
                                value={bio}
                                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                                placeholder="Tell visitors about your fitness journey..."
                                maxLength={500}
                            />
                            <span className="showcase-mgmt__char-count">{bio.length}/500</span>
                        </div>

                        <div className="showcase-mgmt__actions">
                            <Button variant="primary" size="small" onClick={handleSaveProfile} disabled={saving}>
                                {saving ? 'Saving…' : 'Save Profile'}
                            </Button>
                        </div>
                    </Stack>
                </div>

                {/* Slug Management */}
                <div className="showcase-mgmt__section">
                    <h3 className="showcase-mgmt__section-title">
                        <span>🔗</span> Public URL
                    </h3>
                    <Stack gap="sm">
                        <div className="showcase-mgmt__slug-row">
                            <div className="showcase-mgmt__field">
                                <span className="showcase-mgmt__slug-prefix">fitglue.tech/u/</span>
                                <input
                                    type="text"
                                    className="showcase-mgmt__input"
                                    value={slug}
                                    onChange={(e) => {
                                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                                        setSlugError('');
                                    }}
                                    placeholder="your-slug"
                                />
                            </div>
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={handleSaveSlug}
                                disabled={savingSlug || slug === profile.slug}
                            >
                                {savingSlug ? 'Updating…' : 'Update Slug'}
                            </Button>
                        </div>
                        {slugError && <div className="showcase-mgmt__slug-error">{slugError}</div>}
                        {profileVisible ? (
                            <a
                                href={`/u/${encodeURIComponent(profile.slug)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="showcase-mgmt__view-link"
                            >
                                View public profile →
                            </a>
                        ) : (
                            <span className="showcase-mgmt__view-link showcase-mgmt__view-link--hidden">
                                🔒 Profile is hidden — enable visibility in Preferences to share
                            </span>
                        )}
                    </Stack>
                </div>

                {/* Showcased Activities */}
                <div className="showcase-mgmt__section">
                    <h3 className="showcase-mgmt__section-title">
                        <span>🏆</span> Showcased Activities ({activities.filter(a => a.inProfile).length})
                    </h3>

                    {activities.length === 0 ? (
                        <div className="showcase-mgmt__empty">
                            <Paragraph size="sm">
                                No activities have been showcased yet. Set up a pipeline with the Showcase destination to get started.
                            </Paragraph>
                        </div>
                    ) : (
                        <div className="showcase-mgmt__activity-list">
                            {activities.map(activity => (
                                <div key={activity.showcaseId} className="showcase-mgmt__activity-item">
                                    <div className="showcase-mgmt__activity-info">
                                        <span className="showcase-mgmt__activity-title">
                                            {activity.title || 'Untitled Activity'}
                                        </span>
                                        <span className="showcase-mgmt__activity-meta">
                                            {activity.activityType} • {activity.source}
                                            {activity.startTime && ` • ${new Date(activity.startTime).toLocaleDateString()}`}
                                        </span>
                                    </div>
                                    <div className="showcase-mgmt__activity-actions">
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Default Destination Preference */}
                <div className="showcase-mgmt__section">
                    <h3 className="showcase-mgmt__section-title">
                        <span>⚡</span> Preferences
                    </h3>
                    <Stack gap="md">
                        <div className="showcase-mgmt__toggle">
                            <div className="showcase-mgmt__toggle-info">
                                <span className="showcase-mgmt__toggle-label">
                                    Profile visibility
                                </span>
                                <span className="showcase-mgmt__toggle-desc">
                                    {profileVisible
                                        ? 'Your profile is publicly visible'
                                        : 'Your profile is hidden — visitors will see a 404'}
                                </span>
                            </div>
                            <label className="showcase-mgmt__switch">
                                <input
                                    type="checkbox"
                                    checked={profileVisible}
                                    onChange={handleToggleVisibility}
                                />
                                <span className="showcase-mgmt__switch-track" />
                            </label>
                        </div>

                        <div className="showcase-mgmt__toggle">
                            <div className="showcase-mgmt__toggle-info">
                                <span className="showcase-mgmt__toggle-label">
                                    Default destination for new pipelines
                                </span>
                                <span className="showcase-mgmt__toggle-desc">
                                    Automatically add Showcase as a destination when creating new pipelines
                                </span>
                            </div>
                            <label className="showcase-mgmt__switch">
                                <input
                                    type="checkbox"
                                    checked={defaultDestination}
                                    onChange={handleToggleDefaultDestination}
                                    disabled={loadingPrefs}
                                />
                                <span className="showcase-mgmt__switch-track" />
                            </label>
                        </div>
                    </Stack>
                </div>
            </Stack>
        </PageLayout>
    );
};

export default ShowcaseManagementPage;

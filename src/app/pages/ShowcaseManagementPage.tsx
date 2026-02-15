import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageLayout, Stack } from '../components/library/layout';
import { Button, Paragraph, Card, Heading, Link, CardSkeleton, Avatar, Pagination } from '../components/library/ui';
import { FormField, Input, Textarea, Toggle } from '../components/library/forms';
import { useApi } from '../hooks/useApi';
import { useToast } from '../components/library/ui/Toast/Toast';
import { ImageCropModal } from '../components/ImageCropModal';
import { formatActivityType, formatActivitySource } from '../../types/pb/enum-formatters';
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



const ShowcaseManagementPage: React.FC = () => {
    const api = useApi();
    const { success: showSuccess, error: showError } = useToast();

    // Profile state
    const [profile, setProfile] = useState<ShowcaseProfile | null>(null);
    const [activities, setActivities] = useState<ShowcaseActivity[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Editable fields
    const [subtitle, setSubtitle] = useState('');
    const [bio, setBio] = useState('');
    const [slug, setSlug] = useState('');
    const [slugError, setSlugError] = useState('');
    const [saving, setSaving] = useState(false);
    const [savingSlug, setSavingSlug] = useState(false);

    // Picture upload status
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');

    // Default destination
    const [defaultDestination, setDefaultDestination] = useState(false);
    const [profileVisible, setProfileVisible] = useState(true);
    const [loadingPrefs, setLoadingPrefs] = useState(true);



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
            showError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [api, showError]);

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
            showSuccess('Profile updated');
        } catch (err) {
            console.error('Failed to save profile:', err);
            showError('Failed to save profile');
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
            showSuccess('Slug updated');
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
            showSuccess(newVal ? 'Showcase will be added to new pipelines' : 'Default destination disabled');
        } catch (err) {
            // Revert on failure
            setDefaultDestination(!newVal);
            console.error('Failed to update preference:', err);
            showError('Failed to update preference');
        }
    };

    // Toggle profile visibility
    const handleToggleVisibility = async () => {
        const newVal = !profileVisible;
        setProfileVisible(newVal);
        try {
            await api.patch('/showcase-management/profile', { visible: newVal });
            showSuccess(newVal ? 'Profile is now publicly visible' : 'Profile is now hidden');
        } catch (err) {
            setProfileVisible(!newVal);
            console.error('Failed to update visibility:', err);
            showError('Failed to update visibility');
        }
    };

    // Remove activity from profile (optimistic)
    const handleRemoveEntry = async (showcaseId: string) => {
        // Optimistic update
        setActivities(prev => prev.map(a =>
            a.showcaseId === showcaseId ? { ...a, inProfile: false } : a
        ));
        try {
            await api.delete(`/showcase-management/profile/entries/${showcaseId}`);
            showSuccess('Entry removed');
        } catch (err) {
            // Revert on failure
            setActivities(prev => prev.map(a =>
                a.showcaseId === showcaseId ? { ...a, inProfile: true } : a
            ));
            console.error('Failed to remove entry:', err);
            showError('Failed to remove entry');
        }
    };

    // Add activity to profile (optimistic)
    const handleAddEntry = async (showcaseId: string) => {
        // Optimistic update
        setActivities(prev => prev.map(a =>
            a.showcaseId === showcaseId ? { ...a, inProfile: true } : a
        ));
        try {
            await api.post(`/showcase-management/profile/entries/${showcaseId}`);
            showSuccess('Entry added');
        } catch (err) {
            // Revert on failure
            setActivities(prev => prev.map(a =>
                a.showcaseId === showcaseId ? { ...a, inProfile: false } : a
            ));
            console.error('Failed to add entry:', err);
            showError('Failed to add entry');
        }
    };

    // Pagination derived values
    const totalPages = useMemo(() => Math.max(1, Math.ceil(activities.length / pageSize)), [activities.length, pageSize]);
    const paginatedActivities = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return activities.slice(start, start + pageSize);
    }, [activities, currentPage, pageSize]);

    // Reset to page 1 if current page is out of bounds
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    // Picture crop state
    const [cropImage, setCropImage] = useState<string | null>(null);

    // Picture upload — pick file first, then show crop modal
    const handlePictureUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;
            const objectUrl = URL.createObjectURL(file);
            setCropImage(objectUrl);
        };
        input.click();
    };

    // After cropping, upload the cropped blob
    const handleCropComplete = async (croppedBlob: Blob) => {
        // Close the crop modal
        if (cropImage) URL.revokeObjectURL(cropImage);
        setCropImage(null);

        setUploading(true);
        setUploadStatus('Preparing upload…');

        try {
            // Cropped output is always WebP from canvas
            const data = await api.post('/showcase-management/profile/picture', {
                contentType: 'image/webp',
            }) as {
                uploadUrl: string;
                publicUrl: string;
                contentType: string;
                maxSizeBytes: number;
            };

            setUploadStatus('Uploading photo…');

            // Upload to GCS via signed URL
            // x-goog-content-length-range must match the extensionHeaders used during signing
            const uploadResponse = await fetch(data.uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': data.contentType,
                    'x-goog-content-length-range': `0,${data.maxSizeBytes}`,
                },
                body: croppedBlob,
            });
            if (!uploadResponse.ok) {
                throw new Error(`GCS upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
            }

            setUploadStatus('Saving…');

            // Update profile with the new URL
            await api.patch('/showcase-management/profile', {
                profilePictureUrl: data.publicUrl,
            });

            showSuccess('Profile picture updated');
            fetchProfile();
        } catch (err) {
            console.error('Failed to upload picture:', err);
            const msg = err instanceof Error && err.message.startsWith('GCS upload')
                ? 'Failed to upload photo — please try again'
                : 'Failed to update profile picture';
            showError(msg);
        } finally {
            setUploading(false);
            setUploadStatus('');
        }
    };

    const handleCropCancel = () => {
        if (cropImage) URL.revokeObjectURL(cropImage);
        setCropImage(null);
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


                {/* Profile Picture & Basic Info */}
                <Card className="showcase-mgmt__section">
                    <Stack gap="md">
                        <Heading level={3} className="showcase-mgmt__section-title">
                            👤 Profile
                        </Heading>
                        <Stack direction="horizontal" className="showcase-mgmt__avatar-section" gap="md" align="center">
                            <Avatar
                                initial={profile.displayName?.charAt(0) || '?'}
                                src={profile.profilePictureUrl || undefined}
                                size="lg"
                            />
                            <Stack className="showcase-mgmt__avatar-actions" gap="xs">
                                <Button variant="secondary" size="small" onClick={handlePictureUpload} disabled={uploading}>
                                    {uploading ? '⏳ Uploading…' : 'Upload Photo'}
                                </Button>
                                <Paragraph size="sm" muted className="showcase-mgmt__avatar-hint">
                                    {uploadStatus || 'WebP recommended • Max 5MB'}
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
                            <>
                                <Stack className="showcase-mgmt__activity-list" gap="sm">
                                    {paginatedActivities.map(activity => (
                                        <Card key={activity.showcaseId} className="showcase-mgmt__activity-item">
                                            <Stack direction="horizontal" align="center" justify="between">
                                                <Stack className="showcase-mgmt__activity-info" gap="xs">
                                                    <Paragraph className="showcase-mgmt__activity-title">
                                                        {activity.title || 'Untitled Activity'}
                                                    </Paragraph>
                                                    <Paragraph size="sm" muted className="showcase-mgmt__activity-meta">
                                                        {formatActivityType(activity.activityType)} • {formatActivitySource(activity.source)}
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
                                {totalPages > 1 && (
                                    <Stack className="showcase-mgmt__pagination">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            totalItems={activities.length}
                                            pageSize={pageSize}
                                            onPageChange={setCurrentPage}
                                            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                                            showPageSize
                                            pageSizeOptions={[10, 25, 50]}
                                            compact
                                        />
                                    </Stack>
                                )}
                            </>
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
                                ? 'Your profile is publicly visible. Changes may take up to 5 minutes to reflect.'
                                : 'Your profile is hidden — visitors will see a 404. Changes may take up to 5 minutes to reflect.'}
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

                {/* Image Crop Modal */}
                {cropImage && (
                    <ImageCropModal
                        imageSrc={cropImage}
                        onCropComplete={handleCropComplete}
                        onClose={handleCropCancel}
                    />
                )}
            </Stack>
        </PageLayout>
    );
};

export default ShowcaseManagementPage;

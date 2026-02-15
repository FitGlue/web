import React, { useState } from 'react';
import {
    reauthenticateWithCredential,
    EmailAuthProvider,
    User
} from 'firebase/auth';
import { Modal } from './library/ui';
import { Input, FormField } from './library/forms';
import { Button, Paragraph } from './library/ui';
import { Stack } from './library/layout';

interface ReauthModalProps {
    /** The Firebase Auth user to re-authenticate */
    user: User;
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback when re-authentication succeeds */
    onSuccess: () => void;
    /** Callback when the modal is cancelled */
    onCancel: () => void;
    /** Optional heading override */
    title?: string;
    /** Optional description override */
    description?: string;
}

/**
 * ReauthModal prompts the user for their current password to re-authenticate
 * before performing sensitive operations (change email, change password, etc.).
 *
 * Firebase requires recent authentication for security-sensitive operations
 * and throws `auth/requires-recent-login` if the session is too old.
 */
export const ReauthModal: React.FC<ReauthModalProps> = ({
    user,
    isOpen,
    onSuccess,
    onCancel,
    title = 'Confirm Your Identity',
    description = 'For security, please enter your current password to continue.',
}) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!password.trim() || !user.email) return;

        setError('');
        setLoading(true);

        try {
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);
            setPassword('');
            onSuccess();
        } catch (e: unknown) {
            const firebaseError = e as { code?: string };
            if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
                setError('Incorrect password. Please try again.');
            } else {
                setError(e instanceof Error ? e.message : 'Authentication failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPassword('');
        setError('');
        onCancel();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && password.trim()) {
            handleSubmit();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={title}
            size="sm"
            closeOnBackdrop={false}
            footer={
                <Stack direction="horizontal" gap="sm" justify="end">
                    <Button variant="secondary" size="small" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        size="small"
                        onClick={handleSubmit}
                        disabled={loading || !password.trim()}
                    >
                        {loading ? 'Verifying...' : 'Confirm'}
                    </Button>
                </Stack>
            }
        >
            <Stack gap="md">
                <Paragraph size="sm" muted>{description}</Paragraph>
                <FormField label="Current Password" htmlFor="reauth-password">
                    <Input
                        id="reauth-password"
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter your password"
                        disabled={loading}
                    />
                </FormField>
                {error && <Paragraph size="sm">{error}</Paragraph>}
            </Stack>
        </Modal>
    );
};

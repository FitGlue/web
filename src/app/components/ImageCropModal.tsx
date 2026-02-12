import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Modal } from './library/ui/Modal';
import { Button } from './library/ui/Button';
import { Stack } from './library/layout/Stack';
import { Paragraph } from './library/ui/Paragraph';
import { RangeSlider } from './library/forms';
import './ImageCropModal.css';

interface ImageCropModalProps {
    /** The image source (object URL) to crop */
    imageSrc: string;
    /** Called with the cropped blob when the user confirms */
    onCropComplete: (croppedBlob: Blob) => void;
    /** Called when the modal is closed/cancelled */
    onClose: () => void;
}

/**
 * Extracts a circular-crop-ready square region from an image using canvas.
 */
async function getCroppedBlob(imageSrc: string, crop: Area): Promise<Blob> {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = reject;
        image.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
    );

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas toBlob failed'));
            },
            'image/webp',
            0.9
        );
    });
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
    imageSrc,
    onCropComplete,
    onClose,
}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return;
        setProcessing(true);
        try {
            const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
            onCropComplete(blob);
        } catch (err) {
            console.error('Failed to crop image:', err);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Crop Profile Picture"
            size="md"
            closeOnBackdrop={false}
            footer={
                <Stack direction="horizontal" gap="sm" justify="end">
                    <Button variant="secondary" onClick={onClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleConfirm} disabled={processing}>
                        {processing ? 'Cropping…' : '✂️ Crop & Upload'}
                    </Button>
                </Stack>
            }
        >
            <Stack gap="md">
                <Paragraph size="sm" muted>
                    Drag to reposition, scroll or use the slider to zoom. The circular area will be your profile picture.
                </Paragraph>
                {/* Container requires positioned div for react-easy-crop */}
                {/* eslint-disable-next-line react/forbid-dom-props */}
                <Stack className="image-crop-modal__container">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={handleCropComplete}
                    />
                </Stack>
                <RangeSlider
                    label="🔍 Zoom"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                />
            </Stack>
        </Modal>
    );
};

export default ImageCropModal;

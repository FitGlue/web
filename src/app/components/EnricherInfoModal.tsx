import React from 'react';
import { PluginManifest } from '../types/plugin';
import { Button } from './ui/Button';
import { PluginIcon } from './ui/PluginIcon';
import './EnricherInfoModal.css';

interface Props {
    enricher: PluginManifest;
    onClose: () => void;
}

export const EnricherInfoModal: React.FC<Props> = ({ enricher, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="enricher-info-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

                <div className="enricher-info-header">
                    <PluginIcon
                        icon={enricher.icon}
                        iconType={enricher.iconType}
                        iconPath={enricher.iconPath}
                        size="large"
                        className="enricher-info-icon"
                    />
                    <h2>{enricher.name}</h2>
                </div>

                <p className="enricher-info-description">{enricher.description}</p>

                {enricher.marketingDescription && (
                    <div className="enricher-info-marketing">
                        {enricher.marketingDescription}
                    </div>
                )}

                {enricher.configSchema && enricher.configSchema.length > 0 && (
                    <div className="enricher-info-config-preview">
                        <h4>Configuration Options</h4>
                        <ul>
                            {enricher.configSchema.map(field => (
                                <li key={field.key}>
                                    <strong>{field.label}</strong>
                                    {field.required && <span className="required-badge">Required</span>}
                                    {field.description && (
                                        <span className="field-description">{field.description}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {enricher.transformations && enricher.transformations.length > 0 && (
                    <div className="enricher-info-examples">
                        <h4>Example Transformation</h4>
                        <div className="transformation-preview">
                            <div className="before">
                                <span className="label">Before</span>
                                <code>{enricher.transformations[0].before}</code>
                            </div>
                            <span className="arrow">→</span>
                            <div className="after">
                                <span className="label">After</span>
                                <code>{enricher.transformations[0].after}</code>
                            </div>
                        </div>
                    </div>
                )}

                {enricher.useCases && enricher.useCases.length > 0 && (
                    <div className="enricher-info-use-cases">
                        <h4>Perfect For</h4>
                        <ul>
                            {enricher.useCases.slice(0, 3).map((useCase, i) => (
                                <li key={i}>🎯 {useCase}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="enricher-info-actions">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
};

export default EnricherInfoModal;

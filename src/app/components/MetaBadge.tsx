import { stringToColor } from '../../lib/colorUtils';

interface MetaBadgeProps {
  label: string;
  value: string;
  variant?: 'type' | 'source' | 'default';
}

export const MetaBadge: React.FC<MetaBadgeProps> = ({ label, value, variant = 'default' }) => {
  const { style, className } = stringToColor(value);

  return (
    <span className={`meta-badge ${className}`} style={style}>
      <span className="meta-label">{label}:</span> {value}
    </span>
  );
};

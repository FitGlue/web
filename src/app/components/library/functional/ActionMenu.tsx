import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { Stack } from '../layout';
import { Button } from '../ui';
import './ActionMenu.css';

export interface ActionMenuProps {
  trigger: ReactNode;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  children: ReactNode;
}

export interface ActionMenuItemProps {
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  trigger,
  position = 'bottom-right',
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const classes = [
    'ui-action-menu',
    isOpen && 'ui-action-menu--open',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} ref={menuRef}>
      <span
       
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </span>
      {isOpen && (
        <div className={`ui-action-menu__dropdown ui-action-menu__dropdown--${position}`}>
          {React.Children.map(children, child => {
            if (React.isValidElement<ActionMenuItemProps>(child)) {
              return React.cloneElement(child, {
                onClick: () => {
                  child.props.onClick();
                  setIsOpen(false);
                },
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

export const ActionMenuItem: React.FC<ActionMenuItemProps> = ({
  onClick,
  destructive = false,
  disabled = false,
  icon,
  children,
}) => {
  const classes = [
    'ui-action-menu-item',
    destructive && 'ui-action-menu-item--destructive',
    disabled && 'ui-action-menu-item--disabled',
  ].filter(Boolean).join(' ');

  return (
    <Button
      type="button"
      variant="text"
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      <Stack direction="horizontal" gap="xs" align="center">
        {icon && <span>{icon}</span>}
        <span>{children}</span>
      </Stack>
    </Button>
  );
};

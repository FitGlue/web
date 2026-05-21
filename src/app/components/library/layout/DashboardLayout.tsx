import React, { ReactNode } from 'react';
import './DashboardLayout.css';

interface DashboardColProps {
    children?: ReactNode;
}

export const DashboardCol: React.FC<DashboardColProps> = ({ children }) => (
    <div className="dash-col">{children}</div>
);

interface DashboardBodyProps {
    children: ReactNode;
}

export const DashboardBody: React.FC<DashboardBodyProps> = ({ children }) => (
    <div className="dash-body">{children}</div>
);

interface DashboardLayoutProps {
    children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => (
    <div className="dash-layout">{children}</div>
);

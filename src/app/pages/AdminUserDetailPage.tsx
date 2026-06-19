import React from 'react';
import { useParams } from 'react-router-dom';
import { PageLayout } from '../components/library/layout';
import { AdminUserPane } from '../components/admin';
import '../components/admin/admin.css';

/**
 * AdminUserDetailPage — standalone dense user record for the /admin/users/:id
 * deep-link. The same pane is used inline in the users console.
 */
const AdminUserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <PageLayout fullWidth backTo="/admin" backLabel="admin">
      <div className="adm" style={{ maxWidth: 760 }}>
        {id ? <AdminUserPane userId={id} /> : <div className="adm__placeholder">No user id.</div>}
      </div>
    </PageLayout>
  );
};

export default AdminUserDetailPage;

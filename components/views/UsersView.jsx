import { useState } from "react";
import { UserPlus, ShieldCheck, Trash2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDeleteDialog from "../common/ConfirmDeleteDialog";
import PageHeader from "../common/PageHeader";
import { isSuperAdmin, ROLES, roleLabel } from "@/lib/roles";

function RolePill({ role }) {
  const icon =
    role === ROLES.SUPER_ADMIN ? <Crown size={12} /> :
    role === ROLES.ADMIN ? <ShieldCheck size={12} /> :
    null;

  return (
    <span className={`role-pill ${role}`}>
      {icon} {roleLabel(role)}
    </span>
  );
}

export default function UsersView({ users, currentUser, onAdd, onDelete }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      /* toast handled in hook */
    } finally {
      setDeleting(false);
    }
  }

  function canDelete(user) {
    if (user.id === currentUser.id) return false;
    if (isSuperAdmin(user.role)) return false;
    if (user.role === ROLES.ADMIN) {
      if (isSuperAdmin(currentUser.role)) return true;
      const adminCount = users.filter((u) => u.role === ROLES.ADMIN).length;
      return adminCount > 1;
    }
    return true;
  }

  function protectedLabel(user) {
    if (user.id === currentUser.id) return "You";
    if (isSuperAdmin(user.role)) return "Super admin";
    return "Protected admin";
  }

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Super admins and admins can add staff or other admins."
        action={<button className="btn btn-primary page-head-action" onClick={onAdd}><UserPlus size={16} /> Add employee</button>}
      />
      <div className="panel">
        <table className="ledger ledger--desktop">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td className="cell-sub">{u.email}</td>
                <td>
                  <RolePill role={u.role} />
                </td>
                <td className="text-right">
                  {canDelete(u) ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(u)}
                      title="Remove employee"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {protectedLabel(u)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mobile-card-list">
          {users.map((u) => (
            <article key={u.id} className="mobile-card mobile-card--flat">
              <div className="mobile-card-head">
                <div>
                  <div className="cell-title">{u.name}</div>
                  <div className="cell-sub">{u.email}</div>
                </div>
                <RolePill role={u.role} />
              </div>
              <div className="mobile-card-foot">
                {canDelete(u) ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(u)}
                  >
                    <Trash2 className="size-4" /> Remove
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {u.id === currentUser.id ? "Your account" : protectedLabel(u)}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="note-block">
        Super admin and admins can add employees. Admins can create other admins. The super admin account is set by{" "}
        <code>SUPER_ADMIN_EMAIL</code> in your environment and cannot be removed from the app.
      </div>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Remove "${deleteTarget?.name}"?`}
        description={`This permanently removes the employee account "${deleteTarget?.email}". They will no longer be able to sign in.`}
        confirmLabel="Remove"
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}

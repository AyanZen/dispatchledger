"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePortal } from "@/components/providers/PortalProvider";
import UsersView from "@/components/views/UsersView";
import { isAdminLevel } from "@/lib/roles";

export default function UsersPage() {
  const router = useRouter();
  const { users, currentUser, setShowAddUser, deleteUser } = usePortal();

  useEffect(() => {
    if (currentUser && !isAdminLevel(currentUser.role)) {
      router.replace("/dashboard");
    }
  }, [currentUser, router]);

  if (!isAdminLevel(currentUser?.role)) return null;

  return (
    <UsersView
      users={users}
      currentUser={currentUser}
      onAdd={() => setShowAddUser(true)}
      onDelete={deleteUser}
    />
  );
}

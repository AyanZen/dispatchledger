"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePortal } from "@/components/providers/PortalProvider";
import UsersView from "@/components/views/UsersView";

export default function UsersPage() {
  const router = useRouter();
  const { users, currentUser, setShowAddUser, deleteUser } = usePortal();

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [currentUser, router]);

  if (currentUser?.role !== "admin") return null;

  return (
    <UsersView
      users={users}
      currentUser={currentUser}
      onAdd={() => setShowAddUser(true)}
      onDelete={deleteUser}
    />
  );
}

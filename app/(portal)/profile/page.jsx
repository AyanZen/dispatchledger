"use client";

import { usePortal } from "@/components/providers/PortalProvider";
import ProfileView from "@/components/views/ProfileView";

export default function ProfilePage() {
  const { currentUser, changePassword } = usePortal();
  return (
    <ProfileView
      currentUser={currentUser}
      onChangePassword={changePassword}
    />
  );
}

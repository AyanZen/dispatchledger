"use client";

import { usePortal } from "@/components/providers/PortalProvider";
import FranchisesList from "@/components/views/FranchisesList";

export default function FranchisesPage() {
  const {
    franchiseSummaries,
    search,
    setSearch,
    setShowAddFranchise,
    openFranchise,
    currentUser,
    deleteFranchise,
  } = usePortal();

  return (
    <FranchisesList
      franchises={franchiseSummaries}
      search={search}
      setSearch={setSearch}
      onAdd={() => setShowAddFranchise(true)}
      onOpen={openFranchise}
      isAdmin={currentUser?.role === "admin"}
      onDelete={deleteFranchise}
    />
  );
}

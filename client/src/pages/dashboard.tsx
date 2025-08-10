import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "../components/header";
import DashboardStats from "../components/dashboard-stats";
import DomainTable from "../components/domain-table";
import NameserverModal from "../components/nameserver-modal";
import DomainSearch from "../components/domain-search";
import { DomainFilters } from "@/lib/types";
import { DomainWithConnection } from "@shared/schema";

export default function Dashboard() {
  const [filters, setFilters] = useState<DomainFilters>({
    registrar: "",
    status: "",
    search: "",
  });
  
  const [selectedDomainIds, setSelectedDomainIds] = useState<string[]>([]);
  const [isNameserverModalOpen, setIsNameserverModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<DomainWithConnection | null>(null);

  const handleEditNameservers = (domain: DomainWithConnection) => {
    setSelectedDomain(domain);
    setIsNameserverModalOpen(true);
  };

  const handleCloseNameserverModal = () => {
    setIsNameserverModalOpen(false);
    setSelectedDomain(null);
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardStats />
        
        <div className="mt-8 mb-8">
          <DomainSearch />
        </div>
        
        <DomainTable
          filters={filters}
          onFiltersChange={setFilters}
          selectedDomainIds={selectedDomainIds}
          onSelectionChange={setSelectedDomainIds}
          onEditNameservers={handleEditNameservers}
        />
        
        <NameserverModal
          isOpen={isNameserverModalOpen}
          onClose={handleCloseNameserverModal}
          domain={selectedDomain}
        />
      </main>
    </div>
  );
}

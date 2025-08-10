import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreVertical, Edit, Network, Search, Download, ArrowUpDown, Globe } from "lucide-react";
import { DomainFilters } from "@/lib/types";
import { DomainWithConnection } from "@shared/schema";
import { format, differenceInDays } from "date-fns";

interface DomainTableProps {
  filters: DomainFilters;
  onFiltersChange: (filters: DomainFilters) => void;
  selectedDomainIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEditNameservers: (domain: DomainWithConnection) => void;
}

export default function DomainTable({
  filters,
  onFiltersChange,
  selectedDomainIds,
  onSelectionChange,
  onEditNameservers,
}: DomainTableProps) {
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const { data: domains = [], isLoading } = useQuery<DomainWithConnection[]>({
    queryKey: ["/api/domains", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.registrar && filters.registrar !== 'all') params.set('registrar', filters.registrar);
      if (filters.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      
      const url = `/api/domains${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch domains');
      return response.json();
    },
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(domains.map((d) => d.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectDomain = (domainId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedDomainIds, domainId]);
    } else {
      onSelectionChange(selectedDomainIds.filter((id) => id !== domainId));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Active", className: "status-active" },
      expiring: { label: "Expiring Soon", className: "status-expiring" },
      expired: { label: "Expired", className: "status-expired" },
      pending: { label: "Pending", className: "status-pending" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <Badge className={`status-indicator ${config.className}`}>
        <div className="w-1.5 h-1.5 bg-current rounded-full mr-1.5" />
        {config.label}
      </Badge>
    );
  };

  const getRegistrarBadge = (registrar: string) => {
    const registrarConfig = {
      godaddy: { label: "GoDaddy", className: "registrar-godaddy", icon: "🔷" },
      namecheap: { label: "Namecheap", className: "registrar-namecheap", icon: "🛒" },
      dynadot: { label: "Dynadot", className: "registrar-dynadot", icon: "🚀" },
    };

    const config = registrarConfig[registrar as keyof typeof registrarConfig] || registrarConfig.godaddy;
    return (
      <Badge className={`status-indicator ${config.className}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </Badge>
    );
  };

  const getDaysUntilExpiration = (expirationDate: Date) => {
    return differenceInDays(new Date(expirationDate), new Date());
  };

  const getDomainAge = (registrationDate: Date) => {
    const years = differenceInDays(new Date(), new Date(registrationDate)) / 365;
    return years.toFixed(1);
  };

  const formatNameservers = (nameservers: string[]) => {
    if (!Array.isArray(nameservers) || nameservers.length === 0) {
      return "No nameservers";
    }
    return nameservers.join(", ");
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-card overflow-hidden">
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-card overflow-hidden">
      {/* Table Header Controls */}
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Checkbox
                checked={selectedDomainIds.length === domains.length && domains.length > 0}
                onCheckedChange={handleSelectAll}
                data-testid="checkbox-select-all"
              />
              <label className="ml-2 text-sm text-muted-foreground">Select All</label>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled={selectedDomainIds.length === 0} data-testid="button-bulk-update">
                <Edit className="h-4 w-4 mr-1" />
                Bulk Update
              </Button>
              <Button variant="outline" size="sm" data-testid="button-export">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                placeholder="Search domains..."
                value={filters.search}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                className="pl-10 w-64"
                data-testid="input-search-domains"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Select value={filters.registrar} onValueChange={(value) => onFiltersChange({ ...filters, registrar: value })}>
              <SelectTrigger className="w-48" data-testid="select-filter-registrar">
                <SelectValue placeholder="All Registrars" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Registrars</SelectItem>
                <SelectItem value="godaddy">GoDaddy</SelectItem>
                <SelectItem value="namecheap">Namecheap</SelectItem>
                <SelectItem value="dynadot">Dynadot</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => onFiltersChange({ ...filters, status: value })}>
              <SelectTrigger className="w-48" data-testid="select-filter-status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50" 
                onClick={() => handleSort("domain")}
                data-testid="header-domain"
              >
                <div className="flex items-center space-x-1">
                  <span>Domain</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50" 
                onClick={() => handleSort("registrar")}
                data-testid="header-registrar"
              >
                <div className="flex items-center space-x-1">
                  <span>Registrar</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50" 
                onClick={() => handleSort("status")}
                data-testid="header-status"
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50" 
                onClick={() => handleSort("expiration")}
                data-testid="header-expiration"
              >
                <div className="flex items-center space-x-1">
                  <span>Expiration</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50" 
                onClick={() => handleSort("age")}
                data-testid="header-age"
              >
                <div className="flex items-center space-x-1">
                  <span>Age</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead>Nameservers</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {domains.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No domains found</p>
                    <p className="text-sm">Connect your registrar APIs to start managing domains</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              domains.map((domain) => {
                const daysUntilExpiration = getDaysUntilExpiration(domain.expirationDate);
                const isExpiringSoon = daysUntilExpiration <= 30 && daysUntilExpiration > 0;
                
                return (
                  <TableRow 
                    key={domain.id} 
                    className="domain-table-hover"
                    data-testid={`row-domain-${domain.id}`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedDomainIds.includes(domain.id)}
                        onCheckedChange={(checked) => handleSelectDomain(domain.id, checked as boolean)}
                        data-testid={`checkbox-domain-${domain.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`text-domain-name-${domain.id}`}>
                      {domain.name}
                    </TableCell>
                    <TableCell>
                      {getRegistrarBadge(domain.registrar)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(domain.status)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {format(new Date(domain.expirationDate), "MMM dd, yyyy")}
                        </div>
                        <div className={`text-xs ${isExpiringSoon ? "text-red-500" : "text-muted-foreground"}`}>
                          {daysUntilExpiration > 0 ? `${daysUntilExpiration} days` : "Expired"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {getDomainAge(domain.registrationDate)} years
                    </TableCell>
                    <TableCell className="max-w-48">
                      <div className="truncate text-sm">
                        {formatNameservers(domain.nameservers as string[])}
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-primary hover:text-primary/80 mt-1"
                        onClick={() => onEditNameservers(domain)}
                        data-testid={`button-edit-nameservers-${domain.id}`}
                      >
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          data-testid={`button-edit-domain-${domain.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          data-testid={`button-dns-domain-${domain.id}`}
                        >
                          <Network className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          data-testid={`button-more-domain-${domain.id}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Table Footer */}
      {domains.length > 0 && (
        <div className="px-6 py-3 bg-muted/30 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">1-{domains.length}</span> of{" "}
                <span className="font-medium">{domains.length}</span> domains
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

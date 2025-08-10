export interface DomainStats {
  totalDomains: number;
  expiringSoon: number;
  activeDomains: number;
  thisMonth: number;
}

export interface DomainFilters {
  registrar: string;
  status: string;
  search: string;
}

export interface BulkUpdateRequest {
  domainIds: string[];
  updates: Record<string, any>;
}

export interface RegistrarConnectionStatus {
  registrar: string;
  isConnected: boolean;
  lastSync?: Date;
}

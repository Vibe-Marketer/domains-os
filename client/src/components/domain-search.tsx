import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2 } from "lucide-react";

interface SearchResult {
  registrar: string;
  result: {
    domain_name: string;
    available: string;
    premium?: string;
    message?: string;
    price_list?: Array<{
      currency: string;
      unit: string;
      transfer: string;
      restore: string;
    }>;
  };
}

export default function DomainSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (domainName: string) => {
      const response = await apiRequest("GET", `/api/domains/search/${encodeURIComponent(domainName)}?showPrice=true`);
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.results || []);
      toast({
        title: "Search Complete",
        description: `Found results for ${searchTerm}`,
      });
    },
    onError: (error: any) => {
      console.error("Search error:", error);
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search domain",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchMutation.mutate(searchTerm.trim());
    }
  };

  const getAvailabilityColor = (available: string) => {
    switch (available.toLowerCase()) {
      case 'yes':
        return 'bg-green-500';
      case 'no':
        return 'bg-red-500';
      case 'unknown':
        return 'bg-gray-500';
      case 'error':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAvailabilityText = (available: string) => {
    switch (available.toLowerCase()) {
      case 'yes':
        return 'Available';
      case 'no':
        return 'Taken';
      case 'unknown':
        return 'Unknown';
      case 'error':
        return 'Error';
      default:
        return available;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Domain Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter domain name (e.g., example.com)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
            data-testid="input-domain-search"
          />
          <Button 
            type="submit" 
            disabled={searchMutation.isPending || !searchTerm.trim()}
            data-testid="button-search-domain"
          >
            {searchMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </Button>
        </form>

        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" data-testid="text-search-results">
              Search Results for "{searchTerm}"
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base capitalize">
                        {result.registrar}
                      </CardTitle>
                      <Badge 
                        className={`${getAvailabilityColor(result.result.available)} text-white`}
                        data-testid={`badge-availability-${result.registrar}`}
                      >
                        {getAvailabilityText(result.result.available)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Domain:</span>{" "}
                        <span data-testid={`text-domain-${result.registrar}`}>
                          {result.result.domain_name}
                        </span>
                      </div>
                      
                      {result.result.premium && (
                        <div>
                          <span className="font-medium">Premium:</span>{" "}
                          <span className={result.result.premium === 'yes' ? 'text-yellow-600' : 'text-gray-600'}>
                            {result.result.premium === 'yes' ? 'Yes' : 'No'}
                          </span>
                        </div>
                      )}
                      
                      {result.result.message && (
                        <div className="text-gray-600 text-xs">
                          {result.result.message}
                        </div>
                      )}
                      
                      {result.result.price_list && result.result.price_list.length > 0 && (
                        <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="text-xs font-medium mb-1">Pricing:</div>
                          {result.result.price_list.map((price, priceIndex) => (
                            <div key={priceIndex} className="text-xs space-y-1">
                              <div>Currency: {price.currency}</div>
                              {price.transfer && <div>Transfer: {price.transfer}</div>}
                              {price.restore && <div>Restore: {price.restore}</div>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {searchMutation.isPending && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching across registrars...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
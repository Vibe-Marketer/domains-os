import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { DomainWithConnection } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X, Save } from "lucide-react";

interface NameserverModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: DomainWithConnection | null;
}

export default function NameserverModal({ isOpen, onClose, domain }: NameserverModalProps) {
  const [nameservers, setNameservers] = useState({
    primary: "",
    secondary: "",
    additional: "",
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (domain && isOpen) {
      const ns = domain.nameservers as string[];
      setNameservers({
        primary: ns[0] || "",
        secondary: ns[1] || "",
        additional: ns.slice(2).join("\n"),
      });
    }
  }, [domain, isOpen]);

  const updateNameserversMutation = useMutation({
    mutationFn: async (data: { nameservers: string[] }) => {
      if (!domain) throw new Error("No domain selected");
      const response = await apiRequest("PATCH", `/api/domains/${domain.id}/nameservers`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      onClose();
      toast({
        title: "Success",
        description: "Nameservers updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update nameservers",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const allNameservers = [
      nameservers.primary.trim(),
      nameservers.secondary.trim(),
      ...nameservers.additional
        .split("\n")
        .map((ns) => ns.trim())
        .filter((ns) => ns.length > 0),
    ].filter((ns) => ns.length > 0);

    if (allNameservers.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one nameserver is required",
        variant: "destructive",
      });
      return;
    }

    updateNameserversMutation.mutate({ nameservers: allNameservers });
  };

  if (!domain) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Update Nameservers</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Domain: <span className="font-medium text-foreground">{domain.name}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Registrar: <span className="capitalize">{domain.registrar}</span>
          </p>
        </div>
        
        <Separator className="my-4" />
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primary-ns">Primary Nameserver *</Label>
            <Input
              id="primary-ns"
              value={nameservers.primary}
              onChange={(e) => setNameservers({ ...nameservers, primary: e.target.value })}
              placeholder="ns1.example.com"
              required
              data-testid="input-primary-nameserver"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secondary-ns">Secondary Nameserver *</Label>
            <Input
              id="secondary-ns"
              value={nameservers.secondary}
              onChange={(e) => setNameservers({ ...nameservers, secondary: e.target.value })}
              placeholder="ns2.example.com"
              required
              data-testid="input-secondary-nameserver"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="additional-ns">Additional Nameservers (Optional)</Label>
            <Textarea
              id="additional-ns"
              value={nameservers.additional}
              onChange={(e) => setNameservers({ ...nameservers, additional: e.target.value })}
              placeholder="ns3.example.com&#10;ns4.example.com"
              rows={3}
              className="resize-none"
              data-testid="textarea-additional-nameservers"
            />
            <p className="text-xs text-muted-foreground">
              Enter one nameserver per line
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateNameserversMutation.isPending}
              data-testid="button-cancel-nameserver-update"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateNameserversMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-update-nameservers"
            >
              {updateNameserversMutation.isPending ? (
                "Updating..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Nameservers
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
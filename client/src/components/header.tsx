import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRegistrarConnectionSchema, type RegistrarConnection } from "@shared/schema";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Globe, CheckCircle, AlertCircle, Clock, ExternalLink, Info } from "lucide-react";

const formSchema = insertRegistrarConnectionSchema.extend({
  registrar: z.enum(['godaddy', 'namecheap', 'dynadot']),
});

export default function Header() {
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [selectedRegistrar, setSelectedRegistrar] = useState<string>("godaddy");
  const { toast } = useToast();

  const { data: registrars = [] } = useQuery<RegistrarConnection[]>({
    queryKey: ["/api/registrars"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      registrar: "godaddy",
      apiKey: "",
      apiSecret: "",
      isActive: true,
    },
  });

  const getRegistrarInstructions = (registrar: string) => {
    const instructions = {
      godaddy: {
        title: "GoDaddy API Setup",
        description: "Get your API credentials from the GoDaddy Developer Console",
        steps: [
          "Go to GoDaddy Developer Console",
          "Sign in with your GoDaddy account",
          "Navigate to 'My API Keys'",
          "Create a new API key for production use",
          "Copy the API Key and Secret"
        ],
        url: "https://developer.godaddy.com/keys",
        apiKeyLabel: "API Key",
        apiSecretLabel: "API Secret",
        requiresSecret: true,
        note: "Make sure to use Production keys for live domains. OTE (testing) keys are for development only."
      },
      namecheap: {
        title: "Namecheap API Setup", 
        description: "Enable API access in your Namecheap account",
        steps: [
          "Log into your Namecheap account",
          "Go to Profile → Tools → Namecheap API access",
          "Enable API access for your account",
          "Whitelist your server IP address",
          "Note your username and API key"
        ],
        url: "https://ap.www.namecheap.com/settings/tools/apiaccess/",
        apiKeyLabel: "API Key",
        apiSecretLabel: "Username",
        requiresSecret: true,
        note: "API Secret field should contain your Namecheap username, not a separate secret."
      },
      dynadot: {
        title: "Dynadot API Setup",
        description: "Generate an API token in your Dynadot account",
        steps: [
          "Log into your Dynadot account",
          "Go to My Info → API Settings",
          "Generate a new API token",
          "Whitelist your server IP: 34.135.154.200",
          "Copy the API token"
        ],
        url: "https://www.dynadot.com/account/domain/setting/api.html",
        apiKeyLabel: "API Token",
        apiSecretLabel: "",
        requiresSecret: false,
        note: "Dynadot requires IP whitelisting. Make sure to add 34.135.154.200 to your allowed IPs."
      }
    };
    return instructions[registrar as keyof typeof instructions] || instructions.godaddy;
  };

  const createConnectionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/registrars", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrars"] });
      setIsConnectDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Registrar connection created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create registrar connection",
        variant: "destructive",
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const response = await apiRequest("POST", `/api/registrars/${connectionId}/sync`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      queryClient.invalidateQueries({ queryKey: ["/api/domains/stats"] });
      toast({
        title: "Sync Complete",
        description: `Synced ${data.syncedCount} domains successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync domains",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createConnectionMutation.mutate(data);
  };

  const getRegistrarStatus = (registrar: string) => {
    const connection = registrars.find((r) => r.registrar === registrar && r.isActive);
    if (!connection) return { status: 'disconnected', color: 'bg-gray-400' };
    
    if (connection.lastSync) {
      const lastSync = new Date(connection.lastSync);
      const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
      if (hoursSinceSync > 24) {
        return { status: 'warning', color: 'bg-yellow-500' };
      }
    }
    
    return { status: 'connected', color: 'bg-green-500' };
  };

  const handleSync = (connectionId: string) => {
    syncMutation.mutate(connectionId);
  };

  return (
    <header className="bg-white dark:bg-card border-b border-gray-200 dark:border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <Globe className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground" data-testid="header-title">Domains OS</h1>
            </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <a
                href="#"
                className="text-foreground hover:text-muted-foreground px-3 py-2 text-sm font-medium border-b-2 border-primary"
                data-testid="nav-domains"
              >
                Domains
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium"
                data-testid="nav-dns"
              >
                DNS
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium"
                data-testid="nav-settings"
              >
                Settings
              </a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* API Connection Status */}
            <div className="hidden sm:flex items-center space-x-3">
              {['godaddy', 'namecheap', 'dynadot'].map((registrar) => {
                const status = getRegistrarStatus(registrar);
                const connection = registrars.find((r) => r.registrar === registrar && r.isActive);
                
                return (
                  <div key={registrar} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 ${status.color} rounded-full`} />
                    <span className="text-xs text-muted-foreground capitalize">
                      {registrar}
                    </span>
                    {connection && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSync(connection.id)}
                        disabled={syncMutation.isPending}
                        className="h-6 px-2 text-xs"
                        data-testid={`sync-${registrar}`}
                      >
                        {syncMutation.isPending ? (
                          <Clock className="h-3 w-3" />
                        ) : (
                          "Sync"
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            
            <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-connect-api">
                  <Plus className="h-4 w-4 mr-2" />
                  Connect API
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Connect Your Domain Registrar</DialogTitle>
                </DialogHeader>
                
                <Tabs value={selectedRegistrar} onValueChange={(value) => {
                  setSelectedRegistrar(value);
                  form.setValue('registrar', value as any);
                }} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="godaddy" data-testid="tab-godaddy">GoDaddy</TabsTrigger>
                    <TabsTrigger value="namecheap" data-testid="tab-namecheap">Namecheap</TabsTrigger>
                    <TabsTrigger value="dynadot" data-testid="tab-dynadot">Dynadot</TabsTrigger>
                  </TabsList>
                  
                  {['godaddy', 'namecheap', 'dynadot'].map((registrar) => {
                    const instructions = getRegistrarInstructions(registrar);
                    return (
                      <TabsContent key={registrar} value={registrar} className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              {instructions.title}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(instructions.url, '_blank')}
                                data-testid={`link-${registrar}-docs`}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </CardTitle>
                            <CardDescription>{instructions.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <h4 className="font-medium">Step-by-step instructions:</h4>
                              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                                {instructions.steps.map((step, index) => (
                                  <li key={index}>{step}</li>
                                ))}
                              </ol>
                            </div>
                            
                            {instructions.note && (
                              <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>{instructions.note}</AlertDescription>
                              </Alert>
                            )}
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>Enter Your API Credentials</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Form {...form}>
                              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <input type="hidden" {...form.register('registrar')} value={registrar} />
                                
                                <FormField
                                  control={form.control}
                                  name="apiKey"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{instructions.apiKeyLabel}</FormLabel>
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          type="password" 
                                          placeholder={`Enter your ${instructions.apiKeyLabel.toLowerCase()}`}
                                          data-testid="input-api-key"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                {instructions.requiresSecret && (
                                  <FormField
                                    control={form.control}
                                    name="apiSecret"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>{instructions.apiSecretLabel}</FormLabel>
                                        <FormControl>
                                          <Input 
                                            {...field} 
                                            value={field.value || ""}
                                            type={instructions.apiSecretLabel === "Username" ? "text" : "password"}
                                            placeholder={`Enter your ${instructions.apiSecretLabel.toLowerCase()}`}
                                            data-testid="input-api-secret"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                )}
                                
                                <div className="flex justify-end space-x-2 pt-4">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsConnectDialogOpen(false)}
                                    data-testid="button-cancel"
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    type="submit" 
                                    disabled={createConnectionMutation.isPending}
                                    data-testid="button-create-connection"
                                  >
                                    {createConnectionMutation.isPending ? "Testing Connection..." : "Connect & Test"}
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </header>
  );
}
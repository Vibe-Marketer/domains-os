import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import { DomainStats } from "@/lib/types";

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery<DomainStats>({
    queryKey: ["/api/domains/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Domains",
      value: stats?.totalDomains || 0,
      icon: Globe,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      testId: "stat-total-domains",
    },
    {
      title: "Expiring Soon",
      value: stats?.expiringSoon || 0,
      icon: AlertTriangle,
      bgColor: "bg-red-50 dark:bg-red-950",
      iconColor: "text-red-600 dark:text-red-400",
      testId: "stat-expiring-soon",
    },
    {
      title: "Active Domains",
      value: stats?.activeDomains || 0,
      icon: CheckCircle,
      bgColor: "bg-green-50 dark:bg-green-950",
      iconColor: "text-green-600 dark:text-green-400",
      testId: "stat-active-domains",
    },
    {
      title: "This Month",
      value: stats?.thisMonth || 0,
      icon: Calendar,
      bgColor: "bg-blue-50 dark:bg-blue-950",
      iconColor: "text-blue-600 dark:text-blue-400",
      testId: "stat-this-month",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="bg-white dark:bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p 
                    className="text-3xl font-bold text-foreground" 
                    data-testid={stat.testId}
                  >
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                  <Icon className={`${stat.iconColor} text-xl h-6 w-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
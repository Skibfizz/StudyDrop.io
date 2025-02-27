import { Card } from "@/components/ui/card";
import { useUsage } from "@/lib/hooks/use-usage";
import { Crown } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Zap } from "lucide-react";

export function SubscriptionCard() {
  const { usageData, loading, refresh } = useUsage();

  // Refresh usage data when component mounts
  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <Card className="relative overflow-hidden border-border/40 p-6 backdrop-blur-sm bg-white/50">
        <div className="animate-pulse space-y-2">
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mt-2"></div>
          <div className="h-4 bg-gray-100 rounded w-2/3"></div>
          <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
        </div>
      </Card>
    );
  }

  if (!usageData) {
    return null;
  }

  const getTierDetails = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'free':
        return {
          name: 'Free',
          color: 'text-gray-500',
          iconBg: 'bg-gray-100',
          description: 'Basic access to AI learning tools',
          nextTier: 'basic',
          gradient: 'from-gray-500/20 to-gray-400/20'
        };
      case 'basic':
        return {
          name: 'Basic',
          color: 'text-blue-500',
          iconBg: 'bg-blue-100',
          description: 'Enhanced access with higher usage limits',
          nextTier: 'pro',
          gradient: 'from-blue-500/20 to-indigo-500/20'
        };
      case 'pro':
        return {
          name: 'Pro',
          color: 'text-purple-500',
          iconBg: 'bg-purple-100',
          description: 'Unlimited access to all premium features',
          nextTier: null,
          gradient: 'from-purple-500/20 to-pink-500/20'
        };
      default:
        return {
          name: 'Free',
          color: 'text-gray-500',
          iconBg: 'bg-gray-100',
          description: 'Basic access to AI learning tools',
          nextTier: 'basic',
          gradient: 'from-gray-500/20 to-gray-400/20'
        };
    }
  };

  const tierDetails = getTierDetails(usageData.tier);

  return (
    <Card className="relative overflow-hidden border-border/40 transition-all duration-300 hover:border-primary/40 hover:shadow-xl group-hover:shadow-purple-500/20 p-6 backdrop-blur-sm bg-white/50">
      <div className={`absolute inset-0 bg-gradient-to-br ${tierDetails.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-white/80 w-fit">
            <Crown className={`h-6 w-6 ${tierDetails.color}`} />
          </div>
          <div className="text-2xl font-bold">{tierDetails.name}</div>
        </div>
        
        <h3 className="text-lg font-semibold mt-2">Your Subscription</h3>
        <p className="text-sm text-muted-foreground">{tierDetails.description}</p>
        
        {tierDetails.nextTier && (
          <Button 
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white mt-4"
            onClick={() => window.location.href = '/pricing'}
            size="sm"
          >
            <Zap className="mr-2 h-4 w-4" />
            <span>Upgrade to {getTierDetails(tierDetails.nextTier).name}</span>
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
} 
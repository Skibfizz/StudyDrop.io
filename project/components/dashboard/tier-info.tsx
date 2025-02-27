import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUsage } from "@/lib/hooks/use-usage";
import { Crown, Calendar, Clock, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface TierInfo {
  tier: string;
  startDate: string;
  daysOnTier: number;
  changeReason: string;
}

export function TierInfo() {
  const { usageData, loading, refresh } = useUsage();
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [loadingTier, setLoadingTier] = useState(true);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Refresh usage data when component mounts
  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const fetchTierInfo = async () => {
      try {
        setLoadingTier(true);
        const { data, error } = await supabase.rpc('get_user_current_tier');
        
        if (error) {
          console.error('Error fetching tier info:', error);
          // If there's an error, use the tier from usageData as fallback
          if (usageData) {
            setTierInfo({
              tier: usageData.tier,
              startDate: new Date().toLocaleDateString(),
              daysOnTier: 0,
              changeReason: 'Default'
            });
          }
          return;
        }
        
        if (data && data.length > 0) {
          setTierInfo({
            tier: data[0].tier,
            startDate: new Date(data[0].start_date).toLocaleDateString(),
            daysOnTier: data[0].days_on_tier,
            changeReason: data[0].change_reason
          });
        } else if (usageData) {
          // If no data returned but we have usageData, use that tier
          setTierInfo({
            tier: usageData.tier,
            startDate: new Date().toLocaleDateString(),
            daysOnTier: 0,
            changeReason: 'Default'
          });
        }
      } catch (error) {
        console.error('Error in fetchTierInfo:', error);
        // Use usageData as fallback
        if (usageData) {
          setTierInfo({
            tier: usageData.tier,
            startDate: new Date().toLocaleDateString(),
            daysOnTier: 0,
            changeReason: 'Default'
          });
        }
      } finally {
        setLoadingTier(false);
      }
    };

    fetchTierInfo();
  }, [supabase, usageData]); // Re-fetch when usageData changes

  if (loading || loadingTier) {
    return (
      <Card className="relative overflow-hidden border-border/40 p-6 backdrop-blur-sm bg-white/50">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </Card>
    );
  }

  // If we don't have tierInfo but have usageData, create a default tierInfo
  if (!tierInfo && usageData) {
    setTierInfo({
      tier: usageData.tier,
      startDate: new Date().toLocaleDateString(),
      daysOnTier: 0,
      changeReason: 'Default'
    });
    return null; // Return null to avoid rendering with incomplete data
  }

  if (!usageData || !tierInfo) {
    return null;
  }

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'pro':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierGradient = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'free':
        return 'from-gray-500/20 to-gray-400/20';
      case 'basic':
        return 'from-blue-500/20 to-blue-400/20';
      case 'pro':
        return 'from-purple-500/20 to-purple-400/20';
      default:
        return 'from-gray-500/20 to-gray-400/20';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'free':
        return 'text-gray-500';
      case 'basic':
        return 'text-blue-500';
      case 'pro':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const getNextTier = (currentTier: string) => {
    switch (currentTier.toLowerCase()) {
      case 'free':
        return 'basic';
      case 'basic':
        return 'pro';
      default:
        return null;
    }
  };

  const formatTierName = (tier: string) => {
    const formattedTier = tier.toLowerCase();
    return formattedTier.charAt(0).toUpperCase() + formattedTier.slice(1);
  };

  const nextTier = getNextTier(tierInfo.tier);

  return (
    <Card className="relative overflow-hidden border-border/40 transition-all duration-300 hover:border-primary/40 hover:shadow-xl group-hover:shadow-purple-500/20 p-6 backdrop-blur-sm bg-white/50">
      <div className={`absolute inset-0 bg-gradient-to-br ${getTierGradient(tierInfo.tier)} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="p-2 rounded-lg bg-white/80 w-fit">
              <Crown className={`h-6 w-6 ${getTierIcon(tierInfo.tier)}`} />
            </div>
            <h3 className="text-lg font-semibold mt-2">Current Plan</h3>
            <div className="flex items-center space-x-2">
              <Badge className={`${getTierColor(tierInfo.tier)} capitalize text-sm px-3 py-1`}>
                {formatTierName(tierInfo.tier)}
              </Badge>
              <span className="text-sm text-muted-foreground">tier</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex flex-col items-end">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Since {tierInfo.startDate}</span>
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{tierInfo.daysOnTier} days on this plan</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border/40">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Features</span>
            <span className="text-sm font-medium">Limits</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Video Summaries</span>
              <span className="font-medium">{usageData.limits.video_summaries}/week</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Flashcard Sets</span>
              <span className="font-medium">{usageData.limits.flashcard_sets}/week</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Text Humanizations</span>
              <span className="font-medium">{usageData.limits.text_humanizations}/week</span>
            </div>
          </div>
        </div>

        {nextTier && (
          <Button 
            variant="outline" 
            className="w-full mt-4 flex items-center justify-center"
            onClick={() => window.location.href = '/pricing'}
          >
            <span>Upgrade to {formatTierName(nextTier)}</span>
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
} 
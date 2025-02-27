import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUsage, UsageType, UsageLimits } from "@/lib/hooks/use-usage";
import { Brain, Youtube, Sparkles, AlertCircle } from "lucide-react";
import { useEffect } from "react";

interface UsageFeature {
  type: UsageType;
  label: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  description: string;
}

const FEATURES: UsageFeature[] = [
  {
    type: 'video_summaries',
    label: 'Video Summaries',
    icon: Youtube,
    color: 'text-red-500',
    gradient: 'from-red-500/20 to-orange-500/20',
    description: 'Process and summarize video lectures'
  },
  {
    type: 'flashcard_sets',
    label: 'Flashcard Sets',
    icon: Brain,
    color: 'text-green-500',
    gradient: 'from-green-500/20 to-emerald-500/20',
    description: 'Generate study flashcards'
  },
  {
    type: 'text_humanizations',
    label: 'Text Humanizations',
    icon: Sparkles,
    color: 'text-purple-500',
    gradient: 'from-purple-500/20 to-pink-500/20',
    description: 'Transform and improve text content'
  }
];

export function FeatureUsage() {
  const { usageData, loading, getUsagePercentage, getRemainingUsage, refresh } = useUsage();

  // Refresh usage data when component mounts
  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 w-full">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="relative overflow-hidden border-border/40 p-6 backdrop-blur-sm bg-white/50 h-full">
            <div className="animate-pulse space-y-4 h-full flex flex-col">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                </div>
                <div className="text-right">
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-100 rounded mt-1"></div>
                </div>
              </div>
              <div className="space-y-2 mt-auto">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!usageData) {
    return null;
  }

  return (
    <div className="grid gap-8 grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 w-full">
      {FEATURES.map((feature) => {
        const percentage = getUsagePercentage(feature.type);
        const remaining = getRemainingUsage(feature.type);
        const used = usageData?.usage[feature.type] || 0;
        const limit = usageData?.limits[feature.type] || 0;
        const isNearLimit = percentage >= 80;
        const Icon = feature.icon;

        return (
          <Card 
            key={feature.type} 
            className="relative overflow-hidden border-border/40 transition-all duration-300 hover:border-primary/40 hover:shadow-xl group-hover:shadow-purple-500/20 p-6 backdrop-blur-sm bg-white/50 h-full"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative space-y-4 h-full flex flex-col">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="p-2 rounded-lg bg-white/80 w-fit">
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold mt-2">{feature.label}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{used}/{limit}</div>
                  <div className="text-sm text-muted-foreground">Used this week</div>
                </div>
              </div>

              <div className="space-y-2 mt-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Usage</span>
                  <span className="font-medium">{percentage.toFixed(0)}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
                {isNearLimit && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {remaining === 0
                        ? `You've reached your ${feature.label.toLowerCase()} limit`
                        : `Only ${remaining} ${feature.label.toLowerCase()} remaining`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
} 
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUsage, UsageType } from "@/lib/hooks/use-usage";
import { Brain, Youtube, Sparkles, AlertCircle, Users, Star, Clock, Rocket } from "lucide-react";

interface UsageFeature {
  type: UsageType;
  label: string;
  icon: React.ElementType;
  color: string;
}

const FEATURES: UsageFeature[] = [
  {
    type: 'video_summaries',
    label: 'Video Summaries',
    icon: Youtube,
    color: 'text-red-500',
  },
  {
    type: 'flashcard_sets',
    label: 'Flashcard Sets',
    icon: Brain,
    color: 'text-green-500',
  },
  {
    type: 'text_humanizations',
    label: 'Text Humanizations',
    icon: Sparkles,
    color: 'text-purple-500',
  }
];

export function UsageStats() {
  const { usageData, loading, getUsagePercentage, getRemainingUsage } = useUsage();

  if (loading) {
    return (
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative group">
            <Card className="border-border/40 p-6 backdrop-blur-sm bg-white/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gray-200 animate-pulse">
                  <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                </div>
                <div>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-100 rounded mt-1 animate-pulse"></div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (!usageData) {
    return null;
  }

  return (
    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((feature) => {
        const percentage = getUsagePercentage(feature.type);
        const remaining = getRemainingUsage(feature.type);
        const used = usageData.usage[feature.type];
        const limit = usageData.limits[feature.type];
        const isNearLimit = percentage >= 80;
        const Icon = feature.icon;

        return (
          <div key={feature.type} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <Card className="border-border/40 p-6 backdrop-blur-sm bg-white/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-white/80">
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <div>
                  <div className="text-lg font-bold">{feature.label}</div>
                  <div className="text-sm text-muted-foreground">{used}/{limit} used</div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
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
                        ? `You've reached your limit`
                        : `Only ${remaining} remaining`}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
} 
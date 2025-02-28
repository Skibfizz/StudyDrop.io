import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useUsage, UsageType } from "@/lib/hooks/use-usage";
import { Brain, Youtube, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface UsageFeature {
  type: UsageType;
  label: string;
  icon: React.ElementType;
  description: string;
}

const FEATURES: UsageFeature[] = [
  {
    type: 'video_summaries',
    label: 'Video Summaries',
    icon: Youtube,
    description: 'Process and summarize video lectures'
  },
  {
    type: 'flashcard_sets',
    label: 'Flashcard Sets',
    icon: Brain,
    description: 'Generate study flashcards'
  },
  {
    type: 'text_humanizations',
    label: 'Text Humanizations',
    icon: Sparkles,
    description: 'Transform and improve text content'
  }
];

export function UsageDisplay() {
  const { usageData, loading, getUsagePercentage, getRemainingUsage } = useUsage();
  const router = useRouter();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!usageData) {
    return null;
  }

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-500/10">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Usage This Week</h2>
            <p className="text-sm text-muted-foreground">
              Your {usageData.tier} plan limits and usage
            </p>
          </div>
          {usageData.tier === 'free' && (
            <Button
              onClick={() => router.push('/pricing')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              Upgrade Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {FEATURES.map((feature) => {
            const percentage = getUsagePercentage(feature.type);
            const remaining = getRemainingUsage(feature.type);
            const isNearLimit = percentage >= 80;
            const Icon = feature.icon;

            return (
              <div key={feature.type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">{feature.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usageData.usage[feature.type]}/{usageData.limits[feature.type]}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
                {isNearLimit && (
                  <div className="flex items-center space-x-2 text-amber-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {remaining === 0
                        ? `You've reached your ${feature.label.toLowerCase()} limit`
                        : `Only ${remaining} ${feature.label.toLowerCase()} remaining`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {usageData.tier === 'free' && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-purple-900 font-medium">
                  Upgrade to get more features
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  Get access to more summaries, flashcards, and humanizations with our Pro plan.
                </p>
                <Button
                  variant="link"
                  className="text-purple-600 hover:text-purple-700 p-0 h-auto mt-2"
                  onClick={() => router.push('/pricing')}
                >
                  View Plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 
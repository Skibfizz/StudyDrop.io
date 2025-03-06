"use client";

import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, CreditCard, AlertTriangle, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SharedHeader } from "@/components/shared-header";
import { useSubscription } from "@/lib/hooks/use-subscription";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const { subscription, isSubscribed, isCanceled, loading } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { toast } = useToast();
  const cancelCardRef = useRef<HTMLDivElement>(null);

  // Component mount logging
  useEffect(() => {
    console.log("Settings page mounted");
    return () => {
      console.log("Settings page unmounted");
    };
  }, []);

  // Add logging for subscription state changes
  useEffect(() => {
    console.log("Subscription state changed:", {
      subscription,
      isSubscribed,
      isCanceled,
      loading,
      timestamp: new Date().toISOString()
    });
  }, [subscription, isSubscribed, isCanceled, loading]);

  // Add logging for render conditions
  const shouldShowCancelCard = isSubscribed === true && isCanceled === false;
  useEffect(() => {
    console.log("Cancel card visibility condition:", {
      shouldShowCancelCard,
      isSubscribed,
      isCanceled,
      timestamp: new Date().toISOString()
    });
  }, [shouldShowCancelCard, isSubscribed, isCanceled]);

  // Track cancel card dimensions for layout shift debugging
  useEffect(() => {
    if (cancelCardRef.current) {
      const { offsetHeight, offsetWidth } = cancelCardRef.current;
      console.log("Cancel card dimensions:", {
        height: offsetHeight,
        width: offsetWidth,
        visible: shouldShowCancelCard,
        timestamp: new Date().toISOString()
      });
    }
  }, [shouldShowCancelCard, loading]);

  const handleReactivateSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription');
      }

      toast({
        title: 'Success',
        description: 'Your subscription has been reactivated.',
        variant: 'success',
      });
      
      // Refresh the page to update subscription status
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to reactivate subscription. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    console.log("Settings page: handleSignOut called");
    await signOut();
    console.log("Settings page: signOut completed, no additional redirect needed");
  };

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to open subscription management. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      setShowCancelDialog(false);
      toast({
        title: 'Success',
        description: 'Your subscription has been canceled. You will have access until the end of your billing period.',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Fixed position header with z-index to ensure it's visible */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-500/10">
        <SharedHeader />
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[#F8F8FC]" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(120, 119, 198, 0.05) 0.25px, transparent 0.25px)',
        backgroundSize: '12px 12px'
      }} />

      <main className="flex-1 pt-20">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                Settings
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Manage your account settings
            </p>
          </div>

          {/* Subscription Management Card */}
          {loading ? (
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-purple-500/10">
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500 mr-2" />
                <span>Loading subscription information...</span>
              </div>
            </Card>
          ) : (
            <>
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-purple-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-purple-100">
                      <CreditCard className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Subscription Management</h3>
                      <p className="text-sm text-muted-foreground">
                        {isSubscribed 
                          ? (isCanceled 
                              ? `Your subscription will end on ${subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'the end of your billing period'}`
                              : "View and update your billing details and payment method")
                          : "Upgrade to a premium plan to access more features"}
                      </p>
                      {isSubscribed && isCanceled ? (
                        <div className="mt-2 flex items-center text-sm text-amber-600">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          <span>Your subscription has been canceled but is still active</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    {isSubscribed ? (
                      <>
                        <Button 
                          variant="default" 
                          className="bg-purple-500 hover:bg-purple-600 text-white"
                          onClick={handleManageSubscription}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Manage Billing
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="default" 
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                        onClick={() => window.location.href = '/pricing'}
                        disabled={isLoading}
                      >
                        Upgrade Now
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Cancel Subscription Card - Always render the container but conditionally show content */}
              <div className="cancel-subscription-container min-h-[120px]" ref={cancelCardRef}>
                <Card className="p-8 bg-white/80 backdrop-blur-sm border-purple-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-full bg-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Cancel Plan</h3>
                        <p className="text-sm text-muted-foreground">
                          Cancel your subscription but retain access until the end of your current billing period
                        </p>
                      </div>
                    </div>
                    {loading ? (
                      <Button 
                        variant="outline" 
                        className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                        disabled={true}
                      >
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </Button>
                    ) : shouldShowCancelCard ? (
                      <Button 
                        variant="outline" 
                        className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => setShowCancelDialog(true)}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Cancel Subscription
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="border-gray-200 text-gray-400"
                        disabled={true}
                      >
                        Not Available
                      </Button>
                    )}
                  </div>
                </Card>
              </div>

              {/* Reactivate Subscription Card - Always render with consistent height */}
              <div className="reactivate-subscription-container min-h-[120px]">
                {isSubscribed && isCanceled ? (
                  <Card className="p-8 bg-white/80 backdrop-blur-sm border-purple-500/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-green-100">
                          <CreditCard className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Reactivate Subscription</h3>
                          <p className="text-sm text-muted-foreground">
                            Your subscription is currently set to cancel at the end of the billing period. You can reactivate it to continue your premium access.
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={handleReactivateSubscription}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Reactivate Subscription
                      </Button>
                    </div>
                  </Card>
                ) : null}
              </div>
            </>
          )}

          {/* Sign Out Card */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-purple-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-red-100">
                  <LogOut className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Sign Out</h3>
                  <p className="text-sm text-muted-foreground">
                    Sign out from your account
                  </p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </main>

      {/* Cancel Subscription Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Cancel Subscription
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll still have access to premium features until {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'the end of your current billing period'}. After that, your account will revert to the free plan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isLoading}
            >
              Keep Subscription
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Yes, Cancel Subscription"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
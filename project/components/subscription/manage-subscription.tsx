'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, CreditCard, Star, Shield } from 'lucide-react'
import { PLANS } from '@/lib/stripe'
import { useUser } from '@/lib/hooks/use-user'

interface SubscriptionData {
  tier: 'free' | 'basic' | 'pro'
  current_period_end?: string
  cancel_at_period_end?: boolean
  stripe_customer_id?: string
}

export function ManageSubscription() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useUser()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)

  const handleSubscribe = async (priceId: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to start subscription process. Please try again.',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to open subscription management. Please try again.',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Free Plan */}
        <Card className="relative overflow-hidden p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Free</h3>
              <p className="text-sm text-muted-foreground">Get started with basic features</p>
            </div>
            <div className="text-3xl font-bold">$0</div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Shield className="mr-2 h-4 w-4 text-purple-500" />5 video summaries per week
              </li>
              <li className="flex items-center">
                <Shield className="mr-2 h-4 w-4 text-purple-500" />5 flashcard sets per week
              </li>
              <li className="flex items-center">
                <Shield className="mr-2 h-4 w-4 text-purple-500" />
                10 text humanizations per week
              </li>
            </ul>
          </div>
        </Card>

        {/* Basic Plan */}
        <Card className="relative overflow-hidden border-purple-500/50 p-6">
          <div className="absolute right-0 top-0 rounded-bl bg-purple-500 p-1 text-xs text-white">
            Popular
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">{PLANS.basic.name}</h3>
              <p className="text-sm text-muted-foreground">{PLANS.basic.description}</p>
            </div>
            <div className="text-3xl font-bold">${PLANS.basic.price}</div>
            <ul className="space-y-2 text-sm">
              {PLANS.basic.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Star className="mr-2 h-4 w-4 text-purple-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
              onClick={() => handleSubscribe(PLANS.basic.priceId)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Subscribe
            </Button>
          </div>
        </Card>

        {/* Pro Plan */}
        <Card className="relative overflow-hidden border-blue-500/50 p-6">
          <div className="absolute right-0 top-0 rounded-bl bg-blue-500 p-1 text-xs text-white">
            Best Value
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">{PLANS.pro.name}</h3>
              <p className="text-sm text-muted-foreground">{PLANS.pro.description}</p>
            </div>
            <div className="text-3xl font-bold">${PLANS.pro.price}</div>
            <ul className="space-y-2 text-sm">
              {PLANS.pro.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Star className="mr-2 h-4 w-4 text-blue-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
              onClick={() => handleSubscribe(PLANS.pro.priceId)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Subscribe
            </Button>
          </div>
        </Card>
      </div>

      {subscription?.stripe_customer_id && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Current Subscription</h3>
              <p className="text-sm text-muted-foreground">
                {subscription.cancel_at_period_end
                  ? `Your subscription will end on ${new Date(subscription.current_period_end!).toLocaleDateString()}`
                  : `Your next billing date is ${new Date(subscription.current_period_end!).toLocaleDateString()}`}
              </p>
            </div>
            <Button onClick={handleManageSubscription} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Manage Subscription
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'

export default function CancelPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <Card className="w-full max-w-md border-purple-500/10 bg-white/80 p-8 backdrop-blur-sm">
        <div className="space-y-6 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Payment Cancelled</h1>
            <p className="text-gray-600">Your payment was cancelled. No charges were made.</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/pricing')}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

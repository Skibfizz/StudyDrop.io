'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function CreateNewsletterTablePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleCreateTable = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/newsletter/create-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      setResult({
        success: response.ok,
        message: response.ok ? data.message : data.error || 'An error occurred',
      })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create Newsletter Table</CardTitle>
          <CardDescription>
            Create the newsletter_subscriptions table in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will create the necessary table for storing newsletter subscriptions.
            Only run this once.
          </p>
          
          {result && (
            <Alert className={result.success ? 'bg-green-50' : 'bg-red-50'}>
              <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleCreateTable} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Table...
              </>
            ) : (
              'Create Table'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 
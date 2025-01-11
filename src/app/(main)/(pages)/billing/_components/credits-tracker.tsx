import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardTitle } from '@/components/ui/card'

type Props = {
  credits: number
  tier: string
}

const CreditTracker = ({ credits, tier }: Props) => {
  return (
<div className="p-6">
  <Card className="p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
    <CardContent className="flex flex-col gap-6">
      <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">Credit Tracker</CardTitle>
      <div className="flex flex-col gap-2">
        <Progress
          value={
            tier === 'Free'
              ? (credits / 10) * 100
              : tier === 'Unlimited'
              ? 100
              : credits
          }
          className={`w-full h-2 rounded-full text-green-500 ${
            tier === 'Free'
              ? 'bg-red-500'
              : tier === 'Pro'
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {credits} /{' '}
            {tier === 'Free' ? '10' : tier === 'Pro' ? '100' : 'Unlimited'}
          </p>
          <span
            className={`text-xs font-semibold ${
              tier === 'Free'
                ? 'text-red-500'
                : tier === 'Pro'
                ? 'text-yellow-500'
                : 'text-green-500'
            }`}
          >
            {tier === 'Free'
              ? 'Free Tier'
              : tier === 'Pro'
              ? 'Pro Tier'
              : 'Unlimited Tier'}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
  )
}

export default CreditTracker
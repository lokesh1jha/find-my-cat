'use client'

import Header from '@/app/components/Header'
import GameGrid from '@/components/GameGrid'
import StakeMoneyToPlay from '@/components/StakeMoneyToPlay'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Suspense } from 'react'

interface IGame {
  id?: number;
  creator_address: string;
  game_title: string;
  currency: string;
  wager_amount: number;
  max_attempts: number;
  max_time: number;
  start_date: bigint;
  end_date: bigint;
  actionId: string;
}

export default function Page() {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'done'>('pending')
  const [stakeAmountFetched, setStakeAmountFetched] = useState(false)
  const [amountToStake, setAmountToStake] = useState<number | null>(null)

  const searchParams = useSearchParams()
 
  const actionId = searchParams.get('actionId')
  const clusterurl = searchParams.get('clusterurl')
  console.log('params', actionId, clusterurl)

  // Fetch the stake amount
  useEffect(() => {
    const getStakeAmount = async () => {
      try {
        const response = await fetch(`/api/stake?clusterurl=${clusterurl}&actionId=${actionId}`)
        const data = await response.json()
        const game: IGame = data.data
        console.log('game', game)
        setAmountToStake(game.wager_amount)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setStakeAmountFetched(true)
      }
    }
    getStakeAmount()
  }, [actionId, clusterurl])

  // Render a loading state while fetching data
  if (!stakeAmountFetched || amountToStake === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if(actionId === null || clusterurl === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid actionId or clusterurl</p>
      </div>
    )
  }

  

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div>
      <Header />
      {paymentStatus === 'pending' ? (
        <StakeMoneyToPlay
          setPaymentStatus={setPaymentStatus}
          amountToStake={amountToStake}
        />
      ) : (
        <GameGrid params={{ actionId, clusterurl }} />
      )}
    </div>
    </Suspense>
  )
}

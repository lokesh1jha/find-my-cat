'use client'

import Header from '@/app/components/Header'
import GameGrid from '@/components/GameGrid';

export default function GamePage({
  params,
}: {
  params: { actionId: string; clusterurl: string }
}) {


  return (
    <div>
      <Header />
      <GameGrid params={params} />
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, Award } from 'lucide-react'
import Header from '@/app/components/Header'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'

const GRID_SIZE = 5
const MAX_ATTEMPTS = 10
const GAME_DURATION = 60 // seconds

export default function FindTheCat({
  params,
}: {
  params: { actionId: string, clusterurl: string };
}) {
  const [catPosition, setCatPosition] = useState<number>()
  const [attempts, setAttempts] = useState(MAX_ATTEMPTS)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing')
  const [clickedTiles, setClickedTiles] = useState<Set<number>>(new Set())
  const [showPopup, setShowPopup] = useState(false)

  let { publicKey } = useWallet()

  useEffect(() => {

    const actionId = params.actionId
    console.log(`Received actionId: ${actionId} in UIIIIIIIIIIIIIII`)
  }, [])
  const resetGame = useCallback(() => {
    setCatPosition(Math.floor(Math.random() * GRID_SIZE * GRID_SIZE))
    setAttempts(MAX_ATTEMPTS)
    setTimeLeft(GAME_DURATION)
    setGameStatus('playing')
    setClickedTiles(new Set())
    setShowPopup(false)
  }, [])

  useEffect(() => {
    resetGame()
  }, [resetGame])

  useEffect(() => {
    if (gameStatus === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameStatus === 'playing') {
      setGameStatus('lost')
      setShowPopup(true)
    }
  }, [timeLeft, gameStatus])

  const handleTileClick = (index: number) => {
    if (gameStatus !== 'playing' || clickedTiles.has(index)) return

    setClickedTiles(new Set(clickedTiles).add(index))
    setAttempts(attempts - 1)

    if (index === catPosition) {
      setGameStatus('won')
      setShowPopup(true)
    } else if (attempts === 1) {
      setGameStatus('lost')
      setShowPopup(true)
    }
  }

  const submitResult = () => {
    console.log('Submitted result:', attempts, timeLeft, clickedTiles, catPosition, publicKey, gameStatus)
    // make attempt from string to json
    let responseJson: { [key: number]: number } = {}
    for (let i = 0; i < clickedTiles.size; i++) {
      responseJson[i] = Array.from(clickedTiles)[i]
    }

    let body = {
      account: publicKey?.toString(),
      selected_cells: responseJson,
      completion_time: 60 - timeLeft,
      attempts_used: attempts,
      is_cat_found: gameStatus === 'won',
      created_at: new Date()
    }
    
    fetch('/api/actions/submit-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then(async response => {
        let data = await response.json()
        console.log("Response ------------", data)
        toast.success("Game submitted successfully")
        return data
      })
      .then(data => console.log(data))
    // resetGame()
  }

  const getProximity = (index: number) => {
    if (catPosition === undefined) return ''
    const distance = Math.abs(Math.floor(index / GRID_SIZE) - Math.floor(catPosition / GRID_SIZE)) +
      Math.abs((index % GRID_SIZE) - (catPosition % GRID_SIZE))
    if (distance <= 1) return 'bg-red-500'
    if (distance <= 2) return 'bg-orange-500'
    if (distance <= 3) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  return (

    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex flex-col items-center justify-center p-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-4">Find the Cat!</h1>
          <div className="flex justify-center space-x-4">
            <div className="bg-white rounded-full px-4 py-2 shadow-md">
              <span className="font-semibold text-purple-600">Attempts left: {attempts}</span>
            </div>
            <div className="bg-white rounded-full px-4 py-2 shadow-md">
              <span className="font-semibold text-purple-600">Time left: {timeLeft}s</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-5 gap-2 bg-white p-4 rounded-lg shadow-lg">
          {[...Array(GRID_SIZE * GRID_SIZE)].map((_, index) => (
            <motion.button
              key={index}
              className={`w-16 h-16 rounded-lg shadow-md transition-colors duration-300 ${clickedTiles.has(index) ? getProximity(index) : 'bg-gray-200 hover:bg-gray-300'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTileClick(index)}
            >
              {index === catPosition && gameStatus !== 'playing' && '🐱'}
            </motion.button>
          ))}
        </div>

        <footer className="mt-8 flex space-x-4">
          <button
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition-colors duration-300"
            onClick={resetGame}
          >
            Reset Game
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition-colors duration-300"
            onClick={() => alert('Leaderboard coming soon!')}
          >
            Leaderboard
          </button>
        </footer>

        {showPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPopup(false)}
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">
                {gameStatus === 'won' ? 'Congratulations!' : 'Game Over'}
              </h2>
              <p className="text-center mb-4">
                {gameStatus === 'won'
                  ? `You found the cat in ${MAX_ATTEMPTS - attempts + 1} moves!`
                  : 'Better luck next time!'}
              </p>
              <p className="text-center mb-6">Time taken: {GAME_DURATION - timeLeft} seconds</p>
              <div className="flex justify-center space-x-4">
                <button
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition-colors duration-300"
                  onClick={resetGame}
                >
                  Play Again
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition-colors duration-300"
                  onClick={() => submitResult()}
                >
                  Submit Result
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
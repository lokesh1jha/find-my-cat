'use client'

import Image from "next/image";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from 'sonner';

export default function StartGame() {
  const { publicKey } = useWallet()

  const handleClick = () => {
    if(!publicKey) {
      toast.error("Please connect your wallet")      
      return
    }
    window.location.href = "/game/find-my-cat";
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-purple-800 mb-4">Welcome to Find My Cat</h1>
        <p className="text-xl md:text-2xl text-purple-600">
          A Mission to <span className="font-bold text-pink-600">rescue</span> the lost cat 😿 and win prizes 💵
        </p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative mb-8"
      >
        <Image
          src="/cat.jpg?height=400&width=800"
          alt="Lost cat"
          width={800}
          height={400}
          className="rounded-lg border-4 border-purple-300 shadow-lg hover:shadow-xl transition duration-300 ease-in-out"
        />
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        <Button className="relative px-7 py-4 bg-black rounded-lg leading-none flex items-center divide-x divide-gray-600"
        onClick={handleClick}>
          <span className="flex items-center space-x-5">
            <span className="pr-6 text-gray-100">Start Game</span>
          </span>
          <span className="pl-6 text-indigo-400 group-hover:text-gray-100 transition duration-200">
            Let's Go! &rarr;
          </span>
        </Button>
      </motion.div>
    </div>
  );
}
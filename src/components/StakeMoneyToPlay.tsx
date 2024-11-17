'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from '@solana/web3.js';

interface StakeMoneyToPlayProps {
  setPaymentStatus: (status: 'pending' | 'done') => void;
  amountToStake: number; // Amount to stake in SOL
}

export default function StakeMoneyToPlay({ setPaymentStatus, amountToStake }: StakeMoneyToPlayProps) {
  const { publicKey, signTransaction } = useWallet();
  const [isStaking, setIsStaking] = useState(false);
  const [transactionConfirmed, setTransactionConfirmed] = useState(false);

  const connection = new Connection(clusterApiUrl('devnet'));

  const handleStake = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsStaking(true);
      setPaymentStatus('pending');

      // Step 1: Create a transaction to send SOL
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('5Rx3rUcBLLcipxQYTqiMf3ZuXp1p4hJkHHRVok7SZq2o'), // Replace with your receiver wallet
          lamports: amountToStake * LAMPORTS_PER_SOL,
        })
      );

      // Step 2: Set the recent blockhash and fee payer
      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = publicKey;

      // Step 3: Send the transaction to the user's wallet for signing
      const signedTransaction = await signTransaction(transaction);

      // Step 4: Send the signed transaction to the Solana network
      const txId = await connection.sendRawTransaction(signedTransaction.serialize());

      // Step 5: Confirm the transaction
      await connection.confirmTransaction(txId, 'finalized');

      setTransactionConfirmed(true);
      setPaymentStatus('done');
      toast.success('Staking successful! Transaction ID: ' + txId);
    } catch (error) {
      console.error('Staking error:', error);
      toast.error('Staking failed');
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-purple-600">Stake Money to Play</h2>
      <p className="text-gray-600">Amount to Stake: {amountToStake} SOL</p>

      <button
        className={`py-2 px-6 rounded-full font-bold text-white ${
          isStaking ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'
        }`}
        disabled={isStaking}
        onClick={handleStake}
      >
        {isStaking ? 'Staking...' : 'Stake & Play'}
      </button>

      {transactionConfirmed && (
        <div className="mt-4 text-green-600">Transaction Confirmed!</div>
      )}
    </div>
  );
}

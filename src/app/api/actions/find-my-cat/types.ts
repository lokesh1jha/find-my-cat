import { Connection, PublicKey } from "@solana/web3.js";

// Define the currency options for the game
export enum VERIFIED_CURRENCY {
  SOL = "SOL",
  USDC = "USDC",
  BONK = "BONK",
}

// DTO for creating the "Find My Cat" game
export interface CreateFindMyCatGameDto {
  creatorAddress: string;
  gameTitle: string;
  currency: VERIFIED_CURRENCY;
  wagerAmount: number;
  maxAttempts: number;
  maxTime: number; // Maximum time in seconds
  startDate: number;
  endDate: number;
  actionId?: string;
}

// Store player responses for the "Find My Cat" game
export interface FindMyCatResponse {
  account: string;
  selectedCells: number[]; // Array of cells chosen
  attemptsUsed: number;
  completionTime: number; // Time taken to complete (in seconds)
  createdAt: Date;
}

// Interface for creating transactions
export interface ICreateTransaction {
  accountPublicKey: PublicKey;
  recipientPublicKey: PublicKey;
  currency: VERIFIED_CURRENCY;
  amount: number;
  connection: Connection;
}

// Default duration for games (e.g., 5 days)
export const defaultDuration = 5 * 24 * 60 * 60 * 1000;

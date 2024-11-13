import { Connection, PublicKey } from "@solana/web3.js";
import { Pool } from 'pg';
import logger from "../../common/logger";
import { CreateFindMyCatGameDto, FindMyCatResponse } from "./types";

// Initialize the connection to Solana blockchain
export const initWeb3 = async (): Promise<{ connection: Connection }> => {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  return { connection };
};

// Create a new "Find My Cat" game
export const createFindMyCatGame = async (gameDetails: CreateFindMyCatGameDto): Promise<void> => {
  logger.info("Creating new Find My Cat game with details: %o", gameDetails);

  const query = `
    INSERT INTO game (creator_address, game_title, currency, wager_amount, max_attempts, max_time, start_date, end_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;

  const values = [
    gameDetails.creatorAddress,
    gameDetails.gameTitle,
    gameDetails.currency,
    gameDetails.wagerAmount,
    gameDetails.maxAttempts,
    gameDetails.maxTime,
    gameDetails.startDate,
    gameDetails.endDate,
  ];

  try {
    await dbQuery(query, values);
    logger.info("Game created successfully.");
  } catch (err) {
    logger.error("Error creating game in the database: %s", err);
    throw new Error("Failed to create game in the database");
  }
};

// Store player responses for "Find My Cat" game
export const storeFindMyCatResponse = async (response: FindMyCatResponse): Promise<void> => {
  const query = `
    INSERT INTO responses (account, selected_cells, attempts_used, completion_time, created_at)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
  `;

  const values = [
    response.account,
    JSON.stringify(response.selectedCells),
    response.attemptsUsed,
    response.completionTime,
  ];

  try {
    await dbQuery(query, values);
    logger.info("User response stored successfully for account: %s", response.account);
  } catch (err) {
    logger.error("Error storing user response: %s", err);
    throw new Error("Failed to store user response in the database");
  }
};

// Get statistics for game responses
export const getGameStatistics = async (): Promise<{ averageAttempts: number; averageTime: number }> => {
  const totalResponsesQuery = `SELECT COUNT(*) FROM responses`;
  const totalAttemptsQuery = `SELECT AVG(attempts_used) as avg_attempts FROM responses`;
  const totalTimeQuery = `SELECT AVG(completion_time) as avg_time FROM responses`;

  try {
    const totalResponsesResult = await dbQuery(totalResponsesQuery);
    const totalResponses = parseInt(totalResponsesResult[0]?.count || "0", 10);

    if (totalResponses === 0) return { averageAttempts: 0, averageTime: 0 };

    const attemptsResult = await dbQuery(totalAttemptsQuery);
    const avgAttempts = parseFloat(attemptsResult[0]?.avg_attempts || "0");

    const timeResult = await dbQuery(totalTimeQuery);
    const avgTime = parseFloat(timeResult[0]?.avg_time || "0");

    return { averageAttempts: avgAttempts, averageTime: avgTime };
  } catch (err) {
    logger.error("Error fetching game statistics: %s", err);
    throw new Error("Failed to fetch game statistics");
  }
};

// PostgreSQL connection pool
const dbPool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST || "localhost",
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT) || 5432,
});

// Helper function for querying the PostgreSQL database
export const dbQuery = async (text: string, params?: any[]) => {
  const client = await dbPool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } catch (err) {
    logger.error("Database query error: %s", err);
    throw err;
  } finally {
    client.release();
  }
};



/*
CREATE TABLE game (
  id SERIAL PRIMARY KEY,
  creator_address TEXT,
  game_title TEXT,
  currency TEXT,
  wager_amount NUMERIC,
  max_attempts INT,
  max_time INT,
  start_date BIGINT,
  end_date BIGINT
);

CREATE TABLE responses (
  id SERIAL PRIMARY KEY,
  account TEXT,
  selected_cells JSONB,
  attempts_used INT,
  completion_time INT,
  created_at TIMESTAMP DEFAULT NOW()
);

*/
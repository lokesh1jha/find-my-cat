import { Connection } from "@solana/web3.js";
import logger from "../../common/logger";
import { CreateFindMyCatGameDto, FindMyCatResponse } from "./types";
import prisma from "../../../../../utils/db";

// Initialize the connection to Solana blockchain
export const initWeb3 = async (): Promise<{ connection: Connection }> => {
  const connection = new Connection("https://devnet.helius-rpc.com/?api-key=3696f439-e2b1-4cbe-bd38-d70ebc839cee", "confirmed");

  // const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  return { connection };
};

// Create a new "Find My Cat" game
export const createFindMyCatGame = async (gameDetails: CreateFindMyCatGameDto): Promise<void> => {
  logger.info("Creating new Find My Cat game with details: %o", gameDetails);

  const values = {
    creator_address: gameDetails.creatorAddress,
    game_title: gameDetails.gameTitle,
    currency: gameDetails.currency,
    wager_amount: gameDetails.wagerAmount,
    max_attempts: gameDetails.maxAttempts,
    max_time: gameDetails.maxTime,
    start_date: gameDetails.startDate,
    end_date: gameDetails.endDate,
    actionId: gameDetails.actionId
  };

  try {
    await prisma.game.create({data: values});
    logger.info("Game created successfully.");
  } catch (err) {
    logger.error("Error creating game in the database: %s", err);
    throw new Error("Failed to create game in the database");
  }
};

// Store player responses for "Find My Cat" game
export const storeFindMyCatResponse = async (response: FindMyCatResponse): Promise<void> => {


  const values = [
    response.account,
    JSON.stringify(response.selectedCells),
    response.attemptsUsed,
    response.completionTime,
  ];

  try {
    await prisma.responses.create({ data: { account: response.account, selected_cells: response.selectedCells, attempts_used: response.attemptsUsed, completion_time: response.completionTime } });
    logger.info("User response stored successfully for account: %s", response.account);
  } catch (err) {
    logger.error("Error storing user response: %s", err);
    throw new Error("Failed to store user response in the database");
  }
};

// Get statistics for game responses
// export const getGameStatistics = async (): Promise<{ averageAttempts: number; averageTime: number }> => {
 
//   try {
//     const totalResponsesResult = await prisma.responses.count({
//       where: {
//         game_id: 1,
//       },
//     });
//     const totalResponses = parseInt(totalResponsesResult[0]?.count || "0", 10);

//     if (totalResponses === 0) return { averageAttempts: 0, averageTime: 0 };

//     const attemptsResult = await dbQuery(totalAttemptsQuery);
//     const avgAttempts = parseFloat(attemptsResult[0]?.avg_attempts || "0");

//     const timeResult = await dbQuery(totalTimeQuery);
//     const avgTime = parseFloat(timeResult[0]?.avg_time || "0");

//     return { averageAttempts: avgAttempts, averageTime: avgTime };
//   } catch (err) {
//     logger.error("Error fetching game statistics: %s", err);
//     throw new Error("Failed to fetch game statistics");
//   }
// };

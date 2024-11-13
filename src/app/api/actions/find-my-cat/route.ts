import { ACTIONS_CORS_HEADERS, LinkedAction } from "@solana/actions";
import * as web3 from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from "next";
import { initWeb3, createFindMyCatGame } from "./helper";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { BlinksightsClient } from "blinksights-sdk";
import logger from "../../common/logger";
import { CreateFindMyCatGameDto } from "./types";

const BLINKS_INSIGHT_API_KEY = process.env.BLINKS_INSIGHT_API_KEY;
const blinksightsClient = new BlinksightsClient(BLINKS_INSIGHT_API_KEY!);

// GET handler to create the game (show the form for game creation)
export const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const requestUrl = req.url ?? "";
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['host'] || 'localhost:3000';

    // Construct the base URL using the protocol and host
    const baseHref = new URL(`/api/actions/find-my-cat`, `${protocol}://${host}`).toString();

    console.log(`Generated baseHref: ${baseHref}`);
    
    // Define the parameters for the "Find My Cat" game
    const actions: LinkedAction[] = [
      {
        type: 'post',
        label: 'Create Game',
        href: baseHref,
        parameters: [
          { name: "title", label: "Game Title", type: "text", required: true },
          { name: "maxAttempts", label: "Max Attempts (1-8)", type: "number", min: 1, max: 8, required: true },
          { name: "maxTime", label: "Max Time (e.g., 5m = 5 minutes)", type: "text", required: true },
          {
            name: "currency",
            label: "Choose currency",
            type: "radio",
            options: [
              { label: "SOL", value: "SOL" },
              { label: "USDC", value: "USDC" },
              { label: "BONK", value: "BONK" },
            ],
          },
          { name: "wager", label: "Wager Amount", type: "number", required: true },
          { name: "duration", label: "Duration (e.g., 2d = 2 days)", type: "text", required: true },
        ],
      },
    ];

    const payload = await blinksightsClient.createActionGetResponseV1(requestUrl, {
      title: `🚀 Create Find My Cat Game`,
      icon: `${baseHref}/find-my-cat.gif`,
      type: "action",
      description: `Set up your own 'Find My Cat' game! Choose max attempts, time limit, and wager amount.`,
      label: "Create your game",
      links: { actions },
    });

    if (!payload) {
      logger.error("Payload construction failed");
      return res.status(400).json({ error: "Payload is incorrect" });
    }

    await blinksightsClient.trackRenderV1(requestUrl, payload);
    return Response.json(payload, { status: 200, headers: ACTIONS_CORS_HEADERS });
  } catch (err) {
    logger.error("Error in getHandler: %s", err);
    res.status(400).json({ error: "An unknown error occurred" });
  }
};

export const OPTIONS = GET

// POST handler to process game creation and perform the on-chain transaction
export const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    console.log(req.body);

    const { account, data } = req.body;
    const { title, maxAttempts, maxTime, currency, wager, duration } = data || {};

    // Validate required parameters
    if (!account || !title || !maxAttempts || !maxTime || !currency || !wager || !duration) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const accountPublicKey = new PublicKey(account);

    // Create the game in the backend (for future use)
    const gameDetails: CreateFindMyCatGameDto = {
      creatorAddress: accountPublicKey.toString(),
      gameTitle: title,
      maxAttempts: Number(maxAttempts),
      maxTime: parseDuration(maxTime),
      currency: currency,
      wagerAmount: Number(wager),
      startDate: Date.now(),
      endDate: Date.now() + parseDuration(duration),
    };

    await createFindMyCatGame(gameDetails);

    // Initiating the on-chain transaction
    const { connection } = await initWeb3();

    const transaction = new web3.Transaction().add(
      SystemProgram.transfer({
        fromPubkey: accountPublicKey,
        toPubkey: accountPublicKey,
        lamports: 1000,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = accountPublicKey;

    const serializedTransaction = transaction.serialize({ requireAllSignatures: false });
    const base64Transaction = serializedTransaction.toString("base64");

    const gameLink = `https://dial.to/devnet?action=solana-action:http://localhost:3000/api/actions/find-my-cat/challengeID=${Math.random().toString(36).substring(7)}`;

    res.status(200).json({
      transaction: base64Transaction,
      message: `Your game has been successfully created! Share this link to invite others: ${gameLink}`,
    });
  } catch (err) {
    logger.error("An error occurred in postHandler: %s", err);
    return res.status(400).json({ error: err || "An unknown error occurred" });
  }
};


// Helper function to parse duration (e.g., "5h" = 5 hours)
const parseDuration = (duration: string): number => {
  const timeUnit = duration.slice(-1);
  const timeValue = parseInt(duration.slice(0, -1));

  switch (timeUnit) {
    case 'h': return timeValue * 60 * 60 * 1000;  // hours to milliseconds
    case 'm': return timeValue * 60 * 1000;      // minutes to milliseconds
    case 's': return timeValue * 1000;           // seconds to milliseconds
    default: throw new Error("Invalid duration format");
  }
};

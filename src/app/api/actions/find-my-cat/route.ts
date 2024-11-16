import { ActionGetResponse, ActionParameterSelectable, ActionPostResponse, ACTIONS_CORS_HEADERS, createPostResponse, LinkedAction } from "@solana/actions";
import * as web3 from "@solana/web3.js";
import { NextResponse } from 'next/server';
import { URL } from 'url';
import { initWeb3, createFindMyCatGame } from "./helper";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { BlinksightsClient } from "blinksights-sdk";
import logger from "../../common/logger";
import { CreateFindMyCatGameDto } from "./types";

const BLINKS_INSIGHT_API_KEY = process.env.BLINKS_INSIGHT_API_KEY;
const blinksightsClient = new BlinksightsClient(BLINKS_INSIGHT_API_KEY!);

enum CLUSTER_TYPES {
  DEVNET = "devnet",
  MAINNET = "mainnet",
}

// GET handler to create the game (show the form for game creation)
export const GET = async (req: Request) => {
  try {
    // Extract URL and headers from the Request object
    const requestUrl = req.url;
    const clusterurl = new URL(requestUrl).searchParams.get("cluster") || "";
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';

    logger.info("GET request received clusterurl: %s", clusterurl);

    // Define cluster options based on the clusterurl parameter
    const clusterOptions: ActionParameterSelectable<"radio">[] = clusterurl
      ? []
      : [
        {
          name: "clusterurl",
          label: "Select Cluster",
          type: "radio",
          required: true,
          options: [
            { label: "Devnet", value: CLUSTER_TYPES.DEVNET, selected: true },
            { label: "Mainnet", value: CLUSTER_TYPES.MAINNET },
          ],
        },
      ];

    logger.info("Generated clusterOptions: %o", clusterOptions);

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
          ...clusterOptions,
          { name: "title", label: "Game Title", type: "text", required: true },
          { name: "maxAttempts", label: "Max Attempts (1-8)", type: "number", min: 1, max: 8, required: true },
          { name: "maxTime", label: "Max Time (e.g., 5m = 5 minutes)", type: "text", required: true },
          {
            name: "currency",
            label: "Choose currency",
            type: "radio",
            options: [
              { label: "SOL", value: "SOL", selected: true },
              { label: "USDC", value: "USDC" },
              { label: "BONK", value: "BONK" },
            ],
          },
          { name: "wager", label: "Wager Amount", type: "number", required: true },
          { name: "duration", label: "Duration (e.g., 2d = 2 days)", type: "text", required: true },
        ],
      },
    ];

    console.log("Action created", "requestUrl", requestUrl);

    // Create the payload using your client (assuming `blinksightsClient` is properly defined)
    const payload: ActionGetResponse = await blinksightsClient.createActionGetResponseV1(requestUrl, {
      title: `🚀 Create Find My Cat Game`,
      icon: new URL("/find-my-cat.jpg", requestUrl).toString(),
      description: `Set up your own 'Find My Cat' game! Choose max attempts, time limit, and wager amount.`,
      label: "Create your game",
      links: { actions },
    });

    if (!payload) {
      logger.error("Payload construction failed");
      return NextResponse.json({ error: "Payload is incorrect" }, { status: 400 });
    }
    console.log("Payload created");

    await blinksightsClient.trackRenderV1(requestUrl, payload);

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...ACTIONS_CORS_HEADERS,
      },
    });
  } catch (err) {
    logger.error("Error in GET handler: %s", err);
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 400 });
  }
};


// GET handler to create the game (show the form for game creation)
// export async function GET(req: Request): Promise<Response> {
//   try {
//     const requestUrl = req.url;
//     const protocol = req.headers.get('x-forwarded-proto') || 'http';
//     const host = req.headers.get('host') || 'localhost:3000';

//     const baseHref = new URL(`/api/actions/find-my-cat`, `${protocol}://${host}`).toString();
//     console.log(`Generated baseHref: ${baseHref}`);

//     const actions: LinkedAction[] = [
//       {
//         type: 'post',
//         label: 'Create Game',
//         href: baseHref,
//         parameters: [
//           { name: "title", label: "Game Title", type: "text", required: true },
//           { name: "maxAttempts", label: "Max Attempts (1-8)", type: "number", min: 1, max: 8, required: true },
//           { name: "maxTime", label: "Max Time (e.g., 5m = 5 minutes)", type: "text", required: true },
//           {
//             name: "currency",
//             label: "Choose currency",
//             type: "radio",
//             options: [
//               { label: "SOL", value: "SOL" },
//               { label: "USDC", value: "USDC" },
//               { label: "BONK", value: "BONK" },
//             ],
//           },
//           { name: "wager", label: "Wager Amount", type: "number", required: true },
//           { name: "duration", label: "Duration (e.g., 2d = 2 days)", type: "text", required: true },
//         ],
//       },
//     ];

//     const payload: ActionGetResponse = {
//       title: `🚀 Create Find My Cat Game`,
//       icon: new URL(
//         "/find-my-cat.jpg",
//         new URL(requestUrl).origin
//       ).toString(),
//       type: "action",
//       description: `Set up your own 'Find My Cat' game! Choose max attempts, time limit, and wager amount.`,
//       label: "Create your game",
//       links: { actions },
//     };

//     const headers = new Headers({
//       "Content-Type": "application/json",
//       ...ACTIONS_CORS_HEADERS,
//     });

//     return new Response(JSON.stringify(payload), { status: 200, headers });
//   } catch (err) {
//     logger.error("Error in GET handler: %s", err);
//     return new Response(JSON.stringify({ error: "An unknown error occurred" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }


export const OPTIONS = GET

// POST handler to process game creation and perform the on-chain transaction
export async function POST(req: Request): Promise<Response> {
  try {
    const { account, data } = await req.json();

    let actionId = new URL(req.url).searchParams.get("actionId");
    console.log(`Received POST request for actionId: ${actionId}`);

    if(actionId) {
      // will redirect to game as the game is created
      // return Response.redirect(new URL(`/game/play-game?clusterurl=${process.env.NETWORK}&actionId=${actionId}`, new URL(req.url).origin).toString(), 301)
    }
    const { title, maxAttempts, maxTime, currency, wager, duration } = data || {};

    if (!account || !title || !maxAttempts || !maxTime || !currency || !wager || !duration) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }

    let accountPublicKey: PublicKey;
    try {
      accountPublicKey = new PublicKey(account);
    } catch (err) {
      return new Response("Invalid 'account' provided", {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }

    const gameDetails: CreateFindMyCatGameDto = {
      creatorAddress: accountPublicKey.toString(),
      gameTitle: title,
      maxAttempts: Number(maxAttempts),
      maxTime: parseDuration(maxTime),
      currency,
      wagerAmount: Number(wager),
      startDate: Date.now(),
      endDate: Date.now() + parseDuration(duration),
      actionId: actionId || "",
    };

    // insert in db
    await createFindMyCatGame(gameDetails);

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
    console.log("Base64 Transaction:", base64Transaction);

    const gameLink = new URL(`/game/play-game?clusterurl=${process.env.NETWORK}&actionId=${actionId}`, new URL(req.url).origin).toString();
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        type: "transaction",
        message: `Game created successfully! Share this link to invite others: ${gameLink}`,
      },
    });

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    logger.error("Error in POST handler: %s", err);
    return new Response(JSON.stringify({ error: "An unknown error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Helper function to parse duration (e.g., "5h" = 5 hours)
const parseDuration = (duration: string): number => {
  const timeUnit = duration.slice(-1);
  const timeValue = parseInt(duration.slice(0, -1));

  switch (timeUnit) {
    case 'h': return timeValue * 60 * 60 * 1000;  // hours to milliseconds
    case 'm': return timeValue * 60 * 1000;      // minutes to milliseconds
    case 's': return timeValue * 1000;           // seconds to milliseconds
    case 'd': return timeValue * 24 * 60 * 60 * 1000;  // days to milliseconds`
    default: throw new Error("Invalid duration format");
  }
};

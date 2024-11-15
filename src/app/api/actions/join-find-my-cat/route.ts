import {
  ActionPostResponse,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
  createActionHeaders,
  ActionError,
  LinkedAction,
} from "@solana/actions";
import { PublicKey, Transaction } from "@solana/web3.js";
import { BN, web3 } from "@coral-xyz/anchor";
import {
  CLUSTER_TYPES,
  IFindMyCatById,
  IGetTxObject,
  ONCHAIN_PARTICIPATE_TYPE,
} from "../../common/types";
import { getRequestParam } from "../../common/helper/getParams";
import { ONCHAIN_CONFIG } from "../../common/helper/cluster.helper";
import { getFindMyCatById } from "../../../../../utils/api.util";
import { jsonResponse, Promisify } from "../../common/helper/responseMaker";
import { StatusCodes } from "http-status-codes";
import { GenericError } from "../../../../../utils/error";
import { getTxObject, initWeb3, parseToPrecision, tokenAccounts } from "../../common/helper/helper";
import logger from "../../common/logger";

// create the standard headers for this route (including CORS)
const headers = createActionHeaders();

export const GET = async (req: Request) => {
  try {
    logger.info("GET request received");
    /////////////////////////////////////
    /////////Extract Params//////////////
    /////////////////////////////////////
    const requestUrl = new URL(req.url);
    const FindMyCatID = getRequestParam<number>(requestUrl, "FindMyCatID", false);
    const clusterurl = getRequestParam<CLUSTER_TYPES>(
      requestUrl,
      "clusterurl",
      false,
      Object.values(CLUSTER_TYPES),
      CLUSTER_TYPES.DEVNET,
    );

    const basicUrl =
      process.env.IS_PROD === "prod" ? "https://join.catoff.xyz" : new URL(req.url).origin; // TODO: edit text here

    logger.info("Fetching FindMyCat by ID: %s", FindMyCatID);

    const FindMyCat = await Promisify<IFindMyCatById>(
      getFindMyCatById(clusterurl, FindMyCatID),
    );

    const actions: LinkedAction[] = [
      {
        type: "transaction",
        label: `Join FindMyCat ${FindMyCat.Name}`,
        href: `/api/actions/join-FindMyCat?clusterurl=${clusterurl}&{FindMyCatID}=${FindMyCatID}`, // TODO: edit text here
      },
    ];

    const iconUrl = FindMyCat.Media ?? new URL("/join.png", basicUrl).toString(); // TODO: edit media here

    const payload: ActionGetResponse = {
      title: "Join FindMyCat", // TODO: edit text here
      icon: iconUrl,
      type: "action",
      description: `${FindMyCat.Name}`, // TODO: edit text here
      label: "Join",
      links: {
        actions: actions,
      },
    };

    logger.info("Payload constructed successfully for FindMyCatID: %s", FindMyCatID);
    return jsonResponse(payload, StatusCodes.OK, headers);
  } catch (err) {
    logger.error("An error occurred in GET handler: %s", err);
    const errorMessage = err instanceof GenericError ? err.message : "An unknown error occurred";
    const actionError: ActionError = { message: errorMessage };

    return jsonResponse(actionError, StatusCodes.BAD_REQUEST, headers);
  }
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = async () => Response.json(null, { headers });

export const POST = async (req: Request) => {
  try {
    /////////////////////////////////////
    /////////Extract Params//////////////
    /////////////////////////////////////
    const requestUrl = new URL(req.url);
    const clusterurl = getRequestParam<CLUSTER_TYPES>(
      requestUrl,
      "clusterurl",
      false,
      Object.values(CLUSTER_TYPES),
      CLUSTER_TYPES.DEVNET,
    );
    let FindMyCatID = getRequestParam<number>(requestUrl, "FindMyCatId", false);

    /////////////////////////////////////
    /////////Extract Account/////////////
    /////////////////////////////////////
    const body: ActionPostRequest = await req.json();
    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      throw 'Invalid "account" provided';
    }

    /////////////////////////////////////
    ///////////Parse Phase///////////////
    /////////////////////////////////////

    const FindMyCat = await Promisify<IFindMyCatById>(
      getFindMyCatById(clusterurl, FindMyCatID),
    );

    /////////////////////////////////////
    /////////Transaction Phase///////////
    /////////////////////////////////////

    const { program, connection } = await initWeb3(clusterurl);
    const { escrowTokenAccount, userTokenAccount } = await tokenAccounts({
      connection,
      currency: FindMyCat.Currency,
      escrowPublicKey: ONCHAIN_CONFIG[clusterurl].escrowAccountPublicKey,
      userPublicKey: account,
      cluster: clusterurl,
    });

    const web3Join: IGetTxObject = {
      onchainParticipateType: ONCHAIN_PARTICIPATE_TYPE.JOIN_CHALLENGE,
      account,
      program,
      playerId: new BN(0),
      challengeId: new BN(FindMyCatID),
      amount: new BN(
        parseToPrecision(
          FindMyCat.Wager,
          ONCHAIN_CONFIG[clusterurl]?.Decimals[FindMyCat.Currency],
        ),
      ),
      currency: FindMyCat.Currency,
      userPublicKey: account,
      userTokenAccount,
      escrowTokenAccount,
      cluster: clusterurl,
    };

    const transaction = await Promisify<Transaction>(getTxObject(web3Join));
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction,
        message: "Challenge successfully joined!",
      },
    });
    return jsonResponse(payload, StatusCodes.OK, headers);
  } catch (err) {
    logger.error(err);
    let actionError: ActionError = { message: "An unknown error occurred" };
    if (typeof err == "string") actionError.message = err;
    return jsonResponse(actionError, StatusCodes.BAD_REQUEST, headers);
  }
};

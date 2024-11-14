import axios from "axios";
import axiosRetry from "axios-retry";
import {
  FindMyCatType,
  Challenge,
  CLUSTER_TYPES,
  IFindMyCat,
  IFindMyCatById,
  IChallengeById,
  ICreateChallenge,
  PARTICIPATION_TYPE,
  ResultWithError,
} from "../src/app/api/common/types";
import { ONCHAIN_CONFIG } from "../src/app/api/common/helper/cluster.helper";
import { IGenerateAIDescription } from "./apiReturn.types";
import logger from "@/app/api/common/logger";

// Configure axios retry
axiosRetry(axios, {
  retries: 5,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) =>
    (error.response?.status ?? 0) >= 500 || axiosRetry.isNetworkError(error),
});

// Generate AI Description API
export async function generateAIDescription(
  name: string,
  participationType: PARTICIPATION_TYPE,
): Promise<ResultWithError> {
  try {
    logger.info("Generating AI description for battle: %s", name);
    const response = await axios.post(
      "https://ai-api.catoff.xyz/generate-description-x-api-key/",
      {
        prompt: name,
        participation_type: participationType === PARTICIPATION_TYPE.NVN ? "NvN" : "1v1",
        result_type: "voting",
        additional_info: "",
      },
      { timeout: 200000 },
    );

    const result: IGenerateAIDescription = {
      description: response.data.challenge_description,
      title: response.data.challenge_title,
    };

    logger.info("AI-generated description: %o", response.data);
    return { data: result, error: null };
  } catch (error: any) {
    logger.error("Error generating AI description: %s", error.stack);
    return { data: null, error };
  }
}

// Create Challenge API
export async function createChallenge(
  clusterurl: CLUSTER_TYPES,
  challengeData: ICreateChallenge,
): Promise<ResultWithError> {
  const baseUrl = ONCHAIN_CONFIG[clusterurl].BackendURL;
  const partnerApiKey = ONCHAIN_CONFIG[clusterurl].partnerApiKey;

  try {
    logger.info("Sending request to create challenge at: %s and data: %o", baseUrl, challengeData);
    const response = await axios.post(`${baseUrl}/challenge`, challengeData, {
      headers: {
        "x-api-key": partnerApiKey,
        "Content-Type": "application/json",
      },
      timeout: 100000,
    });
    const result: Challenge = response.data.data;
    logger.info("challenge created successfully: %o", response.data);
    return { data: result, error: null };
  } catch (error: any) {
    logger.error("Error creating challenge: %s", error.stack);
    return { data: null, error };
  }
}

// Get Challenge by ID API
export async function getChallengeById(
  clusterurl: CLUSTER_TYPES,
  challengeId: number,
): Promise<ResultWithError> {
  const baseUrl = ONCHAIN_CONFIG[clusterurl].BackendURL;
  const partnerApiKey = ONCHAIN_CONFIG[clusterurl].partnerApiKey;

  try {
    logger.info("Fetching challenge by ID: %s from %s", challengeId, baseUrl);
    const response = await axios.get(`${baseUrl}/challenge/${challengeId}`, {
      headers: {
        "x-api-key": partnerApiKey,
        "Content-Type": "application/json",
      },
      timeout: 100000,
    });
    const result: IChallengeById = response.data.data;
    logger.info("Successfully fetched challenge: %o", result);
    return { data: result, error: null };
  } catch (error: any) {
    logger.error("Error fetching challenge by ID: %s", error.stack);
    return { data: null, error };
  }
}

// Get Challenge Link by Slug
export async function getChallengeShareLink(
  clusterurl: CLUSTER_TYPES,
  slug: string,
): Promise<ResultWithError> {
  const baseUrl = ONCHAIN_CONFIG[clusterurl].BackendURL;
  const partnerApiKey = ONCHAIN_CONFIG[clusterurl].partnerApiKey;

  try {
    logger.info("Fetching share link for challenge with slug: %s", slug);
    const response = await axios.get(`${baseUrl}/challenge/share/${slug}`, {
      headers: {
        "x-api-key": partnerApiKey,
        "Content-Type": "application/json",
      },
      timeout: 100000,
    });

    const result: string = response.data.data;

    return { data: result, error: null };
  } catch (error: any) {
    logger.error("Error fetching challenge share link: %s", error.stack);
    return { data: null, error };
  }
}

// Template function
export async function createFindMyCat(
  clusterurl: CLUSTER_TYPES,
  FindMyCatData: IFindMyCat,
): Promise<ResultWithError> {
  const baseUrl = ONCHAIN_CONFIG[clusterurl].BackendURL;
  const partnerApiKey = ONCHAIN_CONFIG[clusterurl].partnerApiKey;

  try {
    logger.info(
      "Sending request to create FindMyCat at: %s and data: %o",
      baseUrl,
      FindMyCatData,
    );
    const response = await axios.post(`${baseUrl}/FindMyCat`, FindMyCatData, {
      headers: {
        "x-api-key": partnerApiKey,
        "Content-Type": "application/json",
      },
      timeout: 100000,
    });
    const result: FindMyCatType = response.data.data;
    logger.info("FindMyCat created successfully: %o", response.data);
    return { data: result, error: null };
  } catch (error: any) {
    logger.error("Error creating FindMyCat: %s", error.stack);
    return { data: null, error };
  }
}

// Template get function
export async function getFindMyCatById(
  clusterurl: CLUSTER_TYPES,
  FindMyCatId: number,
): Promise<ResultWithError> {
  const baseUrl = ONCHAIN_CONFIG[clusterurl].BackendURL;
  const partnerApiKey = ONCHAIN_CONFIG[clusterurl].partnerApiKey;

  try {
    logger.info("Fetching FindMyCat by ID: %s from %s", FindMyCatId, baseUrl);
    const response = await axios.get(`${baseUrl}/challenge/${FindMyCatId}`, {
      headers: {
        "x-api-key": partnerApiKey,
        "Content-Type": "application/json",
      },
      timeout: 100000,
    });
    const result: IFindMyCatById = response.data.data;
    logger.info("Successfully fetched FindMyCat: %o", result);
    return { data: result, error: null };
  } catch (error: any) {
    logger.error("Error fetching FindMyCat by ID: %s", error.stack);
    return { data: null, error };
  }
}

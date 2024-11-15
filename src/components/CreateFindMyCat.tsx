'use client';

import { useEffect, useState } from 'react';

type Parameter = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: { label: string; value: string }[];
};

type ActionLink = {
  type: string;
  label: string;
  href: string;
  parameters: Parameter[];
};

type GameResponse = {
  title: string;
  icon: string;
  description: string;
  label: string;
  links: {
    actions: ActionLink[];
  };
};

export default function CreateFindMyCatGame() {
  const [gameData, setGameData] = useState<GameResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch('/api/actions/find-my-cat');
        const data: GameResponse = await response.json();
        setGameData(data);
      } catch (error) {
        console.error('Failed to fetch game data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();
  }, []);

  // Redirect to Dialect once the game data is available
  useEffect(() => {
    if (gameData?.links.actions[0]?.href) {
      const href = gameData.links.actions[0].href;
      const dialectUrl = `https://dial.to/?action=solana-action:${encodeURIComponent(href)}&cluster=${process.env.NETWORK}`;
      console.log(`Redirecting to: ${dialectUrl}`);

      window.location.href = dialectUrl;
    }
  }, [gameData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
        <h2 className="text-xl font-semibold text-purple-800">Loading...</h2>
      </div>
    );
  }

  return null; // No need to render anything since we're redirecting
}

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

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
  const [formData, setFormData] = useState<Record<string, any>>({});
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

  const handleInputChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (gameData) {
      const action = gameData.links.actions[0];
      try {
        const response = await fetch(action.href, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        console.log(result);
        // Handle successful game creation here
      } catch (error) {
        console.error('Failed to create game:', error);
        // Handle error here
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-16 h-16 text-purple-600" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-2xl font-semibold text-purple-800"
        >
          Preparing Your Cat Adventure...
        </motion.h2>
      </div>
    );
  }

  if (!gameData) return null;

  const action = gameData.links.actions[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-6">{gameData.title}</h1>
          <p className="text-gray-600 text-center mb-8">{gameData.description}</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            {action.parameters.map((param) => (
              <div key={param.name}>
                <label htmlFor={param.name} className="block text-sm font-medium text-gray-700 mb-1">
                  {param.label}
                </label>
                {param.type === 'text' && (
                  <input
                    type="text"
                    id={param.name}
                    required={param.required}
                    onChange={(e) => handleInputChange(param.name, e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                )}
                {param.type === 'number' && (
                  <input
                    type="number"
                    id={param.name}
                    min={param.min}
                    max={param.max}
                    required={param.required}
                    onChange={(e) => handleInputChange(param.name, parseInt(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                )}
                {param.type === 'radio' && (
                  <div className="mt-2 space-y-2">
                    {param.options?.map((option) => (
                      <div key={option.value} className="flex items-center">
                        <input
                          id={`${param.name}-${option.value}`}
                          name={param.name}
                          type="radio"
                          value={option.value}
                          onChange={() => handleInputChange(param.name, option.value)}
                          className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300"
                        />
                        <label htmlFor={`${param.name}-${option.value}`} className="ml-3 block text-sm font-medium text-gray-700">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {action.label}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
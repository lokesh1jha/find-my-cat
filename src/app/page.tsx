"use client";

import StartGame from "@/components/StartGame";
import Header from "./components/Header";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Header />
      <StartGame />
    </div>
  );
}

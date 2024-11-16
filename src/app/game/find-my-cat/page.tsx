"use client";
import { useSearchParams } from 'next/navigation';
import CreateFindMyCatGame from "@/components/CreateFindMyCat";

export default function Page() {
  const searchParams = useSearchParams();
  
  // Extract query parameters
  const clusterurl = searchParams.get('clusterurl');
  const actionId = searchParams.get('actionId');

  return (
    <div className="container mx-auto">
      <p>Cluster URL: {clusterurl}</p>
      <p>Action ID: {actionId}</p>
      <CreateFindMyCatGame clusterurl={clusterurl} actionId={actionId} />
    </div>
  );
}

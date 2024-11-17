import prisma from "../../../../utils/db";

export async function GET(request: Request) {
  const actionId = new URL(request.url).searchParams.get('actionId');
  
  let game = await prisma.game.findFirst({
    where: { actionId }
  });

  // Convert BigInt fields to strings
  const sanitizedGame = game ? convertBigIntToString(game) : null;

  return Response.json(
    { message: "Hello, Next.js!", data: sanitizedGame },
    { status: 200 }
  );
}

// Utility function to convert BigInt fields to strings
function convertBigIntToString(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value))
  );
}

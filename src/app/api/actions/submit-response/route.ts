import prisma from "../../../../../utils/db";

export async function POST(request: Request) {
    const body = await request.json();
    let game = await prisma.game.findFirst({
        where: {
            actionId: body.actionId
        }
    })

    if(!game) {
        return Response.json({ message: "Game not found" }, { status: 404 });
    }

    body.game_id = game?.id
    console.log(body);
    await prisma.responses.create({ data: body });
    return Response.json({ message: "Hello, Next.js!" }, { status: 200 });
}
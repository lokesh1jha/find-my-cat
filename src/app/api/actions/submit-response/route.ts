import prisma from "../../../../../utils/db";

export async function POST(request: Request) {
    const body = await request.json();
    console.log(body);
    prisma.responses.create({ data: body });
    return Response.json({ message: "Hello, Next.js!" }, { status: 200 });
}
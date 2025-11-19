// src/app/api/links/public/[code]/route.ts
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Link from "@/models/Link";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = await params;
  await connectDB();
  const link = await Link.findOne({ code }).select("-userId -__v");

  if (!link) {
    return new Response("Not found", { status: 404 });
  }

  return Response.json(link);
}
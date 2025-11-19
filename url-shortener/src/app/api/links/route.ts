import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route" // we'll create this in a sec
import { connectDB } from "@/lib/db"
import Link from "@/models/Link"
import { z } from "zod"

const createSchema = z.object({
  targetUrl: z.string().url(),

  customCode: z
    .string()
    .regex(/^[a-zA-Z0-9_-]*$/, "Invalid custom code")
    .optional(),
});
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response("Unauthorized", { status: 401 })

  await connectDB()

  const body = await req.json()
  const validation = createSchema.safeParse(body)
  if (!validation.success) return new Response("Invalid data", { status: 400 })

  let code = validation.data.customCode || Math.random().toString(36).substring(2, 8)

  // Ensure unique code
  while (await Link.findOne({ code })) {
    code = Math.random().toString(36).substring(2, 8)
  }

  const newLink = await Link.create({
    code,
    targetUrl: validation.data.targetUrl,
    userId: session.user.id,
  })

  return Response.json({ shortUrl: `${process.env.NEXTAUTH_URL}/${code}`, ...newLink.toObject() })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response("Unauthorized", { status: 401 })

  await connectDB()
  const links = await Link.find({ userId: session.user.id }).sort({ createdAt: -1 })
  return Response.json(links)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response("Unauthorized", { status: 401 })

  const { id } = await req.json()
  await connectDB()

  const link = await Link.findOne({ _id: id, userId: session.user.id })
  if (!link) return new Response("Not found or unauthorized", { status: 404 })

  await link.deleteOne()
  return new Response("Deleted", { status: 200 })
}
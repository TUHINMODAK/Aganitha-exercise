import { NextRequest } from "next/server"
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

  await connectDB()

  const body = await req.json()
  const validation = createSchema.safeParse(body)
  if (!validation.success) return new Response("Invalid data", { status: 400 })

  let code = validation.data.customCode

  if(!code) {
    return Response.json({ message: "Custom code is required" }, { status: 400 })
  }

  // Ensure unique code
  if (await Link.findOne({ code })) {
    return Response.json({ message: "Code already in use" }, { status: 400 })
  }

  const newLink = await Link.create({
    code,
    targetUrl: validation.data.targetUrl,
  })

  return Response.json({ shortUrl: `${process.env.NEXTAUTH_URL}/${code}`, ...newLink.toObject() })
}

export async function GET(req: NextRequest) {

  await connectDB()
  const links = await Link.find().sort({ createdAt: -1 })
  return Response.json(links)
}

export async function DELETE(req: NextRequest) {

  const { id } = await req.json()
  await connectDB()

  const link = await Link.findOne({ _id: id})
  if (!link) return new Response("Not found or unauthorized", { status: 404 })

  await link.deleteOne()
  return new Response("Deleted", { status: 200 })
}
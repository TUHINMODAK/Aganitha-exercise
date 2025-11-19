import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Link from "@/models/Link"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  await connectDB()
  
  const code = (await params).code
  
  const link = await Link.findOne({ code })
  console.log("in code/link")
  if (!link) {
    return new Response("Not Found", { status: 404 })
  }

  // Increment clicks
  link.clicks += 1
  link.lastClicked = new Date()
  await link.save()

  return NextResponse.redirect(link.targetUrl, 302)
}
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ message: "All fields are required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    return Response.json({ message: "User created successfully" }, { status: 201 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Server error" }, { status: 500 });
  }
}
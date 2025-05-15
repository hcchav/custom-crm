import { NextResponse } from "next/server";
import { sendProposalEmail } from "@/lib/email/sendProposalEmail";

export async function POST(req: Request) {
  const body = await req.json();

  try {
    await sendProposalEmail(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

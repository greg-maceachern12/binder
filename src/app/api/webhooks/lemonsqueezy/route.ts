import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json("Required env secrets not set!", { status: 400 });
  }

  const rawBody = await request.text();
  const signature = Buffer.from(
    request.headers.get("X-Signature") ?? "",
    "hex"
  );

  if (signature.length === 0 || rawBody.length === 0) {
    return NextResponse.json("Invalid request", { status: 400 });
  }

  const hmac = Buffer.from(
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex"),
    "hex"
  );

  if (!crypto.timingSafeEqual(hmac, signature)) {
    return NextResponse.json("Invalid request", { status: 400 });
  }

  // The request is valid, parse the data here
  const data = JSON.parse(rawBody);

  const eventName = data["meta"]["event_name"];
  const attributes = data["data"]["attributes"];
  const id = data["data"]["id"];

  return NextResponse.json("OK", { status: 200 });
}

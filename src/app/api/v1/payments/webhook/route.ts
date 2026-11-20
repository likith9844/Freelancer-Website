import { NextRequest, NextResponse } from "next/server";
import { RazorpayRouteService } from "@/lib/payments/razorpay-route";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "simulated_webhook_signature";

    const result = RazorpayRouteService.processWebhookEvent(rawBody, signature);

    return NextResponse.json({
      status: "ok",
      received: true,
      event: result.event,
      message: result.message,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process webhook" },
      { status: 400 }
    );
  }
}

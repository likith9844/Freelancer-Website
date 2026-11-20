import { NextResponse } from "next/server";
import { getMarketplaceSettings } from "@/lib/payments/provider";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = getMarketplaceSettings();
    return NextResponse.json({
      success: true,
      settings: {
        platformName: "KaryaSetu",
        clientServiceFeeRate: settings.clientServiceFeeRate,
        freelancerCommissionRate: settings.freelancerCommissionRate,
        gstRate: settings.gstRate,
        gatewayHandlingFeeRate: settings.gatewayHandlingFeeRate,
        tdsRate: settings.tdsRate,
        minWithdrawalINR: settings.minWithdrawalINR,
        autoReleaseDays: settings.autoReleaseDays,
        escrowHoldDelayDays: settings.escrowHoldDelayDays,
        razorpayRouteMode: settings.razorpayRouteMode,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to retrieve platform settings" },
      { status: 500 }
    );
  }
}

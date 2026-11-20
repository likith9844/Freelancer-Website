import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/store";

const startTime = Date.now();

export async function GET() {
  try {
    const memory = process.memoryUsage();
    const db = getDatabase();

    const health = {
      status: "UP",
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      service: "karyasetu-marketplace-core",
      environment: process.env.NODE_ENV || "production",
      database: {
        status: "CONNECTED",
        usersCount: (db.users || []).length,
        contractsCount: (db.contracts || []).length,
        ledgerEntriesCount: (db.ledgerEntries || []).length,
      },
      system: {
        memoryHeapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
        memoryHeapTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
        memoryRssMB: Math.round(memory.rss / 1024 / 1024),
        nodeVersion: process.version,
      },
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "DOWN",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

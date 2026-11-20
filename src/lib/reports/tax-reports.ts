import { getDatabase, DBLedgerEntry, DBUser } from "../db/store";

export interface TdsFreelancerRecord {
  freelancerId: string;
  freelancerName: string;
  panNumber: string;
  email: string;
  grossAmountINR: number;
  tdsDeductedINR: number;
  sectionCode: "194-O";
  financialYear: string;
  quarter: string;
  challanStatus: "PROVISIONALLY_WITHHELD" | "DEPOSITED" | "FORM_26AS_GENERATED";
}

export interface GstTransactionRecord {
  invoiceId: string;
  invoiceDate: string;
  recipientName: string;
  recipientGstin?: string;
  sacCode: "998314";
  serviceDescription: string;
  taxableValueINR: number;
  cgstRate: number; // 9%
  cgstAmountINR: number;
  sgstRate: number; // 9%
  sgstAmountINR: number;
  igstRate: number; // 18%
  igstAmountINR: number;
  totalGstINR: number;
  totalInvoiceINR: number;
  placeOfSupply: string;
}

export interface TaxReportSummary {
  financialYear: string;
  quarter: string;
  tds: {
    section: "194-O";
    totalGrossDisbursedINR: number;
    totalTdsWithheldINR: number;
    participantCount: number;
    records: TdsFreelancerRecord[];
  };
  gst: {
    sacCode: "998314";
    sacDescription: "Information Technology Design & Engineering Services";
    totalTaxableValueINR: number;
    totalCgstINR: number;
    totalSgstINR: number;
    totalIgstINR: number;
    totalGstCollectedINR: number;
    records: GstTransactionRecord[];
  };
}

export function generateTaxReportSummary(): TaxReportSummary {
  const db = getDatabase();
  const currentFY = "FY 2026-27";
  const currentQuarter = "Q3 (Oct-Dec 2026)";

  // 1. Gather Freelancer TDS
  const tdsRecords: TdsFreelancerRecord[] = [];
  const freelancers = (db.users || []).filter((u) => u.role === "FREELANCER");

  freelancers.forEach((freelancer) => {
    const profile = (db.freelancers || []).find((f) => f.userId === freelancer.id);
    const profileId = profile?.id;

    // Look up completed milestones or settlements for this freelancer
    let grossTotal = 0;
    (db.contracts || []).forEach((c) => {
      if (c.freelancerId === freelancer.id || (profileId && c.freelancerId === profileId)) {
        (c.milestones || []).forEach((m) => {
          if (["APPROVED", "RELEASED"].includes(m.status)) {
            grossTotal += m.amountINR;
          }
        });
      }
    });

    if (grossTotal > 0) {
      const tdsAmount = Math.round(grossTotal * 0.01); // 1% Section 194-O
      const freelancerName =
        freelancer.fullName ||
        (freelancer as any).name ||
        "Freelancer Participant";

      tdsRecords.push({
        freelancerId: freelancer.id,
        freelancerName,
        panNumber: (freelancer as any).kyc?.panNumber || "ABCPS1234F",
        email: freelancer.email,
        grossAmountINR: grossTotal,
        tdsDeductedINR: tdsAmount,
        sectionCode: "194-O",
        financialYear: currentFY,
        quarter: currentQuarter,
        challanStatus: "PROVISIONALLY_WITHHELD",
      });
    }
  });

  const totalGrossDisbursed = tdsRecords.reduce((s, r) => s + r.grossAmountINR, 0);
  const totalTdsWithheld = tdsRecords.reduce((s, r) => s + r.tdsDeductedINR, 0);

  // 2. Gather GST Records from Platform Revenues & Ledger
  const gstRecords: GstTransactionRecord[] = [];
  let totalTaxable = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  (db.contracts || []).forEach((contract, idx) => {
    const client = db.users.find((u) => u.id === contract.clientId);
    (contract.milestones || []).forEach((milestone, mIdx) => {
      if (["FUNDED", "APPROVED", "RELEASED"].includes(milestone.status)) {
        // Platform Client Service Fee (3%)
        const clientFee = Math.round(milestone.amountINR * 0.03);
        const cgstClient = Math.round(clientFee * 0.09);
        const sgstClient = Math.round(clientFee * 0.09);
        const gstClientTotal = cgstClient + sgstClient;

        gstRecords.push({
          invoiceId: `INV-GST-2026-${idx + 1}0${mIdx + 1}`,
          invoiceDate: milestone.fundedAt || new Date().toISOString(),
          recipientName: client?.fullName || (client as any)?.name || "Client Business",
          recipientGstin: (client as any)?.kyc?.panNumber ? `${(client as any).kyc.panNumber}1Z5` : undefined,
          sacCode: "998314",
          serviceDescription: `Platform Facilitation Fee - Milestone ${milestone.title}`,
          taxableValueINR: clientFee,
          cgstRate: 0.09,
          cgstAmountINR: cgstClient,
          sgstRate: 0.09,
          sgstAmountINR: sgstClient,
          igstRate: 0.18,
          igstAmountINR: 0,
          totalGstINR: gstClientTotal,
          totalInvoiceINR: clientFee + gstClientTotal,
          placeOfSupply: "27-Maharashtra",
        });

        totalTaxable += clientFee;
        totalCgst += cgstClient;
        totalSgst += sgstClient;
      }

      if (["APPROVED", "RELEASED"].includes(milestone.status)) {
        // Platform Freelancer Commission (10%)
        const comm = Math.round(milestone.amountINR * 0.10);
        const cgstComm = Math.round(comm * 0.09);
        const sgstComm = Math.round(comm * 0.09);
        const gstCommTotal = cgstComm + sgstComm;

        const freelancer = db.users.find((u) => u.id === contract.freelancerId);
        gstRecords.push({
          invoiceId: `INV-COMM-2026-${idx + 1}0${mIdx + 1}`,
          invoiceDate: milestone.releasedAt || new Date().toISOString(),
          recipientName: freelancer?.fullName || (freelancer as any)?.name || "Freelancer Participant",
          recipientGstin: undefined,
          sacCode: "998314",
          serviceDescription: `Platform Commission - Milestone ${milestone.title}`,
          taxableValueINR: comm,
          cgstRate: 0.09,
          cgstAmountINR: cgstComm,
          sgstRate: 0.09,
          sgstAmountINR: sgstComm,
          igstRate: 0.18,
          igstAmountINR: 0,
          totalGstINR: gstCommTotal,
          totalInvoiceINR: comm + gstCommTotal,
          placeOfSupply: "27-Maharashtra",
        });

        totalTaxable += comm;
        totalCgst += cgstComm;
        totalSgst += sgstComm;
      }
    });
  });

  return {
    financialYear: currentFY,
    quarter: currentQuarter,
    tds: {
      section: "194-O",
      totalGrossDisbursedINR: totalGrossDisbursed,
      totalTdsWithheldINR: totalTdsWithheld,
      participantCount: tdsRecords.length,
      records: tdsRecords,
    },
    gst: {
      sacCode: "998314",
      sacDescription: "Information Technology Design & Engineering Services",
      totalTaxableValueINR: totalTaxable,
      totalCgstINR: totalCgst,
      totalSgstINR: totalSgst,
      totalIgstINR: totalIgst,
      totalGstCollectedINR: totalCgst + totalSgst + totalIgst,
      records: gstRecords,
    },
  };
}

/**
 * Generate standard RFC 4180 CSV export files
 */
export function generateCsvExport(type: "TDS" | "GST" | "LEDGER"): string {
  const db = getDatabase();
  const summary = generateTaxReportSummary();

  if (type === "TDS") {
    const headers = [
      "Financial Year",
      "Quarter",
      "Section",
      "Freelancer ID",
      "Name",
      "PAN Number",
      "Email",
      "Gross Disbursed (INR)",
      "TDS Deducted 1% (INR)",
      "Challan Status",
    ];
    const rows = summary.tds.records.map((r) => [
      `"${r.financialYear}"`,
      `"${r.quarter}"`,
      `"${r.sectionCode}"`,
      `"${r.freelancerId}"`,
      `"${r.freelancerName}"`,
      `"${r.panNumber}"`,
      `"${r.email}"`,
      r.grossAmountINR,
      r.tdsDeductedINR,
      `"${r.challanStatus}"`,
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  }

  if (type === "GST") {
    const headers = [
      "Invoice ID",
      "Date",
      "Recipient Name",
      "Recipient GSTIN",
      "SAC Code",
      "Service Description",
      "Taxable Value (INR)",
      "CGST Rate",
      "CGST (INR)",
      "SGST Rate",
      "SGST (INR)",
      "IGST Rate",
      "IGST (INR)",
      "Total GST (INR)",
      "Total Invoice (INR)",
      "Place of Supply",
    ];
    const rows = summary.gst.records.map((r) => [
      `"${r.invoiceId}"`,
      `"${r.invoiceDate}"`,
      `"${r.recipientName}"`,
      `"${r.recipientGstin || "N/A"}"`,
      `"${r.sacCode}"`,
      `"${r.serviceDescription}"`,
      r.taxableValueINR,
      "9%",
      r.cgstAmountINR,
      "9%",
      r.sgstAmountINR,
      "18%",
      r.igstAmountINR,
      r.totalGstINR,
      r.totalInvoiceINR,
      `"${r.placeOfSupply}"`,
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  }

  // LEDGER
  const headers = [
    "Entry ID",
    "Timestamp",
    "Transaction Group ID",
    "Account Code",
    "Direction",
    "Amount (INR)",
    "Reference Type",
    "Description",
  ];
  const rows = (db.ledgerEntries || []).map((e) => [
    `"${e.id}"`,
    `"${e.createdAt}"`,
    `"${e.transactionGroupId}"`,
    `"${e.accountCode}"`,
    `"${e.direction}"`,
    e.amountINR,
    `"${e.referenceType}"`,
    `"${e.description.replace(/"/g, '""')}"`,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}

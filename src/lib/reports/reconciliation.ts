import { getDatabase, DBLedgerEntry, DBPayment, DBMilestone } from "../db/store";

export interface AccountBalance {
  accountCode: string;
  accountName: string;
  category: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  totalDebits: number;
  totalCredits: number;
  netBalance: number;
}

export interface ReconciliationReport {
  timestamp: string;
  status: "BALANCED" | "UNRECONCILED";
  totalDebits: number;
  totalCredits: number;
  ledgerImbalance: number;
  accounts: AccountBalance[];
  reconciliations: {
    gateway: {
      totalCapturedINR: number;
      clearingAccountDebitsINR: number;
      varianceINR: number;
      isReconciled: boolean;
    };
    escrow: {
      activeMilestoneCommitmentINR: number;
      escrowLiabilityNetINR: number;
      varianceINR: number;
      isReconciled: boolean;
    };
    tax: {
      tds194OWithheldINR: number;
      gstOutputLiabilityINR: number;
      isReconciled: boolean;
    };
  };
}

export const ACCOUNT_METADATA: Record<string, { name: string; category: AccountBalance["category"] }> = {
  "1010-GATEWAY-CLEARING": { name: "Gateway Settlement Clearing", category: "ASSET" },
  "2010-CLIENT-ESCROW": { name: "Client Milestone Escrow Payable", category: "LIABILITY" },
  "2020-FREELANCER-ESCROW-CLEARING": { name: "Freelancer Wallet Clearing", category: "LIABILITY" },
  "2030-GST-PAYABLE": { name: "GST Output Tax Liability (18%)", category: "LIABILITY" },
  "2040-TDS-PAYABLE-194O": { name: "TDS Payable u/s 194-O (1%)", category: "LIABILITY" },
  "4010-COMMISSION-REVENUE": { name: "Marketplace Commission Revenue", category: "REVENUE" },
  "5010-GATEWAY-FEES-EXPENSE": { name: "Payment Gateway Interchange Fees", category: "EXPENSE" },
};

export function getCanonicalAccountCode(code: string): string {
  if (code.startsWith("1010")) return "1010-GATEWAY-CLEARING";
  if (code.startsWith("2010")) return "2010-CLIENT-ESCROW";
  if (code.startsWith("2020")) return "2020-FREELANCER-ESCROW-CLEARING";
  if (code.startsWith("2030") || code.startsWith("2040-GST")) return "2030-GST-PAYABLE";
  if (code.includes("TDS") || code.startsWith("2050") || code.startsWith("2040-TDS")) return "2040-TDS-PAYABLE-194O";
  if (code.startsWith("40")) return "4010-COMMISSION-REVENUE";
  if (code.startsWith("50")) return "5010-GATEWAY-FEES-EXPENSE";
  return code;
}

export function performLedgerReconciliation(): ReconciliationReport {
  const db = getDatabase();
  const ledgerEntries = db.ledgerEntries || [];

  // 1. Group ledger entries by canonical account
  const accountMap = new Map<string, { debits: number; credits: number }>();

  // Ensure standard accounts exist
  Object.keys(ACCOUNT_METADATA).forEach((code) => {
    accountMap.set(code, { debits: 0, credits: 0 });
  });

  let totalDebits = 0;
  let totalCredits = 0;

  ledgerEntries.forEach((entry) => {
    const canonical = getCanonicalAccountCode(entry.accountCode);
    let current = accountMap.get(canonical);
    if (!current) {
      current = { debits: 0, credits: 0 };
      accountMap.set(canonical, current);
    }

    if (entry.direction === "DEBIT") {
      current.debits += entry.amountINR;
      totalDebits += entry.amountINR;
    } else {
      current.credits += entry.amountINR;
      totalCredits += entry.amountINR;
    }
  });

  const accounts: AccountBalance[] = Array.from(accountMap.entries()).map(([code, val]) => {
    const meta = ACCOUNT_METADATA[code] || { name: code, category: "ASSET" };
    // For Assets & Expenses: Net = Debits - Credits
    // For Liabilities, Equity & Revenue: Net = Credits - Debits
    const isAssetOrExpense = meta.category === "ASSET" || meta.category === "EXPENSE";
    const netBalance = isAssetOrExpense ? val.debits - val.credits : val.credits - val.debits;

    return {
      accountCode: code,
      accountName: meta.name,
      category: meta.category,
      totalDebits: val.debits,
      totalCredits: val.credits,
      netBalance,
    };
  });

  const ledgerImbalance = Math.abs(totalDebits - totalCredits);

  // 2. Gateway Reconciliation
  const payments = db.payments || [];
  const totalCapturedINR = payments
    .filter((p) => p.status === "CAPTURED")
    .reduce((sum, p) => sum + p.amountINR, 0);

  const clearingDebits = accountMap.get("1010-GATEWAY-CLEARING")?.debits || 0;
  const gatewayVariance = Math.abs(totalCapturedINR - clearingDebits);

  // 3. Escrow Reconciliation
  // Active milestones waiting in escrow
  const activeMilestones: DBMilestone[] = [];
  (db.contracts || []).forEach((c) => {
    (c.milestones || []).forEach((m) => {
      if (
        ["FUNDED", "IN_PROGRESS", "SUBMITTED", "REVISION_REQUESTED", "DISPUTED"].includes(
          m.status
        )
      ) {
        activeMilestones.push(m);
      }
    });
  });

  const activeMilestoneCommitmentINR = activeMilestones.reduce(
    (sum, m) => sum + m.amountINR,
    0
  );
  const escrowAccount = accounts.find((a) => a.accountCode === "2010-CLIENT-ESCROW");
  const escrowLiabilityNetINR = escrowAccount ? escrowAccount.netBalance : 0;
  const escrowVariance = Math.abs(activeMilestoneCommitmentINR - escrowLiabilityNetINR);

  // 4. Tax Reconciliations
  const tdsAccount = accounts.find((a) => a.accountCode === "2040-TDS-PAYABLE-194O");
  const gstAccount = accounts.find((a) => a.accountCode === "2030-GST-PAYABLE");

  const tds194OWithheldINR = tdsAccount ? tdsAccount.netBalance : 0;
  const gstOutputLiabilityINR = gstAccount ? gstAccount.netBalance : 0;

  const isBalanced =
    ledgerImbalance === 0 && gatewayVariance === 0 && escrowVariance === 0;

  return {
    timestamp: new Date().toISOString(),
    status: isBalanced ? "BALANCED" : "UNRECONCILED",
    totalDebits,
    totalCredits,
    ledgerImbalance,
    accounts,
    reconciliations: {
      gateway: {
        totalCapturedINR,
        clearingAccountDebitsINR: clearingDebits,
        varianceINR: gatewayVariance,
        isReconciled: gatewayVariance === 0,
      },
      escrow: {
        activeMilestoneCommitmentINR,
        escrowLiabilityNetINR,
        varianceINR: escrowVariance,
        isReconciled: escrowVariance === 0,
      },
      tax: {
        tds194OWithheldINR,
        gstOutputLiabilityINR,
        isReconciled: true,
      },
    },
  };
}

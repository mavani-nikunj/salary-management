import cron from "node-cron";
import { Currency } from "@/models";

const CURRENCY_CDN_URL =
  process.env.INR_CURRENCIES_CDN ||
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/inr.json";

/**
 * Fetches latest exchange rates from the INR currency CDN and updates currencies in the database
 */
export const syncCurrencyRates = async (): Promise<void> => {
  try {
    const cdnUrl = process.env.INR_CURRENCIES_CDN || CURRENCY_CDN_URL;
    console.log(`[Cron] Fetching latest currency rates from: ${cdnUrl}`);

    const response = await fetch(cdnUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch currency rates, HTTP ${response.status}`);
    }

    const data: any = await response.json();
    const rates: Record<string, number> = data?.inr || {};

    if (!rates || Object.keys(rates).length === 0) {
      console.warn("[Cron] No exchange rates found in CDN response.");
      return;
    }

    const existingCurrencies = await Currency.find({});
    if (existingCurrencies.length === 0) {
      console.log("[Cron] No currencies in database to update.");
      return;
    }

    const bulkOps = [];
    let updatedCount = 0;

    for (const curr of existingCurrencies) {
      const codeKey = curr.code.toLowerCase();
      const newRate = rates[codeKey];

      if (typeof newRate === "number" && !isNaN(newRate)) {
        // Enforce min 0.0001 constraint
        const validRate = Math.max(newRate, 0.0001);
        bulkOps.push({
          updateOne: {
            filter: { _id: curr._id },
            update: { $set: { exRate: validRate } },
          },
        });
        updatedCount++;
      }
    }

    if (bulkOps.length > 0) {
      await Currency.bulkWrite(bulkOps);
      console.log(
        `[Cron] Successfully updated exchange rates for ${updatedCount} currencies at ${new Date().toISOString()} (UTC)`,
      );
    }
  } catch (error: any) {
    console.error("[Cron] Error updating currency exchange rates:", error.message);
  }
};

/**
 * Initializes the daily cron job running at 12:00 PM UTC
 */
export const initCurrencyCron = (): void => {
  // 0 12 * * * = Every day at 12:00 PM (noon)
  cron.schedule(
    "0 12 * * *",
    async () => {
      console.log("[Cron] Triggering scheduled currency rate update (12:00 PM UTC)...");
      await syncCurrencyRates();
    },
    {
      timezone: "UTC",
    },
  );

  console.log(
    "[Cron] Currency update cron job initialized: Scheduled for 12:00 PM UTC daily.",
  );
};

export default initCurrencyCron;

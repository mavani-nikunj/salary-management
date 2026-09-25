import { Request, Response } from "express";
import mongoose from "mongoose";
import { Currency, Country, Employee, Salary } from "@/models";
import { sendResponse } from "@/utils/response";

/**
 * @desc   Get all currencies with live exchange rates, country details, search & pagination
 * @route  GET /api/currencies
 * @access Private
 */
export const getCurrencies = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      search,
      countryId,
      sortBy = "code",
      sortOrder = "asc",
      page = "1",
      limit = "100",
      all,
    } = req.query;

    const query: any = {};

    if (countryId && mongoose.Types.ObjectId.isValid(String(countryId))) {
      query.countryId = new mongoose.Types.ObjectId(String(countryId));
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      const term = search.trim();
      query.$or = [
        { code: new RegExp(term, "i") },
        { name: new RegExp(term, "i") },
      ];
    }

    const isAll = String(all) === "true";
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = isAll ? 500 : Math.min(300, Math.max(1, parseInt(String(limit), 10) || 100));
    const skip = isAll ? 0 : (pageNum - 1) * limitNum;

    const orderDirection = sortOrder === "desc" ? -1 : 1;
    const sort: any = { [String(sortBy)]: orderDirection };

    const [currencies, total] = await Promise.all([
      Currency.find(query)
        .populate("countryId", "name code")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Currency.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    sendResponse(res, 200, "Currencies retrieved successfully.", {
      currencies,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error: any) {
    console.error("[Currency] Get currencies error:", error);
    sendResponse(res, 500, "Failed to retrieve currencies.");
  }
};

/**
 * @desc   Get single currency by ID or 3-letter currency code (e.g. USD, EUR, INR)
 * @route  GET /api/currencies/:id
 * @access Private
 */
export const getCurrencyById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const identifier = String(req.params.id).trim();

    let currency = null;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      currency = await Currency.findById(identifier).populate("countryId", "name code").lean();
    } else {
      currency = await Currency.findOne({
        code: identifier.toUpperCase(),
      }).populate("countryId", "name code").lean();
    }

    if (!currency) {
      sendResponse(res, 404, "Currency not found.");
      return;
    }

    sendResponse(res, 200, "Currency retrieved successfully.", { currency });
  } catch (error: any) {
    console.error("[Currency] Get currency by ID error:", error);
    sendResponse(res, 500, "Failed to retrieve currency.");
  }
};

/**
 * @desc   Create new currency record
 * @route  POST /api/currencies
 * @access Private
 */
export const createCurrency = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { countryId, code, name, exRate } = req.body;

    if (!countryId || !code || !name || exRate === undefined) {
      sendResponse(
        res,
        400,
        "Missing required fields: countryId, code, name, exRate.",
      );
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(String(countryId))) {
      sendResponse(res, 400, "Invalid countryId format.");
      return;
    }

    const country = await Country.findById(countryId);
    if (!country) {
      sendResponse(res, 404, "Referenced country not found.");
      return;
    }

    const cleanCode = String(code).trim().toUpperCase();

    // Check compound unique constraint: [countryId, code]
    const existing = await Currency.findOne({
      countryId,
      code: cleanCode,
    });

    if (existing) {
      sendResponse(
        res,
        400,
        `Currency '${cleanCode}' already exists for this country.`,
      );
      return;
    }

    const currency = await Currency.create({
      countryId,
      code: cleanCode,
      name: String(name).trim(),
      exRate: Number(exRate),
    });

    sendResponse(res, 201, "Currency created successfully.", { currency });
  } catch (error: any) {
    console.error("[Currency] Create currency error:", error);
    sendResponse(res, 500, "Failed to create currency.");
  }
};

/**
 * @desc   Update currency details or exchange rate
 * @route  PUT /api/currencies/:id
 * @access Private
 */
export const updateCurrency = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id).trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, "Invalid currency ID format.");
      return;
    }

    const currency = await Currency.findById(id);
    if (!currency) {
      sendResponse(res, 404, "Currency not found.");
      return;
    }

    const { name, exRate, countryId } = req.body;

    if (name) currency.name = String(name).trim();
    if (exRate !== undefined && !isNaN(Number(exRate))) {
      currency.exRate = Number(exRate);
    }
    if (countryId && mongoose.Types.ObjectId.isValid(String(countryId))) {
      currency.countryId = new mongoose.Types.ObjectId(String(countryId));
    }

    await currency.save();

    sendResponse(res, 200, "Currency updated successfully.", { currency });
  } catch (error: any) {
    console.error("[Currency] Update currency error:", error);
    sendResponse(res, 500, "Failed to update currency.");
  }
};

/**
 * @desc   Delete currency record
 * @route  DELETE /api/currencies/:id
 * @access Private
 */
export const deleteCurrency = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id).trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, "Invalid currency ID format.");
      return;
    }

    const currency = await Currency.findById(id);
    if (!currency) {
      sendResponse(res, 404, "Currency not found.");
      return;
    }

    // Check if referenced by employees or salary history
    const [empCount, salaryCount] = await Promise.all([
      Employee.countDocuments({ currencyId: currency._id }),
      Salary.countDocuments({ currencyId: currency._id }),
    ]);

    if (empCount > 0 || salaryCount > 0) {
      sendResponse(
        res,
        400,
        `Cannot delete currency: Referenced by ${empCount} employee(s) and ${salaryCount} salary record(s).`,
      );
      return;
    }

    await Currency.deleteOne({ _id: id });

    sendResponse(res, 200, "Currency deleted successfully.", {
      currencyId: id,
      deletedCode: currency.code,
    });
  } catch (error: any) {
    console.error("[Currency] Delete currency error:", error);
    sendResponse(res, 500, "Failed to delete currency.");
  }
};

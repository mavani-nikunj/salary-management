import { Request, Response } from "express";
import mongoose from "mongoose";
import { Country, Currency, Employee } from "../models";
import { sendResponse } from "../utils/response";

/**
 * @desc   Get all countries with search, sorting & pagination
 * @route  GET /api/countries
 * @access Private
 */
export const getCountries = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      search,
      sortBy = "name",
      sortOrder = "asc",
      page = "1",
      limit = "100",
      all,
    } = req.query;

    const query: any = {};

    if (search && typeof search === "string" && search.trim() !== "") {
      const term = search.trim();
      query.$or = [
        { name: new RegExp(term, "i") },
        { code: new RegExp(term, "i") },
      ];
    }

    const isAll = String(all) === "true";
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = isAll ? 500 : Math.min(300, Math.max(1, parseInt(String(limit), 10) || 100));
    const skip = isAll ? 0 : (pageNum - 1) * limitNum;

    const orderDirection = sortOrder === "desc" ? -1 : 1;
    const sort: any = { [String(sortBy)]: orderDirection };

    const [countries, total] = await Promise.all([
      Country.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
      Country.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    sendResponse(res, 200, "Countries retrieved successfully.", {
      countries,
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
    console.error("[Country] Get countries error:", error);
    sendResponse(res, 500, "Failed to retrieve countries.");
  }
};

/**
 * @desc   Get single country by ID or 2-letter code
 * @route  GET /api/countries/:id
 * @access Private
 */
export const getCountryById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const identifier = String(req.params.id).trim();

    let country = null;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      country = await Country.findById(identifier).lean();
    } else {
      country = await Country.findOne({
        code: identifier.toUpperCase(),
      }).lean();
    }

    if (!country) {
      sendResponse(res, 404, "Country not found.");
      return;
    }

    sendResponse(res, 200, "Country retrieved successfully.", { country });
  } catch (error: any) {
    console.error("[Country] Get country by ID error:", error);
    sendResponse(res, 500, "Failed to retrieve country.");
  }
};

/**
 * @desc   Create new country record
 * @route  POST /api/countries
 * @access Private
 */
export const createCountry = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      sendResponse(res, 400, "Both 'name' and 'code' are required.");
      return;
    }

    const cleanCode = String(code).trim().toUpperCase();
    const cleanName = String(name).trim();

    // Check duplicate code
    const existing = await Country.findOne({ code: cleanCode });
    if (existing) {
      sendResponse(res, 400, `Country with code '${cleanCode}' already exists.`);
      return;
    }

    const country = await Country.create({
      name: cleanName,
      code: cleanCode,
    });

    sendResponse(res, 201, "Country created successfully.", { country });
  } catch (error: any) {
    console.error("[Country] Create country error:", error);
    sendResponse(res, 500, "Failed to create country.");
  }
};

/**
 * @desc   Update country record
 * @route  PUT /api/countries/:id
 * @access Private
 */
export const updateCountry = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id).trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, "Invalid country ID format.");
      return;
    }

    const country = await Country.findById(id);
    if (!country) {
      sendResponse(res, 404, "Country not found.");
      return;
    }

    const { name, code } = req.body;

    if (code) {
      const cleanCode = String(code).trim().toUpperCase();
      if (cleanCode !== country.code) {
        const existing = await Country.findOne({ code: cleanCode, _id: { $ne: country._id } });
        if (existing) {
          sendResponse(res, 400, `Country with code '${cleanCode}' already exists.`);
          return;
        }
        country.code = cleanCode;
      }
    }

    if (name) {
      country.name = String(name).trim();
    }

    await country.save();

    sendResponse(res, 200, "Country updated successfully.", { country });
  } catch (error: any) {
    console.error("[Country] Update country error:", error);
    sendResponse(res, 500, "Failed to update country.");
  }
};

/**
 * @desc   Delete country record
 * @route  DELETE /api/countries/:id
 * @access Private
 */
export const deleteCountry = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id).trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, "Invalid country ID format.");
      return;
    }

    const country = await Country.findById(id);
    if (!country) {
      sendResponse(res, 404, "Country not found.");
      return;
    }

    // Check if any currencies or employees reference this country
    const [currencyCount, employeeCount] = await Promise.all([
      Currency.countDocuments({ countryId: country._id }),
      Employee.countDocuments({ countryId: country._id }),
    ]);

    if (currencyCount > 0 || employeeCount > 0) {
      sendResponse(
        res,
        400,
        `Cannot delete country: Referenced by ${currencyCount} currency record(s) and ${employeeCount} employee(s).`,
      );
      return;
    }

    await Country.deleteOne({ _id: id });

    sendResponse(res, 200, "Country deleted successfully.", {
      countryId: id,
      deletedName: country.name,
    });
  } catch (error: any) {
    console.error("[Country] Delete country error:", error);
    sendResponse(res, 500, "Failed to delete country.");
  }
};

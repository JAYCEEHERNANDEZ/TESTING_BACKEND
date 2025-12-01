import * as consumptionModel from "../models/ConsumptionModel.js";

// GET all consumptions
export const getAllConsumptions = async (req, res, next) => {
  try {
    const rows = await consumptionModel.getAllConsumptions();
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// GET consumption by ID
export const getConsumption = async (req, res, next) => {
  try {
    const data = await consumptionModel.getConsumptionById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// CREATE new consumption
export const addConsumption = async (req, res, next) => {
  try {
    const data = await consumptionModel.createConsumption(req.body);
    res.status(201).json({ 
      success: true, 
      data, 
      message: "Consumption added successfully" 
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE consumption
export const updateConsumption = async (req, res, next) => {
  try {
    const data = await consumptionModel.updateConsumption(req.params.id, req.body);
    res.json({ 
      success: true, 
      data, 
      message: "Consumption updated successfully" 
    });
  } catch (err) {
    next(err);
  }
};

// DELETE consumption
export const removeConsumption = async (req, res, next) => {
  try {
    await consumptionModel.deleteConsumption(req.params.id);
    res.json({ success: true, message: "Consumption record deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// GET consumptions by user
export const getConsumptionsByUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const rows = await consumptionModel.getConsumptionsByUser(userId);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

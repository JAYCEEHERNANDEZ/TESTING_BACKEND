  import * as consumptionModel from "../models/ConsumptionModel.js";

  // GET latest consumptions per user (for dashboard)
  export const getAllConsumptions = async (req, res, next) => {
    try {
      const rows = await consumptionModel.getAllConsumptions(); // latest per user
      res.json({ success: true, data: rows });
    } catch (err) {
      next(err);
    }
  };

  // GET a specific consumption by ID
  export const getConsumption = async (req, res, next) => {
    try {
      const data = await consumptionModel.getConsumptionById(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  // CREATE new consumption record (new month)
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

  // UPDATE existing record (payments or adjustments)
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

  // DELETE a record
  export const removeConsumption = async (req, res, next) => {
    try {
      await consumptionModel.deleteConsumption(req.params.id);
      res.json({ success: true, message: "Consumption record deleted successfully" });
    } catch (err) {
      next(err);
    }
  };

  // GET all consumptions for a user
  export const getConsumptionsByUser = async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const rows = await consumptionModel.getConsumptionsByUser(userId);
      res.json({ success: true, data: rows });
    } catch (err) {
      next(err);
    }
  };

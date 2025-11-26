import * as consumptionModel from "../models/ConsumptionModel.js";

// GET all
export const getAllConsumptions = async (req, res, next) => {
    try {
        const rows = await consumptionModel.getAllConsumptions();
        res.json({ success: true, data: rows });
    } catch (err) {
        next(err);
    }
};

// GET by ID
export const getConsumption = async (req, res, next) => {
    try {
        const data = await consumptionModel.getConsumptionById(req.params.id);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// CREATE
export const addConsumption = async (req, res, next) => {
    try {
        const data = await consumptionModel.createConsumption(req.body);
        res.status(201).json({
            success: true,
            data,
            message: "Consumption added successfully",
        });
    } catch (err) {
        next(err);
    }
};

// FULL UPDATE
export const updateConsumption = async (req, res, next) => {
    try {
        const data = await consumptionModel.updateConsumption(req.params.id, req.body);
        res.json({ success: true, data, message: "Consumption updated" });
    } catch (err) {
        next(err);
    }
};

// UPDATE STATUS ONLY
export const updateStatus = async (req, res, next) => {
    try {
        const data = await consumptionModel.updateConsumptionStatus(req.params.id, req.body.status);
        res.json({ success: true, data, message: "Status updated" });
    } catch (err) {
        next(err);
    }
};

// DELETE
export const removeConsumption = async (req, res, next) => {
    try {
        await consumptionModel.deleteConsumption(req.params.id);
        res.json({ success: true, message: "Record deleted" });
    } catch (err) {
        next(err);
    }
};

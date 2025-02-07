import * as reportModel from '../models/reportModel.js'; 


export const addReport = (req, res) => {
    const { report_date, area, room, text } = req.body;

    if (!report_date || !area || !room || !text) {
        return res.status(400).json({ error: 'Please fill in complete information.' });
    }

    reportModel.addReport(report_date, area, room, text, (err, id) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Saved successfully', id });
    });
};


export const getAllReports = (req, res) => {
    reportModel.getAllReports((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};
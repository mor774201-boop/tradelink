import { Request, Response } from "express";
import fs from "fs";
import path from "path";

export async function getEgyptLocations(req: Request, res: Response) {
  try {
    const filePath = path.join(__dirname, "../resources/locations_eg.json");
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: "Location data not found" });
    }
    const data = fs.readFileSync(filePath, "utf-8");
    const locations = JSON.parse(data);
    res.json({ success: true, data: locations });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

import { Request, Response } from "express";
import { createNewDispute, attachDisputeFile, listAllDisputes } from "../services/dispute.service";

export const createDispute = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { orderId, category, description } = req.body;

    const created = await createNewDispute({ userId, orderId, category, description });
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: "internal_error" });
  }
};

export const uploadAttachment = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "file_required" });

    const saved = await attachDisputeFile(id, file);
    res.json(saved);

  } catch (err) {
    res.status(500).json({ error: "internal_error" });
  }
};

export const listDisputes = async (_req: Request, res: Response) => {
  try {
    const data = await listAllDisputes();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "internal_error" });
  }
};
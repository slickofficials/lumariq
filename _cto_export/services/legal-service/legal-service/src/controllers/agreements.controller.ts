import { Request, Response } from "express";
import { uploadBufferToS3 } from "../services/s3.service";
import { createAgreement, signAgreementVersion, fetchUserAgreements } from "../services/agreement.service";
import { v4 } from "uuid";

export const uploadAgreement = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "file_required" });

    const key = `legal/agreements/${v4()}_${file.originalname}`;
    const url = await uploadBufferToS3(file.buffer, key, file.mimetype);

    const record = await createAgreement({
      userId: (req as any).user.userId,
      type: req.body.type,
      version: req.body.version,
      url
    });

    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
};

export const signAgreement = async (req: Request, res: Response) => {
  try {
    const { type, version } = req.body;
    const userId = (req as any).user.userId;

    const signed = await signAgreementVersion({ userId, type, version });

    res.json(signed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
};

export const getUserAgreements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const data = await fetchUserAgreements(userId);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
};
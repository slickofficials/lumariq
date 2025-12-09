import { Request, Response } from "express";
import { createKycRecord, getKycRecord, listKycRecords } from "../services/kyc.service";
import { uploadBufferToS3 } from "../services/s3.service";
import { v4 as uuidv4 } from "uuid";

export const submitKyc = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.userId) return res.status(401).json({ error: "unauthorized" });

    const files = req.files as any || {};
    const doc = files.document?.[0];
    const selfie = files.selfie?.[0];

    if (!doc || !selfie) return res.status(400).json({ error: "document_and_selfie_required" });

    const docKey = `kyc/${user.userId}/${uuidv4()}_${doc.originalname}`;
    const selfieKey = `kyc/${user.userId}/${uuidv4()}_${selfie.originalname}`;

    // upload to S3
    const docUrl = await uploadBufferToS3(doc.buffer, docKey, doc.mimetype);
    const selfieUrl = await uploadBufferToS3(selfie.buffer, selfieKey, selfie.mimetype);

    const rec = await createKycRecord({
      userId: user.userId,
      docUrl,
      selfieUrl
    });

    res.json({ message: "submitted", id: rec.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
};

export const getKyc = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const rec = await getKycRecord(id);
    if (!rec) return res.status(404).json({ error: "not_found" });
    res.json(rec);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
};

export const adminList = async (_req: Request, res: Response) => {
  try {
    const items = await listKycRecords();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
};
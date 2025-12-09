import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const region = process.env.S3_REGION || "us-east-1";
const bucket = process.env.S3_BUCKET || "lumariq-dev";
const client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ""
  }
});

export const uploadBufferToS3 = async (buffer: Buffer, key: string, contentType: string) => {
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: "private"
  });
  await client.send(cmd);
  // return a signed URL? for now return s3 object path
  return `s3://${bucket}/${key}`;
};
export type PaymentProvider = {
  name: string;
  version: string;
};

export const PROVIDER: PaymentProvider = {
  name: "clover",
  version: process.env.CLOVER_VERSION || "2025-12-15.clover",
};

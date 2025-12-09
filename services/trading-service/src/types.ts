export type OrderMessage = {
  orderId: number;
  userId: number;
  symbol: string;
  quantity: number;
  price: number;
  side: "BUY" | "SELL";
};

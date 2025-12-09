export type OrderItemInput = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type CreateOrderInput = {
  userId: string;
  items: OrderItemInput[];
  currency?: string;
  meta?: Record<string, any>;
};
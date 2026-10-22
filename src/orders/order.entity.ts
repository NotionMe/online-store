export type OrderEntity = {
  orderId: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  customerEmail: string;
  status: 'confirmed';
  createdAt: string;
};

import { Inject, Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
import { DishesService } from '../dishes/dishes.service.js';
import { FEE_CALCULATOR, STORE_CONFIG, type FeeCalculator, type StoreConfig } from '../shared/config/app-config.provider.js';
import { RequestIdService } from '../shared/request-id.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import type { OrderEntity } from './order.entity.js';

@Injectable({ scope: Scope.REQUEST })
export class OrdersService implements OnModuleInit {
  private static readonly orders: OrderEntity[] = [];
  private static nextOrderId = 1;
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly dishesService: DishesService,
    @Inject(FEE_CALCULATOR) private readonly feeCalculator: FeeCalculator,
    @Inject(STORE_CONFIG) private readonly storeConfig: StoreConfig,
    private readonly requestId: RequestIdService,
  ) { }

  onModuleInit(): void {
    this.logger.log('Сервіс замовлень успішно підключено до білінгу та каталогу.');
  }

  createOrder(dto: CreateOrderDto): OrderEntity {
    const product = this.dishesService.findOne(dto.productId);
    const subtotal = product.price * dto.quantity;
    const taxAmount = this.feeCalculator.calculateTax(subtotal);
    const order: OrderEntity = {
      orderId: `ord-${Date.now()}-${OrdersService.nextOrderId++}`,
      productId: product.id,
      productTitle: product.title,
      productSlug: product.slug,
      unitPrice: product.price,
      quantity: dto.quantity,
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
      currency: this.storeConfig.defaultCurrency,
      customerEmail: dto.customerEmail,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    OrdersService.orders.push(order);
    this.logger.debug(`Order created for request ${this.requestId.id}`);
    return order;
  }

  findAll(): OrderEntity[] {
    return OrdersService.orders;
  }
}

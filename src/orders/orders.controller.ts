import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrdersService } from './orders.service.js';
import { RequestIdService } from '../shared/request-id.service.js';
import type { OrderEntity } from './order.entity.js';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly requestId: RequestIdService,
  ) { }

  @Get()
  getAll(@Res({ passthrough: true }) response: Response): OrderEntity[] {
    response.setHeader('X-Request-Id', this.requestId.id);
    return this.ordersService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateOrderDto, @Res({ passthrough: true }) response: Response): OrderEntity {
    response.setHeader('X-Request-Id', this.requestId.id);
    return this.ordersService.createOrder(dto);
  }
}

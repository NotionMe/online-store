import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';
import { DishesModule } from '../dishes/dishes.module.js';
import { SharedModule } from '../shared/shared.module.js';

@Module({
  providers: [OrdersService],
  controllers: [OrdersController],
  imports: [DishesModule, SharedModule],
})
export class OrdersModule { }

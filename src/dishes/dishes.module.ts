import { Module } from '@nestjs/common';
import { DishesController } from './dishes.controller.js';
import { DishesService } from './dishes.service.js';
import { SharedModule } from '../shared/shared.module.js';

@Module({
  controllers: [DishesController],
  providers: [DishesService],
  imports: [SharedModule],
  exports: [DishesService],
})
export class DishesModule {
}

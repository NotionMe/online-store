import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateDishesDto, UpdateDishesDto } from './dto/dishes.dto.js';
import { DishesService } from './dishes.service.js';
import type { DishesEntity } from './entity/dishes.entity.js';

@Controller('dishes')
export class DishesController {

  constructor(private readonly dishesService: DishesService) { };

  @Get()
  @Header('X-API-Version', '1.0')
  @Header('X-Service-Status', 'operational')
  dishesAll(@Query('search') search?: string, @Query('limit') limit?: string): DishesEntity[] {
    return this.dishesService.findAll(search, limit);
  }

  @Get(':id')
  dishesId(@Param('id', ParseIntPipe) id: number): DishesEntity {
    return this.dishesService.findOne(id.toString());
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDishesDto: CreateDishesDto): DishesEntity {
    return this.dishesService.create(createDishesDto);

  }

  @Patch()
  update(@Body() dto: UpdateDishesDto): DishesEntity {
    if (!dto.id) {
      throw new NotFoundException(`Сутність із id ${dto.id} не знайдено`);
    }

    return this.dishesService.update(dto.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string): DishesEntity {
    return this.dishesService.remove(id);
  };
}

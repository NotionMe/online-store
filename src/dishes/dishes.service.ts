import { Injectable, NotFoundException } from '@nestjs/common';
import { DishesEntity } from './entity/dishes.entity.js';
import { CreateDishesDto, UpdateDishesDto } from './dto/dishes.dto.js';

@Injectable()
export class DishesService {
  private items: DishesEntity[] = [
    {
      id: '1',
      title: "nghmh",
      price: Math.floor(Math.random() * 1000),
      weightGrams: Math.floor(Math.random() * 1000),
      calories: Math.floor(Math.random() * 1000),
      isSpicy: true
    },
    {
      id: Math.floor(Math.random() * 1000).toString(),
      title: 'fgjgh',
      price: Math.floor(Math.random() * 1000),
      weightGrams: Math.floor(Math.random() * 1000),
      calories: Math.floor(Math.random() * 1000),
      isSpicy: false
    }
  ];

  findAll(search?: string, limit?: string): DishesEntity[] {
    let result = this.items;
    if (search) {
      result = result.filter(item => item.title.toLowerCase().includes(search.toLowerCase()));
    }

    if (limit) {
      const limitN = Number.parseInt(limit, 10);

      if (!isNaN(limitN)) {
        result = result.slice(0, limitN);
      }
    }

    return result;
  }

  findOne(id: string): DishesEntity {
    const dish = this.items.find(i => i.id === id);

    if (!dish) {
      throw new NotFoundException(`Сутність із id ${id} не знайдено`);
    }

    return dish;
  }

  create(dto: CreateDishesDto): DishesEntity {
    const newDish: CreateDishesDto = {
      ...dto,
      id: Math.floor(Math.random() * 1000).toString()
    };

    this.items.push(newDish);

    return newDish;
  };

  update(id: string, dto: UpdateDishesDto): DishesEntity {
    const dish = this.findOne(id);

    Object.assign(dish, dto);

    return dish;
  };

  remove(id: string): DishesEntity {
    const index = this.items.findIndex(item => item.id === id);

    if (index === -1) {
      throw new NotFoundException(`Сутність із id ${id} не знайдено`);
    }

    const [deletedDish] = this.items.splice(index, 1);
    return deletedDish;
  }

}

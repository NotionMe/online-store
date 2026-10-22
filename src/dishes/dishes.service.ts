import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { DishesEntity } from './entity/dishes.entity.js';
import { CreateDishesDto, UpdateDishesDto } from './dto/dishes.dto.js';
import { SlugService } from '../shared/slug/slug.service.js';

@Injectable()
export class DishesService implements OnModuleInit {

  private items: DishesEntity[] = [];
  private readonly logger = new Logger(DishesService.name);

  constructor(private readonly slugService: SlugService) {
  }

  onModuleInit(): void {
    this.logger.log('Ініціалізація модуля завершена. Завантажено початкові тестові дані.');
    this.items.push(
      { id: '1', title: 'Піца Маргарита', price: 250, weightGrams: 450, calories: 850, isSpicy: false, slug: this.slugService.generateSlug('Піца Маргарита') },
      { id: '2', title: 'Карі гостре', price: 320, weightGrams: 380, calories: 610, isSpicy: true, slug: this.slugService.generateSlug('Карі гостре') },
    );
  }


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
    const newDish: DishesEntity = {
      ...dto,
      id: dto.id ?? Date.now().toString(),
      slug: this.slugService.generateSlug(dto.title),
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

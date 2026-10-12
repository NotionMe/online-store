import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDishesDto {
  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  title: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  weightGrams: number;

  @IsNumber()
  @Min(0)
  calories: number;

  @IsBoolean()
  isSpicy: boolean;
}

export class UpdateDishesDto extends PartialType(CreateDishesDto) {}

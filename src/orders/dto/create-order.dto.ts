import { IsEmail, IsInt, IsPositive, IsString } from 'class-validator';

export class  CreateOrderDto {
  @IsString()
  productId: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsEmail()
  customerEmail: string;
}

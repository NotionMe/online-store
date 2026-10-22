# Практична робота № 4

## Тема: Розроблення REST-ендпоінтів засобами NestJS
## Варіант № 4
---

## Мета роботи

- Опанувати принципи побудови REST API засобами фреймворку NestJS.
- Навчитися реалізовувати CRUD-ендпоінти для ресурсу страв.
- Засвоїти використання контролерів, сервісів, DTO, декораторів та HTTP-статусів.
- Реалізувати пошук і обмеження кількості елементів за параметрами рядка запиту.
- Перевірити роботу API за допомогою колекції Postman.

## Технічне забезпечення

| Компонент | Версія / Опис |
| --- | --- |
| ОС | Linux (Arch-based) |
| Середовище розробки | Nvim (ls_ts) |
| Платформа виконання | Node.js v26.7.0 |
| Мова програмування | TypeScript |
| Фреймворк | NestJS 12 |
| HTTP-платформа | Express через `@nestjs/platform-express` |
| Інструменти компіляції | Nest CLI, TypeScript 6, npm 11.19.0 |
| Тестування | Vitest, Supertest, Postman |
| Термінал | bash |
| Система контролю версій | Git 2.55.0 |

---

## Хід виконання роботи

### 1. Створення структури NestJS-застосунку

Застосунок побудовано за модульною архітектурою NestJS. `AppModule` реєструє контролер `DishesController` і сервіс `DishesService`, а файл `main.ts` створює HTTP-застосунок та запускає його на порту `3000`.

```typescript
const app = await NestFactory.create(AppModule, {
  instrument: ObserveInstrument,
});

await app.listen(process.env.PORT ?? 3000);
```

Виклик `NestFactory.create()` ініціалізує контейнер залежностей NestJS. Метод `listen()` запускає HTTP-сервер; за замовчуванням використовується порт `3000`, але його можна змінити через змінну середовища `PORT`.

### 2. Опис моделі ресурсу та DTO

Для ресурсу `dishes` створено тип `DishesEntity` і два DTO. Сутність описує дані, що зберігаються в сервісі, а `CreateDishesDto` задає структуру тіла POST-запиту. `UpdateDishesDto` утворений за допомогою `PartialType`, тому всі його поля необов'язкові.

| Поле | Тип | Призначення |
| --- | --- | --- |
| `id` | `string` | Ідентифікатор страви |
| `title` | `string` | Назва страви |
| `price` | `number` | Ціна; має бути додатною |
| `weightGrams` | `number` | Маса у грамах; має бути додатною |
| `calories` | `number` | Калорійність; не може бути від'ємною |
| `isSpicy` | `boolean` | Ознака гострої страви |

```typescript
export class UpdateDishesDto extends PartialType(CreateDishesDto) {}
```

Декоратори пакета `class-validator` описують правила валідації полів. Вони є основою для перевірки даних при підключенні глобального `ValidationPipe`.

### 3. Реалізація сервісу з даними та CRUD-операціями

`DishesService` є провайдером NestJS і зберігає дані в масиві `items`. У початковому наборі є запис з ID `1`, тому запит `GET /dishes/1` можна використати для перевірки успішного одержання одного запису.

```typescript
findAll(search?: string, limit?: string): DishesEntity[] {
  let result = this.items;

  if (search) {
    result = result.filter(item =>
      item.title.toLowerCase().includes(search.toLowerCase()),
    );
  }

  if (limit) {
    const limitN = Number.parseInt(limit, 10);
    if (!isNaN(limitN)) {
      result = result.slice(0, limitN);
    }
  }

  return result;
}
```

Метод `findAll()` підтримує параметри `search` і `limit`. Пошук не залежить від регістру, а `slice()` повертає не більше вказаної кількості елементів. Методи `findOne()`, `update()` і `remove()` використовують ID страви; якщо запис не знайдено, створюється `NotFoundException`, що NestJS перетворює на відповідь `404 Not Found`.

Для видалення визначається індекс елемента, а не числове значення його ID:

```typescript
const index = this.items.findIndex(item => item.id === id);

if (index === -1) {
  throw new NotFoundException(`Сутність із id ${id} не знайдено`);
}

const [deletedDish] = this.items.splice(index, 1);
return deletedDish;
```

Такий підхід коректний, оскільки `id` є ідентифікатором, а не позицією в масиві.

### 4. Створення REST-контролера

Контролер позначений декоратором `@Controller('dishes')`, тому всі його маршрути мають префікс `/dishes`. Декоратори `@Get`, `@Post`, `@Patch` і `@Delete` пов'язують методи класу з відповідними HTTP-методами.

| HTTP-метод | Маршрут | Призначення | Очікуваний статус |
| --- | --- | --- | --- |
| GET | `/dishes` | Одержання списку страв | 200 |
| GET | `/dishes?search=...` | Пошук страв за назвою | 200 |
| GET | `/dishes/:id` | Одержання однієї страви | 200 або 404 |
| POST | `/dishes` | Створення страви | 201 |
| PATCH | `/dishes` | Часткове оновлення; `id` передається у JSON-тілі | 200 |
| DELETE | `/dishes/:id` | Видалення страви | 204 |

```typescript
@Get(':id')
dishesId(@Param('id', ParseIntPipe) id: number): DishesEntity {
  return this.dishesService.findOne(id.toString());
}

@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
delete(@Param('id') id: string): DishesEntity {
  return this.dishesService.remove(id);
}
```

`ParseIntPipe` у маршруті одержання перетворює параметр URL на число, після чого значення повертається до рядка для пошуку за рядковим ID. У маршруті видалення параметр одразу залишається рядком, тому порівняння з `item.id` є коректним. Для списку встановлено заголовки `X-API-Version: 1.0` і `X-Service-Status: operational`.

### 5. Перевірка API в Postman

Створено колекцію `postman/dishes.postman_collection.json`. Вона містить запити до всіх потрібних маршрутів, а після POST зберігає ID нової страви у змінну колекції `createdDishId`. Завдяки цьому PATCH і DELETE виконуються над реально створеним записом.

```json
{
  "title": "Postman test dish",
  "price": 189,
  "weightGrams": 350,
  "calories": 520,
  "isSpicy": false
}
```

Приклад тіла POST-запиту відповідає структурі `CreateDishesDto`. Після успішного створення API повертає об'єкт із генерованим рядковим ID та статус `201 Created`.

```json
{
  "id": "{{createdDishId}}",
  "price": 199,
  "isSpicy": true
}
```

Це тіло часткового оновлення: в реалізованій версії ID передається всередині JSON, тому запит має адресу `PATCH /dishes`. Колекція також містить автоматичні перевірки статусів `200`, `201`, `204` і `404`, а для пошуку — перевірку наявності пошукового рядка в кожній назві.

### 6. Запуск і приклади відповідей

Для запуску в режимі розробки використовується команда:

```bash
npm run start:dev
```

Після старту NestJS реєструє маршрути контролера `DishesController` і слухає порт `3000`. Приклад перевірки створення ресурсу:

```bash
curl -X POST http://localhost:3000/dishes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Піца Маргарита",
    "price": 250,
    "weightGrams": 450,
    "calories": 850,
    "isSpicy": false
  }'
```

Очікується відповідь зі статусом `201 Created` і JSON-об'єктом створеної страви. Запит `GET /dishes/99999` повертає `404 Not Found` із повідомленням про відсутність сутності.

---

## Висновки

- Опановано модульний підхід NestJS: контролер приймає HTTP-запити, а сервіс містить прикладну логіку роботи з даними.
- Реалізовано REST-операції створення, читання, оновлення та видалення для ресурсу страв.
- Використано DTO, тип `DishesEntity`, декоратори валідації та HTTP-декоратори NestJS.
- Реалізовано фільтрацію списку за параметром `search`, обмеження результатів за `limit` і обробку відсутнього ресурсу через `NotFoundException`.
- Створено Postman-колекцію з тестами, що перевіряє повний цикл CRUD та коди відповідей API.

## Рівні 2–3: модулі, провайдери та життєвий цикл

`DishesModule` експортує `DishesService`, а `OrdersModule` імпортує `DishesModule` і `SharedModule`. `OrdersService` шукає страву через `DishesService.findOne()`, рахує суму, податок і загальну вартість та зберігає підтверджене замовлення в пам'яті. Для відсутнього товару сервіс каталогу повертає `NotFoundException` (HTTP 404).

У `SharedModule` зареєстровано `STORE_CONFIG` через `useValue` (валюта UAH, ставка податку 20%) та `FEE_CALCULATOR` через `useFactory`, який отримує конфігурацію через `inject`. `SlugService` генерує slug для кожної нової страви. `DishesService` завантажує дві тестові страви у `onModuleInit()`, а сервіси виводять повідомлення про готовність через `Logger`.

`RequestIdService` має `Scope.REQUEST` і використовується контролером та сервісом замовлень. Контролер повертає ID поточного запиту у заголовку `X-Request-Id`. Сервіс замовлень використовує спільне in-memory сховище, щоб request scope не втрачав оформлені замовлення між HTTP-запитами.

### Наскрізна перевірка

Файл [`requests.http`](./requests.http) містить послідовність запитів для створення страви зі slug, читання початкових і нових страв, успішного замовлення з податком, перевірки 404 та читання замовлень. Запускайте застосунок через `npm run start:dev`, після чого виконуйте запити у порядку зверху вниз з HTTP-клієнта IDE. Наприклад, для страви ID `1` з ціною 250 грн та кількістю 2 очікується `subtotal: 500`, `taxAmount: 100`, `total: 600`, `currency: "UAH"`.

Приклад успішної відповіді `POST /orders`:

```json
{
  "orderId": "ord-...",
  "productId": "1",
  "productTitle": "Піца Маргарита",
  "productSlug": "піца-маргарита",
  "unitPrice": 250,
  "quantity": 2,
  "subtotal": 500,
  "taxAmount": 100,
  "total": 600,
  "currency": "UAH",
  "customerEmail": "student@college.edu",
  "status": "confirmed",
  "createdAt": "<час створення замовлення>"
}
```


# Лістинг

## package.json

```json
{
  "name": "online-store",
  "version": "0.0.1",
  "description": "",
  "author": "",
  "private": true,
  "license": "UNLICENSED",
  "type": "module",
  "scripts": {
    "build": "nest build",
    "deploy": "nest deploy",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "oxlint --type-aware src/ test/",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage",
    "test:debug": "vitest --inspect-brk --no-file-parallelism",
    "test:e2e": "vitest run --config ./vitest.config.e2e.ts"
  },
  "dependencies": {
    "@nestjs/common": "^12.0.1",
    "@nestjs/core": "^12.0.1",
    "@nestjs/mapped-types": "^12.0.0",
    "@nestjs/observe": "^0.3.0",
    "@nestjs/platform-express": "^12.0.1",
    "class-validator": "^0.15.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^12.0.0",
    "@nestjs/mau": "^0.2.6",
    "@nestjs/schematics": "^12.0.0",
    "@nestjs/testing": "^12.0.1",
    "@types/express": "^5.0.0",
    "@types/node": "^24.0.0",
    "@types/supertest": "^7.0.0",
    "@vitest/coverage-v8": "^4.1.2",
    "oxlint": "^1.58.0",
    "oxlint-tsgolint": "^7.0.2001",
    "prettier": "^3.4.2",
    "source-map-support": "^0.5.21",
    "supertest": "^7.0.0",
    "typescript": "^6.0.2",
    "vite-tsconfig-paths": "^5.1.4",
    "vitest": "^4.1.2"
  }
}
```

## src/main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
```

## src/app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DishesController } from './dishes/dishes.controller.js';
import { DishesService } from './dishes/dishes.service.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'online-store',
    }),
  ],
  controllers: [AppController, DishesController],
  providers: [AppService, DishesService],
})
export class AppModule { }
```

## src/app.controller.ts

```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

## src/app.service.ts

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

## src/dishes/entity/dishes.entity.ts

```typescript
export type DishesEntity = {
  id: string;
  title: string;
  price: number;
  weightGrams: number;
  calories: number;
  isSpicy: boolean;
}
```

## src/dishes/dto/dishes.dto.ts

```typescript
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
```

## src/dishes/dishes.service.ts

```typescript
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
```

## src/dishes/dishes.controller.ts

```typescript
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
```

## postman/dishes.postman_collection.json

```json
{
  "info": {
    "_postman_id": "937a7296-2d0c-4f5f-9697-6074239be111",
    "name": "Online Store — Dishes API",
    "description": "Перевірки CRUD API для ресурсу dishes. Після POST ідентифікатор з відповіді зберігається в змінній createdDishId.",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:3000" },
    { "key": "createdDishId", "value": "" }
  ],
  "item": [
    {
      "name": "Dishes",
      "item": [
        {
          "name": "Get list",
          "request": { "method": "GET", "url": "{{baseUrl}}/dishes" },
          "event": [{ "listen": "test", "script": { "type": "text/javascript", "exec": ["pm.test('Status is 200 OK', () => pm.response.to.have.status(200));", "pm.test('Response is an array', () => pm.expect(pm.response.json()).to.be.an('array'));" ] } }]
        },
        {
          "name": "Filter list by search",
          "request": { "method": "GET", "url": "{{baseUrl}}/dishes?search=nghmh" },
          "event": [{ "listen": "test", "script": { "type": "text/javascript", "exec": ["pm.test('Status is 200 OK', () => pm.response.to.have.status(200));", "pm.test('Every title matches search term', () => { pm.response.json().forEach(dish => pm.expect(dish.title.toLowerCase()).to.include('nghmh')); });"] } }]
        },
        {
          "name": "Get existing record: ID 1",
          "request": { "method": "GET", "url": "{{baseUrl}}/dishes/1" },
          "event": [{ "listen": "test", "script": { "type": "text/javascript", "exec": ["pm.test('Status is 200 OK', () => pm.response.to.have.status(200));"] } }]
        },
        {
          "name": "Get missing record: 404",
          "request": { "method": "GET", "url": "{{baseUrl}}/dishes/99999" },
          "event": [{ "listen": "test", "script": { "type": "text/javascript", "exec": ["pm.test('Status is 404 Not Found', () => pm.response.to.have.status(404));"] } }]
        },
        {
          "name": "Create dish",
          "request": { "method": "POST", "header": [{ "key": "Content-Type", "value": "application/json" }], "body": { "mode": "raw", "raw": "{\\n  \\"title\\": \\"Postman test dish\\",\\n  \\"price\\": 189,\\n  \\"weightGrams\\": 350,\\n  \\"calories\\": 520,\\n  \\"isSpicy\\": false\\n}", "options": { "raw": { "language": "json" } } }, "url": "{{baseUrl}}/dishes" },
          "event": [{ "listen": "test", "script": { "type": "text/javascript", "exec": ["pm.test('Status is 201 Created', () => pm.response.to.have.status(201));", "const dish = pm.response.json();", "pm.test('Response has an ID', () => pm.expect(dish.id).to.exist);", "pm.collectionVariables.set('createdDishId', dish.id);"] } }]
        },
        {
          "name": "Partially update created dish",
          "request": { "method": "PATCH", "header": [{ "key": "Content-Type", "value": "application/json" }], "body": { "mode": "raw", "raw": "{\\n  \\"id\\": \\"{{createdDishId}}\\",\\n  \\"price\\": 199,\\n  \\"isSpicy\\": true\\n}", "options": { "raw": { "language": "json" } } }, "url": "{{baseUrl}}/dishes" },
          "event": [{ "listen": "test", "script": { "type": "text/javascript", "exec": ["pm.test('Status is 200 OK', () => pm.response.to.have.status(200));", "pm.test('Fields are updated', () => { const dish = pm.response.json(); pm.expect(dish.price).to.eql(199); pm.expect(dish.isSpicy).to.eql(true); });"] } }]
        },
        {
          "name": "Delete created dish",
          "request": { "method": "DELETE", "url": "{{baseUrl}}/dishes/{{createdDishId}}" },
          "event": [{ "listen": "test", "script": { "type": "text/javascript", "exec": ["pm.test('Status is 204 No Content', () => pm.response.to.have.status(204));"] } }]
        }
      ]
    }
  ]
}
```

## test/app.e2e-spec.ts

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterEach(async () => {
    await app.close();
  });
});
```

## src/app.controller.spec.ts

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "resolvePackageJsonExports": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": ".",
    "incremental": true,
    "skipLibCheck": true,
    "strict": true,
    "strictPropertyInitialization": false,
    "types": ["vitest/globals", "node"]
  }
}
```

## tsconfig.build.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

## nest-cli.json

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

## vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`.
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
  },
});
```

## vitest.config.e2e.ts

```typescript
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
  },
});
```

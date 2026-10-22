import { Module } from '@nestjs/common';
import { SlugService } from './slug/slug.service.js';
import { RequestIdService } from './request-id.service.js';
import { FEE_CALCULATOR, STORE_CONFIG, storeConfig } from './config/app-config.provider.js';

@Module({
  providers: [
    SlugService,
    RequestIdService,
    { provide: STORE_CONFIG, useValue: storeConfig },
    {
      provide: FEE_CALCULATOR,
      useFactory: (config: typeof storeConfig) => ({
        calculateTax: (amount: number) => amount * config.taxPercent / 100,
      }),
      inject: [STORE_CONFIG],
    },
  ],
  exports: [SlugService, RequestIdService, STORE_CONFIG, FEE_CALCULATOR],
})
export class SharedModule { }

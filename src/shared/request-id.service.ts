import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestIdService {
  readonly id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

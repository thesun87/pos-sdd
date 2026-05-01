import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

export interface TenantRequest extends Request {
  tenantId?: string;
}

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<TenantRequest>();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (request as any).user;
    
    if (user && user.tenantId) {
      request.tenantId = user.tenantId;
    }

    return next.handle();
  }
}

import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const { method, url } = request;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (request as any).user;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = ctx.getResponse<Response>();
        const duration = Date.now() - now;
        
        this.logger.log(JSON.stringify({
          method,
          url,
          userId: user?.userId || 'anonymous',
          statusCode: response.statusCode,
          duration: `${duration}ms`,
        }));
      }),
    );
  }
}

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: unknown;
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, Response<T> | T> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T> | T> {
    return next.handle().pipe(
      map((res) => {
        // If response is undefined/null, wrap it
        if (res === undefined || res === null) {
          return { data: res };
        }

        // If response already has 'data' key, we keep it as is
        // This covers both { data } and { data, meta } patterns from existing controllers
        if (typeof res === 'object' && 'data' in res) {
          return res;
        }

        // Otherwise wrap it in { data }
        return { data: res };
      }),
    );
  }
}

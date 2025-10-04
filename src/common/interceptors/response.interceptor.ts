import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

export interface ApiResponse<T> {
  statusCode: HttpStatus;
  method: string;
  path: string;
  payload: T;
}

interface RequestWithTimeStart extends Request {
  timeStart?: number;
  userSession?: {
    email?: string;
    userId?: string;
  };
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  private logger = new Logger('REQ-RES');

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest<RequestWithTimeStart>();

    // add timestart to track response time
    request.timeStart = Date.now();

    const requestLog = {
      pipeline: 'request',
      method: request.method,
      requestBody: ['/auth', '/integration', '/callbacks'].some((el) =>
        request.originalUrl.includes(el),
      )
        ? '-'
        : (request.body as unknown),

      path: request.path,
      url: request.originalUrl,
      userAgent: request.get('user-agent') || '',
      ip: request.ip,
      user: request.userSession?.email || 'no login',
      userId: request.userSession?.userId || 'no login',
    };

    this.logger.log(`${requestLog.method} ${requestLog.path}`, requestLog);

    return next.handle().pipe(
      map((data) => {
        const responseLog = {
          pipeline: 'response',
          method: request.method,
          requestBody: ['/auth', '/integration', '/callbacks'].some((el) =>
            request.originalUrl.includes(el),
          )
            ? '-'
            : (request.body as unknown),

          statusCode: response.statusCode,
          responseBody: ['/auth', '/integration', '/callbacks'].some((el) =>
            request.originalUrl.includes(el),
          )
            ? '-'
            : (data as unknown),
          responseTime: Date.now() - (request.timeStart || Date.now()),

          path: request.path,
          url: request.originalUrl,
          userAgent: request.get('user-agent') || '',
          ip: request.ip,
          user: request.userSession?.email || 'no login',
          userId: request.userSession?.userId || 'no login',
        };

        this.logger.log(`${requestLog.method} ${requestLog.path}`, responseLog);

        return {
          statusCode: response.statusCode,
          method: request.method,
          path: request.url,
          payload: data as T,
        };
      }),
    );
  }
}

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_ERROR';
    let detail = 'Lỗi hệ thống';
    let errors: { field: string; message: string }[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      
      // Handle class-validator errors (BadRequestException with message array)
      if (typeof exResponse === 'object' && exResponse !== null && 'message' in exResponse) {
        const messages = (exResponse as { message: string | string[] }).message;
        if (Array.isArray(messages)) {
          errors = messages.map(m => ({ field: '', message: m }));
          detail = 'Dữ liệu đầu vào không hợp lệ';
          errorCode = 'VALIDATION_FAILED';
        } else {
          detail = String(messages);
        }
      } else {
        detail = exception.message;
      }

      // Map status to errorCode if not already set
      if (errorCode === 'INTERNAL_ERROR') {
        switch (status) {
          case HttpStatus.BAD_REQUEST:
            errorCode = 'BAD_REQUEST';
            break;
          case HttpStatus.UNAUTHORIZED:
            errorCode = 'UNAUTHORIZED';
            break;
          case HttpStatus.FORBIDDEN:
            errorCode = 'FORBIDDEN';
            break;
          case HttpStatus.NOT_FOUND:
            errorCode = 'NOT_FOUND';
            break;
          case HttpStatus.CONFLICT:
            errorCode = 'CONFLICT';
            break;
          case HttpStatus.UNPROCESSABLE_ENTITY:
            errorCode = 'VALIDATION_FAILED';
            break;
        }
      }
    } else if (exception instanceof Error) {
      detail = exception.message;
    }

    const typeSuffix = errorCode.toLowerCase().replace(/_/g, '-');

    response.status(status).header('Content-Type', 'application/problem+json').json({
      type: `https://pos-sdd.com/errors/${typeSuffix}`,
      title: HttpStatus[status] || 'Error',
      status,
      detail,
      errorCode,
      timestamp: new Date().toISOString(),
      instance: request.url,
      ...(errors && { errors }),
    });
  }
}

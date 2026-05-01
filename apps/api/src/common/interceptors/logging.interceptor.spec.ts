import { firstValueFrom } from 'rxjs';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { LoggingInterceptor } from './logging.interceptor.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log structured JSON with user id', async () => {
    const mockRequest = {
      method: 'GET',
      url: '/test-endpoint',
      user: { userId: '123' },
    };
    
    const mockResponse = {
      statusCode: 200,
    };

    const mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: vi.fn().mockReturnValue(of('test data')),
    } as unknown as CallHandler;

    const loggerSpy = vi.spyOn(interceptor['logger'], 'log');
    vi.useFakeTimers();

    await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));
      vi.advanceTimersByTime(10);
      expect(loggerSpy).toHaveBeenCalled();
      
      const logString = loggerSpy.mock.calls[0][0];
      const logObj = JSON.parse(logString);
      
      expect(logObj.method).toBe('GET');
      expect(logObj.url).toBe('/test-endpoint');
      expect(logObj.userId).toBe('123');
      expect(logObj.statusCode).toBe(200);
      expect(logObj.duration).toBeDefined();
      
      vi.useRealTimers();
      
  });

  it('should log anonymous if user is not defined', async () => {
    const mockRequest = {
      method: 'POST',
      url: '/another-endpoint',
    };
    
    const mockResponse = {
      statusCode: 201,
    };

    const mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: vi.fn().mockReturnValue(of('test data')),
    } as unknown as CallHandler;

    const loggerSpy = vi.spyOn(interceptor['logger'], 'log');

    await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));
      expect(loggerSpy).toHaveBeenCalled();
      
      const logString = loggerSpy.mock.calls[0][0];
      const logObj = JSON.parse(logString);
      
      expect(logObj.method).toBe('POST');
      expect(logObj.url).toBe('/another-endpoint');
      expect(logObj.userId).toBe('anonymous');
      expect(logObj.statusCode).toBe(201);
      
      
  });
});

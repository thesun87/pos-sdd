import { firstValueFrom } from 'rxjs';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { ResponseTransformInterceptor } from './response-transform.interceptor.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';

describe('ResponseTransformInterceptor', () => {
  let interceptor: ResponseTransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new ResponseTransformInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap primitive response in { data }', async () => {
    const mockExecutionContext = {} as ExecutionContext;
    const mockCallHandler = {
      handle: vi.fn().mockReturnValue(of('test data')),
    } as unknown as CallHandler;

    const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));
      expect(result).toEqual({ data: 'test data' });
      
  });

  it('should wrap object without data key in { data }', async () => {
    const mockExecutionContext = {} as ExecutionContext;
    const mockCallHandler = {
      handle: vi.fn().mockReturnValue(of({ name: 'test' })),
    } as unknown as CallHandler;

    const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));
      expect(result).toEqual({ data: { name: 'test' } });
      
  });

  it('should not wrap object that already has data key', async () => {
    const mockExecutionContext = {} as ExecutionContext;
    const mockCallHandler = {
      handle: vi.fn().mockReturnValue(of({ data: { name: 'test' } })),
    } as unknown as CallHandler;

    const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));
      expect(result).toEqual({ data: { name: 'test' } });
      
  });

  it('should not wrap paginated object that already has data and meta keys', async () => {
    const mockExecutionContext = {} as ExecutionContext;
    const mockCallHandler = {
      handle: vi.fn().mockReturnValue(of({ data: [{ name: 'test' }], meta: { page: 1 } })),
    } as unknown as CallHandler;

    const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));
      expect(result).toEqual({ data: [{ name: 'test' }], meta: { page: 1 } });
      
  });

  it('should wrap null response in { data }', async () => {
    const mockExecutionContext = {} as ExecutionContext;
    const mockCallHandler = {
      handle: vi.fn().mockReturnValue(of(null)),
    } as unknown as CallHandler;

    const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));
      expect(result).toEqual({ data: null });
      
  });
});

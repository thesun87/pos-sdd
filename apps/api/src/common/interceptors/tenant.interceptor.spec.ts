import { firstValueFrom } from 'rxjs';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { TenantInterceptor, TenantRequest } from './tenant.interceptor.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';

describe('TenantInterceptor', () => {
  let interceptor: TenantInterceptor;

  beforeEach(() => {
    interceptor = new TenantInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should extract tenantId from user and set it on request', async () => {
    const mockRequest = {
      user: { tenantId: 'tenant-123' },
    } as unknown as TenantRequest;
    
    const mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: vi.fn().mockReturnValue(of('test data')),
    } as unknown as CallHandler;

    await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));
      expect(mockRequest.tenantId).toBe('tenant-123');
      
  });

  it('should not set tenantId if user is undefined', async () => {
    const mockRequest = {} as unknown as TenantRequest;
    
    const mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: vi.fn().mockReturnValue(of('test data')),
    } as unknown as CallHandler;

    await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));
      expect(mockRequest.tenantId).toBeUndefined();
      
  });

  it('should not set tenantId if user does not have tenantId', async () => {
    const mockRequest = {
      user: { userId: '123' },
    } as unknown as TenantRequest;
    
    const mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: vi.fn().mockReturnValue(of('test data')),
    } as unknown as CallHandler;

    await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));
      expect(mockRequest.tenantId).toBeUndefined();
      
  });
});

import { ArgumentsHost, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { Request, Response } from 'express';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch BadRequestException and map to VALIDATION_FAILED (array message)', () => {
    const mockJson = vi.fn();
    const mockStatus = vi.fn().mockReturnValue({
      header: vi.fn().mockReturnValue({
        json: mockJson,
      }),
    });

    const mockResponse = {
      status: mockStatus,
    } as unknown as Response;

    const mockRequest = {
      url: '/test-url',
    } as unknown as Request;

    const mockArgumentsHost = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    const exception = new BadRequestException(['error 1', 'error 2']);
    
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T15:00:00Z'));

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      type: 'https://pos-sdd.com/errors/validation-failed',
      title: 'BAD_REQUEST',
      status: HttpStatus.BAD_REQUEST,
      detail: 'Dữ liệu đầu vào không hợp lệ',
      errorCode: 'VALIDATION_FAILED',
      timestamp: '2026-05-01T15:00:00.000Z',
      instance: '/test-url',
      errors: [
        { field: '', message: 'error 1' },
        { field: '', message: 'error 2' },
      ],
    });
    
    vi.useRealTimers();
  });

  it('should catch unhandled Error and map to INTERNAL_ERROR', () => {
    const mockJson = vi.fn();
    const mockStatus = vi.fn().mockReturnValue({
      header: vi.fn().mockReturnValue({
        json: mockJson,
      }),
    });

    const mockResponse = {
      status: mockStatus,
    } as unknown as Response;

    const mockRequest = {
      url: '/test-url',
    } as unknown as Request;

    const mockArgumentsHost = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    const exception = new Error('Some unexpected error');

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T15:00:00Z'));

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      type: 'https://pos-sdd.com/errors/internal-error',
      title: 'INTERNAL_SERVER_ERROR',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: 'Some unexpected error',
      errorCode: 'INTERNAL_ERROR',
      timestamp: '2026-05-01T15:00:00.000Z',
      instance: '/test-url',
    });

    vi.useRealTimers();
  });
});

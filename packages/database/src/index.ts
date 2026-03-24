// @pos-sdd/database - Placeholder
// Prisma client sẽ được setup đầy đủ ở Story 1.2
//
// Story 1.2 sẽ:
// - Khởi tạo Prisma schema
// - Tạo database migrations
// - Export PrismaClient thực sự
// - Setup seeding scripts

// Stub export để các package khác có thể import mà không bị lỗi
export class PrismaClient {
  // Placeholder - sẽ được thay thế ở Story 1.2
  constructor() {
    console.warn('PrismaClient placeholder - setup đầy đủ ở Story 1.2');
  }

  async $connect(): Promise<void> {
    // Placeholder
  }

  async $disconnect(): Promise<void> {
    // Placeholder
  }
}

export const prisma = new PrismaClient();

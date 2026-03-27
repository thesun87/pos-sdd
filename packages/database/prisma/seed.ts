import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
config({ path: resolve(__dirname, '../../../.env') });
config({ path: resolve(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import { createPrismaClientOptions } from '../src/index.js';
import { hashSync } from 'bcryptjs';
import { uuidv7 } from 'uuidv7';

const prisma = new PrismaClient(createPrismaClientOptions());

async function main() {
  console.log('🌱 Starting seed...');

  // === TENANT ===
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'pos-sdd-demo' },
    update: {},
    create: {
      id: uuidv7(),
      name: 'POS SDD Demo',
      slug: 'pos-sdd-demo',
      settings: {},
      is_active: true,
    },
  });
  console.log(`✅ Tenant: ${tenant.name} (${tenant.id})`);

  // === STORES ===
  const store1 = await prisma.store.upsert({
    where: { id: '01900000-0000-7000-8000-000000000001' },
    update: {},
    create: {
      id: '01900000-0000-7000-8000-000000000001',
      tenant_id: tenant.id,
      name: 'Chi nhánh Quận 1',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      phone: '028-1234-5678',
      settings: {},
      is_active: true,
    },
  });

  const store2 = await prisma.store.upsert({
    where: { id: '01900000-0000-7000-8000-000000000002' },
    update: {},
    create: {
      id: '01900000-0000-7000-8000-000000000002',
      tenant_id: tenant.id,
      name: 'Chi nhánh Quận 3',
      address: '456 Võ Văn Tần, Quận 3, TP.HCM',
      phone: '028-8765-4321',
      settings: {},
      is_active: true,
    },
  });
  console.log(`✅ Stores: ${store1.name}, ${store2.name}`);

  // === ROLES (6 default system roles) ===
  const rolesData = [
    {
      id: '01900000-0000-7000-8000-000000000101',
      name: 'system_admin',
      description: 'Quản trị hệ thống — Toàn quyền tất cả modules',
      permissions: { all: true },
    },
    {
      id: '01900000-0000-7000-8000-000000000102',
      name: 'chain_owner',
      description: 'Chủ chuỗi — Tất cả stores, báo cáo, cấu hình, quản lý user',
      permissions: {
        stores: 'all',
        reports: 'all',
        config: 'all',
        users: 'manage',
      },
    },
    {
      id: '01900000-0000-7000-8000-000000000103',
      name: 'store_manager',
      description: 'Quản lý store — Single/group stores, toàn bộ operations',
      permissions: {
        pos: 'all',
        kitchen: 'all',
        reports: 'store',
        users: 'store',
      },
    },
    {
      id: '01900000-0000-7000-8000-000000000104',
      name: 'shift_lead',
      description: 'Trưởng ca — Single store, admin hạn chế (void, discount có giới hạn)',
      permissions: {
        pos: 'operate',
        void: 'limited',
        discount: 'limited',
      },
    },
    {
      id: '01900000-0000-7000-8000-000000000105',
      name: 'cashier',
      description: 'Thu ngân — POS operations, void hạn chế',
      permissions: {
        pos: 'operate',
        void: 'limited',
        discount: 'limited',
      },
    },
    {
      id: '01900000-0000-7000-8000-000000000106',
      name: 'kitchen',
      description: 'Bếp — KDS access only',
      permissions: {
        kds: 'operate',
      },
    },
  ];

  for (const roleData of rolesData) {
    await prisma.role.upsert({
      where: { id: roleData.id },
      update: {},
      create: {
        ...roleData,
        tenant_id: tenant.id,
        is_system: true,
      },
    });
  }
  console.log(`✅ Roles: ${rolesData.length} system roles created`);

  // === DEFAULT POLICIES ===
  const policiesData = [
    // Cashier policies
    {
      id: '01900000-0000-7000-8000-000000000201',
      role: 'cashier',
      action: 'discount',
      resource: 'order',
      limit: 10, // 10%
      override_role: 'shift_lead',
    },
    {
      id: '01900000-0000-7000-8000-000000000202',
      role: 'cashier',
      action: 'void',
      resource: 'order_item',
      limit: 50000, // 50,000 VND
      override_role: 'shift_lead',
    },
    // Shift lead policies
    {
      id: '01900000-0000-7000-8000-000000000203',
      role: 'shift_lead',
      action: 'discount',
      resource: 'order',
      limit: 20, // 20%
      override_role: 'store_manager',
    },
    {
      id: '01900000-0000-7000-8000-000000000204',
      role: 'shift_lead',
      action: 'void',
      resource: 'order',
      limit: 200000, // 200,000 VND
      override_role: 'store_manager',
    },
    // Store manager policies
    {
      id: '01900000-0000-7000-8000-000000000205',
      role: 'store_manager',
      action: 'refund',
      resource: 'payment',
      limit: 500000, // 500,000 VND
      override_role: 'chain_owner',
    },
  ];

  for (const policyData of policiesData) {
    await prisma.policy.upsert({
      where: { id: policyData.id },
      update: {},
      create: {
        ...policyData,
        tenant_id: tenant.id,
        is_active: true,
      },
    });
  }
  console.log(`✅ Policies: ${policiesData.length} default policies created`);

  // === ADMIN USER ===
  const pinHash = hashSync('123456', 10);
  const passwordHash = hashSync('Admin@123456', 10);

  const adminUser = await prisma.user.upsert({
    where: { id: '01900000-0000-7000-8000-000000000301' },
    update: {},
    create: {
      id: '01900000-0000-7000-8000-000000000301',
      tenant_id: tenant.id,
      email: 'admin@pos-sdd.local',
      name: 'System Admin',
      pin_hash: pinHash,
      password_hash: passwordHash,
      is_active: true,
    },
  });
  console.log(`✅ Admin user: ${adminUser.email}`);

  // Assign system_admin role to admin user
  const systemAdminRole = rolesData.find((r) => r.name === 'system_admin')!;
  await prisma.userRole.upsert({
    where: {
      user_id_role_id: {
        user_id: adminUser.id,
        role_id: systemAdminRole.id,
      },
    },
    update: {},
    create: {
      id: uuidv7(),
      user_id: adminUser.id,
      role_id: systemAdminRole.id,
    },
  });
  console.log(`✅ Admin user assigned system_admin role`);

  // === CUSTOM AUTH ACCOUNT RECORD ===
  // Tạo Account record cho admin user (credential provider)
  // Custom AuthService lưu password hash trong Account.password
  await prisma.account.upsert({
    where: {
      id: '01900000-0000-7000-8000-000000000401',
    },
    update: {},
    create: {
      id: '01900000-0000-7000-8000-000000000401',
      user_id: adminUser.id,
      account_id: adminUser.email,       // Provider's user ID = email
      provider_id: 'credential',          // Email/password provider
      password: passwordHash,            // Custom Auth lưu password hash trong Account.password
    },
  });
  console.log(`✅ Custom Auth Account record created for admin user`);

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

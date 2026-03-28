import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module.js';
import { AuthNestModule } from './modules/auth/auth.module.js';
import { UserModule } from './modules/user/user.module.js';
import { resolve } from 'path';

// Resolve .env from monorepo root (2 levels up from apps/api/)
const rootDir = resolve(__dirname, '../../..');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(rootDir, '.env.local'),
        resolve(rootDir, '.env'),
        '.env.local',
        '.env',
      ],
    }),
    DatabaseModule,
    AuthNestModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

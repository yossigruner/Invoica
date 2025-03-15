import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminController } from './admin.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [UsersController, AdminController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {} 
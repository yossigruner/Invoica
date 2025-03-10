import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase not allowed in production');
    }
    
    const models = Reflect.ownKeys(this).filter((key) => {
      return typeof key === 'string' && 
             typeof (this as any)[key] === 'object' && 
             (this as any)[key].deleteMany;
    });

    return Promise.all(
      models.map((modelKey) => {
        if (typeof modelKey === 'string') {
          return (this as any)[modelKey].deleteMany();
        }
        return Promise.resolve();
      })
    );
  }
} 
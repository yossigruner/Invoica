import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Prisma } from '@prisma/client';

interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createCustomerDto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        ...createCustomerDto,
        userId,
      },
    });
  }

  async findAll(userId: string, params: PaginationParams) {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    // Build the where clause based on search parameter
    const where: Prisma.CustomerWhereInput = {
      userId,
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          { email: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          { phone: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          { address: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          { city: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          { state: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          { country: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
        ],
      } : {}),
    };

    // Get total count for pagination
    const total = await this.prisma.customer.count({ where });

    // Get paginated customers
    const customers = await this.prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(userId: string, id: string, updateCustomerDto: UpdateCustomerDto) {
    // Verify customer exists and belongs to user
    await this.findOne(userId, id);

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(userId: string, id: string) {
    // Verify customer exists and belongs to user
    await this.findOne(userId, id);

    await this.prisma.customer.delete({
      where: { id },
    });

    return { message: 'Customer deleted successfully' };
  }
} 
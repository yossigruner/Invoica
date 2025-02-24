import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

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

  async findAll(userId: string) {
    return this.prisma.customer.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
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
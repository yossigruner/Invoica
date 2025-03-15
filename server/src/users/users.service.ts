import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { 
        email: {
          equals: createUserDto.email,
          mode: 'insensitive'
        }
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email.toLowerCase(),
        password: hashedPassword,
      },
    });

    // Create an empty profile for the user
    await this.prisma.profile.create({
      data: {
        userId: user.id,
        firstName: '',
        lastName: '',
        email: user.email,
        preferredCurrency: 'USD',
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async findAll(params: { page?: number; limit?: number; search?: string; sortBy?: string } = {}) {
    const { page = 1, limit = 10, search, sortBy } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { 
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ]
    } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          profile: true,
        },
        orderBy: sortBy ? {
          [sortBy]: 'asc'
        } : {
          createdAt: 'desc'
        }
      }),
      this.prisma.user.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        profile: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { 
        email: {
          equals: email,
          mode: 'insensitive'
        }
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updates: any = { ...updateUserDto };
    
    if (updateUserDto.password) {
      updates.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.email) {
      updates.email = updateUserDto.email.toLowerCase();
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updates,
      include: {
        profile: true,
      },
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async validatePassword(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { 
        email: {
          equals: email,
          mode: 'insensitive'
        }
      },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async createPasswordReset(data: { email: string; token: string; expiresAt: Date }): Promise<void> {
    await this.prisma.passwordReset.create({
      data: {
        email: data.email,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findPasswordReset(token: string) {
    return this.prisma.passwordReset.findUnique({
      where: { token },
    });
  }

  async updatePassword(email: string, hashedPassword: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
  }

  async markPasswordResetAsUsed(token: string): Promise<void> {
    await this.prisma.passwordReset.update({
      where: { token },
      data: { used: true },
    });
  }

  async updateRole(id: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: { 
        role: role as UserRole 
      },
      include: {
        profile: true,
      },
    });
  }
} 
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(userId: string) {
    const profile = await this.prisma.profile.findUniqueOrThrow({
      where: {
        userId: userId
      },
    });

    return profile;
  }

  async update(userId: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: updateProfileDto,
    });

    return profile;
  }

  async findByImage(filename: string) {
    return this.prisma.profile.findFirst({
      where: {
        OR: [
          { companyLogo: { contains: filename } },
          { signature: { contains: filename } }
        ]
      }
    });
  }
} 
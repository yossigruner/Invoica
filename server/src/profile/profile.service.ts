import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

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
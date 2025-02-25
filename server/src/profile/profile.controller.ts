import { Controller, Get, Patch, Body, UseGuards, Request, Post, Param, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return the user profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@Request() req: any) {
    return this.profileService.findOne(req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile successfully updated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(req.user.id, updateProfileDto);
  }

  @Post('upload/logo')
  @ApiOperation({ summary: 'Upload company logo' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Logo uploaded successfully.' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/logos',
      filename: (req, file, cb) => {
        const userId = (req as any).user.id;
        const fileExt = extname(file.originalname);
        cb(null, `${userId}-logo${fileExt}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async uploadLogo(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    const imageUrl = `/profile/images/${file.filename}`;
    await this.profileService.update(req.user.id, { company_logo: imageUrl });
    return { imageUrl };
  }

  @Post('upload/signature')
  @ApiOperation({ summary: 'Upload signature' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Signature uploaded successfully.' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/signatures',
      filename: (req, file, cb) => {
        const userId = (req as any).user.id;
        const fileExt = extname(file.originalname);
        cb(null, `${userId}-signature${fileExt}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async uploadSignature(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    const imageUrl = `/profile/images/${file.filename}`;
    await this.profileService.update(req.user.id, { signature: imageUrl });
    return { imageUrl };
  }

  @Get('images/:filename')
  @ApiOperation({ summary: 'Get profile image' })
  @ApiResponse({ status: 200, description: 'Return the image file.' })
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = `./uploads/${filename.includes('logo') ? 'logos' : 'signatures'}/${filename}`;
    return res.sendFile(filePath, { root: '.' });
  }
} 
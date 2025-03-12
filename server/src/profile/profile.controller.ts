import { Controller, Get, Patch, Body, UseGuards, Request, Post, Param, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { extname } from 'path';
import { bucket, getSignedUrl } from '../config/storage.config';
import { Readable } from 'stream';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
    const updatedProfile = await this.profileService.update(req.user.id, updateProfileDto);
    return {
      profile: updatedProfile,
      redirectUrl: '/'
    };
  }

  @Post('upload/logo')
  @ApiOperation({ summary: 'Upload company logo' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Logo uploaded successfully.' })
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: MAX_FILE_SIZE
    }
  }))
  async uploadLogo(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      throw new Error('Only image files are allowed!');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10MB limit!');
    }

    const userId = req.user.id;
    const fileExt = extname(file.originalname);
    const filename = `logos/${userId}-logo${fileExt}`;
    
    const fileStream = Readable.from(file.buffer);
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    await new Promise((resolve, reject) => {
      fileStream
        .pipe(blobStream)
        .on('error', reject)
        .on('finish', resolve);
    });

    const imageUrl = await getSignedUrl(filename);
    await this.profileService.update(req.user.id, { companyLogo: filename });
    return { 
      imageUrl,
      redirectUrl: '/'
    };
  }

  @Post('upload/signature')
  @ApiOperation({ summary: 'Upload signature' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Signature uploaded successfully.' })
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: MAX_FILE_SIZE
    }
  }))
  async uploadSignature(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      throw new Error('Only image files are allowed!');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10MB limit!');
    }

    const userId = req.user.id;
    const fileExt = extname(file.originalname);
    const filename = `signatures/${userId}-signature${fileExt}`;
    
    const fileStream = Readable.from(file.buffer);
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    await new Promise((resolve, reject) => {
      fileStream
        .pipe(blobStream)
        .on('error', reject)
        .on('finish', resolve);
    });

    const imageUrl = await getSignedUrl(filename);
    await this.profileService.update(req.user.id, { signature: filename });
    return { 
      imageUrl,
      redirectUrl: '/'
    };
  }

  @Get('images/:filename')
  @ApiOperation({ summary: 'Get profile image' })
  @ApiResponse({ status: 200, description: 'Return the image file.' })
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const profile = await this.profileService.findByImage(filename);
    if (!profile) {
      res.status(404).send('Image not found');
      return;
    }

    const imageKey = filename.includes('logo') ? profile.companyLogo : profile.signature;
    if (!imageKey) {
      res.status(404).send('Image not found');
      return;
    }

    const signedUrl = await getSignedUrl(imageKey);
    res.redirect(signedUrl);
  }
} 
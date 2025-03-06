import { Controller, Get, Post, Query, UseGuards, Req, Res, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CloverService } from './clover.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@Controller('clover')
export class CloverController {
  private readonly logger = new Logger(CloverController.name);

  constructor(
    private readonly cloverService: CloverService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Req() req: RequestWithUser) {
    const integration = await this.prisma.cloverIntegration.findUnique({
      where: { userId: req.user.id },
    });

    return {
      connected: !!integration,
      merchantId: integration?.merchantId,
      connectedAt: integration?.connectedAt,
    };
  }

  @Get('connect')
  @UseGuards(JwtAuthGuard)
  async connect(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    const authorizationUrl = this.cloverService.getAuthorizationUrl(userId);
    return { url: authorizationUrl };
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('merchant_id') merchantId: string,
    @Query('employee_id') employeeId: string,
    @Query('client_id') clientId: string,
    @Query('state') userId: string,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (!userId) {
      return res.redirect(`${frontendUrl}`);
    }

    await this.cloverService.handleCallback(code, merchantId, employeeId, clientId, userId);
    
    // Redirect to profile page
    return res.redirect(`${frontendUrl}/profile`);
  }

  @Post('disconnect')
  @UseGuards(JwtAuthGuard)
  async disconnect(@Req() req: RequestWithUser) {
    try {
      await this.cloverService.disconnect(req.user.id);
      return { success: true, message: 'Successfully disconnected from Clover' };
    } catch (error) {
      this.logger.error('Failed to disconnect from Clover:', error);
      throw new HttpException(
        'Failed to disconnect from Clover',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 
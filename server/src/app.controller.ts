import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get server health status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns server health status and version information.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        version: { type: 'string', example: '1.0.0' },
        environment: { type: 'string', example: 'production' },
        timestamp: { type: 'string', example: '2024-03-12T18:00:00.000Z' }
      }
    }
  })
  getHealth() {
    return {
      status: 'ok',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      name: 'Invoica API',
      description: 'Invoice Management System API'
    };
  }
} 
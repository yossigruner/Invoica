import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Request() req: RequestWithUser, @Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(req.user.id, createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers with pagination and search' })
  @ApiResponse({ status: 200, description: 'Return paginated customers.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['name', 'city', 'email', 'createdAt'] })
  async findAll(
    @Request() req: RequestWithUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'name' | 'city' | 'email' | 'createdAt',
  ) {
    const pageNumber = page ? parseInt(page.toString()) : 1;
    const pageSize = limit ? parseInt(limit.toString()) : 10;
    
    return this.customersService.findAll(req.user.id, {
      page: pageNumber,
      limit: pageSize,
      search: search,
      sortBy: sortBy,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by id' })
  @ApiResponse({ status: 200, description: 'Return the customer.' })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  async findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.customersService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiResponse({ status: 200, description: 'Customer successfully updated.' })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  async update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(req.user.id, id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiResponse({ status: 200, description: 'Customer successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  async remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.customersService.remove(req.user.id, id);
  }
} 
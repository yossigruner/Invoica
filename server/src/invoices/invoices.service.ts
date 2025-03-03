import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { InvoiceOperationError, InvoiceErrorCodes } from './errors/invoice.errors';
import { ProfileService } from '../profile/profile.service';
import { QueryInvoiceDto } from './dto/query-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private profileService: ProfileService,
  ) {}

  async create(userId: string, createInvoiceDto: CreateInvoiceDto) {
    try {
      const { items, customerId, ...invoiceData } = createInvoiceDto;

      // If customerId is provided, verify it exists and belongs to user
      if (customerId) {
        const customer = await this.prisma.customer.findFirst({
          where: {
            id: customerId,
            userId,
          },
        });

        if (!customer) {
          throw new InvoiceOperationError(
            `Customer with ID ${customerId} not found`,
            InvoiceErrorCodes.CUSTOMER_NOT_FOUND,
            { customerId }
          );
        }
      }

      // Get user's profile for default currency if not provided
      if (!invoiceData.currency) {
        const profile = await this.prisma.profile.findUnique({
          where: { userId },
        });
        
        if (!profile) {
          throw new InvoiceOperationError(
            'User profile not found',
            InvoiceErrorCodes.VALIDATION_ERROR,
            { field: 'currency' }
          );
        }
        
        invoiceData.currency = profile.preferredCurrency;
      }

      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
      const discount = this.calculateAdjustment(subtotal, createInvoiceDto.discountValue, createInvoiceDto.discountType);
      const tax = this.calculateAdjustment(subtotal - discount, createInvoiceDto.taxValue, createInvoiceDto.taxType);
      const shipping = this.calculateAdjustment(subtotal - discount + tax, createInvoiceDto.shippingValue, createInvoiceDto.shippingType);
      const total = subtotal - discount + tax + shipping;

      // Log calculations and adjustments
      console.log('Invoice calculations:', {
        subtotal,
        adjustments: {
          discount: {
            base: subtotal,
            value: createInvoiceDto.discountValue,
            type: createInvoiceDto.discountType,
            calculated: discount
          },
          tax: {
            base: subtotal - discount,
            value: createInvoiceDto.taxValue,
            type: createInvoiceDto.taxType,
            calculated: tax
          },
          shipping: {
            base: subtotal - discount + tax,
            value: createInvoiceDto.shippingValue,
            type: createInvoiceDto.shippingType,
            calculated: shipping
          }
        },
        total
      });

      // Create invoice with items
      console.log('Creating invoice with data:', {
        dates: {
          issueDate: invoiceData.issueDate,
          dueDate: invoiceData.dueDate
        },
        payment: {
          method: invoiceData.paymentMethod,
          terms: invoiceData.paymentTerms
        },
        summary: {
          additionalNotes: invoiceData.additionalNotes,
          adjustments: {
            discount: {
              type: invoiceData.discountType,
              value: invoiceData.discountValue,
              calculated: discount
            },
            tax: {
              type: invoiceData.taxType,
              value: invoiceData.taxValue,
              calculated: tax
            },
            shipping: {
              type: invoiceData.shippingType,
              value: invoiceData.shippingValue,
              calculated: shipping
            }
          },
          subtotal,
          total
        }
      });

      const invoice = await this.prisma.invoice.create({
        data: {
          userId,
          customerId,
          invoiceNumber: invoiceData.invoiceNumber,
          issueDate: invoiceData.issueDate,
          dueDate: invoiceData.dueDate,
          currency: invoiceData.currency,
          paymentMethod: invoiceData.paymentMethod,
          paymentTerms: invoiceData.paymentTerms,
          additionalNotes: invoiceData.additionalNotes,
          status: invoiceData.status || 'DRAFT',
          billingName: invoiceData.billingName,
          billingEmail: invoiceData.billingEmail,
          billingPhone: invoiceData.billingPhone,
          billingAddress: invoiceData.billingAddress,
          billingCity: invoiceData.billingCity,
          billingProvince: invoiceData.billingProvince,
          billingZip: invoiceData.billingZip,
          billingCountry: invoiceData.billingCountry,
          discountValue: invoiceData.discountValue || 0,
          discountType: invoiceData.discountType || 'percentage',
          taxValue: invoiceData.taxValue || 0,
          taxType: invoiceData.taxType || 'percentage',
          shippingValue: invoiceData.shippingValue || 0,
          shippingType: invoiceData.shippingType || 'amount',
          subtotal,
          total,
          items: {
            create: items.map(item => ({
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.quantity * item.rate,
            })),
          },
        } as Prisma.InvoiceUncheckedCreateInput,
        include: {
          items: true,
        },
      });

      return invoice;
    } catch (error) {
      if (error instanceof InvoiceOperationError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle unique constraint violations
        if (error.code === 'P2002') {
          throw new InvoiceOperationError(
            'Invoice number already exists',
            InvoiceErrorCodes.VALIDATION_ERROR,
            { field: 'invoiceNumber' }
          );
        }
      }

      throw new InvoiceOperationError(
        'Failed to create invoice',
        InvoiceErrorCodes.DATABASE_ERROR,
        { originalError: error.message }
      );
    }
  }

  async findAll(userId: string, query?: QueryInvoiceDto) {
    try {

      console.log('Query parameters:', query);

      const where: Prisma.InvoiceWhereInput = { userId };

      // Add search conditions if searchQuery is provided
      if (query?.searchQuery) {
        where.OR = [
          { invoiceNumber: { contains: query.searchQuery, mode: 'insensitive' } },
          { billingName: { contains: query.searchQuery, mode: 'insensitive' } },
          { billingEmail: { contains: query.searchQuery, mode: 'insensitive' } },
          { billingAddress: { contains: query.searchQuery, mode: 'insensitive' } }
        ];

        // Handle status search separately since it's an enum
        const upperSearchQuery = query.searchQuery.toUpperCase();
        if (['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'].includes(upperSearchQuery)) {
          where.OR.push({ status: upperSearchQuery as InvoiceStatus });
        }
      }

      // Add date range conditions if provided
      if (query?.startDate || query?.endDate) {
        where.issueDate = {};
        if (query.startDate) {
          where.issueDate.gte = new Date(query.startDate);
        }
        if (query.endDate) {
          where.issueDate.lte = new Date(query.endDate);
        }
      }

      // Get total count for pagination
      const total = await this.prisma.invoice.count({ where });

      // Calculate pagination
      const page = Number(query?.page) || 1;
      const limit = Number(query?.limit) || 10;
      const skip = (page - 1) * limit;

      console.log('Query parameters:', {
        where,
        pagination: { page, limit, skip },
        total
      });

      // Get paginated results
      const invoices = await this.prisma.invoice.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      });

      console.log('Query results:', {
        totalInvoices: invoices.length,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });

      return {
        data: invoices,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new InvoiceOperationError(
        'Failed to fetch invoices',
        InvoiceErrorCodes.DATABASE_ERROR,
        { originalError: error.message }
      );
    }
  }

  async findOne(userId: string, id: string) {
    try {
      const invoice = await this.prisma.invoice.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          items: true,
        },
      });

      if (!invoice) {
        throw new InvoiceOperationError(
          `Invoice with ID ${id} not found`,
          InvoiceErrorCodes.INVOICE_NOT_FOUND,
          { invoiceId: id }
        );
      }

      return invoice;
    } catch (error) {
      if (error instanceof InvoiceOperationError) {
        throw error;
      }

      throw new InvoiceOperationError(
        'Failed to fetch invoice',
        InvoiceErrorCodes.DATABASE_ERROR,
        { originalError: error.message }
      );
    }
  }

  async update(userId: string, id: string, updateInvoiceDto: UpdateInvoiceDto) {
    try {
      const { items, status, customerId, ...invoiceData } = updateInvoiceDto;

      // Log the incoming data
      console.log('Updating invoice with data:', {
        id,
        userId,
        dates: {
          issueDate: invoiceData.issueDate,
          dueDate: invoiceData.dueDate
        },
        payment: {
          method: invoiceData.paymentMethod,
          terms: invoiceData.paymentTerms
        },
        summary: {
          additionalNotes: invoiceData.additionalNotes,
          discount: {
            type: invoiceData.discountType,
            value: invoiceData.discountValue
          },
          tax: {
            type: invoiceData.taxType,
            value: invoiceData.taxValue
          },
          shipping: {
            type: invoiceData.shippingType,
            value: invoiceData.shippingValue
          }
        },
        fullData: updateInvoiceDto
      });

      // If customerId is provided, verify it exists and belongs to user
      if (customerId) {
        const customer = await this.prisma.customer.findFirst({
          where: {
            id: customerId,
            userId,
          },
        });

        if (!customer) {
          throw new InvoiceOperationError(
            `Customer with ID ${customerId} not found`,
            InvoiceErrorCodes.CUSTOMER_NOT_FOUND,
            { customerId }
          );
        }
      }

      // Verify invoice exists and belongs to user
      const existingInvoice = await this.findOne(userId, id);

      let subtotal = existingInvoice.subtotal;
      let total = existingInvoice.total;

      // If items are being updated, recalculate totals
      if (items) {
        subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
        const discount = this.calculateAdjustment(
          subtotal,
          updateInvoiceDto.discountValue ?? existingInvoice.discountValue,
          updateInvoiceDto.discountType ?? existingInvoice.discountType,
        );
        const tax = this.calculateAdjustment(
          subtotal - discount,
          updateInvoiceDto.taxValue ?? existingInvoice.taxValue,
          updateInvoiceDto.taxType ?? existingInvoice.taxType,
        );
        const shipping = this.calculateAdjustment(
          subtotal - discount + tax,
          updateInvoiceDto.shippingValue ?? existingInvoice.shippingValue,
          updateInvoiceDto.shippingType ?? existingInvoice.shippingType,
        );
        total = subtotal - discount + tax + shipping;

        // Log recalculation details
        console.log('Invoice recalculation:', {
          subtotal,
          adjustments: {
            discount: {
              base: subtotal,
              value: updateInvoiceDto.discountValue ?? existingInvoice.discountValue,
              type: updateInvoiceDto.discountType ?? existingInvoice.discountType,
              calculated: discount
            },
            tax: {
              base: subtotal - discount,
              value: updateInvoiceDto.taxValue ?? existingInvoice.taxValue,
              type: updateInvoiceDto.taxType ?? existingInvoice.taxType,
              calculated: tax
            },
            shipping: {
              base: subtotal - discount + tax,
              value: updateInvoiceDto.shippingValue ?? existingInvoice.shippingValue,
              type: updateInvoiceDto.shippingType ?? existingInvoice.shippingType,
              calculated: shipping
            }
          },
          total
        });

        // Delete existing items
        await this.prisma.invoiceItem.deleteMany({
          where: { invoiceId: id },
        });
      }

      // Log the data being sent to the database
      console.log('Sending update to database:', {
        id,
        dates: {
          issueDate: invoiceData.issueDate,
          dueDate: invoiceData.dueDate
        },
        status,
        items: items?.length
      });

      // Update invoice and items
      const updatedInvoice = await this.prisma.invoice.update({
        where: { id },
        data: {
          customerId,
          invoiceNumber: invoiceData.invoiceNumber,
          issueDate: invoiceData.issueDate,
          dueDate: invoiceData.dueDate,
          currency: invoiceData.currency,
          paymentMethod: invoiceData.paymentMethod,
          paymentTerms: invoiceData.paymentTerms,
          additionalNotes: invoiceData.additionalNotes,
          status: status as InvoiceStatus,
          billingName: invoiceData.billingName,
          billingEmail: invoiceData.billingEmail,
          billingPhone: invoiceData.billingPhone,
          billingAddress: invoiceData.billingAddress,
          billingCity: invoiceData.billingCity,
          billingProvince: invoiceData.billingProvince,
          billingZip: invoiceData.billingZip,
          billingCountry: invoiceData.billingCountry,
          discountValue: invoiceData.discountValue,
          discountType: invoiceData.discountType,
          taxValue: invoiceData.taxValue,
          taxType: invoiceData.taxType,
          shippingValue: invoiceData.shippingValue,
          shippingType: invoiceData.shippingType,
          subtotal: items ? subtotal : undefined,
          total: items ? total : undefined,
          items: items ? {
            create: items.map(item => ({
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.quantity * item.rate,
            })),
          } : undefined,
        } as Prisma.InvoiceUncheckedUpdateInput,
        include: {
          items: true,
        },
      });

      // Log the updated invoice
      console.log('Invoice updated successfully:', {
        id: updatedInvoice.id,
        dates: {
          issueDate: updatedInvoice.issueDate,
          dueDate: updatedInvoice.dueDate
        }
      });

      return updatedInvoice;
    } catch (error) {
      if (error instanceof InvoiceOperationError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle unique constraint violations
        if (error.code === 'P2002') {
          throw new InvoiceOperationError(
            'Invoice number already exists',
            InvoiceErrorCodes.VALIDATION_ERROR,
            { field: 'invoiceNumber' }
          );
        }
      }

      throw new InvoiceOperationError(
        'Failed to update invoice',
        InvoiceErrorCodes.DATABASE_ERROR,
        { originalError: error.message }
      );
    }
  }

  async remove(userId: string, id: string) {
    try {
      // Verify invoice exists and belongs to user
      await this.findOne(userId, id);

      await this.prisma.invoice.delete({
        where: { id },
      });

      return { message: 'Invoice deleted successfully' };
    } catch (error) {
      if (error instanceof InvoiceOperationError) {
        throw error;
      }

      throw new InvoiceOperationError(
        'Failed to delete invoice',
        InvoiceErrorCodes.DATABASE_ERROR,
        { originalError: error.message }
      );
    }
  }

  async findPublicOne(id: string) {
    try {
      return await this.prisma.invoice.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });
    } catch (error) {
      throw new InvoiceOperationError(
        'Failed to fetch invoice',
        InvoiceErrorCodes.DATABASE_ERROR,
        { originalError: error.message }
      );
    }
  }

  async findByInvoiceNumber(invoiceNumber: string) {
    try {
      return await this.prisma.invoice.findUnique({
        where: { invoiceNumber },
        include: {
          items: true,
        },
      });
    } catch (error) {
      throw new InvoiceOperationError(
        'Failed to fetch invoice by invoice number',
        InvoiceErrorCodes.DATABASE_ERROR,
        { originalError: error.message }
      );
    }
  }

  private calculateAdjustment(amount: number, value?: number, type?: string): number {
    if (!value || value === 0) return 0;
    return type === 'percentage' ? (amount * value) / 100 : value;
  }

  async getProfileData(userId: string) {
    return this.profileService.findOne(userId);
  }
} 
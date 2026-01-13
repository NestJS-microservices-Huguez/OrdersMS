import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus, Prisma, PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { OrderPaginationDTO } from './dto/order-pagination.dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private logger = new Logger("OrdersService")

  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log("Database Connected");
  }

  async create(createOrderDto: CreateOrderDto) {
    return await this.order.create({ data: createOrderDto });
  }

  async findAll(pagination: OrderPaginationDTO) {
    try {
      const { limit = 5, page = 1, status } = pagination

      const total = await this.order.count({ where: status ? { status } : {}, });

      const orders = await this.order.findMany({
        where: status ? { status } : {},
        skip: (page - 1) * limit,
        take: limit
      })

      return {
        lastPage: Math.ceil(total / limit),
        totalProducts: total,
        orders,
      }
    } catch (error) {
      this.handlerExceptions(error)
    }
  }

  async findOne(id: string) {
    try {
      const order = await this.order.findFirst({
        where: {
          id
        }
      })

      if (!order) {
        throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `Order with id: ${id}, not found` })
      }

      return {
        order
      }

    } catch (error) {
      this.handlerExceptions(error)
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      const resp = await this.findOne(id)

      const { status } = updateOrderDto

      if ( resp?.order.status === status  ) {
        return { 
          order: resp.order
        }
      }
      
      return {
        order: await this.order.update({
          where: {
            id
          },
          data: {
            status
          },
        })
      }
    } catch (error) {
      this.handlerExceptions(error)
    }

    return `This action updates a #${id} order`;
  }

  private handlerExceptions(error: any) {

    if (error.error.status === HttpStatus.NOT_FOUND) {
      throw new RpcException({ status: HttpStatus.NOT_FOUND, message: error.error.message })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: 'Error: instance/attribute duplicate' })
      }
    } else if (error instanceof Prisma.PrismaClientRustPanicError) {
      throw new RpcException({ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error: Prisma engine fail.' })
    } else {
      this.logger.error(error);
      throw new RpcException({ status: HttpStatus.INTERNAL_SERVER_ERROR, message: "Check Logs" })
    }
  }
}

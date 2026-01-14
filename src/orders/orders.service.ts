import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDTO } from './dto/order-pagination.dto';
import { NATS_SERVICES } from 'src/config';
import { firstValueFrom } from 'rxjs';
import { OrderItemDTO } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private logger = new Logger("OrdersService")

  constructor(
    @Inject(NATS_SERVICES)
    private readonly client: ClientProxy
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log("Database Connected");
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      const validatedProducts = await firstValueFrom(this.client.send({ cmd: "validate_products" }, createOrderDto.items.map(item => item.productId)))

      const totalAmount = createOrderDto.items.reduce((acc, currentValue: OrderItemDTO) => {

        const price = validatedProducts.find(product => product.id === currentValue.productId).price

        return acc + price * currentValue.quantity;
      }, 0)

      const totalItems = createOrderDto.items.reduce((acc, currentValue: OrderItemDTO) => {
        return acc + currentValue.quantity;
      }, 0)

      const order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          orderItem: {
            createMany: {
              data: createOrderDto.items.map((orderItem) => ({
                price: validatedProducts.find(product => product.id === orderItem.productId).price,
                productId: orderItem.productId,
                quantity: orderItem.quantity,
              }))
            }
          }
        },
        include: {
          orderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true,
            }
          }
        }
      });

      return {
        ...order,
        orderItem: order.orderItem.map(orderItem => ({
          ...orderItem,
          name: validatedProducts.find( product => product.id === orderItem.productId ).name
        }))
      }

    } catch (error) {
      this.handlerExceptions(error)
    }
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
        },
        include: {
          orderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true,
            }
          }
        }
      })

      if (!order) {
        throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `Order with id: ${id}, not found` })
      }
      
      const validatedProducts = await firstValueFrom(this.client.send({ cmd: "validate_products" }, order.orderItem.map(item => item.productId )))
      
      return {
        ...order,
        orderItem: order.orderItem.map( orderItem => ({
          name: validatedProducts.find( product => product.id === orderItem.productId ).name,
          price: orderItem.price,
          quantity: orderItem.quantity,
        }) )
      }

    } catch (error) {
      this.handlerExceptions(error)
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      const order = await this.findOne(id)

      const { status } = updateOrderDto

      if (order?.status === status) {
        return { ...order }
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

    if (error.status && error.status === HttpStatus.BAD_REQUEST) {
      throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: error.message })
    }

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

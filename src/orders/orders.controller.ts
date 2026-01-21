import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, OrderPaginationDTO, PaidOrderDTO } from './dto';
import { OrderWithProducts } from './interfaces';

@Controller()
export class OrdersController {

  constructor(
    private readonly ordersService: OrdersService
  ) { }

  @MessagePattern('createOrder')
  async create(@Payload() createOrderDto: CreateOrderDto) {
    const order: OrderWithProducts = await this.ordersService.create(createOrderDto);
    const paymentSession = await this.ordersService.createPaymentSession(order)

    return {
      order,
      ...paymentSession,
    }
  }

  @MessagePattern('findAllOrders')
  findAll(@Payload() pagination: OrderPaginationDTO) {
    return this.ordersService.findAll(pagination);
  }

  @MessagePattern('findOneOrder')
  findOne(@Payload() payload: { id: string }) {
    return this.ordersService.findOne(payload.id);
  }

  @MessagePattern('changeOrderStatus')
  update(@Payload() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(updateOrderDto.id, updateOrderDto);
  }

  @EventPattern('payment.succeeded')
  payOrder(@Payload() payOrderDTO: PaidOrderDTO ) {
    return this.ordersService.paidOrder( payOrderDTO )
  }

}

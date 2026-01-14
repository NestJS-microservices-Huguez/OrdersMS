import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { OrderPaginationDTO } from './dto/order-pagination.dto';

@Controller()
export class OrdersController {

  constructor(
    private readonly ordersService: OrdersService
  ) {}

  @MessagePattern('createOrder')
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern('findAllOrders')
  findAll(@Payload() pagination: OrderPaginationDTO ) {
    return this.ordersService.findAll( pagination);
  }

  @MessagePattern('findOneOrder')
  findOne(@Payload() payload: { id: string }) {
    return this.ordersService.findOne(payload.id);
  }

  @MessagePattern('changeOrderStatus')
  update(@Payload() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(updateOrderDto.id, updateOrderDto);
  }

}

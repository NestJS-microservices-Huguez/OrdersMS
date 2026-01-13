import { OrderStatus } from "@prisma/client";
import { OrderStatusList } from "../enum/order.enum";
import { IsEnum, IsString } from "class-validator";

export class UpdateOrderDto {

  @IsEnum(OrderStatusList, {
    message: `Possible status values are ${OrderStatusList.toString()}`
  })
  status: OrderStatus;


  @IsString()
  id: string;
}

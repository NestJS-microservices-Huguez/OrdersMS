import { IsEnum, IsOptional } from "class-validator";
import { OrderStatusList } from "../enum/order.enum";
import { PaginationDTO } from "src/common/dto";
import { OrderStatus } from "@prisma/client";

export class OrderPaginationDTO extends PaginationDTO {

   @IsEnum(OrderStatusList, {
      message: `Possible status values are ${OrderStatusList.toString()}`
   })
   @IsOptional()
   status?: OrderStatus
}
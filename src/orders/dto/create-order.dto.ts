import { OrderStatus } from "@prisma/client";
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsPositive, Min } from "class-validator";
import { OrderStatusList } from "../enum/order.enum";

export class CreateOrderDto {

   @IsNumber()
   @IsPositive()
   @Min(1.00)
   totalAmount: number;

   @IsNumber()
   @IsPositive()
   @Min(1.00)
   totalItems: number;

   @IsEnum( OrderStatusList, {
      message: `Possible status values are ${ OrderStatusList.toString() }`
   } )
   @IsOptional()
   status: OrderStatus = OrderStatus.PENDING;

   @IsBoolean()
   @IsOptional()
   paid?: boolean = false;

   @IsDate()
   @IsOptional()
   paidAt?: Date;
}

import { IsNumber, IsPositive, Min } from "class-validator";

export class OrderItemDTO {

   @IsNumber()
   @IsPositive()
   productId: number;

   @IsNumber()
   @IsPositive()
   quantity: number;

   @IsNumber()
   @IsPositive()
   @Min(1.00)
   prince: number;
}
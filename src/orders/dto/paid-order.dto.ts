import { IsString, IsUrl, IsUUID } from "class-validator";

export class PaidOrderDTO {

   @IsString()
   public stripePaymentId: string;
   
   @IsString()
   @IsUUID()
   public orderId: string;

   @IsString()
   @IsUrl()
   public receiptUrl: string;
}
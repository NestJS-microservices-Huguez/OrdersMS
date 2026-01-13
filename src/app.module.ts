import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';

@Module({
  controllers: [],
  providers: [],
  imports: [OrdersModule],
})
export class AppModule {}

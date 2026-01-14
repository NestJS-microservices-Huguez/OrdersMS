import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { TransportsModule } from './transports/transports.module';

@Module({
  controllers: [],
  providers: [],
  imports: [OrdersModule, TransportsModule],
})
export class AppModule {}

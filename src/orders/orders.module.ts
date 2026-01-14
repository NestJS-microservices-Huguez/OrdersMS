import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TransportsModule } from 'src/transports/transports.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [TransportsModule]
})
export class OrdersModule { }

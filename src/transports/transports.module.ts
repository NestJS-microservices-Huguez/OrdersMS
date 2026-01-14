import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { env } from 'src/config';
import { NATS_SERVICES } from 'src/config/services';

@Module({
      imports: [
      ClientsModule.register([
         {
            name: NATS_SERVICES,
            transport: Transport.NATS,
            options: {
               servers: env.NATS_SERVERS
            }
         },
      ])
   ],
   exports: [
      ClientsModule.register([
         {
            name: NATS_SERVICES,
            transport: Transport.NATS,
            options: {
               servers: env.NATS_SERVERS
            }
         },
      ])
   ]
})
export class TransportsModule { }

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RestaurantsResolver } from './restaurants.resolver';
import { RestaurantsService } from './restaurants.service';

@Module({
  imports: [PrismaModule],
  providers: [RestaurantsResolver, RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}

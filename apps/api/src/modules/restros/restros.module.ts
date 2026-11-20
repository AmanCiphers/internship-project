import { Module } from '@nestjs/common';
import { RestrosController } from './restros.controller.js';
import { RestrosService } from './restros.service.js';

@Module({
  controllers: [RestrosController],
  providers: [RestrosService]
})
export class RestrosModule {}

import { Controller, Get, Post, Body } from '@nestjs/common';
import { RestrosService } from './restros.service.js';
import { CreateRestroDto } from './dto/create-restro.dto.js';

@Controller('restros')
export class RestrosController {
  constructor(private readonly restrosService: RestrosService) {}

  @Get()
  findAll() {
    return this.restrosService.findAll();
  }

  @Post()
  create(@Body() body: CreateRestroDto) {
    return this.restrosService.create(body);
  }
}

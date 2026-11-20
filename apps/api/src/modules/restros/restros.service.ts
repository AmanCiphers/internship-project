import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { CreateRestroDto } from './dto/create-restro.dto.js';

@Injectable()
export class RestrosService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateRestroDto) {
    return this.prisma.restro.create({ data });
  }

  async findAll() {
    return this.prisma.restro.findMany();
  }
}

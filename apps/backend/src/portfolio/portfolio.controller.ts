import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { Protected } from 'src/auth/protected.decorator';
import { CreatePortfolioDto, UpdatePortfolioDto } from './portfolio.dto';
import { PortfolioService } from './portfolio.service';

@Protected()
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  async findAll() {
    return this.portfolioService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.portfolioService.findOne(id);
  }

  @Post()
  async create(@Body() data: CreatePortfolioDto) {
    return this.portfolioService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdatePortfolioDto,
  ) {
    return this.portfolioService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.portfolioService.delete(id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Protected } from 'src/auth/protected.decorator';
import {
  CreateZamerQuestionDto,
  UpdateZamerQuestionDto,
  UpdateZamerSummaryDto,
  ZamerConfigDto,
} from './zamer.dto';
import { ZamerService } from './zamer.service';

@Protected()
@Controller('zamer')
export class ZamerController {
  constructor(private readonly zamerService: ZamerService) {}

  @Get('config')
  async getConfig(): Promise<ZamerConfigDto> {
    const questions = await this.zamerService.getAllQuestions();
    const summary = await this.zamerService.getSummary();
    return { questions, summary };
  }

  @Get('questions')
  async getAllQuestions() {
    return this.zamerService.getAllQuestions();
  }

  @Get('questions/:id')
  async getQuestion(@Param('id') id: string) {
    return this.zamerService.getQuestion(parseInt(id));
  }

  @Post('questions')
  async createQuestion(@Body() dto: CreateZamerQuestionDto) {
    return this.zamerService.createQuestion(dto);
  }

  @Put('questions/:id')
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateZamerQuestionDto,
  ) {
    return this.zamerService.updateQuestion(parseInt(id), dto);
  }

  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    await this.zamerService.deleteQuestion(parseInt(id));
    return { success: true };
  }

  @Get('summary')
  async getSummary() {
    const message = await this.zamerService.getSummary();
    return { message };
  }

  @Put('summary')
  async updateSummary(@Body() dto: UpdateZamerSummaryDto) {
    await this.zamerService.updateSummary(dto.message);
    return { success: true };
  }
}

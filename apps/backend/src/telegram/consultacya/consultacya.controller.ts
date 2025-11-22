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
  ConsultacyaConfigDto,
  CreateConsultacyaQuestionDto,
  UpdateConsultacyaQuestionDto,
  UpdateConsultacyaSummaryDto,
} from './consultacya.dto';
import { ConsultacyaService } from './consultacya.service';

@Protected()
@Controller('consultacya')
export class ConsultacyaController {
  constructor(private readonly consultacyaService: ConsultacyaService) {}

  @Get('config')
  async getConfig(): Promise<ConsultacyaConfigDto> {
    const questions = await this.consultacyaService.getAllQuestions();
    const summary = await this.consultacyaService.getSummary();
    return { questions, summary };
  }

  @Get('questions')
  async getAllQuestions() {
    return this.consultacyaService.getAllQuestions();
  }

  @Get('questions/:id')
  async getQuestion(@Param('id') id: string) {
    return this.consultacyaService.getQuestion(parseInt(id));
  }

  @Post('questions')
  async createQuestion(@Body() dto: CreateConsultacyaQuestionDto) {
    return this.consultacyaService.createQuestion(dto);
  }

  @Put('questions/:id')
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateConsultacyaQuestionDto,
  ) {
    return this.consultacyaService.updateQuestion(parseInt(id), dto);
  }

  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    await this.consultacyaService.deleteQuestion(parseInt(id));
    return { success: true };
  }

  @Get('summary')
  async getSummary() {
    const message = await this.consultacyaService.getSummary();
    return { message };
  }

  @Put('summary')
  async updateSummary(@Body() dto: UpdateConsultacyaSummaryDto) {
    await this.consultacyaService.updateSummary(dto.message);
    return { success: true };
  }
}

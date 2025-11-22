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
  CalculateConfigDto,
  CreateCalculateQuestionDto,
  UpdateCalculateQuestionDto,
  UpdateCalculateSummaryDto,
} from './calculate.dto';
import { CalculateService } from './calculate.service';

@Protected()
@Controller('calculate')
export class CalculateController {
  constructor(private readonly calculateService: CalculateService) {}

  @Get('config')
  async getConfig(): Promise<CalculateConfigDto> {
    const questions = await this.calculateService.getAllQuestions();
    const summary = await this.calculateService.getSummary();
    return { questions, summary };
  }

  @Get('questions')
  async getAllQuestions() {
    return this.calculateService.getAllQuestions();
  }

  @Get('questions/:id')
  async getQuestion(@Param('id') id: string) {
    return this.calculateService.getQuestion(parseInt(id));
  }

  @Post('questions')
  async createQuestion(@Body() dto: CreateCalculateQuestionDto) {
    return this.calculateService.createQuestion(dto);
  }

  @Put('questions/:id')
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateCalculateQuestionDto,
  ) {
    return this.calculateService.updateQuestion(parseInt(id), dto);
  }

  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    await this.calculateService.deleteQuestion(parseInt(id));
    return { success: true };
  }

  @Get('summary')
  async getSummary() {
    const message = await this.calculateService.getSummary();
    return { message };
  }

  @Put('summary')
  async updateSummary(@Body() dto: UpdateCalculateSummaryDto) {
    await this.calculateService.updateSummary(dto.message);
    return { success: true };
  }
}

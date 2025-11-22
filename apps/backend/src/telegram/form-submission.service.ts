import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FormSubmissionService {
  constructor(private prisma: PrismaService) {}

  async handleSubmission(commandName: string, data: object, chatId?: string) {
    console.log('\n' + '='.repeat(50));
    console.log(`📋 Form Submission: ${commandName.toUpperCase()}`);
    console.log('='.repeat(50));

    const entries = Object.entries(data);
    if (entries.length > 0) {
      entries.forEach(([key, value]) => {
        const label = this.getFieldLabel(key);
        console.log(`  ${label}: ${value}`);
      });
    } else {
      console.log('  (no data)');
    }

    console.log('='.repeat(50) + '\n');

    if (chatId) {
      try {
        const user = await this.prisma.telegramUser.findUnique({
          where: { chatId },
        });

        if (user) {
          await this.prisma.formSubmission.create({
            data: {
              commandName,
              data,
              telegramUserId: user.id,
            },
          });
          console.log(
            `✅ Form submission saved to database for user ${chatId}`,
          );
        }
      } catch (error) {
        console.error('❌ Failed to save form submission:', error);
      }
    }
  }

  private getFieldLabel(key: string): string {
    if (key === '-1') return '📞 Phone';
    const questionNum = parseInt(key);
    if (!isNaN(questionNum) && questionNum > 0) {
      return `❓ Question ${questionNum}`;
    }
    return `🔹 ${key}`;
  }
}

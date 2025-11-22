import { Injectable } from '@nestjs/common';

@Injectable()
export class FormSubmissionService {
  async handleSubmission(commandName: string, data: object) {
    console.log('Form submitted:', commandName);
    console.log('Data:', JSON.stringify(data, null, 2));
  }
}

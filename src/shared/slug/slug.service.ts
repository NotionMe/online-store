import { Injectable } from '@nestjs/common';

@Injectable()
export class SlugService {
  generateSlug(text: string): string {
    return text.toString().trim().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
}

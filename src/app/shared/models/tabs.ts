import { TemplateRef } from '@angular/core';

export interface Tab {
  title: string;
  content: TemplateRef<null>;
}

export type Variant = 'primary' | 'secondary' | 'tertiary';

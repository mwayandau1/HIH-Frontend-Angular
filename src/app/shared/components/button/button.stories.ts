import { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Controls the active state of the button',
    },
    variant: {
      control: 'radio',
      options: ['primary', 'secondary', 'tertiary'],
    },
    title: {
      control: 'text',
      description: 'Accessibility for screen readers',
    },
  },
};

export default meta;

type Story = StoryObj<ButtonComponent>;

export const primaryButtonActiveState: Story = {
  args: {
    disabled: false,
    variant: 'primary',
    title: 'Primary Button',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [disabled]="disabled" [variant]="variant" [title]="title">Click Me</app-button>`,
  }),
};

export const secondaryButtonActiveState: Story = {
  args: {
    disabled: false,
    variant: 'secondary',
    title: 'Secondary Button',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [disabled]="disabled" [variant]="variant" [title]="title">Click Me</app-button>`,
  }),
};

export const tertiaryButtonActiveState: Story = {
  args: {
    disabled: false,
    variant: 'tertiary',
    title: 'Tertiary Button',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [disabled]="disabled" [variant]="variant" [title]="title">Click Me</app-button>`,
  }),
};

import { Meta, StoryObj } from '@storybook/angular';
import { ToastComponent } from './toast.component';

const meta: Meta<ToastComponent> = {
  title: 'Toast',
  component: ToastComponent,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<ToastComponent>;

export const Toast: Story = {};

import type { CornerRadiusPreset } from '@/types/calculator';

export interface CornerRadiusClasses {
  window: string;
  card: string;
  button: string;
  smButton: string;
}

export function getCornerRadiusClasses(preset: CornerRadiusPreset = 'extra'): CornerRadiusClasses {
  switch (preset) {
    case 'sharp':
      return {
        window: 'corner-window rounded-none',
        card: 'corner-card rounded-none',
        button: 'corner-btn rounded-none',
        smButton: 'corner-sm-btn rounded-none',
      };
    case 'subtle':
      return {
        window: 'corner-window rounded-xl',
        card: 'corner-card rounded-lg',
        button: 'corner-btn rounded-md',
        smButton: 'corner-sm-btn rounded-sm',
      };
    case 'standard':
      return {
        window: 'corner-window rounded-2xl',
        card: 'corner-card rounded-xl',
        button: 'corner-btn rounded-xl',
        smButton: 'corner-sm-btn rounded-md',
      };
    case 'pill':
      return {
        window: 'corner-window rounded-[32px]',
        card: 'corner-card rounded-2xl',
        button: 'corner-btn rounded-full',
        smButton: 'corner-sm-btn rounded-full',
      };
    case 'extra':
    default:
      return {
        window: 'corner-window rounded-3xl',
        card: 'corner-card rounded-2xl',
        button: 'corner-btn rounded-xl',
        smButton: 'corner-sm-btn rounded-lg',
      };
  }
}

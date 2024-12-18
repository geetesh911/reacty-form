import { compact } from './compact';

export const stringToPath = (input: string): string[] =>
    compact(input.replace(/["|']|\]/g, '').split(/\.|\[/));

import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        watch: false,
        coverage: {
            enabled: true,
            exclude: [
                ...(configDefaults.coverage.exclude as string[]),
                'scripts/**/*',
                '**/*.config.*',
                '**/__typetest__/**/*',
                '**/types/**/*',
            ],
        },
        environment: 'jsdom',
        // Faster than 'fork' pool at the cost of less isolation.
        pool: 'threads',
        reporters: process.env.GITHUB_ACTIONS ? ['verbose', 'github-actions'] : ['verbose'],
        logHeapUsage: true,
    },
});

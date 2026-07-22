import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { cn } from '@/lib/utils';
import { renderWithProviders } from './test-utils';

describe('test infra sanity check', () => {
    it('resolves the @ alias', () => {
        expect(cn('a', 'b')).toBe('a b');
    });

    it('renders through the Redux + Router provider wrapper', () => {
        renderWithProviders(<div>ok</div>);
        expect(screen.getByText('ok')).toBeInTheDocument();
    });
});

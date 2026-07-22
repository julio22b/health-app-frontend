import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    formatTime,
    getAgeFromDOB,
    getAudioExtension,
    getAvatarColor,
    getDOBFromAge,
    getDocumentPreview,
    getErrorMessage,
    getLastVisitDate,
    getSupportedAudioMimeType,
    parseDateOnly,
    toDateInputValue,
} from './utils';

describe('getErrorMessage', () => {
    it('uses response.data.error for an axios error that has one', () => {
        const error = {
            isAxiosError: true,
            message: 'Request failed with status code 400',
            response: { data: { error: 'Username already taken' } },
        };
        expect(getErrorMessage(error)).toBe('Username already taken');
    });

    it('falls back to error.message for an axios error without response.data.error', () => {
        const error = { isAxiosError: true, message: 'Network Error', response: { data: {} } };
        expect(getErrorMessage(error)).toBe('Network Error');
    });

    it('falls back to error.message when the axios error has no response at all', () => {
        const error = { isAxiosError: true, message: 'Network Error' };
        expect(getErrorMessage(error)).toBe('Network Error');
    });

    it('defaults to "Login failed" for a non-axios error, regardless of its own message', () => {
        expect(getErrorMessage(new Error('boom'))).toBe('Login failed');
        expect(getErrorMessage('some string')).toBe('Login failed');
        expect(getErrorMessage(undefined)).toBe('Login failed');
    });
});

describe('parseDateOnly', () => {
    it('parses a date-only string to local midnight', () => {
        const result = parseDateOnly('2024-03-15');
        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(2);
        expect(result.getDate()).toBe(15);
        expect(result.getHours()).toBe(0);
    });

    it('parses a full ISO timestamp using only the date portion, with no timezone off-by-one', () => {
        const result = parseDateOnly('2024-03-15T23:45:00.000Z');
        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(2);
        expect(result.getDate()).toBe(15);
    });
});

describe('getAgeFromDOB', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2024, 5, 15));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('does not decrement age when today is the birthday', () => {
        expect(getAgeFromDOB('2000-06-15')).toBe(24);
    });

    it('decrements age when the birthday has not yet occurred this year (same month)', () => {
        expect(getAgeFromDOB('2000-06-16')).toBe(23);
    });

    it('decrements age when the birthday month has not yet occurred this year', () => {
        expect(getAgeFromDOB('2000-07-01')).toBe(23);
    });

    it('does not decrement age when the birthday already occurred this year', () => {
        expect(getAgeFromDOB('2000-01-01')).toBe(24);
    });
});

describe('getDOBFromAge', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2024, 5, 15));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('derives a January 1st birth date from the current year and age', () => {
        expect(getDOBFromAge(24)).toBe('2000-01-01');
    });
});

describe('toDateInputValue', () => {
    it('slices a timestamp down to the date-only portion', () => {
        expect(toDateInputValue('2024-03-15T10:30:00.000Z')).toBe('2024-03-15');
    });

    it('returns an empty string for undefined or null', () => {
        expect(toDateInputValue(undefined)).toBe('');
        expect(toDateInputValue(null)).toBe('');
    });
});

describe('getAvatarColor', () => {
    it('cycles through the palette by id', () => {
        expect(getAvatarColor(0)).toEqual({ bg: 'bg-teal-200', text: 'text-teal-800' });
        expect(getAvatarColor(1)).toEqual({ bg: 'bg-blue-200', text: 'text-blue-800' });
    });

    it('wraps around once the id exceeds the palette length', () => {
        expect(getAvatarColor(6)).toEqual(getAvatarColor(0));
        expect(getAvatarColor(7)).toEqual(getAvatarColor(1));
    });
});

describe('getLastVisitDate', () => {
    it('formats the date using the "Mon D" Intl format', () => {
        const lastVisit = '2024-03-05T12:00:00.000Z';
        const expected = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
            new Date(lastVisit),
        );
        expect(getLastVisitDate(lastVisit)).toBe(expected);
    });
});

describe('getDocumentPreview', () => {
    it('strips bullets, ALL-CAPS headings, and "Label: value" metadata lines, then joins the remaining prose', () => {
        const content = [
            'PATIENT SUMMARY',
            'Fecha: 2024-03-15',
            '- Patient reports mild fever and cough for three days.',
            '- No shortness of breath noted.',
            'Blood pressure remains stable throughout observation.',
        ].join('\n');

        expect(getDocumentPreview(content)).toBe(
            'Patient reports mild fever and cough for three days. No shortness of breath noted. Blood pressure remains stable throughout observation.',
        );
    });

    it('truncates at a word boundary and appends an ellipsis when the content exceeds maxLength', () => {
        const content = 'This is a really long line of text that will definitely exceed the max length limit.';
        expect(getDocumentPreview(content, 20)).toBe('This is a really…');
    });

    it('falls back to the raw collapsed content when every line gets filtered out', () => {
        const content = 'SUMMARY\nFecha: 2024-03-15\nPaciente: John Doe';
        expect(getDocumentPreview(content)).toBe('SUMMARY Fecha: 2024-03-15 Paciente: John Doe');
    });
});

describe('formatTime', () => {
    it('pads minutes and seconds under 10', () => {
        expect(formatTime(5)).toBe('00:05');
    });

    it('formats minutes and seconds at or above 10 without extra padding', () => {
        expect(formatTime(65)).toBe('01:05');
        expect(formatTime(600)).toBe('10:00');
    });
});

describe('getSupportedAudioMimeType', () => {
    it('returns an empty string when MediaRecorder is unavailable (as in jsdom)', () => {
        expect(getSupportedAudioMimeType()).toBe('');
    });
});

describe('getAudioExtension', () => {
    it('maps known mime types to their extension, ignoring codec suffixes', () => {
        expect(getAudioExtension('audio/webm;codecs=opus')).toBe('webm');
        expect(getAudioExtension('audio/mp4')).toBe('mp4');
        expect(getAudioExtension('audio/ogg;codecs=opus')).toBe('ogg');
    });

    it('falls back to webm for an unrecognized mime type', () => {
        expect(getAudioExtension('audio/unknown-format')).toBe('webm');
    });
});

import { isAxiosError } from 'axios';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown) {
    let message = 'Login failed';
    if (isAxiosError(error)) {
        message = error.response?.data?.error || error.message;
    }
    return message;
}

export function parseDateOnly(date: string): Date {
    const [year, month, day] = date.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
}

export function getAgeFromDOB(dateOfBirth: string): number {
    const birthDate = parseDateOnly(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

export function getDOBFromAge(age: number): string {
    return `${new Date().getFullYear() - age}-01-01`;
}

export function toDateInputValue(date: string | undefined | null): string {
    return date ? date.slice(0, 10) : '';
}

export const getAvatarColor = (id: number) => {
    const colors = [
        { bg: 'bg-teal-200', text: 'text-teal-800' },
        { bg: 'bg-blue-200', text: 'text-blue-800' },
        { bg: 'bg-purple-200', text: 'text-purple-800' },
        { bg: 'bg-rose-200', text: 'text-rose-800' },
        { bg: 'bg-amber-200', text: 'text-amber-800' },
        { bg: 'bg-emerald-200', text: 'text-emerald-800' },
    ];
    return colors[id % colors.length];
};

export const getLastVisitDate = (lastVisit: string) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    }).format(new Date(lastVisit));
};

export function getDocumentPreview(content: string, maxLength = 160): string {
    const collapse = (text: string) => text.replace(/\s+/g, ' ').trim();

    const prose = content
        .split('\n')
        .map((line) => line.replace(/^[-•*]\s*/, '').trim())
        .filter((line) => line.length > 0)
        .filter((line) => line !== line.toUpperCase()) // drop the title + ALL-CAPS section headings
        .filter((line) => !/^[\p{L} ]{1,25}:\s*\S/u.test(line)) // drop "Fecha: ...", "Paciente: ..." metadata
        .join(' ');

    const summary = collapse(prose) || collapse(content);
    if (summary.length <= maxLength) return summary;

    return summary.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

export const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
    const secondsLefts = (seconds % 60).toString().padStart(2, '0');

    return `${minutes}:${secondsLefts}`;
};

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const AUDIO_MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];

const AUDIO_MIME_EXTENSIONS: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/mp4': 'mp4',
    'audio/ogg': 'ogg',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
};

// falls back to the browser default
export const getSupportedAudioMimeType = (): string => {
    if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return '';

    return AUDIO_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
};

export const getAudioExtension = (mimeType: string): string => {
    const baseType = mimeType.split(';')[0].trim().toLowerCase();
    return AUDIO_MIME_EXTENSIONS[baseType] ?? 'webm';
};

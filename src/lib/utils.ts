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

export function getAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
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
    return new Intl.DateTimeFormat('en-US-', {
        month: 'short',
        day: 'numeric',
    }).format(new Date(lastVisit));
};

export const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
    const secondsLefts = (seconds % 60).toString().padStart(2, '0');

    return `${minutes}:${secondsLefts}`;
};

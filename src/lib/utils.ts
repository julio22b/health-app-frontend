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

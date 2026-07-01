import { LoadingSpinner } from './LoadingSpinner';

export default function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm'>
            <div className='flex flex-col items-center gap-2'>
                <LoadingSpinner size={48} className='text-primary' />
                <p className='text-sm font-medium'>{message}</p>
            </div>
        </div>
    );
}

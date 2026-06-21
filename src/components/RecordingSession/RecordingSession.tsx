import { ArrowLeft, Bookmark, InfoIcon, Mic, Pause, Square } from 'lucide-react';
import { Button } from '../ui/button';
import { useLocation, useNavigate } from 'react-router';
import type { DocumentType, Patient, RecordingStatus } from '@/types/types';
import { useEffect, useRef, useState } from 'react';
import { DOCUMENT_TYPES, RECORDING_STATUSES } from '@/app/constants';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { formatTime } from '@/lib/utils';

const RecordingSession = () => {
    const [documentType, setDocumentType] = useState<DocumentType>(DOCUMENT_TYPES.MEDICAL_HISTORY.value);
    const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>(RECORDING_STATUSES.idle);
    const [timer, setTimer] = useState<number>(0);
    const navigate = useNavigate();
    const location = useLocation();
    const patient = location.state.patient as Patient | null;
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isRecording = recordingStatus === RECORDING_STATUSES.recording;

    useEffect(() => {
        if (recordingStatus === RECORDING_STATUSES.recording) {
            timerRef.current = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }

        return () => {
            clearInterval(timerRef.current ?? undefined);
        };
    }, [recordingStatus]);

    const pauseTimer = () => {
        clearInterval(timerRef.current ?? undefined);
    };

    const stopTimer = () => {
        clearInterval(timerRef.current ?? undefined);
        setTimer(0);
    };

    const startRecording = (stream: MediaStream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (ev) => {
            if (ev.data.size > 0) {
                audioChunksRef.current.push(ev.data);
            }
        };

        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            console.log(audioUrl);
        };

        mediaRecorderRef.current.start();
        setRecordingStatus(RECORDING_STATUSES.recording);
        console.log('recoding started');
    };

    const requestMicPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            startRecording(stream);
        } catch (error) {
            if (error instanceof DOMException) {
                if (error.name === 'NotAllowedError') {
                    console.log(error, 'User or system denied mic access');
                } else if (error.name === 'NotFoundError') {
                    console.log(error, 'No microphone found');
                } else {
                    console.log(`Media error: ${error.name} - ${error.message}`);
                }
            } else {
                console.log('Unknown error:', error);
            }
        }
    };

    const pauseRecording = () => {
        mediaRecorderRef.current?.pause();
        pauseTimer();
        setRecordingStatus(RECORDING_STATUSES.paused);
        console.log('recording paused');
    };

    const resumeRecording = () => {
        mediaRecorderRef.current?.resume();
        setRecordingStatus(RECORDING_STATUSES.recording);
        console.log('recording resumed');
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        stopTimer();
        setRecordingStatus(RECORDING_STATUSES.done);
        console.log('recording stopped');
    };

    return (
        <section className='flex flex-col p-4 gap-6'>
            <header className='flex items-center justify-between'>
                <Button variant='outline' size='icon' className='rounded-full' onClick={() => navigate(-1)}>
                    <ArrowLeft />
                </Button>
                <div>
                    <h1 className='text-sm tracking-wider text-center text-muted-foreground'>Recording Session</h1>
                    <p className='font-bold text-center'>{patient && patient.name}</p>
                </div>
                <InfoIcon />
            </header>
            <ToggleGroup
                onValueChange={(value: DocumentType) => setDocumentType(value || documentType)}
                value={documentType}
                variant='outline'
                size='lg'
                type='single'
                className='flex justify-between w-full bg-gray-200 p-1.5 **:data-[state=on]:bg-blue-500 **:data-[state=on]:text-white **:data-[state=on]:shadow-md **:data-[state=on]:scale-105 **:data-[state=on]:font-semibold'
            >
                {Object.values(DOCUMENT_TYPES).map(({ value, label }) => (
                    <ToggleGroupItem className='tracking-wider' value={value} key={value}>
                        {label}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
            <canvas className='w-full h-80 border-2 my-6'></canvas>
            <p className='font-bold text-3xl text-center'>{formatTime(timer)}</p>
            {isRecording ? (
                <p className='font-semibold text-green-600 text-center'>Capturing active</p>
            ) : (
                <p className='font-semibold text-gray-500 text-center'>Not capturing</p>
            )}
            <div className='flex justify-around items-center'>
                <Button
                    className='size-14 bg-white rounded-full shadow-2xl'
                    onClick={pauseRecording}
                    disabled={!isRecording}
                >
                    <Pause className='size-7 fill-black text-black' />
                </Button>
                <Button
                    className={`size-24 rounded-full bg-gray-500 shadow-2xl ${isRecording ? 'bg-blue-500 animate-pulse' : ''}`}
                    onClick={() => {
                        if (recordingStatus === RECORDING_STATUSES.recording) return stopRecording();
                        if (recordingStatus === RECORDING_STATUSES.paused) return resumeRecording();
                        return requestMicPermission();
                    }}
                >
                    {isRecording ? <Square className='size-12' /> : <Mic className='size-12' />}
                </Button>
                <Button
                    className='size-14 bg-white rounded-full shadow-2xl'
                    disabled={recordingStatus === RECORDING_STATUSES.idle}
                >
                    <Bookmark className='size-7 fill-black text-black' />
                </Button>
            </div>
        </section>
    );
};

export default RecordingSession;

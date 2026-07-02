import { ArrowUp, Mic, Pause, Trash } from 'lucide-react';
import { Button } from '../ui/button';
import { useLocation, useNavigate } from 'react-router';
import type { Consultation, Document, DocumentType, Patient, RecordingStatus } from '@/types/types';
import { useEffect, useRef, useState } from 'react';
import { DOCUMENT_TYPES, RECORDING_STATUSES } from '@/app/constants';
import { ROUTES } from '@/routes';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { formatTime } from '@/lib/utils';
import {
    createConsultation,
    processConsultation,
    updateConsultationAudio,
} from '@/features/consultations/consultationsSlice';
import { useAppDispatch } from '@/app/hooks';
import { toast } from 'sonner';
import ProcessingRecording from './ProcessingRecording';
import PatientHeader from '../common/PatientHeader';

const RecordingSession = () => {
    const [documentType, setDocumentType] = useState<DocumentType>(DOCUMENT_TYPES.MEDICAL_HISTORY.value);
    const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>(RECORDING_STATUSES.idle);
    const [timer, setTimer] = useState<number>(0);
    const [isConsultationCreated, setIsConsultationCreated] = useState(false);
    const [isConsultationProcessed, setIsConsultationProcessed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { patient, existingConsultation } = (location.state || {}) as {
        patient: Patient;
        existingConsultation?: Consultation;
    };
    // recording and canvas ref
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const audioBlobRef = useRef<Blob | null>(null);
    //
    const createdConsultationRef = useRef<Consultation | null>(null);
    const createdDocumentRef = useRef<Document | null>(null);
    const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dispatch = useAppDispatch();
    const isRecording = recordingStatus === RECORDING_STATUSES.recording;
    const isPaused = recordingStatus === RECORDING_STATUSES.paused;
    const isIdle = recordingStatus === RECORDING_STATUSES.idle;
    const isProcessing = recordingStatus === RECORDING_STATUSES.processing;
    const isDone = recordingStatus === RECORDING_STATUSES.done;
    const time = formatTime(timer);

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


    const startDrawLoop = () => {
        if (!analyserRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const dpr = window.devicePixelRatio || 1;
        const cssWidth = canvas.clientWidth;
        const cssHeight = canvas.clientHeight;
        canvas.width = cssWidth * dpr;
        canvas.height = cssHeight * dpr;

        const barCount = 55;
        const barWidth = 6;
        const gap = 5;
        const totalWidth = barCount * (barWidth + gap) - gap;
        const startX = (cssWidth - totalWidth) / 2;
        const centerY = cssHeight / 2;
        const maxBarHalfHeight = cssHeight * 0.42;
        const minBarHalfHeight = 3;
        const step = Math.floor(bufferLength / barCount);
        const radius = barWidth / 2;

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyserRef.current!.getByteFrequencyData(dataArray);

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, cssWidth, cssHeight);
            ctx.fillStyle = '#2563eb';

            for (let i = 0; i < barCount; i++) {
                const value = dataArray[i * step] / 255;
                const halfHeight = Math.max(minBarHalfHeight, value * maxBarHalfHeight);
                const x = startX + i * (barWidth + gap);
                const y = centerY - halfHeight;
                const height = halfHeight * 2;

                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, height, radius);
                ctx.fill();
            }
        };
        draw();
    };

    const drawWaveform = (stream: MediaStream) => {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        startDrawLoop();
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
            audioBlobRef.current = audioBlob;
            dispatchConsultation(audioBlob, existingConsultation?.id);
        };

        mediaRecorderRef.current.start();
        setRecordingStatus(RECORDING_STATUSES.recording);
        drawWaveform(stream);
    };

    const requestMicPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            startRecording(stream);
        } catch (error) {
            if (error instanceof DOMException) {
                if (error.name === 'NotAllowedError') {
                    toast.error('User or system denied mic access');
                } else if (error.name === 'NotFoundError') {
                    toast.error('No microphone found');
                } else {
                    toast.error(`Media error: ${error.name} - ${error.message}`);
                }
            } else {
                toast.error(`Unknown error: ${error}`);
            }
        }
    };

    const pauseRecording = () => {
        mediaRecorderRef.current?.pause();
        pauseTimer();
        setRecordingStatus(RECORDING_STATUSES.paused);
        cancelAnimationFrame(animationFrameRef.current!);
    };

    const resumeRecording = () => {
        mediaRecorderRef.current?.resume();
        setRecordingStatus(RECORDING_STATUSES.recording);
        startDrawLoop();
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        pauseTimer();
        setRecordingStatus(RECORDING_STATUSES.processing);
        cancelAnimationFrame(animationFrameRef.current!);
        canvasRef.current
            ?.getContext('2d')
            ?.clearRect(0, 0, canvasRef.current?.width ?? 0, canvasRef.current?.height ?? 0);
    };

    useEffect(() => {
        return () => {
            if (doneTimerRef.current !== null) clearTimeout(doneTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (isDone && createdConsultationRef.current !== null && createdDocumentRef.current !== null) {
            navigate(ROUTES.CONSULTATION_REVIEW.replace(':id', String(createdConsultationRef.current.id)), {
                state: {
                    patient,
                    documentType,
                    consultation: createdConsultationRef.current,
                    document: createdDocumentRef.current,
                },
            });
        }
    }, [isDone, navigate]);

    const dispatchConsultation = async (blob: Blob, existingConsultationId?: number) => {
        if (!patient) return;

        setIsConsultationCreated(false);
        setIsConsultationProcessed(false);

        const formData = new FormData();
        formData.append('patientId', patient.id.toString());
        formData.append('audioFile', blob, 'consultation.webm');
        try {
            let consultationId: number;
            if (existingConsultationId) {
                consultationId = (
                    await dispatch(
                        updateConsultationAudio({ consultationId: existingConsultationId, formData }),
                    ).unwrap()
                ).id;
            } else consultationId = (await dispatch(createConsultation(formData)).unwrap()).id;

            setIsConsultationCreated(true);

            const { consultation, document } = await dispatch(
                processConsultation({ consultationId, documentType }),
            ).unwrap();

            setIsConsultationProcessed(true);

            createdConsultationRef.current = consultation;
            createdDocumentRef.current = document;
            doneTimerRef.current = setTimeout(() => setRecordingStatus(RECORDING_STATUSES.done), 2000);
        } catch (error) {
            // add error handling, the loader should show which step failed
            setRecordingStatus(RECORDING_STATUSES.idle);
            console.log('error', error);
        }
    };

    const onSubmit = () => {
        if (!patient) {
            toast.error('Patient not found');
            return;
        }
        stopRecording();
    };

    const discardRecording = () => {
        pauseRecording();
        audioBlobRef.current = null;
        audioChunksRef.current = [];
        mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
        setRecordingStatus(RECORDING_STATUSES.idle);
        setIsConsultationProcessed(false);
        if (doneTimerRef.current !== null) clearTimeout(doneTimerRef.current);
        setTimer(0);
        const canvas = canvasRef.current;
        if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <section className='flex flex-col p-4 gap-4'>
            {patient && <PatientHeader patient={patient} />}
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
            <div className='relative my-1'>
                <canvas ref={canvasRef} className='w-full h-70 border bg-white rounded-lg'></canvas>
                {!isRecording && !isPaused && !isProcessing && (
                    <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                        <Mic className='size-10 opacity-20' />
                        <p className='text-black font-medium'>Ready when you are</p>
                        <p className='text-sm w-70 text-center'>
                            Tap the microphone to capture the visit. When you’re done, send the audio and we’ll draft
                            the document for you.
                        </p>
                    </div>
                )}
                {(isProcessing || isConsultationProcessed) && (
                    <ProcessingRecording
                        documentType={documentType}
                        isConsultationCreated={isConsultationCreated}
                        isConsultationProcessed={isConsultationProcessed}
                        time={time}
                    />
                )}
            </div>
            {!isProcessing &&
                (isRecording ? (
                    <div className='flex items-center gap-2 self-center'>
                        <div className='rounded-full size-2 bg-green-600 animate-pulse'></div>
                        <p className='font-semibold text-green-600 text-center'>Recording active</p>
                    </div>
                ) : (
                    <div className='flex items-center gap-2 self-center'>
                        <div className='rounded-full size-2 bg-gray-500'></div>
                        <p className='font-semibold text-gray-500 text-center'>Not recording</p>
                    </div>
                ))}
            {!isProcessing && (
                <p
                    className={`font-bold text-3xl -mt-4 text-center ${isRecording ? 'text-black' : 'text-muted-foreground'}`}
                >
                    {time}
                </p>
            )}
            <div className='flex justify-around items-center'>
                {!isIdle && !isProcessing && !isDone && (
                    <div>
                        <Button
                            className='size-14 bg-white rounded-full shadow-md shadow-gray-200 border-gray-200'
                            onClick={discardRecording}
                        >
                            <Trash className='size-7 text-red-500' />
                        </Button>
                        <p className='text-sm text-gray-500 text-center mt-2'>Discard</p>
                    </div>
                )}
                {!isProcessing && (
                    <div>
                        <Button
                            className={`size-24 rounded-full ${!isRecording ? 'bg-blue-500 shadow-blue-400 shadow-md' : 'bg-white shadow-md shadow-gray-200'}`}
                            onClick={() => {
                                if (isRecording) return pauseRecording();
                                if (isPaused) return resumeRecording();
                                return requestMicPermission();
                            }}
                        >
                            {isRecording ? (
                                <Pause className='size-10 text-black fill-black' />
                            ) : (
                                <Mic className='size-10' />
                            )}
                        </Button>
                        <p className='text-sm text-gray-500 text-center mt-2'>
                            {isRecording ? 'Pause' : 'Start recording'}
                        </p>
                    </div>
                )}
                {!isIdle && !isProcessing && !isDone && (
                    <div>
                        <Button
                            className='size-14 bg-green-600 rounded-full shadow-md shadow-green-400 text-white text-xs font-semibold border-gray-200'
                            disabled={!isPaused}
                            onClick={onSubmit}
                        >
                            <ArrowUp className='size-7' />
                        </Button>
                        <p className='text-sm text-gray-500 text-center mt-2'>Send</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default RecordingSession;

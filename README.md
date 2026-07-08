# MiloScribe

**A mobile-first clinical AI assistant that turns doctor–patient consultations into structured medical documents.**

MiloScribe records a consultation, transcribes it, and generates a formatted clinical document: a medical history, progress note, or discharge summary that the physician can review, edit, and save. It was built to solve a real documentation burden for a surgeon in a Venezuelan hospital, and its design decisions were shaped directly by his day-to-day workflow.

> **This is the frontend repository.** The API and AI processing live in the [backend repository](https://github.com/julio22b/health-app-backend).

---

## Why this project exists

Physicians spend a large share of their day writing documentation instead of seeing patients. A surgeon I worked with described dictating the same structured notes repeatedly by hand. MiloScribe lets him speak naturally during or after a visit and get a properly formatted clinical document back — one that follows the conventions his hospital actually uses, not a generic template.

---

## Core workflow

1. The physician selects an existing patient or creates one inline for a quick recording.
2. They pick the document type (medical history, progress note, discharge summary).
3. They record the consultation. Audio is captured in the browser with a live waveform visualization.
4. On submit, the audio is uploaded and processed by the backend, which returns a structured clinical document.
5. The physician reviews and edits the generated document, then saves or re-records it to regenerate.

---

## Screenshots & demo

<img src="/docs/screenshots/patients-screen.png" alt="patients screen" width="300" />
<img src="/docs/screenshots/recording.png" alt="recording screen" width="300" />
<img src="/docs/screenshots/review.png" alt="review screen" width="300" />

---

## Tech stack

- **React + TypeScript + Vite**
- **Redux Toolkit**
- **shadcn/ui + Tailwind CSS**
- **Web Audio API** (`MediaRecorder` + `AnalyserNode`) for recording and real-time waveform rendering on `<canvas>`
- **React Router**

---

## Frontend engineering highlights

**Real-time audio waveform.** The recording screen captures microphone input via `MediaRecorder` and visualizes it live by reading frequency data from an `AnalyserNode` and drawing bars on a canvas inside a `requestAnimationFrame` loop with correct handling of device pixel ratio, pause/resume, and animation cleanup.

**Inline patient creation.** The "quick record" flow lets a physician create a patient and record in one screen, resolving the new patient's ID before the consultation is created, useful when the user wants speed above all.

**Multi-step async flow with meaningful feedback.** Submitting a recording chains patient creation (if needed), audio upload, and AI processing, surfacing which step is in progress rather than a generic spinner.

**Resilient re-record flow.** A generated document can be discarded and re-recorded against the same consultation, uploading fresh audio and regenerating without orphaning data.

---

## Local development

```bash
npm install
# set up .env with VITE_API_URL pointing at the backend
npm run dev
```

The backend must be running for the app to function — see the [backend repository](https://github.com/julio22b/health-app-backend) for its setup.

---

## Acknowledgements

Clinical guidance and real-world testing by a general surgery resident whose feedback shaped the document structures, the physical-exam conventions, and the scope of each document type. Named after Milo, my dog.

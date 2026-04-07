# Meet2Action: AI-Powered Meeting Analysis for Actionable Insights (currently in development stage)

### AI-Driven System for Extracting Structured Actions and Insights from Online Meetings

## Overview

Meet2Action is a local, GPU-accelerated AI system that transforms meeting inputs (audio, video, text) into structured, decision-ready outputs.

Instead of merely summarizing meetings, the system extracts:

-   Core Meeting Intent   
-   Structured Topic-Based Summary   
-   Action Matrix (Task, Assignee, Deadline, Priority)   
-   Project Context Detection   

The system is built with an agent-orchestrated backend and a modern frontend interface, optimized for local inference using Faster-Whisper and Ollama.

------------------------------------------------------------------------

## System Architecture

    Meeting Input (Audio / Text)
            ↓
    Faster-Whisper (GPU ASR - CUDA float16)
            ↓
    Transcript
            ↓
    Summarizer Agent (Hybrid: Ollama / Gemini)
            ↓
    Strict JSON Output / Interactive Clarity Enhancement
            ↓
    Response Mapper
            ↓
    Frontend Rendering

------------------------------------------------------------------------

## Key Features

-   GPU-accelerated Speech-to-Text using Faster-Whisper (CUDA float16)   
-   Hybrid LLM inference: Local (via Ollama) or Cloud fallback (via Google Gemini)   
-   Interactive Summary Clarity Enhancement with single-click optimization   
-   Strict JSON enforcement and schema validation using Pydantic   
-   Modular agent-orchestration for transcript analysis   
-   Clean React + TypeScript frontend with specialized "MeetAction" metrics   

------------------------------------------------------------------------

## Project Structure

The platform is organized into a clean, modular architecture:

- **`frontend/`**
  - **`src/`**: All source code (UI components, services, context, assets).
  - **`index.html`**: Entry point for the Vite application.
- **`backend/`**
  - **`app/`**: FastAPI implementation (Routers, schemas, services).
  - **`agents/`**: Modular AI agents for processing.
- **Root**
  - **`.env`**: Centralized environment configuration.

------------------------------------------------------------------------

## Tech Stack

### Backend
- **FastAPI**: Modern, high-performance Python-based web framework.
- **Faster-Whisper**: GPU-accelerated speech-to-text (using CTranslate2 backend).
- **Ollama**: Local inference server for models like Qwen 2.5 and Llama 3.
- **Google Generative AI**: SDK for high-speed cloud-based summary refinements (Gemini).
- **Python 3.10+** (tested on Windows/Ubuntu)

### Frontend
- **React 19**: Modern UI library.
- **TypeScript**: Static typing for reliability.
- **Vite 6**: Fast development server and build tool.
- **TailwindCSS**: Premium utility-first styling.
- **Firebase**: Authentication and secure state management.

### Hardware

-   RTX 2050 (4GB VRAM tested)
-   CUDA 12.4 toolkit

------------------------------------------------------------------------

## Performance Benchmarks (Local)

Test Case: 7-minute meeting audio (CUDA-Accelerated RTX 2050)

-   **ASR (Transcription)**: ~42 seconds   
-   **Local LLM (Qwen 7B)**: ~28--30 seconds   
-   **Cloud LLM (Gemini)**: ~2--5 seconds   
-   **Total end-to-end processing**: ~70--75 seconds (Local) / < 50 seconds (Hybrid)

------------------------------------------------------------------------

## Installation Guide

### 1. Clone Repository

```
git clone https://github.com/saaket2006/meet2action-an-intelligent-platform.git
cd meet2action
```

------------------------------------------------------------------------

### 2. Backend Setup

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

#### Install CUDA toolkit for Ctranslate2 (version 4.7.x):

Download from: https://developer.nvidia.com/cuda-12-4-0-download-archive

#### Install Faster-Whisper:

```
pip install faster-whisper
```

------------------------------------------------------------------------

### 3. Install Ollama

Download from: https://ollama.com

Pull Qwen model:

```
ollama pull qwen2.5:7b
```

(Optional lighter model)

```
ollama pull qwen2.5:3b
```

------------------------------------------------------------------------

### 4. Run Backend

```
uvicorn app.main:app --reload
```

API Docs: http://127.0.0.1:8000/docs

------------------------------------------------------------------------

### 5. Run Frontend

```
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

------------------------------------------------------------------------

### 6. Environment Configuration

Create a `.env` file in the root directory for full functionality:

```bash
# --- LLM Options ---
# Set to "true" to force use of Ollama even if Gemini key is present
USE_OLLAMA=false 

# Required for Gemini Cloud Fallback / Fast Enhancement
GOOGLE_AI_API_KEY=your_google_api_key_here

# --- Other Vars ---
# (Add any additional Firebase or storage configurations here)
```

------------------------------------------------------------------------

### 7. CUDA Optimization Note

For maximum speed on NVIDIA GPUs, ensure:
1. CUDA Toolkit 12.4+ is installed.
2. The backend is correctly detecting your GPU (should see `Initializing Faster-Whisper model on GPU (cuda)...` in logs).
3. `zlibwapi.dll` is in your system path (if running on Windows).

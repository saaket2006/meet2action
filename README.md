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
    Faster-Whisper (GPU ASR)
            ↓
    Transcript
            ↓
    Qwen 7B (Ollama)
            ↓
    Strict JSON Output
            ↓
    Response Mapper
            ↓
    Frontend Rendering

------------------------------------------------------------------------

## Key Features

-   GPU-accelerated Speech-to-Text using Faster-Whisper   
-   Local LLM inference via Ollama (Qwen 2.5 7B / 3B)   
-   Strict JSON enforcement from LLM   
-   Markdown stripping and structured validation   
-   Modular agent-based backend architecture   
-   Clean React + TypeScript frontend   

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
- **FastAPI**: Modern, high-performance web framework.
- **Faster-Whisper**: GPU-accelerated speech-to-text (CTranslate2).
- **Ollama**: Local LLM inference (Qwen 2.5 7B/3B).
- **Python 3.10+**

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

Test Case: 7-minute meeting audio

-   Faster-Whisper (GPU): ~42 seconds   
-   Qwen 7B inference: ~28--30 seconds   
-   Total end-to-end processing: ~70--75 seconds

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

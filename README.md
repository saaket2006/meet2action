# Meet2Action  
### A Decision-Centric Agent-Orchestrated System for Extracting Actionable Insights from Meetings

Meet2Action is a multi-agent AI platform that transforms meeting inputs (audio, video, transcript, or raw text) into structured, decision-centric actionable insights.

Unlike traditional meeting summarization tools, Meet2Action focuses on extracting decisions, action items, owners, deadlines, and reasoning — making meetings executable rather than just summarized.

---

## 🚀 Problem Statement

Most existing tools:
- Generate summaries but do not extract executable actions
- Extract action items without full system-level integration
- Treat ASR, summarization, and task extraction as fragmented pipelines
- Provide limited explainability

Meet2Action addresses these gaps by orchestrating specialized AI agents that collaborate to convert meetings into structured decision intelligence.

---

## 🧠 System Overview

Meet2Action follows a multi-agent architecture where each agent handles a specialized responsibility:

1. **Input Processing Agent**
   - Accepts audio, video, or text
   - Performs ASR (if required)
   - Normalizes and cleans transcripts

2. **Summarization Agent**
   - Generates structured meeting summaries
   - Identifies key discussion themes

3. **Decision Extraction Agent**
   - Detects explicit and implicit decisions
   - Classifies decision types

4. **Action Item Agent**
   - Extracts tasks
   - Assigns owners
   - Detects deadlines (if mentioned)

5. **Explainability Agent**
   - Links outputs back to transcript segments
   - Provides reasoning traces

6. **Output Structuring Agent**
   - Formats results into structured JSON / UI-friendly format

---

## 🔁 Workflow

Input (Audio/Video/Text)  
→ Transcription (if needed)  
→ Multi-Agent Processing  
→ Decision & Action Structuring  
→ Explainable Output  

---

## 🛠️ Technologies Used

- Python
- Streamlit (Frontend)
- LLM APIs (pluggable inference backend)
- ASR Models (for audio/video input)
- LangChain (optional orchestration)
- JSON-based structured output pipeline

---

## 📦 Features

- 🎙 Multi-format input (audio, video, transcript, text)
- 🧾 Structured summary generation
- ✅ Decision extraction
- 📌 Action item identification
- 👤 Owner and deadline detection
- 🔍 Explainable outputs
- 🧩 Modular agent architecture
- 🔄 Swappable LLM backend

---

## 🏗️ Architecture Design Principles

- Agent-Oriented Design
- Modular and Replaceable Components
- Structured Output Enforcement
- Explainability-first approach
- Backend-agnostic LLM integration

}


# 🌿 HerbaScan: AI-Powered Botanical Intelligence

[![MERN](https://img.shields.io/badge/Stack-MERN-green.svg)](https://mongodb.com)
[![TensorFlow](https://img.shields.io/badge/AI-TensorFlow-orange.svg)](https://tensorflow.org)
[![React](https://img.shields.io/badge/Frontend-React%2019-blue.svg)](https://react.dev)

HerbaScan is a high-performance, full-stack application designed to bridge the gap between ancient Ayurvedic knowledge and modern digital accessibility. Utilizing a custom-trained **MobileNetV2 CNN model**, it identifies over 40 species of medicinal plants with high precision and delivers trilingual (EN, HI, KN) traditional remedy intelligence.

---

## 🚀 Key Features

- **Precision Identification**: Deep Learning model trained on 40+ medicinal taxa for visual marker recognition.
- **Trilingual Intelligence**: Comprehensive botanical data available in English, Hindi, and Kannada.
- **Neural Feature Extraction**: Visualizes CNN confidence scores and identified morphological markers.
- **Persistent Personal Library**: Archive identification results to a local MongoDB collection for future reference.
- **Functional Export**: Stylized trilingual report generation in PDF and high-resolution JPG snapshots.
- **Progressive Web App (PWA)**: Installable interface with offline caching for remote botanical research.
- **Neural Remedy Search**: Condition-based search targeting the trilingual remedy database.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 with Vite for ultra-fast HMR.
- **Styling**: Tailwind CSS 4.0 with customized "Nature-Tech" aesthetics.
- **Animations**: Framer Motion for premium 3D perspective transitions.
- **Utilities**: Lucide React (Icons), html2canvas & jsPDF (Exporting).

### Backend
- **Server**: Node.js 22 with Express.
- **Database**: MongoDB Atlas (Persisting trilingual botanical datasets and user history).
- **AI Inference**: Python 3.x bridge utilizing TensorFlow/Keras for real-time image prediction.

---

## 📂 Repository Structure

```text
├── backend/
│   ├── models/       # Mongoose Schemas (Plant, SavedSpecimen, Archive)
│   ├── scripts/      # Python inference scripts and DB seeding
│   ├── uploads/      # Temporary processing directory (GitIgnored)
│   └── index.js      # Main Express entry point
├── frontend/
│   ├── public/       # PWA Manifest and assets
│   ├── src/          # React components, services, and hooks
│   └── index.html    # PWA Entry
├── .gitignore        # Comprehensive exclusion rules
├── .env.example      # Environment baseline templates
└── package.json      # Monorepo management via concurrently
```

---

## ⚙️ Quick Start

### 1. Database Setup
Ensure you have a MongoDB instance running or a MongoDB Atlas URI. Use the provided trilingual seed script in the backend if needed.

### 2. Environment Configuration
Clone the `.env.example` files in both `backend/` and `frontend/` to `.env` and provide your specific credentials.

### 3. Execution
From the root directory:
```bash
npm install
npm run dev
```
*The root script uses `concurrently` to launch both services in parallel.*

---

## ⚖️ Disclaimer
*All botanical and medicinal information is derived from traditional ethnobotanical records for educational purposes. Always consult with a clinical practitioner before medicinal intervention.*

---
**Developed with focus on Scalable MERN + AI Architecture.**

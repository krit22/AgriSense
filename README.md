<img width="581" height="681" alt="image" src="https://github.com/user-attachments/assets/9076daab-39c9-482b-853a-7d87d6019c04" /># 🌿 AI Object Scanner MVP

A blazing fast, real-time AI scanner built for the web. This MVP leverages **TensorFlow.js** and a custom **Teachable Machine** model to identify objects directly in the browser—no backend required.

<!-- You can replace this placeholder with a banner image if you have one -->
<!-- ![Project Banner](./screenshots/banner.png) -->

> **Note:** This project is currently configured as a prototype (e.g., tomato plant disease detection), but the logic can be easily adapted for any image classification task.

## ✨ Features

- **Real-time Classification**: Instant feedback using WebGL-accelerated inference.
- **Smart Scanning Logic**: Includes confidence thresholds and stability timers (scan for 3s) to prevent flickering results.
- **Sleek UI**: Cyberpunk-inspired scanner overlay with CSS animations and responsive design.
- **Privacy First**: All processing happens client-side; video streams never leave the user's device.
- **Mobile Ready**: Optimized for mobile browsers with facing-mode controls.

## 📸 Screenshots

<img width="581" height="681" alt="image" src="https://github.com/user-attachments/assets/5b7d256c-a592-4d84-b485-1825c4323b39" />
<img width="777" height="322" alt="image" src="https://github.com/user-attachments/assets/686a8e11-0853-475c-9267-cedd342c166e" />
<img width="478" height="550" alt="image" src="https://github.com/user-attachments/assets/eb7eeccd-808c-463f-9f80-a75faf497ae8" />
  

## 🚀 How It Works

1.  **Camera Feed**: The app accesses the webcam via `navigator.mediaDevices`.
2.  **Inference Loop**: `requestAnimationFrame` drives a loop that passes video frames to the **Teachable Machine** model.
3.  **State Machine**:
    *   **Scanning**: Checks for high confidence (>85%) on non-background classes.
    *   **Locking**: If a specific class is detected consistently for 3 seconds, the scanner locks.
    *   **Result**: Displays the classification and hardcoded advice (MVP feature).

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/tm-scanner-mvp.git
    cd tm-scanner-mvp
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  Open `http://localhost:5173` in your browser.

## ⚙️ Configuration

### Changing the AI Model

To use your own model trained on [Teachable Machine](https://teachablemachine.withgoogle.com/):

1.  Train an Image Project on Teachable Machine.
2.  Upload it to generate a shareable link (e.g., `https://teachablemachine.withgoogle.com/models/AbCdEfG/`).
3.  Open `constants.ts` in the project root.
4.  Update the URL:

```typescript
// constants.ts
export const TM_MODEL_URL = 'https://teachablemachine.withgoogle.com/models/YOUR_NEW_MODEL_ID/';
```

### Customizing Advice

Currently, the advice (Action Plan) is hardcoded for the MVP demonstration.
To change the text, edit the `HARDCODED_SOLUTION` object in `components/CameraView.tsx`.

## 💻 Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **ML Engine**: TensorFlow.js
- **Model Loader**: @teachablemachine/image

## 📄 License

MIT License. Free to use for educational and prototype purposes.

# Get Your Earth: Your Mobile Earth Science Exploration Hub

## Overview

Explore the world around you, from the clouds in the sky to the rocks beneath your feet.

Get Your Earth is an innovative web application designed to make Earth science accessible and engaging using your smartphone and cutting-edge AI technology. It goes beyond simple data display, leveraging Gemini API and Teachable Machine for intelligent analysis and Three.js for high-quality 3D visualization.

This project is currently available on iOS, Android, and the Web.

**GitHub Repository:** [https://github.com/lmwmason/GetYourEarth.git](https://github.com/lmwmason/GetYourEarth.git)

## 🌍 Core Services

Get Your Earth guides your Earth science exploration through four specialized "Lens" services.

| Service Name | Description | Key Technology |
|--------------|-------------|----------------|
| **Cloud Lens** | Learn about the clouds you see. Simply take a picture, and the app identifies the cloud type and provides detailed scientific explanations. | Teachable Machine Image Classification AI |
| **Know Weather** | Get a scientific explanation of your local weather, from humidity to wind speed. It provides in-depth analysis beyond a basic forecast. | Gemini API for weather data analysis and scientific text generation |
| **Rock Lens** | Discover the geology around you. Take a picture of a rock to find out what it is and learn about its geological background and features. | Gemini API for rock image analysis and expert text generation |
| **Watch Planet** | Explore the solar system in 3D. Click on a planet to learn its structure, characteristics, and key scientific facts. | Three.js for high-performance 3D planet simulation |

## 🛠 Tech Stack

This project is built using modern frontend frameworks combined with powerful AI and 3D rendering libraries.

- **Frontend & Structure:** React / TypeScript (TSX)
- **AI & Data Analysis:**
  - **Gemini API:** Utilized for complex data analysis and generating expert-level textual explanations in Know Weather and Rock Lens.
  - **Teachable Machine:** Used to build the custom image classification model that powers Cloud Lens.
- **3D Visualization:** Three.js
- **Deployment:** Vercel
  - Provides fast, reliable CDN-based deployment and hosting.

## ⚙️ Installation

Follow these steps to set up and run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/lmwmason/GetYourEarth.git

#If you want to use GetYourEarth
cd get_your_earth

#If you want to use introducing GetYourEarth
cd get_your_earth_introduce/get-your-earth-homepage
```

### 2. Install Dependencies

```bash
# If using npm
npm install
```

### 3. Set Environment Variables

You must configure the API key in a `.env` file. The Gemini API key is required.

```bash
# .env.local
# Gemini API Key (Used in Know Weather and Rock Lens)
REACT_APP_GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Note: The CloudLens model URL is hardcoded in the application.
```

### 4. Run the Development Server

```bash
# If using npm
npm run start
# or
npm run dev
```

The application will be available at `http://localhost:3000` (or the specified port).

## 💡 Motivation and Goal

> "We believe everyone can be an Earth scientist."

This project was initiated to revolutionize the process of gaining knowledge through direct exploration and visualization. By integrating the powerful analytical capabilities of the Gemini API with the visualization prowess of Three.js, our goal is to bring theoretical Earth science knowledge into a practical, real-world context. Get Your Earth aims to cultivate curiosity and enhance scientific literacy among students and the general public.

## 🔗 Live Links

| Type | URL |
|------|-----|
| GitHub Repository | https://github.com/lmwmason/GetYourEarth.git |
| Main App (Demo) | https://get-your-earth.vercel.app/ |
| Landing Page (Introduction) | https://introducing-get-your-earth.vercel.app/ |

---

**Meet GetYourEarth now**  
Available on iOS, Android, and the Web.

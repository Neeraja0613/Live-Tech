# LIVE TECH 

### Your Real-Time AI Innovation Feed

LIVE TECH is a futuristic real-time AI tools discovery platform that continuously fetches and displays the latest AI product launches and updates from Product Hunt.

The platform combines:

* Real-time data ingestion
* AI tool discovery
* Modern frontend UI
* Supabase realtime database
* Automated backend pipelines

---

#  Features

##  Authentication

* User Signup & Login
* Supabase Authentication
* Secure session handling

---

## Real-Time AI Feed

* Live AI tool updates
* Instant frontend feed refresh
* Supabase realtime subscriptions

---

##  AI Tool Discovery

* Trending AI tools
* Latest AI launches
* AI categories/topics
* Direct website links

---

##  Automated Data Pipeline

* Product Hunt API scraping
* Continuous backend updates
* Real-time database insertion

---

##  Modern UI/UX

* Futuristic cyberpunk theme
* Glassmorphism cards
* Infinite scrolling
* Animated loaders
* Responsive design

---

# Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Framer Motion
* React Router DOM

---

## Backend

* Python
* Supabase Python SDK
* Product Hunt API
* APScheduler / Realtime polling

---

## Database & Auth

* Supabase PostgreSQL
* Supabase Realtime
* Supabase Authentication

---

# Project Structure

```bash
LiveTech/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── producer.py
│   ├── consumer.py
│   ├── scheduler_realtime.py
│   ├── supabase_client.py
│   ├── requirements.txt
│   └── server.js
│
└── README.md
```

---

# System Architecture

```text
Product Hunt API
        ↓
Python Scraper
        ↓
Backend Processing
        ↓
Supabase Database
        ↓
Supabase Realtime
        ↓
LIVE TECH Frontend Feed
```

---

#  Database Schema

## ai_tools Table

| Column         | Type      |
| -------------- | --------- |
| id             | BIGINT    |
| date           | DATE      |
| name           | TEXT      |
| tagline        | TEXT      |
| description    | TEXT      |
| website        | TEXT      |
| created_at     | TIMESTAMP |
| topics         | TEXT[]    |
| trending_score | FLOAT     |

---

# Frontend Setup

## Navigate to frontend

```bash
cd frontend
```

---

## Install dependencies

```bash
npm install
```

---

## Create `.env`

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL

VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

---

## Run frontend

```bash
npm run dev
```

---

# Backend Setup

## Navigate to backend

```bash
cd backend
```

---

## Install dependencies

```bash
pip install -r requirements.txt
```

---

## Create `.env`

```env
SUPABASE_URL=YOUR_SUPABASE_URL

SUPABASE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

PRODUCTHUNT_TOKEN=YOUR_PRODUCTHUNT_API_TOKEN
```

---

## Run realtime scheduler

```bash
python scheduler_realtime.py
```

---

# Realtime Setup

Enable realtime in Supabase:

```text
Supabase Dashboard
    ↓
Database
    ↓
Replication
    ↓
Enable ai_tools table
```

---

#  Deployment

## Frontend Deployment

Deploy frontend using:

* Vercel

---

## Backend Deployment

Deploy backend using:

* Railway
  or
* Render

---

#  Upcoming Features

* AI-powered recommendations
* Bookmarking tools
* Personalized feeds
* Trending algorithms
* AI chatbot assistant
* Notifications system
* Analytics dashboard
* Email digest automation

---


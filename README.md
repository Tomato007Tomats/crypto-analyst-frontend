# Crypto Analyst Frontend

Modern Next.js frontend for the Crypto Analyst Agent, powered by LangSmith and Deep Agents.

## Features

- 💬 **Chat Interface**: Interactive chat with the AI crypto analyst
- 📊 **Opportunities Dashboard**: Real-time investment opportunities tracking
- 🎨 **Modern UI**: Beautiful gradient design with Tailwind CSS
- ⚡ **Fast**: Built with Next.js 14 and React 18

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `LANGSMITH_API_URL`: Your LangSmith deployment URL
- `LANGSMITH_API_KEY`: Your LangSmith API key
- `NEXT_PUBLIC_API_URL`: Frontend API URL (defaults to `http://localhost:3000`)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `LANGSMITH_API_URL`
   - `LANGSMITH_API_KEY`
   - `NEXT_PUBLIC_API_URL` (set to your Vercel domain)
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes (proxy to LangSmith)
│   │   ├── chat/      # Chat endpoint
│   │   └── opportunities/  # Opportunities endpoint
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page
└── components/
    ├── ChatTab.tsx    # Chat interface component
    └── OpportunitiesTab.tsx  # Opportunities dashboard
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS
- **Icons**: Lucide React
- **HTTP**: Axios
- **Data Fetching**: SWR
- **Backend**: LangSmith Deployment

## License

MIT


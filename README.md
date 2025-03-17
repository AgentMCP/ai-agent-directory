# Welcome to Agent MCP
An open source project directory that solely focusses on ai agents. While we love huggingface we noticed it focussed on LLMs and datasets. Agent MCP focusses on AI Agents and MCP orchestration.
update 16-3-2024: added support for CursorAI, Windsurf AI and Trey AI

## Project info

**URL**: www.agentmcp.ai

## How can I edit this code?

There are several ways of editing your application.


**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server.
npm run dev
```

## Firebase Authentication Setup

This project uses Firebase for authentication and storing user search history. To set up Firebase:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Google Authentication in the Authentication section
3. Create a Firestore database in the Firestore section
4. Get your Firebase configuration from Project Settings > General > Your Apps > SDK setup and configuration
5. Copy the `.env.example` file to `.env.local` and fill in your Firebase configuration values

```sh
# Copy the example env file
cp .env.example .env.local

# Edit the .env.local file with your Firebase configuration
```

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Features

- Browse and search for AI Agent and MCP repositories
- Bulk import repositories from GitHub
- User authentication with Google
- Save search history for registered users
- View and re-import previous searches

# FBLA Connect

**FBLA Connect** is a mobile app built to help Future Business Leaders of America members stay organized, connected, and ready for competition. The app was created for FBLA and earned **1st Place at the Future Business Leaders of America New Jersey State Leadership Conference**, where it was recognized for combining practical chapter-management tools with a polished mobile experience.

The goal of FBLA Connect is simple: give FBLA members one place to manage chapter life. Instead of switching between announcements, calendars, reminders, practice material, dues tracking, maps, and messages, the app brings those pieces into one clean student-focused workspace.

---

## About the App

FBLA Connect acts as a digital command center for FBLA members and chapters. It is designed for students who need to keep track of competitions, chapter deadlines, dues, practice resources, conference schedules, and communication with other members.

The app focuses on three major problems:

1. **Organization** — Members often need to manage meetings, deadlines, state/regional/national events, and preparation tasks at the same time.
2. **Competition readiness** — Students need quick access to practice materials, event schedules, maps, and presentation information.
3. **Connection** — Chapters work better when members can easily find each other, message each other, and stay updated on chapter activity.

---

## Award Recognition

FBLA Connect earned **1st Place at the Future Business Leaders of America New Jersey State Leadership Conference**.

This recognition reflects the app’s purpose: solving a real FBLA student problem with a complete, functional, and visually polished mobile product. The app was built around the needs of FBLA members, including preparation for competitive events, chapter communication, dues tracking, reminders, and conference navigation.

---

## Key Features

### Home Command Center

The home screen gives members a quick overview of chapter activity. It includes:

- A personalized greeting
- Upcoming reminders for the next week
- Dues progress
- FBLA news and updates
- Quick access to the user profile

This screen is designed to be the first place a member checks when opening the app.

### Reminders and Calendar Planning

FBLA Connect includes a calendar-based reminder system built for FBLA-specific planning. Users can organize reminders by:

- FBLA National
- FBLA State
- FBLA Regional

Members can select dates, add reminders, write notes, view reminders for a specific day, and delete completed or outdated reminders.

### Profile and Member Dashboard

The profile dashboard stores important member information, including:

- Name and profile image
- School
- State
- Chapter name
- Graduation date
- FBLA member status

It also includes a dues tracker where users can enter total dues, record payments, and view their progress as a percentage.

### Chapter Social Media Links

The app includes a chapter social media section that can open chapter Instagram and TikTok links. This helps members stay connected with chapter announcements, posts, and updates.

### Practice Quizzes

The practice quiz section helps students prepare for FBLA competitive events. Members can:

- Search FBLA events
- Favorite events
- See the last opened event
- Open sample question PDFs for supported events

The app currently includes sample question PDF support for events such as Accounting and Business Ethics, with the structure ready to expand to more events.

### PDF Practice Viewer

FBLA Connect includes an in-app PDF viewer for practice quiz materials. When the app runtime does not support the full PDF viewer, it provides a fallback option to open the PDF externally.

### Competition Mode

Competition Mode is designed for live FBLA events. Users enter a six-character event code to load event-specific information, such as:

- Event name
- Current time
- Presentation schedule
- Competitor names
- Room numbers
- Next upcoming presentation slot

This feature is meant to make competition day easier by giving competitors a fast way to check where they need to be and when.

### Event Map

Competition Mode also includes an event map screen. After entering an event code, users can view a conference map to help navigate the event location.

### Messaging

The messaging feature allows members to find and continue conversations with other users. Members can:

- View existing conversations
- Search the member directory
- Start new conversations
- Send and receive messages
- View message timestamps

This helps FBLA members and chapter teams communicate inside the app.

### Tools Hub

The Tools screen organizes extra FBLA utilities in one place, including:

- Practice Quizzes
- Competition Mode
- Messaging
- Nationwide Directory concept
- Goal Setting concept
- Badges and Streaks concept
- Career and Internship Portal concept

Some tools are functional now, while others represent planned expansion areas for the app.

---

## Design

FBLA Connect uses a modern mobile interface inspired by FBLA branding. The design includes:

- FBLA blue and gold color palette
- Liquid-glass style panels
- Frosted cards
- Rounded navigation
- Animated home screen logo presentation
- Clean profile and dashboard layouts
- Mobile-first spacing and typography

The goal was to make the app feel professional enough for a business leadership organization while still being simple and engaging for students.

---

## Tech Stack

FBLA Connect is built with:

- **React Native**
- **Expo**
- **Expo Router**
- **TypeScript**
- **React Navigation**
- **AsyncStorage**
- **React Native Calendars**
- **React Native PDF**
- **Expo Vector Icons**
- **Expo Blur**
- **Expo Linear Gradient**
- **Expo Haptics**

The project uses Expo Router for file-based navigation and a modular folder structure for screens, components, features, models, hooks, constants, viewmodels, and local storage logic.

---

## Project Structure

```text
FBLA-App/
├── app/                 # Expo Router routes and tab navigation
├── assets/              # Images, maps, logos, and sample PDFs
├── components/          # Reusable UI components
├── constants/           # Theme and shared constants
├── contexts/            # App-wide providers
├── features/            # Feature-specific logic
├── hooks/               # Custom React hooks
├── lib/                 # Local auth, user, news, reminder, and message storage
├── models/              # Data models and competition logic
├── screens/             # Full screen components
├── viewmodels/          # View model logic for screens
└── scripts/             # Utility scripts
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm start
```

or

```bash
npx expo start
```

### 3. Run the app

Expo will provide options to open the project on:

- iOS simulator
- Android emulator
- Expo Go
- Development build
- Web

For the best experience with native features such as PDF rendering, use a development build instead of Expo Go.

---

## Available Scripts

```bash
npm start
```

Starts the Expo development server on LAN.

```bash
npm run start:tunnel
```

Starts Expo using tunnel mode.

```bash
npm run start:clear
```

Starts Expo and clears the cache.

```bash
npm run android
```

Starts the app for Android.

```bash
npm run ios
```

Starts the app for iOS.

```bash
npm run web
```

Starts the web version.

```bash
npm run lint
```

Runs Expo linting.

---

## Why It Matters

FBLA members balance school, chapter responsibilities, competitive events, leadership activities, and deadlines. FBLA Connect was built to reduce that friction. By combining reminders, communication, dues tracking, practice resources, and competition tools into one app, it helps members stay focused on leadership and performance instead of losing time searching for information.

---

## Future Improvements

Planned or expandable features include:

- Full nationwide chapter/member directory
- Goal tracking and milestone system
- Badges and streak rewards
- Career and internship portal
- More FBLA competitive event PDFs
- More competition event codes and venue maps
- Cloud-based accounts and real-time syncing
- Push notifications for reminders and messages

---

## Built For FBLA

FBLA Connect was created as a student-built solution for FBLA members and chapters. It combines business leadership, software development, user experience design, and competition-focused problem solving into one project.

**Award:** 1st Place — Future Business Leaders of America New Jersey State Leadership Conference

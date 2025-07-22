# Problem 2: Token Exchange UI Challenge

## Overview

This project is a frontend coding challenge for a token swap/exchange interface. It demonstrates modern UI/UX, best practices in React/JavaScript, and attention to detail in both design and code structure. The app allows users to select tokens, input amounts, and view real-time exchange rates and price information, with a focus on usability and maintainability.

## Features

- **Modern UI/UX:** Responsive, accessible, and visually appealing design.
- **Token Selection:** Modal with search and token icons (from Switcheo token-icons repo).
- **Real-time Price Fetching:** Uses [Switcheo price API](https://interview.switcheo.com/prices.json) for up-to-date rates.
- **Input Validation:** Inline error feedback, toast notifications, and error highlighting.
- **Mock Backend Interactions:** Simulated loading and swap confirmation.
- **Extensible Design:** Easily adaptable for real backend integration.
- **jQuery Integration:** For enhanced DOM manipulation and effects.
- **CSS Variables:** Centralized theme and color management for easy customization.

## Setup & Usage

### Prerequisites
- Node.js (v14+ recommended)
- npm or yarn

### Installation
```bash
cd problem2
npm install
```

### Running the App
```bash
npm run dev
```
- The app will be available at [http://localhost:3000](http://localhost:3000)

### Folder Structure
```
problem2/
├── index.html         # Main HTML file
├── style.css          # CSS styles (with CSS variables)
├── script.js          # Main JavaScript (jQuery, UI logic)
├── package.json       # Project config and scripts
├── README.md          # This documentation
└── ...                # Other config and dependency files
```

## Key Implementation Notes

- **Token Images:** Pulled from [Switcheo token-icons](https://github.com/Switcheo/token-icons/tree/main/tokens).
- **Price Data:** Pulled from [Switcheo price API](https://interview.switcheo.com/prices.json).
- **Input Validation:** Both inline (border color) and toast notifications for errors.
- **Toast Notifications:** Unified, reusable toast system for success, error, info, and warning messages.
- **No Tokens Found:** Custom message and style when search yields no results.
- **CSS Variables:** All theme colors and radii are defined in `:root` for easy updates.
- **Responsiveness:** Works well on both desktop and mobile devices.

## Reviewer Notes

- The code is commented for clarity and maintainability.
- All UI/UX decisions are made with real-world extensibility in mind.
- The project is ready for further backend/API integration if required.
- Please see inline comments in `script.js` and `style.css` for further rationale and best practices.

---

**This README is intended to help reviewers and interviewers quickly understand the project structure, features, and rationale behind key implementation decisions.**

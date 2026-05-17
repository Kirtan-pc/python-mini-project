# Web App Folder

This folder contains the interactive web-based version of the Python Mini Projects collection. You can play games, use math tools, and try utilities directly in your browser—no installation or build process required.

## What is Inside?

- index.html — Main entry point for the web app UI
- css/styles.css — Custom styles for dark/light themes and responsive design
- assets/ — Icons and images (e.g., favicon)
- js/main.js — App logic, navigation, and UI controls
- js/projects.js — Project registry and loader
- js/projects/ — Each project’s HTML/JS logic in its own file (e.g. tic-tac-toe.js, calculator.js)

## How to Run the Web App

These instructions are for beginners and assume no prior web development experience.

1. Download or clone the repository to your computer.
	- If you are new to GitHub, click the green "Code" button on the repository page and select "Download ZIP". Extract the ZIP file to a folder on your computer.
	- If you use Git, run:
	  ```bash
	  git clone https://github.com/steam-bell-92/python-mini-project.git
	  ```

2. Open the project folder on your computer.

3. Find the `web-app` folder inside the project.

4. Open the file named `index.html`.
	- On Windows: Right-click `index.html` and choose "Open with" > your web browser (e.g., Chrome, Edge, Firefox).
	- On Mac: Right-click or Control-click `index.html` and choose "Open With" > your browser.
	- On Linux: Double-click or right-click and select your browser.

5. The web app will open in your browser. You can now use all the games, math tools, and utilities instantly.

**No build tools, package managers, or server setup are required. Everything runs locally in your browser.**

## Adding a New Web Project

If you want to add your own project to the web app, follow these steps:

1. Create a new JavaScript file in `js/projects/` (for example, `my-game.js`).
2. Write a function that returns your project’s HTML as a string. See other files in `js/projects/` for examples.
3. Register your project in `js/projects.js` by adding it to the `getProjectHTML` function and any initialization logic.
4. (Optional) Add a project card in `index.html` so users can find your project easily.
5. Use only plain JavaScript and CSS (no frameworks like React or Vue).
6. Test your project on both desktop and mobile browsers to ensure it works and looks good.

## Project List (as of May 2026)

- 2048 Game
- Armstrong Number
- Calculator
- Coin Flip
- Collatz Conjecture
- Coordinate to Polar Transform
- Derivative Calculator
- Dice Rolling
- Emoji Memory Game
- F1 Performance Analyzer
- Fibonacci Series
- FLAMES Game
- Hangman
- Morse Code
- Number Converter
- Number Guessing
- Pascal Triangle
- Prime Analyzer
- Productivity Pet
- Progression Recognizer
- Projectile Motion
- Rock Paper Scissor
- Simon Says
- Snake Game
- Spot the Difference
- Tic Tac Toe
- Tower of Hanoi
- Typing Speed Tester
- Whack a Mole
- Word Scramble

## Contribution Guidelines

- Follow the main project README for contribution steps and best practices.
- Use semantic HTML and accessible labels for all interactive elements.
- Keep the UI simple, clear, and educational for all users.
- Use only plain JavaScript and CSS. Do not add frameworks or external libraries unless approved.
- Test your changes in multiple browsers and on mobile devices.
- Credit: Project by [steam-bell-92](https://github.com/steam-bell-92) and contributors

---

Thank you for contributing to Python Mini Projects Web Edition!

# 🐾 Find My Cat

A simple game where players need to find the hidden cat on the board within a limited number of attempts. The player who finds the cat in the fewest moves wins! In case of a tie, the fastest time will be used as the tiebreaker.

## 🚀 Features
- Fun and interactive game where players search for a hidden cat.
- Clean and modern user interface using Tailwind CSS.
- Integration with Solana wallet for tracking player scores and rewards.
- Responsive design for seamless experience on desktop and mobile.

---

## 🛠️ Tech Stack
- **Frontend**: [Next.js](https://nextjs.org/), [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Blockchain**: [Solana](https://solana.com/) for wallet integration
- **Wallet Integration**: Solana Wallet Adapter
- **Language**: TypeScript

---

## 📋 Prerequisites
Ensure you have the following installed:
- Node.js (>= 18.x)
- npm or yarn
- Git
- A Solana wallet (e.g., Phantom)

---

## 🛠️ Installation and Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/lokesh1jha/find-my-cat.git
   cd find-my-cat
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

5. **Build for production** (optional):
   ```bash
   npm run build
   npm run start
   ```

---

## 📂 Project Structure
```
.
├── components
│   ├── Header.tsx           # Navigation header
│   ├── StartGame.tsx        # Game component
├── public
│   └── cat.jpg              # Image of the cat
├── pages
│   ├── _app.tsx             # Custom App component
│   ├── index.tsx            # Main Home page
│   └── api
├── styles
│   └── globals.css          # Global styles
├── README.md                # Documentation
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

---

## 🕹️ How to Play
1. **Connect your Solana wallet** using the "Connect Wallet" button.
2. Start the game by clicking on the "Start Game" button.
3. You have a limited number of attempts to find the hidden cat.
4. The player with the fewest attempts and fastest time wins!

---

## 🎨 Styling
The UI is designed using Tailwind CSS. If you wish to customize the design, you can modify the classes in the respective components.

---

## 🔧 Troubleshooting
- **Scroll Issue**: If there's unwanted scrolling, make sure the outermost container uses `overflow-hidden` and `min-h-screen` in your Tailwind classes.
- **Solana Wallet Issues**: If you encounter issues connecting to a wallet, ensure the browser wallet extension (e.g., Phantom) is properly installed.

---

## 🤝 Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the project
2. Create a new branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a pull request

---

## 📜 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 💬 Contact
For any questions or feedback, please reach out:

- Email: lokesh1jha@gmail.com
- Twitter: [@lokesh1jha](https://twitter.com/lokesh1jha)

---

## 🌟 Acknowledgements
- Solana for blockchain integration.
- Radix UI for React components.
- Tailwind CSS for styling.
```

### Notes:
- Update the **GitHub repository URL**, **contact information**, and **social handles** to reflect your actual details.
- If you have any specific information to include (e.g., links to documentation, future features, etc.), you can add those sections.

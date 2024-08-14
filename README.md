# Smart Inventory Management System

A modern, AI-enhanced inventory management system built with Next.js, Firebase, and OpenAI's GPT-4 Vision API.

## Features

- **Real-time Inventory Management**: Add, remove, and update inventory items in real-time.
- **Image Capture**: Utilize device camera to capture images of inventory items.
- **AI-Powered Classification**: Automatically classify and describe items using GPT-4 Vision API.
- **Smart Search**: Quickly find items in your inventory with an intuitive search function.
- **Cloud Storage**: Securely store your inventory data with Firebase Firestore.
- **Responsive Design**: A clean, user-friendly interface that works on desktop and mobile devices.

## Technologies Used

- Next.js
- React
- Firebase (Firestore)
- Material-UI
- OpenAI GPT-4 Vision API

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase account
- OpenAI API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Zhaoshan-Duan/inventory-app.git
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Firebase and OpenAI API credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

- Add new items by clicking the "Add New Item" button.
- Use your device camera to capture images of items.
- The system will automatically classify and describe the item using AI.
- Search for items using the search bar.
- Manage item quantities using the + and - buttons on each item card.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.


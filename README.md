# Smart Inventory Management System

A web-based inventory management application built using modern web technologies. It allows users to add, view, and manage inventory items, including capturing images of items and using AI for image classification.

## Main Features
- **Real-time Inventory Management**: Add, remove, and update inventory items in real-time.
- **Smart Search**: Quickly find items in your inventory with an intuitive search function.
- **Image Capture**: Integrated camera functionality to capture item images
- **AI-Powered Classification**: Automatically classify and describe items using GPT-4 Vision API.
- **Cloud Storage**: Securely store your inventory data with Firebase Firestore.
- **Responsive Design**: A clean, user-friendly interface that works on desktop and mobile devices.

## Key Technologies

- Frontend: React, Next.js
- UI Framework: Material-UI (MUI)
- Backend/Database: Firebase (Firestore)
- Image Processing: OpenAI API for classification
- State Management: React Hooks
- Camera Integration: react-camera-pro

## File Structure
Components `app/components` 
- `Header.js`: app bar with title and add button
- `InventoryList.js`: Grid of inventory items
- `InventoryItem.js`: Individual inventory item card
- `AddItemModal.js`: Modal for adding new item
- `SearchBar.js`: Search input field
- `SnackbarMessage.js`: Snackbar for notifications

Hooks `app/hooks`
- `useInventory.js`: Custom hook for inventory management logic
- `userSnackbar.js`: Custom hook for snackbar state management

Utils `app/utils`
- `firebaseUtils.js`: Firebase-related utility functions
- `imageUtils.js`: Image processing utility functions

Constants
- `uiConstants.js`: UI-related constant values

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.


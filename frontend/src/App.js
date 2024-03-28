import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './Pages/HomePage.jsx';
import ChatPage from './Pages/ChatPage.jsx';
import ChatProvider from './Context/ChatProvider.js';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <ChatProvider>
          <Routes>
            <Route path="/" element={<HomePage />} exact />
            <Route path="/chats" element={<ChatPage />} />
          </Routes>
        </ChatProvider>

      </BrowserRouter>
    </div>
  );
}

export default App;

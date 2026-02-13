import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../shared/firebaseConfig';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import Calendar from './components/Calendar';


function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <Login />} 
        />
        {/* <Route
          path="/"
          element={user ? <Dashboard /> : <Navigate to="/dashboard" />}
        /> */}
        <Route path="/calendar" element={<Dashboard />} />
        {/* <Route
          path="/users"
          element={user ? <UserList /> : <Navigate to="/login" />}
          
        /> */}
        <Route path="/userlist" element={<UserList />} />
        {/* <Route
          path="/calendar"
          element={user ? <Calendar /> : <Navigate to="/calendar" />}
        /> */}
        <Route path="/calendar" element={<Calendar />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
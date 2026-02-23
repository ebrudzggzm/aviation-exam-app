import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pplUsers: 0,
    atplUsers: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => doc.data());

      const pplUsers = users.filter(u => u.group === 'PPL').length;
      const atplUsers = users.filter(u => u.group === 'ATPL').length;
      const activeUsers = users.filter(u => 
        u.period?.includes('aktif')
      ).length;

      setStats({
        totalUsers: users.length,
        pplUsers,
        atplUsers,
        activeUsers,
      });
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      await signOut(auth);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-content">
          <h1>📊 Yönetim Paneli</h1>
          <nav>
            <Link to="/">Ana Sayfa</Link>
            <Link to="/users">Kullanıcılar</Link>
            <Link to="/calendar">Takvim</Link>
            <button onClick={handleLogout}>Çıkış</button>
          </nav>
        </div>
      </nav>

      <div className="container">
        <h2 style={{ marginBottom: '20px' }}>Hoş Geldiniz, {auth.currentUser?.email}</h2>

        {loading ? (
          <div>Yükleniyor...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Toplam Kullanıcı</h3>
                <div className="number">{stats.totalUsers}</div>
              </div>
              <div className="stat-card">
                <h3>PPL Öğrenciler</h3>
                <div className="number">{stats.pplUsers}</div>
              </div>
              <div className="stat-card">
                <h3>ATPL Öğrenciler</h3>
                <div className="number">{stats.atplUsers}</div>
              </div>
              <div className="stat-card">
                <h3>Aktif Dönem</h3>
                <div className="number">{stats.activeUsers}</div>
              </div>
            </div>

            <div className="card">
              <h2>Hızlı İşlemler</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginTop: '20px' }}>
                <Link to="/users" style={{ textDecoration: 'none' }}>
                  <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#e3f2fd', 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}>
                    <h3 style={{ color: '#0066cc', marginBottom: '10px' }}>👥 Kullanıcıları Görüntüle</h3>
                    <p style={{ color: '#666', fontSize: '14px' }}>Tüm kullanıcıları listele ve Excel'e aktar</p>
                  </div>
                </Link>

                <Link to="/calendar" style={{ textDecoration: 'none' }}>
                  <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#f3e5f5', 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}>
                    <h3 style={{ color: '#7b1fa2', marginBottom: '10px' }}>📅 Sınav Takvimi</h3>
                    <p style={{ color: '#666', fontSize: '14px' }}>Sınav planlaması yap ve bildirimleri yönet</p>
                  </div>
                </Link>

                <div style={{ 
                  padding: '20px', 
                  backgroundColor: '#e8f5e9', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  opacity: 0.6
                }}>
                  <h3 style={{ color: '#2e7d32', marginBottom: '10px' }}>📊 Raporlar</h3>
                  <p style={{ color: '#666', fontSize: '14px' }}>Yakında eklenecek</p>
                </div>

                <div style={{ 
                  padding: '20px', 
                  backgroundColor: '#fff3e0', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  opacity: 0.6
                }}>
                  <h3 style={{ color: '#e65100', marginBottom: '10px' }}>🔔 Bildirimler</h3>
                  <p style={{ color: '#666', fontSize: '14px' }}>Yakında eklenecek</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Son Aktiviteler</h2>
              <p style={{ color: '#666', marginTop: '10px' }}>
                Bu bölüm geliştirilme aşamasındadır. Yakında kullanıcı aktivitelerini buradan takip edebileceksiniz.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import * as XLSX from 'xlsx';

interface ExamDetail {
  month: string;
  pre: boolean;
  final: boolean;
}

interface UserData {
  id: string;
  email: string;
  group: string;
  period: string;
  lessons: string[];
  examDetails?: Record<string, ExamDetail>;
  createdAt: string;
}

export default function UserList() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ group: 'all', period: 'all' });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserData[];
        setUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error('Hata:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user => {
    if (filter.group !== 'all' && user.group !== filter.group) return false;
    if (filter.period !== 'all' && user.period !== filter.period) return false;
    return true;
  });

  // Ders detayını "10: Mart: Ön" formatında göster
  const formatExamDetail = (courseId: string, detail?: ExamDetail) => {
    if (!detail) return courseId;
    const parts = [courseId];
    if (detail.month) parts.push(detail.month);
    const types = [];
    if (detail.pre) types.push('Ön');
    if (detail.final) types.push('Son');
    if (types.length) parts.push(types.join('+'));
    return parts.join(': ');
  };

  const exportToExcel = () => {
    const exportData = filteredUsers.map(user => ({
      'E-posta': user.email,
      'Grup': user.group,
      'Dönem': user.period,
      'Ders Sayısı': user.lessons?.length || 0,
      'Ders Detayları': user.lessons?.map(id => formatExamDetail(id, user.examDetails?.[id])).join(' | ') || '',
      'Kayıt Tarihi': new Date(user.createdAt).toLocaleDateString('tr-TR'),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kullanıcılar');
    ws['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 30 }, { wch: 12 }, { wch: 60 }, { wch: 15 }];
    XLSX.writeFile(wb, `kullanicilar_${new Date().toISOString().split('T')[0]}.xlsx`);
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
          <h1>👥 Kullanıcı Yönetimi</h1>
          <nav>
            <Link to="/">Ana Sayfa</Link>
            <Link to="/users">Kullanıcılar</Link>
            <Link to="/calendar">Takvim</Link>
            <button onClick={handleLogout}>Çıkış</button>
          </nav>
        </div>
      </nav>

      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Kullanıcı Listesi ({filteredUsers.length})</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: '#28a745', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#28a745', display: 'inline-block' }} />
                Canlı
              </span>
              <button className="btn btn-secondary" onClick={exportToExcel} style={{ width: 'auto', marginTop: 0 }}>
                📥 Excel'e Aktar
              </button>
            </div>
          </div>

          {/* FİLTRELER */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Grup Filtrele:</label>
              <select value={filter.group} onChange={(e) => setFilter({ ...filter, group: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: 'white' }}>
                <option value="all">Tümü</option>
                <option value="PPL">PPL</option>
                <option value="ATPL">ATPL</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Dönem Filtrele:</label>
              <select value={filter.period} onChange={(e) => setFilter({ ...filter, period: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: 'white' }}>
                <option value="all">Tümü</option>
                <option value="PPL aktif">PPL aktif</option>
                <option value="ATPL aktif">ATPL aktif</option>
                <option value="ATPL akademik tamamlamış">ATPL akademik tamamlamış</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Yükleniyor...</div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Kullanıcı bulunamadı</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>E-posta</th>
                    <th>Grup</th>
                    <th>Dönem</th>
                    <th style={{ textAlign: 'center' }}>Ders Sayısı</th>
                    <th>Ders Detayları</th>
                    <th>Kayıt Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>
                        <span style={{
                          padding: '4px 8px', borderRadius: '4px',
                          backgroundColor: user.group === 'PPL' ? '#e3f2fd' : '#f3e5f5',
                          color: user.group === 'PPL' ? '#0066cc' : '#7b1fa2',
                          fontWeight: 600, fontSize: '12px',
                        }}>
                          {user.group}
                        </span>
                      </td>
                      <td>{user.period}</td>
                      <td style={{ textAlign: 'center' }}>{user.lessons?.length || 0}</td>
                      <td style={{ fontSize: '12px' }}>
                        {user.lessons?.length > 0
                          ? user.lessons.map(id => (
                              <div key={id} style={{ marginBottom: 2 }}>
                                <span style={{ fontWeight: 600 }}>{id}</span>
                                {user.examDetails?.[id]?.month && (
                                  <span style={{ color: '#555' }}>{': '}{user.examDetails[id].month}</span>
                                )}
                                {user.examDetails?.[id]?.pre && (
                                  <span style={{ marginLeft: 4, padding: '1px 5px', borderRadius: 4, backgroundColor: '#d4edda', color: '#155724', fontSize: 11 }}>Ön</span>
                                )}
                                {user.examDetails?.[id]?.final && (
                                  <span style={{ marginLeft: 4, padding: '1px 5px', borderRadius: 4, backgroundColor: '#cce5ff', color: '#004085', fontSize: 11 }}>Son</span>
                                )}
                              </div>
                            ))
                          : '-'}
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
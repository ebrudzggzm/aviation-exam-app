import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../../shared/firebaseConfig';
import * as XLSX from 'xlsx';

interface UserData {
  id: string;
  email: string;
  group: string;
  period: string;
  lessons: string[];
  exams?: {
    pre: boolean;
    final: boolean;
  };
  createdAt: string;
}

export default function UserList() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    group: 'all',
    period: 'all',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as UserData[];

      setUsers(usersData);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      alert('Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter.group !== 'all' && user.group !== filter.group) return false;
    if (filter.period !== 'all' && user.period !== filter.period) return false;
    return true;
  });

  const exportToExcel = () => {
    const exportData = filteredUsers.map(user => ({
      'E-posta': user.email,
      'Grup': user.group,
      'Dönem': user.period,
      'Ders Sayısı': user.lessons?.length || 0,
      'Dersler': user.lessons?.join(', ') || '',
      'Ön Sınav': user.exams?.pre ? 'Evet' : 'Hayır',
      'Son Sınav': user.exams?.final ? 'Evet' : 'Hayır',
      'Kayıt Tarihi': new Date(user.createdAt).toLocaleDateString('tr-TR'),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kullanıcılar');
    
    // Sütun genişliklerini ayarla
    const wscols = [
      { wch: 25 }, // E-posta
      { wch: 10 }, // Grup
      { wch: 25 }, // Dönem
      { wch: 12 }, // Ders Sayısı
      { wch: 40 }, // Dersler
      { wch: 12 }, // Ön Sınav
      { wch: 12 }, // Son Sınav
      { wch: 15 }, // Kayıt Tarihi
    ];
    ws['!cols'] = wscols;

    const fileName = `kullanicilar_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
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
            <button 
              className="btn btn-secondary" 
              onClick={exportToExcel}
              style={{ width: 'auto', marginTop: 0 }}
            >
              📥 Excel'e Aktar
            </button>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                Grup Filtrele:
              </label>
              <select 
                value={filter.group}
                onChange={(e) => setFilter({ ...filter, group: e.target.value })}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">Tümü</option>
                <option value="PPL">PPL</option>
                <option value="ATPL">ATPL</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                Dönem Filtrele:
              </label>
              <select 
                value={filter.period}
                onChange={(e) => setFilter({ ...filter, period: e.target.value })}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">Tümü</option>
                <option value="PPL aktif">PPL aktif</option>
                <option value="ATPL aktif">ATPL aktif</option>
                <option value="ATPL akademik tamamlamış">ATPL akademik tamamlamış</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              Yükleniyor...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Kullanıcı bulunamadı
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>E-posta</th>
                    <th>Grup</th>
                    <th>Dönem</th>
                    <th>Ders Sayısı</th>
                    <th>Dersler</th>
                    <th>Sınavlar</th>
                    <th>Kayıt Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          backgroundColor: user.group === 'PPL' ? '#e3f2fd' : '#f3e5f5',
                          color: user.group === 'PPL' ? '#0066cc' : '#7b1fa2',
                          fontWeight: 600,
                          fontSize: '12px'
                        }}>
                          {user.group}
                        </span>
                      </td>
                      <td>{user.period}</td>
                      <td style={{ textAlign: 'center' }}>{user.lessons?.length || 0}</td>
                      <td style={{ fontSize: '12px', maxWidth: '300px' }}>
                        {user.lessons?.join(', ') || '-'}
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {user.exams?.pre && '✓ Ön'}
                        {user.exams?.pre && user.exams?.final && ', '}
                        {user.exams?.final && '✓ Son'}
                        {!user.exams?.pre && !user.exams?.final && '-'}
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
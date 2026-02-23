import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

interface CalendarEvent {
  id: string;
  userId: string;
  userEmail: string;
  date: string;
  lesson: string;
  examType: string;
  notes?: string;
}

interface UserData {
  id: string;
  email: string;
  group: string;
  lessons: string[];
}

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    userId: '',
    date: '',
    lesson: '',
    examType: 'pre',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Kullanıcıları yükle
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as UserData[];
      setUsers(usersData);

      // Takvim olaylarını yükle
      const eventsSnapshot = await getDocs(collection(db, 'calendarEvents'));
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CalendarEvent[];
      setEvents(eventsData);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      alert('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEvent.userId || !newEvent.date || !newEvent.lesson) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    const selectedUser = users.find(u => u.id === newEvent.userId);
    if (!selectedUser) {
      alert('Kullanıcı bulunamadı');
      return;
    }

    try {
      await addDoc(collection(db, 'calendarEvents'), {
        userId: newEvent.userId,
        userEmail: selectedUser.email,
        date: newEvent.date,
        lesson: newEvent.lesson,
        examType: newEvent.examType,
        notes: newEvent.notes,
        createdAt: new Date().toISOString(),
      });

      alert('Sınav başarıyla eklendi!');
      setShowAddForm(false);
      setNewEvent({
        userId: '',
        date: '',
        lesson: '',
        examType: 'pre',
        notes: '',
      });
      loadData();
    } catch (error) {
      console.error('Sınav eklenirken hata:', error);
      alert('Sınav eklenirken bir hata oluştu');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Bu sınavı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'calendarEvents', eventId));
      alert('Sınav silindi');
      loadData();
    } catch (error) {
      console.error('Sınav silinirken hata:', error);
      alert('Sınav silinirken bir hata oluştu');
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      await signOut(auth);
    }
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const selectedUserLessons = newEvent.userId 
    ? users.find(u => u.id === newEvent.userId)?.lessons || []
    : [];

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-content">
          <h1>📅 Sınav Takvimi</h1>
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
            <h2>Planlanan Sınavlar ({events.length})</h2>
            <button 
              className="btn"
              onClick={() => setShowAddForm(!showAddForm)}
              style={{ width: 'auto', marginTop: 0 }}
            >
              {showAddForm ? '❌ İptal' : '➕ Yeni Sınav Ekle'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddEvent} style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginBottom: '15px' }}>Yeni Sınav Ekle</h3>
              
              <div className="form-group">
                <label>Kullanıcı Seçin *</label>
                <select
                  value={newEvent.userId}
                  onChange={(e) => setNewEvent({ ...newEvent, userId: e.target.value, lesson: '' })}
                  required
                >
                  <option value="">Kullanıcı seçin...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.email} ({user.group})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ders Seçin *</label>
                <select
                  value={newEvent.lesson}
                  onChange={(e) => setNewEvent({ ...newEvent, lesson: e.target.value })}
                  required
                  disabled={!newEvent.userId}
                >
                  <option value="">Ders seçin...</option>
                  {selectedUserLessons.map(lesson => (
                    <option key={lesson} value={lesson}>
                      {lesson}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Sınav Türü *</label>
                <select
                  value={newEvent.examType}
                  onChange={(e) => setNewEvent({ ...newEvent, examType: e.target.value })}
                  required
                >
                  <option value="pre">Ön Sınav</option>
                  <option value="final">Son Sınav</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tarih *</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Notlar</label>
                <textarea
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }}
                  placeholder="Ek bilgiler..."
                />
              </div>

              <button type="submit" className="btn">
                Sınavı Ekle
              </button>
            </form>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              Yükleniyor...
            </div>
          ) : sortedEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Henüz planlanmış sınav yok. Yeni sınav eklemek için yukarıdaki butona tıklayın.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Kullanıcı</th>
                    <th>Ders</th>
                    <th>Sınav Türü</th>
                    <th>Notlar</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEvents.map((event) => {
                    const eventDate = new Date(event.date);
                    const isUpcoming = eventDate >= new Date();
                    
                    return (
                      <tr 
                        key={event.id}
                        style={{ 
                          backgroundColor: isUpcoming ? '#fff' : '#f8f9fa',
                          opacity: isUpcoming ? 1 : 0.7
                        }}
                      >
                        <td>
                          <strong>{eventDate.toLocaleDateString('tr-TR')}</strong>
                          <br />
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            {eventDate.toLocaleDateString('tr-TR', { weekday: 'long' })}
                          </span>
                        </td>
                        <td>{event.userEmail}</td>
                        <td>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            backgroundColor: '#e3f2fd',
                            color: '#0066cc',
                            fontWeight: 600,
                            fontSize: '12px'
                          }}>
                            {event.lesson}
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            backgroundColor: event.examType === 'pre' ? '#fff3e0' : '#e8f5e9',
                            color: event.examType === 'pre' ? '#e65100' : '#2e7d32',
                            fontWeight: 600,
                            fontSize: '12px'
                          }}>
                            {event.examType === 'pre' ? 'Ön Sınav' : 'Son Sınav'}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', maxWidth: '200px' }}>
                          {event.notes || '-'}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            🗑️ Sil
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h2>💡 Bilgi</h2>
          <p style={{ color: '#666', lineHeight: 1.6 }}>
            Bu sayfada kullanıcılar için sınav planlaması yapabilirsiniz. Sınav eklediğinizde, 
            ilgili kullanıcıya otomatik olarak bildirim gönderilecektir (yakında eklenecek).
          </p>
        </div>
      </div>
    </div>
  );
}
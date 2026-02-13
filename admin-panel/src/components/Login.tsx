import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db} from '../../../shared/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

  //   setLoading(true);
  //   try {
  //     await signInWithEmailAndPassword(auth, email, password);
  //     // Başarılı giriş - App.tsx yönlendirecek
  //   } catch (error: any) {
  //     let errorMessage = 'Giriş yapılırken bir hata oluştu';
      
  //     if (error.code === 'auth/invalid-email') {
  //       errorMessage = 'Geçersiz e-posta adresi';
  //     } else if (error.code === 'auth/user-not-found') {
  //       errorMessage = 'Kullanıcı bulunamadı';
  //     } else if (error.code === 'auth/wrong-password') {
  //       errorMessage = 'Hatalı şifre';
  //     }
      
  //     setError(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

    setLoading(true);
    try {
      // Firebase'e giriş yap
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Admin kontrolü yap
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      
      if (!adminDoc.exists() || !adminDoc.data()?.isAdmin) {
        // Admin değilse çıkış yap
        await auth.signOut();
        setError('Bu hesap yönetici değil. Giriş izni yok!');
        return;
      }

      // Admin ise devam et (App.tsx yönlendirecek)
    } catch (error: any) {
      let errorMessage = 'Giriş yapılırken bir hata oluştu';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Kullanıcı bulunamadı';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Hatalı şifre';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Yönetim Paneli</h1>
        <p>Havacılık Sınav Takip Sistemi</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
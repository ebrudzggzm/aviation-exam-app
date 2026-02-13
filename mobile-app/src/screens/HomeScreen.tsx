import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
// import { signOut } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
// import { auth, db } from './firebase/firebaseConfig';

export default function HomeScreen({ navigation }: any) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Geçici mock data
  const mockUser = {
    email: 'test@example.com',
    group: 'PPL',
    period: 'PPL aktif',
    lessons: ['10', '20', '30'],
    exams: {
      pre: true,
      final: false,
    }
  };

  useEffect(() => {
    // Geçici olarak mock data kullan
    setUserData(mockUser);
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış',
          style: 'destructive',
          onPress: async () => {
            // Firebase olmadan geçici
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const handleEditCourses = () => {
    if (userData) {
      navigation.navigate('CourseSelection', {
        group: userData.group,
        period: userData.period,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Hoş Geldiniz!</Text>
        <Text style={styles.emailText}>{mockUser.email}</Text>
      </View>

      {userData && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profil Bilgileri</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Grup:</Text>
            <Text style={styles.infoValue}>{userData.group}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dönem:</Text>
            <Text style={styles.infoValue}>{userData.period}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Seçili Ders Sayısı:</Text>
            <Text style={styles.infoValue}>
              {userData.lessons?.length || 0}
            </Text>
          </View>
          {userData.exams && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sınavlar:</Text>
              <Text style={styles.infoValue}>
                {[
                  userData.exams.pre && 'Ön Sınav',
                  userData.exams.final && 'Son Sınav',
                ]
                  .filter(Boolean)
                  .join(', ') || 'Yok'}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Menü</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleEditCourses}>
          <Text style={styles.menuItemText}>📚 Ders Seçimini Düzenle</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Yakında', 'Veri girişi özelliği yakında eklenecek')}
        >
          <Text style={styles.menuItemText}>📝 Aylık Veri Girişi</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Yakında', 'Sınav takvimi özelliği yakında eklenecek')}
        >
          <Text style={styles.menuItemText}>📅 Sınav Takvimi</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Yakında', 'Bildirimler özelliği yakında eklenecek')}
        >
          <Text style={styles.menuItemText}>🔔 Bildirimler</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Hesap</Text>
        
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ℹ️ Firebase bağlantısı yapılınca e-posta doğrulama aktif olacak
          </Text>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={[styles.menuItemText, styles.logoutText]}>
            🚪 Çıkış Yap
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Havacılık Sınav Takip v1.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#0066cc',
    padding: 20,
    paddingTop: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 0,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  logoutText: {
    color: '#d32f2f',
  },
  warningBox: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  warningText: {
    fontSize: 14,
    color: '#1565c0',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
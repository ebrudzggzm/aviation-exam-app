import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../shared/firebaseConfig';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [group, setGroup] = useState<'PPL' | 'ATPL'>('PPL');
  const [period, setPeriod] = useState('PPL aktif');
  const [loading, setLoading] = useState(false);

  const periodOptions = {
    PPL: ['PPL aktif'],
    ATPL: ['ATPL aktif', 'ATPL akademik tamamlamış'],
  };

  const handleRegister = async () => {
    // Validasyon
    if (!email || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);
    try {
      // Kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // E-posta doğrulama gönder
      await sendEmailVerification(user);

      // Firestore'a kullanıcı bilgilerini kaydet
      await setDoc(doc(db, 'users', user.uid), {
        email,
        group,
        period,
        lessons: [], // Ders seçimi sonraki adımda
        createdAt: new Date().toISOString(),
        emailVerified: false,
      });

      Alert.alert(
        'Başarılı',
        'Kayıt başarılı! E-posta adresinize doğrulama linki gönderildi. Lütfen e-postanızı kontrol edin.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('CourseSelection', { group, period }),
          },
        ]
      );
    } catch (error: any) {
      let errorMessage = 'Kayıt olurken bir hata oluştu';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu e-posta adresi zaten kullanılıyor';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifre çok zayıf';
      }
      
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Yeni Hesap Oluştur</Text>

        <Text style={styles.label}>E-posta</Text>
        <TextInput
          style={styles.input}
          placeholder="ornek@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />

        <Text style={styles.label}>Şifre</Text>
        <TextInput
          style={styles.input}
          placeholder="En az 6 karakter"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <Text style={styles.label}>Şifre Tekrar</Text>
        <TextInput
          style={styles.input}
          placeholder="Şifrenizi tekrar girin"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />

        <Text style={styles.label}>Grup Seçimi</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={group}
            onValueChange={(value) => {
              setGroup(value);
              setPeriod(periodOptions[value][0]);
            }}
            enabled={!loading}
          >
            <Picker.Item label="PPL" value="PPL" />
            <Picker.Item label="ATPL" value="ATPL" />
          </Picker>
        </View>

        <Text style={styles.label}>Dönem Seçimi</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={period}
            onValueChange={setPeriod}
            enabled={!loading}
          >
            {periodOptions[group].map((option) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
        </View>

        <Text style={styles.infoText}>
          Ders seçimini bir sonraki adımda yapacaksınız
        </Text>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.linkText}>
            Zaten hesabınız var mı? Giriş yapın
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#0066cc',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase/firebaseConfig';

const COURSE_OPTIONS = {
  PPL: [
    { id: '10', name: '010 - Hava Hukuku' },
    { id: '20', name: '020 - Uçak Genel Bilgisi' },
    { id: '30', name: '030 - Uçuş Performansı ve Planlama' },
    { id: '40', name: '040 - İnsan Performansı ve Limitleri' },
    { id: '50', name: '050 - Meteoroloji' },
    { id: '60', name: '060 - Navigasyon' },
    { id: '70', name: '070 - Operasyonel Prosedürler' },
    { id: '80', name: '080 - Uçuş Prensipleri' },
    { id: '90', name: '090 - İletişim' },
  ],
  ATPL: [
    { id: '10', name: '010 - Hava Hukuku' },
    { id: '21', name: '021 - Uçak Genel Bilgisi - Airframe/Systems' },
    { id: '22', name: '022 - Uçak Genel Bilgisi - Instrumentation' },
    { id: '31', name: '031 - Uçuş Performansı ve Planlama - Mass & Balance' },
    { id: '32', name: '032 - Uçuş Performansı ve Planlama - Performance' },
    { id: '33', name: '033 - Uçuş Planlama ve Monitöring' },
    { id: '40', name: '040 - İnsan Performansı ve Limitleri' },
    { id: '50', name: '050 - Meteoroloji' },
    { id: '61', name: '061 - Genel Navigasyon' },
    { id: '62', name: '062 - Radyo Navigasyon' },
    { id: '70', name: '070 - Operasyonel Prosedürler' },
    { id: '81', name: '081 - Uçuş Prensipleri' },
    { id: '91', name: '091 - VFR İletişim' },
    { id: '92', name: '092 - IFR İletişim' },
  ],
};

export default function CourseSelectionScreen({ navigation, route }: any) {
  const { group, period } = route.params;
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [includePreExam, setIncludePreExam] = useState(false);
  const [includeFinalExam, setIncludeFinalExam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const courses = COURSE_OPTIONS[group as 'PPL' | 'ATPL'];

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.lessons) {
            setSelectedCourses(data.lessons);
          }
          if (data.exams) {
            setIncludePreExam(data.exams.pre || false);
            setIncludeFinalExam(data.exams.final || false);
          }
        }
      }
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      Alert.alert('Hata', 'Mevcut ders seçimleri yüklenemedi');
    } finally {
      setInitialLoading(false);
    }
  };

  const toggleCourse = (courseId: string) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
    } else {
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };

  const selectAll = () => {
    setSelectedCourses(courses.map(c => c.id));
  };

  const clearAll = () => {
    setSelectedCourses([]);
  };

  const handleSave = async () => {
    if (selectedCourses.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir ders seçin');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          lessons: selectedCourses,
          exams: {
            pre: includePreExam,
            final: includeFinalExam,
          },
          updatedAt: new Date().toISOString(),
        });

        Alert.alert(
          'Başarılı',
          'Ders seçiminiz kaydedildi!',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      Alert.alert('Hata', `Ders seçimi kaydedilirken bir hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Ders Seçimi</Text>
          <Text style={styles.subtitle}>
            Grup: {group} | Dönem: {period}
          </Text>
          <Text style={styles.info}>
            {selectedCourses.length} ders seçildi
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.utilButton} onPress={selectAll}>
            <Text style={styles.utilButtonText}>Tümünü Seç</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.utilButton} onPress={clearAll}>
            <Text style={styles.utilButtonText}>Temizle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.coursesContainer}>
          {courses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={[
                styles.courseItem,
                selectedCourses.includes(course.id) && styles.courseItemSelected,
              ]}
              onPress={() => toggleCourse(course.id)}
            >
              <View style={styles.checkbox}>
                {selectedCourses.includes(course.id) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.courseText}>{course.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.examSection}>
          <Text style={styles.sectionTitle}>Sınav Türleri</Text>
          
          <TouchableOpacity
            style={[
              styles.courseItem,
              includePreExam && styles.courseItemSelected,
            ]}
            onPress={() => setIncludePreExam(!includePreExam)}
          >
            <View style={styles.checkbox}>
              {includePreExam && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.courseText}>Ön Sınav</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.courseItem,
              includeFinalExam && styles.courseItemSelected,
            ]}
            onPress={() => setIncludeFinalExam(!includeFinalExam)}
          >
            <View style={styles.checkbox}>
              {includeFinalExam && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.courseText}>Son Sınav</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Kaydet ve Devam Et</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  utilButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0066cc',
    alignItems: 'center',
  },
  utilButtonText: {
    color: '#0066cc',
    fontWeight: '600',
  },
  coursesContainer: {
    padding: 15,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  courseItemSelected: {
    borderColor: '#0066cc',
    backgroundColor: '#e6f2ff',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0066cc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#0066cc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  courseText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  examSection: {
    padding: 15,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  footer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
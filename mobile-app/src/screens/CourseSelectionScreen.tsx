import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase/firebaseConfig';

const COURSE_OPTIONS: Record<'PPL' | 'ATPL', { id: string; name: string }[]> = {
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

const PERIOD_OPTIONS: Record<'PPL' | 'ATPL', string[]> = {
  PPL: ['PPL aktif', 'PPL akademik tamamlamış'],
  ATPL: ['ATPL aktif', 'ATPL akademik tamamlamış'],
};

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

// Her ders için: { courseId: { month: 'Mart', pre: true, final: false } }
type ExamDetail = { month: string; pre: boolean; final: boolean };
type ExamDetails = Record<string, ExamDetail>;

export default function CourseSelectionScreen({ navigation, route }: any) {
  const params = route.params as { group: 'PPL' | 'ATPL'; period: string };

  const [selectedGroup, setSelectedGroup] = useState<'PPL' | 'ATPL'>(params.group ?? 'ATPL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>(params.period ?? '');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [examDetails, setExamDetails] = useState<ExamDetails>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const courses = COURSE_OPTIONS[selectedGroup] ?? [];

  useEffect(() => { loadExistingData(); }, []);

  const handleGroupChange = (group: 'PPL' | 'ATPL') => {
    setSelectedGroup(group);
    setSelectedPeriod(PERIOD_OPTIONS[group][0]);
    setSelectedCourses([]);
    setExamDetails({});
  };

  const loadExistingData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.group) setSelectedGroup(data.group);
          if (data.period) setSelectedPeriod(data.period);
          if (data.lessons) setSelectedCourses(data.lessons);
          if (data.examDetails) setExamDetails(data.examDetails);
        }
      }
    } catch (error) {
      Alert.alert('Hata', 'Mevcut ders seçimleri yüklenemedi');
    } finally {
      setInitialLoading(false);
    }
  };

  const toggleCourse = (courseId: string) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter((id) => id !== courseId));
      const updated = { ...examDetails };
      delete updated[courseId];
      setExamDetails(updated);
    } else {
      setSelectedCourses([...selectedCourses, courseId]);
      setExamDetails(prev => ({ ...prev, [courseId]: { month: '', pre: false, final: false } }));
    }
  };

  const updateExamDetail = (courseId: string, field: keyof ExamDetail, value: any) => {
    setExamDetails(prev => ({
      ...prev,
      [courseId]: { ...prev[courseId], [field]: value },
    }));
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
          group: selectedGroup,
          period: selectedPeriod,
          lessons: selectedCourses,
          examDetails,
          updatedAt: new Date().toISOString(),
        });
        Alert.alert('Başarılı', 'Bilgileriniz kaydedildi!', [
          { text: 'Tamam', onPress: () => navigation.replace('Home') },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Hata', `Kaydedilirken bir hata oluştu: ${error.message}`);
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
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">

        {/* GRUP VE DÖNEM */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grup ve Dönem</Text>
          <Text style={styles.label}>Grup</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedGroup} onValueChange={handleGroupChange}>
              <Picker.Item label="PPL" value="PPL" />
              <Picker.Item label="ATPL" value="ATPL" />
            </Picker>
          </View>
          <Text style={styles.label}>Dönem</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedPeriod} onValueChange={setSelectedPeriod}>
              {PERIOD_OPTIONS[selectedGroup].map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
        </View>

        {/* DERS SEÇİMİ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ders Seçimi</Text>
          <Text style={styles.info}>{selectedCourses.length} ders seçildi</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.utilButton} onPress={() => {
              setSelectedCourses(courses.map(c => c.id));
              const all: ExamDetails = {};
              courses.forEach(c => { all[c.id] = { month: '', pre: false, final: false }; });
              setExamDetails(all);
            }}>
              <Text style={styles.utilButtonText}>Tümünü Seç</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.utilButton} onPress={() => { setSelectedCourses([]); setExamDetails({}); }}>
              <Text style={styles.utilButtonText}>Temizle</Text>
            </TouchableOpacity>
          </View>

          {courses.map((course) => {
            const isSelected = selectedCourses.includes(course.id);
            const detail = examDetails[course.id] ?? { month: '', pre: false, final: false };
            return (
              <View key={course.id} style={styles.courseBlock}>
                {/* Ders satırı */}
                <TouchableOpacity
                  style={[styles.courseItem, isSelected && styles.courseItemSelected]}
                  onPress={() => toggleCourse(course.id)}
                >
                  <View style={styles.checkbox}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.courseText}>{course.name}</Text>
                </TouchableOpacity>

                {/* Detay satırı - sadece seçiliyse */}
                {isSelected && (
                  <View style={styles.detailRow}>
                    {/* Ay picker */}
                    <View style={styles.monthPickerWrap}>
                      <Picker
                        selectedValue={detail.month}
                        onValueChange={(val) => updateExamDetail(course.id, 'month', val)}
                        mode="dropdown"
                        style={styles.monthPickerStyle}
                      >
                        <Picker.Item label="Ay seçin" value="" />
                        {MONTHS.map((m) => (
                          <Picker.Item key={m} label={m} value={m} />
                        ))}
                      </Picker>
                    </View>

                    {/* Ön Sınav checkbox */}
                    <TouchableOpacity
                      style={[styles.examTypeBtn, detail.pre && styles.examTypeBtnActive]}
                      onPress={() => updateExamDetail(course.id, 'pre', !detail.pre)}
                    >
                      <Text style={[styles.examTypeTxt, detail.pre && styles.examTypeTxtActive]}>Ön</Text>
                    </TouchableOpacity>

                    {/* Son Sınav checkbox */}
                    <TouchableOpacity
                      style={[styles.examTypeBtn, detail.final && styles.examTypeBtnActive]}
                      onPress={() => updateExamDetail(course.id, 'final', !detail.final)}
                    >
                      <Text style={[styles.examTypeTxt, detail.final && styles.examTypeTxtActive]}>Son</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveButtonText}>Kaydet ve Devam Et</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  scrollView: { flex: 1 },
  section: {
    backgroundColor: '#fff', margin: 15, marginBottom: 0, padding: 15, borderRadius: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginTop: 10, marginBottom: 4 },
  pickerContainer: { backgroundColor: '#f9f9f9', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', overflow: 'hidden', marginBottom: 8 },
  info: { fontSize: 14, color: '#0066cc', fontWeight: '600', marginBottom: 10 },
  buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  utilButton: { flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#0066cc', alignItems: 'center' },
  utilButtonText: { color: '#0066cc', fontWeight: '600' },
  courseBlock: { marginBottom: 6 },
  courseItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9',
    padding: 13, borderRadius: 8, borderWidth: 2, borderColor: '#ddd',
  },
  courseItemSelected: { borderColor: '#0066cc', backgroundColor: '#e6f2ff' },
  checkbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: '#0066cc', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkmark: { color: '#0066cc', fontSize: 18, fontWeight: 'bold' },
  courseText: { fontSize: 15, color: '#333', flex: 1 },

  // Detay satırı
  detailRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f0f7ff', borderRadius: 8,
    borderWidth: 1, borderColor: '#c0d8f0',
    marginTop: 4, paddingHorizontal: 8, overflow: 'hidden', minHeight: 48,
  },
  monthPickerWrap: { flex: 1 },
  monthPickerStyle: {
    width: '100%',
    ...Platform.select({ android: { color: '#333' }, ios: {} }),
  },
  examTypeBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
    borderWidth: 1, borderColor: '#0066cc', marginLeft: 6,
  },
  examTypeBtnActive: { backgroundColor: '#0066cc' },
  examTypeTxt: { fontSize: 13, color: '#0066cc', fontWeight: '600' },
  examTypeTxtActive: { color: '#fff' },

  footer: { padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd' },
  saveButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#999' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
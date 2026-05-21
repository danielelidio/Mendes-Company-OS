import { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Sidebar, type ScreenKey } from './src/components/Sidebar';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  const [tela, setTela] = useState<ScreenKey>('home');

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Sidebar active={tela} onNavigate={setTela} />
        <View style={styles.content}>{tela === 'home' && <HomeScreen />}</View>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  body: { flex: 1, flexDirection: 'row' },
  content: { flex: 1 },
});

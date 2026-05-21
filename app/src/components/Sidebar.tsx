import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export type ScreenKey = 'home';

interface MenuItem {
  key: ScreenKey;
  label: string;
}

const MENU: MenuItem[] = [{ key: 'home', label: 'Home' }];

export function Sidebar({
  active,
  onNavigate,
}: {
  active: ScreenKey;
  onNavigate: (key: ScreenKey) => void;
}) {
  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <Text style={styles.brandText}>mendescompany-os</Text>
      </View>
      <ScrollView contentContainerStyle={styles.menu}>
        {MENU.map((item) => {
          const selected = item.key === active;
          return (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.item,
                selected && styles.itemActive,
                pressed && styles.pressed,
              ]}
              onPress={() => onNavigate(item.key)}
            >
              <View style={[styles.dot, selected && styles.dotActive]} />
              <Text style={[styles.itemLabel, selected && styles.itemLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 264,
    backgroundColor: '#0b1220',
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
  },
  brand: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  brandText: { color: '#f8fafc', fontWeight: '700', fontSize: 16 },
  menu: { paddingVertical: 12 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  itemActive: { backgroundColor: '#1e293b', borderRightWidth: 2, borderRightColor: '#2563eb' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#475569' },
  dotActive: { backgroundColor: '#2563eb' },
  itemLabel: { color: '#cbd5e1', fontSize: 14 },
  itemLabelActive: { color: '#f8fafc', fontWeight: '600' },
  pressed: { opacity: 0.8 },
});

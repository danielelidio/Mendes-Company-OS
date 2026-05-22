import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

export type ScreenKey = 'home';

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  active: ScreenKey;
  onNavigate: (key: ScreenKey) => void;
};

const ITEMS: { key: ScreenKey; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'home', label: 'Home', icon: 'home' },
];

export function Sidebar({ collapsed, onToggle, active, onNavigate }: SidebarProps) {
  return (
    <View style={[styles.sidebar, collapsed ? styles.collapsed : styles.expanded]}>
      <Pressable style={styles.toggle} onPress={onToggle} hitSlop={8}>
        <Feather name={collapsed ? 'menu' : 'chevron-left'} size={20} color="#cbd5e1" />
        {!collapsed && <Text style={styles.brand}>mendescompany</Text>}
      </Pressable>

      <View style={styles.items}>
        {ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <Pressable
              key={item.key}
              onPress={() => onNavigate(item.key)}
              style={({ pressed }) => [
                styles.item,
                collapsed && styles.itemCollapsed,
                isActive && styles.itemActive,
                pressed && styles.itemPressed,
              ]}
            >
              <Feather name={item.icon} size={20} color={isActive ? '#f8fafc' : '#94a3b8'} />
              {!collapsed && (
                <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#111827',
    borderRightWidth: 1,
    borderRightColor: '#1f2937',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 8,
  },
  expanded: { width: 220 },
  collapsed: { width: 64 },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  brand: { color: '#e5e7eb', fontWeight: '700' },
  items: { gap: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  itemCollapsed: { justifyContent: 'center', paddingHorizontal: 0 },
  itemActive: { backgroundColor: '#1f2937' },
  itemPressed: { opacity: 0.8 },
  label: { color: '#94a3b8', fontSize: 15 },
  labelActive: { color: '#f8fafc', fontWeight: '600' },
});

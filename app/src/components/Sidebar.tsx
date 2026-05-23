import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

type Leaf = { href: string; labelKey: string; icon: keyof typeof Feather.glyphMap };
type Group = { id: string; labelKey: string; icon: keyof typeof Feather.glyphMap; children: Leaf[] };

const TOP_LEAVES: Leaf[] = [
  { href: '/', labelKey: 'nav.home', icon: 'home' },
  { href: '/clientes', labelKey: 'nav.clients', icon: 'users' },
];
const GROUPS: Group[] = [
  {
    id: 'contabilidade',
    labelKey: 'nav.accounting',
    icon: 'book',
    children: [
      { href: '/contabilidade/notas-fiscais', labelKey: 'nav.invoices', icon: 'file-text' },
      { href: '/contabilidade/invoices', labelKey: 'nav.faturas', icon: 'file' },
      { href: '/contabilidade/invoice-config', labelKey: 'nav.invoiceConfig', icon: 'settings' },
    ],
  },
];

function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation('common');
  const go = (href: string) => router.push(href as never);
  const allLeaves: Leaf[] = [...TOP_LEAVES, ...GROUPS.flatMap((g) => g.children)];

  return (
    <View style={[styles.sidebar, collapsed ? styles.collapsed : styles.expanded]}>
      <Pressable style={styles.toggle} onPress={onToggle} hitSlop={8}>
        <Feather name={collapsed ? 'menu' : 'chevron-left'} size={20} color="#cbd5e1" />
        {!collapsed ? <Text style={styles.brand}>mendescompany</Text> : null}
      </Pressable>

      {collapsed ? (
        <View style={styles.items}>
          {allLeaves.map((leaf) => (
            <Pressable
              key={leaf.href}
              onPress={() => go(leaf.href)}
              style={({ pressed }) => [
                styles.item,
                styles.itemCollapsed,
                isActive(leaf.href, pathname) && styles.itemActive,
                pressed && styles.itemPressed,
              ]}
            >
              <Feather name={leaf.icon} size={20} color={isActive(leaf.href, pathname) ? '#f8fafc' : '#94a3b8'} />
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.items}>
          {TOP_LEAVES.map((leaf) => (
            <LeafItem key={leaf.href} leaf={leaf} label={t(leaf.labelKey)} active={isActive(leaf.href, pathname)} onPress={() => go(leaf.href)} />
          ))}
          {GROUPS.map((group) => (
            <View key={group.id} style={styles.group}>
              <View style={styles.groupHeader}>
                <Feather name={group.icon} size={15} color="#64748b" />
                <Text style={styles.groupLabel}>{t(group.labelKey)}</Text>
              </View>
              {group.children.map((leaf) => (
                <LeafItem
                  key={leaf.href}
                  leaf={leaf}
                  label={t(leaf.labelKey)}
                  nested
                  active={isActive(leaf.href, pathname)}
                  onPress={() => go(leaf.href)}
                />
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function LeafItem({
  leaf,
  label,
  active,
  onPress,
  nested,
}: {
  leaf: Leaf;
  label: string;
  active: boolean;
  onPress: () => void;
  nested?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        nested && styles.itemNested,
        active && styles.itemActive,
        pressed && styles.itemPressed,
      ]}
    >
      <Feather name={leaf.icon} size={18} color={active ? '#f8fafc' : '#94a3b8'} />
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
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
  expanded: { width: 230 },
  collapsed: { width: 64 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 8, marginBottom: 8 },
  brand: { color: '#e5e7eb', fontWeight: '700' },
  items: { gap: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8 },
  itemCollapsed: { justifyContent: 'center', paddingHorizontal: 0 },
  itemNested: { paddingLeft: 18 },
  itemActive: { backgroundColor: '#1f2937' },
  itemPressed: { opacity: 0.8 },
  label: { color: '#94a3b8', fontSize: 15 },
  labelActive: { color: '#f8fafc', fontWeight: '600' },
  group: { marginTop: 8, gap: 2 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 6 },
  groupLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
});

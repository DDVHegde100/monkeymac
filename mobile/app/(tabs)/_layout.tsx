import { Tabs } from 'expo-router'
import { Text } from 'react-native'
import { colors } from '@/src/theme'

function TabIcon({ label }: { label: string }) {
  return (
    <Text style={{ color: colors.accent, fontSize: 15, fontWeight: '900', letterSpacing: 0.5 }}>
      {label}
    </Text>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Train',
          tabBarIcon: () => <TabIcon label="Σ" />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: () => <TabIcon label="↗" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <TabIcon label="MM" />,
        }}
      />
    </Tabs>
  )
}

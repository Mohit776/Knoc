import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#431BB8',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#F2F2F7',
                    height: 100,
                    paddingBottom: 8,
                    paddingTop: 6,
                },
                tabBarLabelStyle: {
                    fontFamily: 'Gilroy-Medium',
                    fontSize: 12,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Setting',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}

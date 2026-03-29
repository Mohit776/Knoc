import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/themeContext';
import { vs, ms } from '../../lib/typography';

export default function TabsLayout() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    // Extra bottom inset for devices with gesture nav or 3-button nav bar
    const tabBarPaddingBottom = vs(6) + insets.bottom;
    const tabBarHeight = vs(55) + insets.bottom;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.cardBg,
                    borderTopWidth: 1,
                    borderTopColor: colors.separator,
                    paddingBottom: tabBarPaddingBottom,
                    paddingTop: vs(4),
                    height: tabBarHeight,
                },
                tabBarLabelStyle: {
                    fontFamily: 'Gilroy-Medium',
                    fontSize: ms(12),
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

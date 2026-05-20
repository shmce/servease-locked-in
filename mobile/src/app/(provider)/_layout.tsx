import { Tabs } from 'expo-router';
import {
  Calendar,
  Clock,
  Home,
  Menu,
  MessageCircle,
} from 'lucide-react-native';
import { palette } from '../../theme/serveaseDesign';

export default function ProviderTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.mint,
        tabBarInactiveTintColor: '#B0A89E',
        tabBarStyle: {
          backgroundColor: palette.white,
          borderTopColor: '#EFE9DF',
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={20} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color }) => <Calendar color={color} size={20} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <Clock color={color} size={20} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => (
            <MessageCircle color={color} size={20} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <Menu color={color} size={20} strokeWidth={2.4} />,
        }}
      />
    </Tabs>
  );
}

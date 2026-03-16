import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { RaceDetailScreen } from '../screens/RaceDetailScreen';
import { StandingsScreen } from '../screens/StandingsScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="RaceDetail" component={RaceDetailScreen} />
    </Stack.Navigator>
  );
}

function CoursesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CoursesList" component={CoursesScreen} />
      <Stack.Screen name="CourseDetail" component={RaceDetailScreen} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Calendrier"
          component={HomeStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Courses"
          component={CoursesStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="flag" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Classements"
          component={StandingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trophy" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

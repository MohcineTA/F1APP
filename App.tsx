import 'react-native-gesture-handler';
import React from 'react';
import { useNotifications } from './src/hooks/useNotifications';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  useNotifications(); // Register push token on startup
  return <AppNavigator />;
}

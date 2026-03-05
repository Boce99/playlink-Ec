
import { StyleSheet } from 'react-native';

// PlayLink Ec - Brand Colors
// Primary: PL Blue (#4A9BF0)
// Secondary: PL Black (#000000), Dark Gray (#333333), Light Gray (#EEEEEE)
export const colors = {
  // Light theme
  light: {
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#333333',
    primary: '#4A9BF0', // PL Blue
    secondary: '#000000', // PL Black
    accent: '#4A9BF0', // PL Blue accent
    highlight: '#E8F4FD', // Light blue highlight
    border: '#EEEEEE',
    error: '#EF4444',
    success: '#10B981',
    lightGray: '#EEEEEE',
    darkGray: '#333333',
  },
  // Dark theme
  dark: {
    background: '#000000',
    card: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#EEEEEE',
    primary: '#4A9BF0', // PL Blue
    secondary: '#FFFFFF', // White for dark mode
    accent: '#4A9BF0', // PL Blue accent
    highlight: '#1A3A52',
    border: '#333333',
    error: '#EF4444',
    success: '#10B981',
    lightGray: '#333333',
    darkGray: '#EEEEEE',
  },
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
});

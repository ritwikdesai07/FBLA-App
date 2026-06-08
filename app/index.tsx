import { ThemeProvider } from '@/contexts/ThemeContext';
import RemindersScreen from './(tabs)/index';

export default function App() {
  return (
    <ThemeProvider>
      <RemindersScreen />
    </ThemeProvider>
  );
}

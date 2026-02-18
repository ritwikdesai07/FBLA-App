import { ThemeProvider } from './(tabs)/ThemeContext';  // ← Add (tabs)/ here
import RemindersScreen from './(tabs)/index';

export default function App() {
  return (
    <ThemeProvider>
      <RemindersScreen />
    </ThemeProvider>
  );
}
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fractal.tareas',
  appName: 'Fractal Tareas',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;

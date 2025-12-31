import { defineConfig, loadEnv } from 'vite';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    server: {
      port: Number(env.VITE_PORT) || 5173
    }
  });
};

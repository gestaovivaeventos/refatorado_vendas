/**
 * App Component - Wrapper principal do Next.js
 * Importa estilos globais e configura providers
 */

import type { AppProps } from 'next/app';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

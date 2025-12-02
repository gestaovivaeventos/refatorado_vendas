import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Footer from '@/components/Footer';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para login (primeira página que o usuário vê)
    router.push('/login');
  }, [router]);

  return (
    <>
      <Head>
        <title>PEX - Programa de Excelência</title>
        <meta name="description" content="Programa de Excelência (PEX) - Dashboard de Performance" />
      </Head>
      
      <div style={{ 
        backgroundColor: '#212529', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#adb5bd',
        fontFamily: 'Poppins, sans-serif',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '40px' }}>
          Redirecionando...
        </div>
        <Footer />
      </div>
    </>
  );
}

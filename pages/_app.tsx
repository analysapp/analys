import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';

const TEMPO_LIMITE = 15 * 60 * 1000; // 15 minutos

const rotasProtegidas = ['/conta', '/nova-analise', '/resultado'];

function useAutoLogout() {
  const router = useRouter();

  useEffect(() => {
    if (!rotasProtegidas.includes(router.pathname)) return;

    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        signOut(auth).then(() => {
          alert('Sessão encerrada por inatividade.');
          router.push('/login');
        });
      }, TEMPO_LIMITE);
    };

    const eventos = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    eventos.forEach((e) => window.addEventListener(e, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeout);
      eventos.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [router.pathname]);
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useAutoLogout();

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !darkMode ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
    setDarkMode(!darkMode);
  };

  return (
    <SessionProvider session={session}>
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 left-4 z-50 p-2 bg-transparent border-none cursor-pointer"
        aria-label="Alternar modo escuro"
      >
        {darkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 3v1m0 16v1m8.66-13.66l-.7.7m-12.02 12.02l-.7.7m0-14.14l.7.7m12.02 12.02l.7.7M4 12H3m18 0h-1M7.05 7.05L4.93 4.93M19.07 19.07l-2.12-2.12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 018 8 8 8 0 01-8 8 8 8 0 010-16z" />
          </svg>
        )}
      </button>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

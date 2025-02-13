import './styles/page.css';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function LoginRedirect(): JSX.Element {
    const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const { userData } = router.query;

      if (userData) {
        localStorage.setItem("userLogged", String(userData));
      }

      router.replace("/");
    }
  }, [router.query]);

  return <p>...</p>;
}

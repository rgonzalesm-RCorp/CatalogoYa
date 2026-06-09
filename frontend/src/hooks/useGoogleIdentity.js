import { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_ID = 'catalogosya-google-identity';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client?hl=es';

let googleScriptPromise;

const loadGoogleIdentityScript = () => {
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const handleReady = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google);
        return;
      }

      reject(new Error('Google Identity Services no estuvo disponible.'));
    };

    const handleError = () => {
      reject(new Error('No se pudo cargar Google Sign-In.'));
    };

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener('load', handleReady, { once: true });
      existingScript.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', handleReady, { once: true });
    script.addEventListener('error', handleError, { once: true });
    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

export function useGoogleIdentity({ onCredential }) {
  const buttonRef = useRef(null);
  const onCredentialRef = useRef(onCredential);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setIsReady(false);
      setError('Configura VITE_GOOGLE_CLIENT_ID para habilitar el acceso con Google.');
      return undefined;
    }

    let isCancelled = false;

    const mountButton = async () => {
      try {
        setError('');
        setIsReady(false);

        await loadGoogleIdentityScript();

        if (isCancelled || !buttonRef.current) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response?.credential) {
              setError('No se recibio una credencial valida desde Google.');
              return;
            }

            onCredentialRef.current(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          context: 'signin',
        });

        buttonRef.current.innerHTML = '';

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          logo_alignment: 'left',
          width: Math.max(buttonRef.current.offsetWidth || 320, 280),
        });

        setIsReady(true);
      } catch (mountError) {
        if (isCancelled) {
          return;
        }

        setIsReady(false);
        setError(mountError.message || 'No se pudo preparar el acceso con Google.');
      }
    };

    mountButton();

    return () => {
      isCancelled = true;

      if (buttonRef.current) {
        buttonRef.current.innerHTML = '';
      }
    };
  }, []);

  return {
    buttonRef,
    error,
    isReady,
  };
}

import { useEffect, useRef, useState } from 'react';

// Mostra uma confirmação de "salvo" por alguns segundos depois de uma ação bem-sucedida.
export function useSavedFeedback(duracaoMs = 3000) {
  const [salvo, setSalvo] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function mostrar() {
    setSalvo(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setSalvo(false), duracaoMs);
  }

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return { salvo, mostrar };
}

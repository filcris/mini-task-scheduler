import React from 'react';
import { ping } from '../lib/api';

export default function BackendStatus() {
  const [ok, setOk] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let mounted = true;
    ping()
      .then(() => mounted && setOk(true))
      .catch(() => mounted && setOk(false));
    return () => { mounted = false; };
  }, []);

  if (ok === null) return <span aria-label="backend-status">⏳</span>;
  return (
    <span aria-label="backend-status">
      {ok ? '✅ Backend disponível' : '❌ Backend indisponível'}
    </span>
  );
}

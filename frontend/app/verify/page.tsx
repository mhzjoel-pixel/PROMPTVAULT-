'use client';

import { IDKitRequestWidget } from '@worldcoin/idkit';
import { Nav } from '../../components/nav';

export default function Verify() {
  return (
    <main>
      <Nav />
      <section className="mx-auto max-w-2xl p-6">
        <div className="glass rounded-3xl p-8">
          <h1 className="text-4xl font-black">World ID verification</h1>
          <p className="mt-3 text-white/70">Generate a proof before staking, joining, or claiming rewards.</p>
          <IDKitRequestWidget
            app_id={(process.env.NEXT_PUBLIC_WORLD_ID_APP_ID || 'app_staging') as `app_${string}`}
            action={process.env.NEXT_PUBLIC_WORLD_ID_ACTION || 'attendx-verify'}
            handleVerify={async (result) => {
              const response = await fetch('/verify-world-id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result),
              });
              if (!response.ok) throw new Error('World ID verification failed');
            }}
            onSuccess={(result) => console.log(result)}
          >
            {({ open }) => (
              <button type="button" onClick={open} className="mt-6 rounded-xl bg-aqua px-6 py-3 font-bold text-black">
                Verify identity
              </button>
            )}
          </IDKitRequestWidget>
        </div>
      </section>
    </main>
  );
}

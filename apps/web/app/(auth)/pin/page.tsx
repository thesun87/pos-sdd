'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PinLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/v1/auth/pin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, tenantSlug, email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Đăng nhập thất bại');
        return;
      }

      const { token, user } = await response.json();

      // Lưu JWT token để dùng cho POS offline
      localStorage.setItem('pos_jwt', token);
      localStorage.setItem('pos_user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        storeAssignments: user.storeAssignments,
        cachedAt: Date.now(),
      }));

      router.push('/pos');
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  function handlePinInput(digit: string) {
    if (pin.length < 8) {
      setPin((prev) => prev + digit);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Đăng nhập POS</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tenantSlug" className="block text-sm font-medium text-gray-700 mb-1">
            Tên nhà hàng (Slug)
          </label>
          <input
            id="tenantSlug"
            type="text"
            value={tenantSlug}
            onChange={(e) => setTenantSlug(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
            placeholder="pos-sdd-demo"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
            placeholder="cashier@pos-sdd.local"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">PIN</label>
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: Math.max(pin.length, 4) }).map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 border-2 rounded-xl flex items-center justify-center text-xl font-bold ${
                  i < pin.length ? 'border-amber-500 bg-amber-50' : 'border-gray-300'
                }`}
              >
                {i < pin.length ? '●' : ''}
              </div>
            ))}
          </div>

          {/* PIN keypad */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === '⌫') setPin((prev) => prev.slice(0, -1));
                  else if (key !== '') handlePinInput(key);
                }}
                disabled={key === ''}
                className={`py-4 rounded-xl text-xl font-medium transition min-h-[44px] ${
                  key === ''
                    ? 'invisible'
                    : key === '⌫'
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          <input type="hidden" value={pin} required />
        </div>

        <button
          type="submit"
          disabled={loading || pin.length < 4}
          className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-medium rounded-xl transition min-h-[44px]"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Dành cho Dashboard?{' '}
        <a href="/auth/login" className="text-amber-600 hover:text-amber-700 font-medium">
          Đăng nhập bằng email
        </a>
      </p>
    </div>
  );
}

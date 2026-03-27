export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900">POS Modern Bistro</h1>
          <p className="text-amber-700 mt-2">Hệ thống quản lý nhà hàng</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

'use client';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Tableau de Bord Administration</h1>
        <p className="text-gray-600">Félicitations, tu es connecté et cette zone est totalement sécurisée par JWT !</p>
      </div>
    </div>
  );
}
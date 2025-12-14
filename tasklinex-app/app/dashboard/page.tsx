export default function DashboardPage() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-semibold text-indigo-600 mb-4">
        📊 Dashboard Overview
      </h1>
      <p className="text-gray-700">
        This is your primary dashboard. The sidebar state is maintained as you navigate here.
      </p>
      
      <div className="mt-8 grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow h-32 border border-green-300">
            <h2 className="font-bold text-lg">Key Metrics</h2>
        </div>
        <div className="bg-white p-6 rounded-lg shadow h-32 border border-green-300">
            <h2 className="font-bold text-lg">Recent Activity</h2>
        </div>
      </div>
    </div>
  );
}
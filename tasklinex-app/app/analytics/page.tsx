export default function DashboardPage() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-semibold text-indigo-600 mb-4">
        👨‍🔬 Analysis Page
      </h1>
      <p className="text-gray-700">
        Welcome to the Analysis page. This page is under construction 🚧.
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
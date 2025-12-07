// app/page.tsx

export default function HomePage() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Welcome to TaskLinex Dashboard
      </h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
        <p className="text-gray-600">
          This is the main content area. The sidebar on the left is fully collapsible and uses Tailwind CSS transitions. Click the arrow button to toggle its state.
        </p>
      </div>
      
      {/* Placeholder content to show layout working */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg shadow h-32">Box 1</div>
        <div className="bg-white p-5 rounded-lg shadow h-32">Box 2</div>
        <div className="bg-white p-5 rounded-lg shadow h-32">Box 3</div>
      </div>
    </div>
  );
}
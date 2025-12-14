export default function SettingsPage() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-semibold text-indigo-600 mb-4">
        ⚙️ User Settings
      </h1>
      <p className="text-gray-700">
        Manage your profile and application preferences.
      </p>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow border border-red-300">
        <h2 className="font-bold text-lg">Account Details</h2>
        <p className="text-sm text-gray-500 mt-2">Update your email and password.</p>
      </div>
    </div>
  );
}
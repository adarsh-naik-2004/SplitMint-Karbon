export default function Dashboard({ summary, user, onLogout }) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">SplitMint</h1>
          </div>

          <div className="flex-1 flex items-center gap-2 lg:gap-3 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-primary-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <p className="text-xs text-gray-600 leading-tight">Total Spent</p>
                <p className="text-sm lg:text-base font-semibold text-gray-900">₹{summary.totalSpent.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
              </svg>
              <div>
                <p className="text-xs text-gray-600 leading-tight">You Owe</p>
                <p className="text-sm lg:text-base font-semibold text-red-700">₹{Math.max(-summary.ownerNet, 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 bg-primary-50 border border-primary-200 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-primary-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/>
              </svg>
              <div>
                <p className="text-xs text-gray-600 leading-tight">Owed To You</p>
                <p className="text-sm lg:text-base font-semibold text-primary-700">₹{Math.max(summary.ownerNet, 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-700">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
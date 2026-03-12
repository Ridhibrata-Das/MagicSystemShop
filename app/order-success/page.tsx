"use client";

import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <div className="bg-gray-50 flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow border border-gray-100 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">Order Placed Successfully!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Thank you for shopping at MagicSystem Shop. Your order is being processed and will be shipped soon.
          </p>
        </div>
        
        <div className="mt-8 flex flex-col space-y-4">
          <Link
            href="/profile"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            View Order History
          </Link>
          <Link
            href="/"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

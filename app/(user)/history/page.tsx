"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/authService";
import { getUserOrders } from "@/services/orders";
import { Order } from "@/types";
import SystemWindow from "@/components/SystemWindow";
import BackToDashboard from "@/components/BackToDashboard";

export default function HistoryPage() {
  const user = getCurrentUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.uid) {
      getUserOrders(user.uid).then((res) => {
        setOrders(res);
        setLoading(false);
      });
    }
  }, [user]);

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full animate-fade-in-up">
      <BackToDashboard />
      <SystemWindow title="TRANSACTION LOGS">
        <div className="p-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-black/20 border border-system-border/30 animate-pulse rounded-sm"></div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-system-border/30">
              <p className="text-system-muted font-orbitron uppercase tracking-widest">No transaction records found in this cycle.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.orderId} className="bg-black/60 rounded-sm border border-system-border overflow-hidden">
                  <div 
                    className="px-4 py-4 flex justify-between items-center cursor-pointer hover:bg-system-accent/10 transition-colors"
                    onClick={() => toggleOrder(order.orderId)}
                  >
                    <div>
                      <h3 className="text-sm font-orbitron font-bold text-system-text tracking-wider uppercase">
                        LOG <span className="text-system-accent">#{order.orderId.substring(0, 8)}</span>
                      </h3>
                      <p className="mt-1 text-xs font-rajdhani text-system-muted">
                        TIMESTAMP: {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-orbitron font-bold text-system-accent">
                        {order.totalPrice.toFixed(2)} G
                      </span>
                      <svg className={`h-5 w-5 text-system-muted transform transition-transform \${expandedOrders[order.orderId] ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  {expandedOrders[order.orderId] && (
                    <div className="border-t border-system-border/50 px-4 py-5 bg-black/40 font-rajdhani">
                      <h4 className="text-xs font-orbitron font-bold uppercase tracking-widest text-system-accent mb-3">Item Analysis</h4>
                      <ul className="divide-y divide-system-border/30">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="py-2 flex justify-between items-center">
                            <span className="text-sm text-system-text">ID: {item.productId} <span className="text-system-muted ml-2">x{item.quantity}</span></span>
                            <span className="text-sm font-orbitron text-system-text">{(item.priceSnapshot * item.quantity).toFixed(2)} G</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SystemWindow>
    </div>
  );
}

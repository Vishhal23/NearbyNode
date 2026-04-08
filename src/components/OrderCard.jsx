import React from 'react';
import { getCategoryImage } from '../assets/categoryImages';

/**
 * OrderCard — Displays order summary
 * @param {object} order - Order data object
 */
const OrderCard = ({ order }) => {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-blue-100 text-blue-700',
        processing: 'bg-indigo-100 text-indigo-700',
        shipped: 'bg-purple-100 text-purple-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
        refunded: 'bg-gray-100 text-gray-700',
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="card p-4 hover:shadow-card-hover transition-all duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <span className="text-xs text-gray-400">Order</span>
                    <p className="font-semibold text-sm text-gray-900">
                        #{order._id?.slice(-8).toUpperCase() || 'N/A'}
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                </span>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-3">
                {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <img
                            src={item.imageUrl || getCategoryImage(item.category)}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            onError={(e) => { e.target.src = getCategoryImage(item.category); }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">{order.createdAt ? formatDate(order.createdAt) : ''}</p>
                <p className="font-bold text-gray-900">₹{order.grandTotal || order.totalAmount}</p>
            </div>
        </div>
    );
};

export default OrderCard;

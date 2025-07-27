"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
    Package,
    User,
    MapPin,
    Calendar,
    Search,
    Download,
    Eye,
    Edit,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Phone,
    Mail,
    CheckCircle,
    Clock,
    XCircle,
    AlertTriangle,
    DollarSign,
    FileText,
    ArrowUpDown,
    RefreshCw,
    Clipboard,
    ShoppingBag,
} from "lucide-react"
import SupplierHeader from "@/components/SupplierHeader"

export default function SupplierOrdersPage() {
    const router = useRouter()
    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [authChecked, setAuthChecked] = useState(false)

    // Filter and pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [filters, setFilters] = useState({
        status: "all",
        paymentStatus: "all",
        search: "",
        startDate: "",
        endDate: "",
        sortBy: "createdAt",
        sortOrder: "desc",
    })
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        processingOrders: 0,
        deliveredOrders: 0,
        paymentFailedOrders: 0,
    })

    // Memoize the query params to prevent unnecessary re-renders
    const queryParams = useMemo(() => {
        return new URLSearchParams({
            page: currentPage.toString(),
            limit: "20",
            ...filters,
        }).toString()
    }, [currentPage, filters])

    const checkAuth = useCallback(async () => {
        try {
            const response = await fetch("/api/supplier/auth/user")
            const data = await response.json()

            if (!response.ok) {
                throw new Error("Not authenticated")
            }

            setAuthChecked(true)
            setIsLoading(false)
        } catch (error) {
            console.error("Authentication check failed:", error)
            router.push("/supplier/login")
        }
    }, [router])

    const fetchOrders = useCallback(async () => {
        if (!authChecked) return

        try {
            setIsLoading(true)
            setError("")
            
            console.log('🔥 Fetching orders with params:', queryParams)

            const response = await fetch(`/api/supplier/orders?${queryParams}`)
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data = await response.json()
            console.log('📋 Orders API response:', data)

            if (!data.success) {
                throw new Error(data.error || "Failed to fetch orders")
            }

            setOrders(data.orders || [])
            setTotalPages(data.pagination?.totalPages || 0)
            setTotalCount(data.pagination?.totalCount || 0)
            setStats(data.stats || {
                totalOrders: 0,
                totalRevenue: 0,
                processingOrders: 0,
                deliveredOrders: 0,
                paymentFailedOrders: 0,
            })
            
            console.log('✅ Orders state updated:', {
                ordersCount: data.orders?.length || 0,
                totalCount: data.pagination?.totalCount || 0,
                stats: data.stats
            })

        } catch (error) {
            console.error("❌ Failed to fetch orders:", error)
            setError(`Failed to load orders: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }, [authChecked, queryParams])

    // Check auth only once on mount
    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    // Fetch orders when auth is checked and params change
    useEffect(() => {
        if (authChecked) {
            fetchOrders()
        }
    }, [authChecked, fetchOrders])

    const handleFilterChange = useCallback((key, value) => {
        console.log('🔧 Filter changed:', key, value)
        setFilters((prev) => ({ ...prev, [key]: value }))
        setCurrentPage(1)
    }, [])

    const clearFilters = useCallback(() => {
        setFilters({
            status: "all",
            paymentStatus: "all",
            search: "",
            startDate: "",
            endDate: "",
            sortBy: "createdAt",
            sortOrder: "desc",
        })
        setCurrentPage(1)
    }, [])

    const refreshOrders = useCallback(() => {
        if (authChecked) {
            fetchOrders()
        }
    }, [authChecked, fetchOrders])

    const handleOrderUpdate = async (orderId, status, paymentStatus) => {
        try {
            setIsUpdating(true)
            const response = await fetch("/api/supplier/orders", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderId,
                    status,
                    paymentStatus,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to update order")
            }

            // Update the order in the list
            setOrders((prev) =>
                prev.map((order) =>
                    order._id === orderId
                        ? { ...order, status: status || order.status, paymentStatus: paymentStatus || order.paymentStatus }
                        : order,
                ),
            )

            // Update selected order if it's the one being updated
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder((prev) => ({
                    ...prev,
                    status: status || prev.status,
                    paymentStatus: paymentStatus || prev.paymentStatus,
                }))
            }

            showToast("Order updated successfully", "success")
        } catch (error) {
            console.error("Order update error:", error)
            showToast(error.message || "Failed to update order", "error")
        } finally {
            setIsUpdating(false)
        }
    }

    const showToast = (message, type = "info") => {
        // Simple toast implementation
        const toast = document.createElement("div")
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
            type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-blue-600"
            }`
        toast.textContent = message
        document.body.appendChild(toast)

        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast)
            }
        }, 3000)
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "processing":
                return <Package size={16} className="text-blue-500" />
            case "delivered":
                return <CheckCircle size={16} className="text-green-500" />
            case "payment failed":
                return <XCircle size={16} className="text-red-500" />
            default:
                return <AlertTriangle size={16} className="text-gray-500" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "processing":
                return "bg-blue-100 text-blue-800"
            case "delivered":
                return "bg-green-100 text-green-800"
            case "payment failed":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "failed":
                return "bg-red-100 text-red-800"
            case "refunded":
                return "bg-purple-100 text-purple-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const OrderDetailsModal = () => {
        const toggleEditMode = () => {
            setIsEditMode(!isEditMode)
        }

        if (!selectedOrder) return null

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{isEditMode ? "Edit Order" : "Order Details"}</h2>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XCircle size={20} className="sm:hidden" />
                            <XCircle size={24} className="hidden sm:block" />
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        {/* Order Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            <div className="bg-gray-50 p-3 sm:p-5 rounded-xl shadow-sm">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                                    <Clipboard className="mr-2 text-teal-600" size={16} />
                                    <span className="sm:hidden">Order Info</span>
                                    <span className="hidden sm:inline">Order Information</span>
                                </h3>
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                                        <span className="text-gray-600 text-sm sm:text-base">Order ID:</span>
                                        <span className="font-medium bg-gray-100 px-2 py-1 rounded text-gray-800 text-xs sm:text-sm break-all">{selectedOrder._id}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                                        <span className="text-gray-600 text-sm sm:text-base">Date:</span>
                                        <span className="font-medium text-sm sm:text-base">{formatDate(selectedOrder.createdAt)}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                                        <span className="text-gray-600 text-sm sm:text-base">Total Amount:</span>
                                        <span className="font-bold text-green-600 bg-green-50 px-2 sm:px-3 py-1 rounded-full text-sm sm:text-base">
                                            ₹{selectedOrder.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                                        <span className="text-gray-600 text-sm sm:text-base">Status:</span>
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(selectedOrder.status)}
                                            {isEditMode ? (
                                                <select
                                                    value={selectedOrder.status}
                                                    onChange={(e) => handleOrderUpdate(selectedOrder._id, e.target.value, null)}
                                                    disabled={isUpdating}
                                                    className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
                                                >
                                                    <option value="processing">Processing</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="payment failed">Payment Failed</option>
                                                </select>
                                            ) : (
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}
                                                >
                                                    {selectedOrder.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                                        <span className="text-gray-600 text-sm sm:text-base">Payment:</span>
                                        {isEditMode ? (
                                            <select
                                                value={selectedOrder.paymentStatus}
                                                onChange={(e) => handleOrderUpdate(selectedOrder._id, null, e.target.value)}
                                                disabled={isUpdating}
                                                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="completed">Completed</option>
                                                <option value="failed">Failed</option>
                                                <option value="refunded">Refunded</option>
                                            </select>
                                        ) : (
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}
                                            >
                                                {selectedOrder.paymentStatus}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Vendor Info */}
                            <div className="bg-gray-50 p-3 sm:p-5 rounded-xl shadow-sm">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                                    <User className="mr-2 text-teal-600" size={16} />
                                    <span className="sm:hidden">Vendor Info</span>
                                    <span className="hidden sm:inline">Vendor Information</span>
                                </h3>
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex items-center p-2 bg-white rounded-lg">
                                        <User size={14} className="text-gray-500 mr-2 sm:mr-3 flex-shrink-0" />
                                        <span className="font-medium text-sm sm:text-base truncate">{selectedOrder.userDetails?.vendorName || 'Unknown Vendor'}</span>
                                    </div>
                                    <div className="flex items-center p-2 bg-white rounded-lg">
                                        <Mail size={14} className="text-gray-500 mr-2 sm:mr-3 flex-shrink-0" />
                                        <span className="text-sm sm:text-base truncate">{selectedOrder.userDetails?.email || 'No email'}</span>
                                    </div>
                                    {selectedOrder.shippingAddress?.phone && (
                                        <div className="flex items-center p-2 bg-white rounded-lg">
                                            <Phone size={14} className="text-gray-500 mr-2 sm:mr-3 flex-shrink-0" />
                                            <span className="text-sm sm:text-base">{selectedOrder.shippingAddress.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-start p-2 bg-white rounded-lg">
                                        <MapPin size={14} className="text-gray-500 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                                        <div className="text-sm sm:text-base">
                                            <div className="font-medium">{selectedOrder.shippingAddress?.name}</div>
                                            <div className="break-words">{selectedOrder.shippingAddress?.address}</div>
                                            <div>
                                                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{" "}
                                                {selectedOrder.shippingAddress?.postalCode}
                                            </div>
                                            <div>{selectedOrder.shippingAddress?.country}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-3 sm:p-5 border-b border-gray-100">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                                    <ShoppingBag className="mr-2 text-teal-600" size={16} />
                                    Order Items
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Raw Material
                                            </th>
                                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Qty
                                            </th>
                                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {selectedOrder.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 sm:h-12 sm:w-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                            <Image
                                                                src={item.rawMaterial?.mainImage || "/placeholder.svg"}
                                                                alt={item.rawMaterial?.name || "Raw Material"}
                                                                width={48}
                                                                height={48}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="ml-2 sm:ml-4 min-w-0">
                                                            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                                                {item.rawMaterial?.name || "Raw Material not found"}
                                                            </div>
                                                            {item.rawMaterial?.category && (
                                                                <div className="text-xs text-gray-500">
                                                                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                                                                        {item.rawMaterial.category}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                                    ₹{item.price.toLocaleString()}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                                    <span className="px-1.5 sm:px-2 py-1 bg-gray-100 rounded-md text-xs sm:text-sm">{item.quantity}</span>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                                                    ₹{(item.price * item.quantity).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan="3" className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium text-gray-900">
                                                Total Amount:
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold text-green-600">
                                                ₹{selectedOrder.totalAmount.toLocaleString()}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Payment Info */}
                        {selectedOrder.paymentInfo && (
                            <div className="bg-gray-50 p-3 sm:p-5 rounded-xl shadow-sm">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                                    <CreditCard className="mr-2 text-teal-600" size={16} />
                                    Payment Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    {selectedOrder.paymentInfo.razorpayOrderId && (
                                        <div className="p-2 sm:p-3 bg-white rounded-lg">
                                            <span className="text-gray-600 block mb-1 text-xs sm:text-sm">Razorpay Order ID:</span>
                                            <div className="font-mono text-xs sm:text-sm bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto break-all">
                                                {selectedOrder.paymentInfo.razorpayOrderId}
                                            </div>
                                        </div>
                                    )}
                                    {selectedOrder.paymentInfo.razorpayPaymentId && (
                                        <div className="p-2 sm:p-3 bg-white rounded-lg">
                                            <span className="text-gray-600 block mb-1 text-xs sm:text-sm">Payment ID:</span>
                                            <div className="font-mono text-xs sm:text-sm bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto break-all">
                                                {selectedOrder.paymentInfo.razorpayPaymentId}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
                        >
                            Close
                        </button>
                        {isEditMode ? (
                            <button
                                onClick={() => {
                                    setIsEditMode(false)
                                    setIsModalOpen(false)
                                }}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm sm:text-base"
                            >
                                Save Changes
                            </button>
                        ) : (
                            <button
                                onClick={toggleEditMode}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                            >
                                Edit Order
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    if (!authChecked || (isLoading && orders.length === 0)) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                <SupplierHeader />
                <div className="flex-grow flex items-center justify-center px-4">
                    <div className="flex flex-col items-center bg-white p-6 sm:p-8 rounded-xl shadow-md max-w-sm w-full">
                        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
                        <p className="text-teal-700 font-medium text-sm sm:text-base">Loading orders...</p>
                        <p className="text-gray-500 text-xs sm:text-sm mt-2 text-center">This may take a moment</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <SupplierHeader />

            <main className="flex-grow py-4 sm:py-6 lg:py-8">
                <div className="container mx-auto px-2 sm:px-4">
                    {/* Header */}
                    <div className="mb-4 sm:mb-6 lg:mb-8 bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
                                <p className="text-gray-600 text-sm sm:text-base">Manage and track all customer orders</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <button
                                    onClick={refreshOrders}
                                    disabled={isLoading}
                                    className="px-3 sm:px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center text-sm sm:text-base disabled:opacity-70"
                                >
                                    <RefreshCw size={14} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                    {isLoading ? 'Refreshing...' : 'Refresh'}
                                </button>
                                <button
                                    onClick={() => {
                                        /* Handle export functionality */
                                    }}
                                    className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                                >
                                    <Download size={14} className="mr-2" />
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>

                    {/*Error Display */}
                    {error && (
                        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
                            <div className="flex items-center">
                                <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                                <span className="text-sm sm:text-base">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
                        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500">
                            <div className="flex items-center">
                                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg mr-2 sm:mr-3">
                                    <FileText size={16} className="text-blue-600 sm:hidden" />
                                    <FileText size={20} className="text-blue-600 hidden sm:block" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Total</p>
                                    <p className="text-base sm:text-xl font-bold text-gray-900">{stats.totalOrders}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500">
                            <div className="flex items-center">
                                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg mr-2 sm:mr-3">
                                    <Package size={16} className="text-blue-600 sm:hidden" />
                                    <Package size={20} className="text-blue-600 hidden sm:block" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Processing</p>
                                    <p className="text-base sm:text-xl font-bold text-gray-900">{stats.processingOrders}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-green-500">
                            <div className="flex items-center">
                                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg mr-2 sm:mr-3">
                                    <CheckCircle size={16} className="text-green-600 sm:hidden" />
                                    <CheckCircle size={20} className="text-green-600 hidden sm:block" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Delivered</p>
                                    <p className="text-base sm:text-xl font-bold text-gray-900">{stats.deliveredOrders}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-red-500">
                            <div className="flex items-center">
                                <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg mr-2 sm:mr-3">
                                    <XCircle size={16} className="text-red-600 sm:hidden" />
                                    <XCircle size={20} className="text-red-600 hidden sm:block" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Payment Failed</p>
                                    <p className="text-base sm:text-xl font-bold text-gray-900">{stats.paymentFailedOrders}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-green-500 col-span-2 sm:col-span-1">
                            <div className="flex items-center">
                                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg mr-2 sm:mr-3">
                                    <DollarSign size={16} className="text-green-600 sm:hidden" />
                                    <DollarSign size={20} className="text-green-600 hidden sm:block" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Revenue</p>
                                    <p className="text-base sm:text-xl font-bold text-gray-900">₹{(stats.totalRevenue / 1000).toFixed(0)}k</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-4 sm:mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
                            {/* Search */}
                            <div className="sm:col-span-2 lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Search Vendor</label>
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange("search", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange("status", e.target.value)}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="processing">Processing</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="payment failed">Payment Failed</option>
                                </select>
                            </div>

                            {/* Payment Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                                    value={filters.paymentStatus}
                                    onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
                                >
                                    <option value="all">All Payments</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>

                            {/* Date Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <button
                                onClick={clearFilters}
                                className="text-sm text-teal-600 hover:text-teal-800 flex items-center"
                            >
                                <RefreshCw size={14} className="mr-1" />
                                Clear Filters
                            </button>
                            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                                Showing {orders.length} of {totalCount} orders
                            </div>
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {/* Show empty state or orders */}
                        {orders.length === 0 && !isLoading ? (
                            <div className="text-center py-8 sm:py-12">
                                <Package size={32} className="mx-auto text-gray-300 mb-4 sm:hidden" />
                                <Package size={48} className="mx-auto text-gray-300 mb-4 hidden sm:block" />
                                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                                <p className="text-gray-500 text-sm sm:text-base">
                                    {Object.values(filters).some(filter => filter !== 'all' && filter !== '' && filter !== 'createdAt' && filter !== 'desc')
                                        ? "Try adjusting your filters to see more orders."
                                        : "No orders have been placed yet."}
                                </p>
                                {Object.values(filters).some(filter => filter !== 'all' && filter !== '' && filter !== 'createdAt' && filter !== 'desc') && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Mobile Card View */}
                                <div className="block lg:hidden">
                                    <div className="space-y-3 p-4">
                                        {orders.map((order) => (
                                            <div key={order._id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">#{order._id.slice(-8).toUpperCase()}</div>
                                                        <div className="text-xs text-gray-500 flex items-center mt-1">
                                                            <Calendar size={10} className="mr-1" />
                                                            {formatDate(order.createdAt)}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-semibold text-gray-900">₹{order.totalAmount.toLocaleString()}</div>
                                                        <div className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                                                            {order.items?.length || 0} item(s)
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                                        <User size={16} className="text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{order.userDetails?.vendorName || 'Unknown Vendor'}</div>
                                                        <div className="text-xs text-gray-500">{order.userDetails?.email || 'No email'}</div>
                                                    </div>
                                                </div>

                                                <div className="text-sm text-gray-600">
                                                    <div className="flex items-start">
                                                        <MapPin size={12} className="mt-0.5 mr-1 flex-shrink-0" />
                                                        <div>
                                                            <div>{order.shippingAddress?.city}, {order.shippingAddress?.state}</div>
                                                            <div>{order.shippingAddress?.postalCode}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex space-x-2">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                                order.status,
                                                            )}`}
                                                        >
                                                            {getStatusIcon(order.status)}
                                                            <span className="ml-1 capitalize">{order.status}</span>
                                                        </span>
                                                        <span
                                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                                                                order.paymentStatus,
                                                            )}`}
                                                        >
                                                            <CreditCard size={10} className="mr-1" />
                                                            <span className="capitalize">{order.paymentStatus}</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOrder(order)
                                                                setIsEditMode(false)
                                                                setIsModalOpen(true)
                                                            }}
                                                            className="text-teal-600 hover:text-teal-900 bg-teal-50 p-2 rounded-lg transition-colors"
                                                            title="View Order Details"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOrder(order)
                                                                setIsEditMode(true)
                                                                setIsModalOpen(true)
                                                            }}
                                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-lg transition-colors"
                                                            title="Edit Order"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Desktop Table View */}
                                <div className="hidden lg:block overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <button
                                                        onClick={() => handleFilterChange("sortBy", "createdAt")}
                                                        className="flex items-center hover:text-gray-700"
                                                    >
                                                        Order Details
                                                        <ArrowUpDown size={14} className="ml-1" />
                                                    </button>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Vendor Info
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Shipping Address
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <button
                                                        onClick={() => handleFilterChange("sortBy", "totalAmount")}
                                                        className="flex items-center hover:text-gray-700"
                                                    >
                                                        Amount
                                                        <ArrowUpDown size={14} className="ml-1" />
                                                    </button>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Payment
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {orders.map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">#{order._id.slice(-8).toUpperCase()}</div>
                                                            <div className="text-sm text-gray-500 flex items-center">
                                                                <Calendar size={12} className="mr-1" />
                                                                {formatDate(order.createdAt)}
                                                            </div>
                                                            <div className="text-xs text-gray-400 mt-1 bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                                                                {order.items?.length || 0} item(s)
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                                <User size={20} className="text-gray-500" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{order.userDetails?.vendorName || 'Unknown Vendor'}</div>
                                                                <div className="text-sm text-gray-500 flex items-center">
                                                                    <Mail size={12} className="mr-1" />
                                                                    {order.userDetails?.email || 'No email'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">
                                                            <div className="font-medium">{order.shippingAddress?.name}</div>
                                                            <div className="text-gray-500">
                                                                {order.shippingAddress?.city}, {order.shippingAddress?.state}
                                                            </div>
                                                            <div className="text-gray-500">{order.shippingAddress?.postalCode}</div>
                                                            {order.shippingAddress?.phone && (
                                                                <div className="text-gray-500 flex items-center">
                                                                    <Phone size={12} className="mr-1" />
                                                                    {order.shippingAddress.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-lg font-semibold text-gray-900 bg-green-50 px-3 py-1 rounded-lg inline-block">
                                                            ₹{order.totalAmount.toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                                order.status,
                                                            )}`}
                                                        >
                                                            {getStatusIcon(order.status)}
                                                            <span className="ml-1 capitalize">{order.status}</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                                                                order.paymentStatus,
                                                            )}`}
                                                        >
                                                            <CreditCard size={12} className="mr-1" />
                                                            <span className="capitalize">{order.paymentStatus}</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOrder(order)
                                                                setIsEditMode(false)
                                                                setIsModalOpen(true)
                                                            }}
                                                            className="text-teal-600 hover:text-teal-900 bg-teal-50 p-2 rounded-lg mr-2 transition-colors"
                                                            title="View Order Details"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOrder(order)
                                                                setIsEditMode(true)
                                                                setIsModalOpen(true)
                                                            }}
                                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-lg transition-colors"
                                                            title="Edit Order"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="bg-white px-4 sm:px-6 py-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 flex justify-between sm:hidden">
                                                <button
                                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    Previous
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-700">
                                                        Showing <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> to{" "}
                                                        <span className="font-medium">{Math.min(currentPage * 20, totalCount)}</span> of{" "}
                                                        <span className="font-medium">{totalCount}</span> results
                                                    </p>
                                                </div>
                                                <div>
                                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                        <button
                                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                            disabled={currentPage === 1}
                                                            className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                        >
                                                            <ChevronLeft size={18} />
                                                        </button>
                                                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                                            const page = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4)) + Math.min(i, 4)
                                                            return (
                                                                <button
                                                                    key={page}
                                                                    onClick={() => setCurrentPage(page)}
                                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                                        currentPage === page
                                                                            ? "z-10 bg-teal-50 border-teal-500 text-teal-600"
                                                                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                                        }`}
                                                                >
                                                                    {page}
                                                                </button>
                                                            )
                                                        })}
                                                        <button
                                                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                            disabled={currentPage === totalPages}
                                                            className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                        >
                                                            <ChevronRight size={18} />
                                                        </button>
                                                    </nav>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Order Details Modal */}
            {isModalOpen && <OrderDetailsModal />}
        </div>
    )
}
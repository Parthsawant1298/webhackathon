"use client"

import SupplierHeader from "@/components/SupplierHeader"

import {
    Activity,
    AlertTriangle,
    ArrowUp,
    BarChart2,
    Bell,
    Calendar,
    CheckCircle,
    ChevronRight,
    Clock,
    DollarSign,
    Layers,
    Package,
    Percent,
    Plus,
    RefreshCw,
    Settings,
    ShoppingCart,
    Target,
    TrendingUp,
    User,
    Users,
    XCircle,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SupplierDashboardPage() {
    const router = useRouter()
    const [supplier, setSupplier] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalRawMaterials: 0,
            totalVendors: 0,
            totalOrders: 0,
            totalRevenue: 0,
            lowStockRawMaterials: 0,
            outOfStockRawMaterials: 0,
            processingOrders: 0,
            deliveredOrders: 0,
            paymentFailedOrders: 0,
        },
        recentRawMaterials: [],
        recentOrders: [],
        recentActivity: [],
        categoryStats: [],
        monthlyRevenue: [],
        insights: {
            averageOrderValue: 0,
            conversionRate: 0,
            topCategory: "No raw materials yet",
        },
    })

    const fetchDashboardData = async () => {
        try {
            setIsRefreshing(true)
            const response = await fetch("/api/supplier/dashboard-stats")
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch dashboard data")
            }

            // Merge fetched data with default state to prevent undefined properties
            setDashboardData(prevData => ({
                ...prevData,
                ...data,
                stats: { ...prevData.stats, ...data.stats },
                insights: { ...prevData.insights, ...data.insights },
            }))
            setError("")
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error)
            setError("Failed to load dashboard data")
        } finally {
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch("/api/supplier/auth/user")
                const data = await response.json()

                if (!response.ok) {
                    throw new Error("Not authenticated")
                }

                setSupplier(data.supplier)
                await fetchDashboardData()
            } catch (error) {
                console.error("Authentication check failed:", error)
                router.push("/supplier/login")
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [router])

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const formatTime = (dateString) => {
        const now = new Date()
        const date = new Date(dateString)
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60))
            return `${diffInMinutes} minutes ago`
        } else if (diffInHours < 24) {
            return `${diffInHours} hours ago`
        } else {
            const diffInDays = Math.floor(diffInHours / 24)
            return `${diffInDays} days ago`
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "processing":
                return "text-blue-600 bg-blue-100"
            case "delivered":
                return "text-green-600 bg-green-100"
            case "payment failed":
                return "text-red-600 bg-red-100"
            default:
                return "text-gray-600 bg-gray-100"
        }
    }

    const getActivityIcon = (type) => {
        switch (type) {
            case "order":
                return <ShoppingCart size={16} className="text-green-600" />
            case "rawmaterial":
                return <Package size={16} className="text-blue-600" />
            case "vendor":
                return <User size={16} className="text-purple-600" />
            default:
                return <Activity size={16} className="text-gray-600" />
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                <SupplierHeader />
                <div className="flex-grow flex items-center justify-center px-4">
                    <div className="flex flex-col items-center bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-sm w-full">
                        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
                        <p className="text-teal-700 font-medium text-sm sm:text-base">Loading dashboard...</p>
                        <p className="text-gray-500 text-xs sm:text-sm mt-2 text-center">Preparing your business overview</p>
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
                    {/* Welcome banner */}
                    <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white opacity-5 rounded-full -mt-8 sm:-mt-16 -mr-8 sm:-mr-16"></div>
                        <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-40 sm:h-40 bg-white opacity-5 rounded-full -mb-8 sm:-mb-16 -ml-8 sm:-ml-16"></div>

                        <div className="flex flex-col lg:flex-row lg:items-center justify-between relative z-10 gap-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">Welcome back, {supplier?.name.split(" ")[0]}!</h1>
                                <p className="text-teal-100 text-sm sm:text-base lg:text-lg">Here's what's happening with your business today.</p>
                                {error && (
                                    <div className="mt-2 sm:mt-3 bg-red-400 bg-opacity-20 px-3 sm:px-4 py-2 rounded-lg text-white flex items-center text-sm">
                                        <AlertTriangle size={14} className="mr-2 flex-shrink-0" />
                                        <span className="break-words">{error}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <Link
                                    href="/supplier/add-raw-material"
                                    className="bg-white text-teal-700 hover:bg-teal-50 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg shadow-md flex items-center justify-center font-medium transition-colors text-sm sm:text-base"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Add Raw Material
                                </Link>
                                <button
                                    onClick={fetchDashboardData}
                                    disabled={isRefreshing}
                                    className="bg-teal-500 hover:bg-teal-400 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg shadow-md flex items-center justify-center font-medium transition-colors disabled:opacity-70 text-sm sm:text-base"
                                >
                                    <RefreshCw size={16} className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                                    {isRefreshing ? "Refreshing..." : "Refresh"}
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Empty state for dashboard */}
                    {dashboardData.stats.totalOrders === 0 && dashboardData.stats.totalRawMaterials === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <Package size={48} className="mb-4 text-gray-300" />
                            <p className="text-lg font-semibold">No data to display</p>
                            <p className="text-sm mt-2">Add raw materials and receive orders to see your business stats here.</p>
                        </div>
                    )}

                    {/* Key Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">Average Order Value</p>
                                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1 truncate">
                                        ₹{(dashboardData.insights?.averageOrderValue || 0).toLocaleString()}
                                    </h3>
                                    <p className="text-green-600 text-xs mt-1 font-medium">Per completed order</p>
                                </div>
                                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                                    <Target size={20} className="sm:hidden" />
                                    <Target size={28} className="hidden sm:block" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-purple-500">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">Conversion Rate</p>
                                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">{(dashboardData.insights?.conversionRate || 0)}%</h3>
                                    <p className="text-purple-600 text-xs mt-1 font-medium">Vendors to customers</p>
                                </div>
                                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 flex-shrink-0">
                                    <Percent size={20} className="sm:hidden" />
                                    <Percent size={28} className="hidden sm:block" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">Top Category</p>
                                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mt-1 truncate">
                                        {dashboardData.insights?.topCategory || 'N/A'}
                                    </h3>
                                    <p className="text-indigo-600 text-xs mt-1 font-medium">Most raw materials</p>
                                </div>
                                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0">
                                    <BarChart2 size={20} className="sm:hidden" />
                                    <BarChart2 size={28} className="hidden sm:block" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alerts Section */}
                    {(dashboardData.stats?.outOfStockRawMaterials > 0 ||
                        dashboardData.stats?.lowStockRawMaterials > 0 ||
                        dashboardData.stats?.paymentFailedOrders > 0) && (
                        <div className="mb-4 sm:mb-6 lg:mb-8">
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-5 rounded-xl shadow-md">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                                    </div>
                                    <div className="ml-3 sm:ml-4">
                                        <h3 className="text-base sm:text-lg font-semibold text-yellow-800">Attention Required</h3>
                                        <div className="mt-2 text-yellow-700">
                                            <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-sm sm:text-base">
                                                {dashboardData.stats.outOfStockRawMaterials > 0 && (
                                                    <li className="flex items-start">
                                                        <span className="inline-flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-red-100 text-red-500 mr-2 mt-0.5 flex-shrink-0">
                                                            <AlertTriangle size={10} className="sm:hidden" />
                                                            <AlertTriangle size={12} className="hidden sm:block" />
                                                        </span>
                                                        <span>{dashboardData.stats.outOfStockRawMaterials} raw materials are out of stock</span>
                                                    </li>
                                                )}
                                                {dashboardData.stats.lowStockRawMaterials > 0 && (
                                                    <li className="flex items-start">
                                                        <span className="inline-flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-amber-100 text-amber-500 mr-2 mt-0.5 flex-shrink-0">
                                                            <AlertTriangle size={10} className="sm:hidden" />
                                                            <AlertTriangle size={12} className="hidden sm:block" />
                                                        </span>
                                                        <span>{dashboardData.stats.lowStockRawMaterials} raw materials have low stock (≤5 items)</span>
                                                    </li>
                                                )}
                                                {dashboardData.stats.paymentFailedOrders > 0 && (
                                                    <li className="flex items-start">
                                                        <span className="inline-flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-red-100 text-red-500 mr-2 mt-0.5 flex-shrink-0">
                                                            <XCircle size={10} className="sm:hidden" />
                                                            <XCircle size={12} className="hidden sm:block" />
                                                        </span>
                                                        <span>{dashboardData.stats.paymentFailedOrders} orders have payment failures</span>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Stats cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 transform hover:-translate-y-1">
                            <div className="flex justify-between items-start">
                                <div className="min-w-0 flex-1">
                                    <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">Total Raw Materials</p>
                                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-2">{dashboardData.stats?.totalRawMaterials || 0}</h3>
                                    <div className="flex flex-wrap gap-1 sm:gap-2 text-xs mt-2 sm:mt-3">
                                        {dashboardData.stats?.lowStockRawMaterials > 0 && (
                                            <span className="text-amber-600 bg-amber-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center">
                                                <AlertTriangle size={10} className="mr-1" />
                                                {dashboardData.stats.lowStockRawMaterials} low stock
                                            </span>
                                        )}
                                        {dashboardData.stats?.outOfStockRawMaterials > 0 && (
                                            <span className="text-red-600 bg-red-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center">
                                                <AlertTriangle size={10} className="mr-1" />
                                                {dashboardData.stats.outOfStockRawMaterials} out of stock
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 flex-shrink-0">
                                    <Package size={20} className="sm:hidden" />
                                    <Package size={28} className="hidden sm:block" />
                                </div>
                            </div>
                            <Link
                                href="/supplier/rawmaterials"
                                className="mt-3 sm:mt-4 inline-flex items-center text-teal-600 text-xs sm:text-sm font-medium hover:text-teal-700 group"
                            >
                                View all raw materials
                                <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 transform hover:-translate-y-1">
                            <div className="flex justify-between items-start">
                                <div className="min-w-0 flex-1">
                                    <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">Total Vendors</p>
                                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-2">{dashboardData.stats?.totalVendors || 0}</h3>
                                    <p className="text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs mt-2 sm:mt-3 inline-block">
                                        Registered vendors
                                    </p>
                                </div>
                                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <Users size={20} className="sm:hidden" />
                                    <Users size={28} className="hidden sm:block" />
                                </div>
                            </div>
                            <button className="mt-3 sm:mt-4 inline-flex items-center text-teal-600 text-xs sm:text-sm font-medium hover:text-teal-700 group">
                                Manage vendors
                                <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>

                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 transform hover:-translate-y-1">
                            <div className="flex justify-between items-start">
                                <div className="min-w-0 flex-1">
                                    <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">Total Orders</p>
                                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-2">{dashboardData.stats?.totalOrders || 0}</h3>
                                    <div className="flex flex-wrap gap-1 sm:gap-2 text-xs mt-2 sm:mt-3">
                                        {dashboardData.stats?.processingOrders > 0 && (
                                            <span className="text-blue-600 bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                                {dashboardData.stats.processingOrders} processing
                                            </span>
                                        )}
                                        {dashboardData.stats?.deliveredOrders > 0 && (
                                            <span className="text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                                {dashboardData.stats.deliveredOrders} delivered
                                            </span>
                                        )}
                                        {dashboardData.stats?.paymentFailedOrders > 0 && (
                                            <span className="text-red-600 bg-red-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                                {dashboardData.stats.paymentFailedOrders} failed
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0">
                                    <ShoppingCart size={20} className="sm:hidden" />
                                    <ShoppingCart size={28} className="hidden sm:block" />
                                </div>
                            </div>
                            <Link
                                href="/supplier/orders"
                                className="mt-3 sm:mt-4 inline-flex items-center text-teal-600 text-xs sm:text-sm font-medium hover:text-teal-700 group"
                            >
                                View orders
                                <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 transform hover:-translate-y-1">
                            <div className="flex justify-between items-start">
                                <div className="min-w-0 flex-1">
                                    <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">Total Revenue</p>
                                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-2 break-words">
                                        ₹{(dashboardData.stats?.totalRevenue || 0).toLocaleString()}
                                    </h3>
                                    <p className="text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs mt-2 sm:mt-3 inline-block">
                                        From completed orders
                                    </p>
                                </div>
                                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                                    <DollarSign size={20} className="sm:hidden" />
                                    <DollarSign size={28} className="hidden sm:block" />
                                </div>
                            </div>
                            <Link
                                href="/supplier/analytics"
                                className="mt-3 sm:mt-4 inline-flex items-center text-teal-600 text-xs sm:text-sm font-medium hover:text-teal-700 group"
                            >
                                View analytics
                                <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>

                  
                    {/* Main content grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {/* Recent raw materials */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-3 sm:p-4 lg:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                                    <div className="p-1.5 sm:p-2 bg-teal-100 rounded-lg mr-2 sm:mr-3 text-teal-600">
                                        <Package size={16} className="sm:hidden" />
                                        <Package size={20} className="hidden sm:block" />
                                    </div>
                                    Recent Raw Materials
                                </h2>
                                <Link
                                    href="/supplier/rawmaterials"
                                    className="text-xs sm:text-sm text-teal-600 hover:text-teal-700 flex items-center group"
                                >
                                    View all
                                    <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>

                            {(dashboardData.recentRawMaterials || []).length === 0 ? (
                                <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <Package size={32} className="mx-auto mb-3 sm:mb-4 text-gray-300 sm:hidden" />
                                    <Package size={48} className="mx-auto mb-3 sm:mb-4 text-gray-300 hidden sm:block" />
                                    <p className="text-gray-600 mb-3 text-sm sm:text-base">No raw materials yet.</p>
                                    <Link
                                        href="/supplier/add-raw-material"
                                        className="inline-flex items-center px-3 sm:px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm sm:text-base"
                                    >
                                        <Plus size={14} className="mr-2" />
                                        Add your first raw material
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-gray-100">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                                                    Raw Material
                                                </th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                                    Category
                                                </th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Price
                                                </th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                                    Stock
                                                </th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider text-right rounded-tr-lg">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {(dashboardData.recentRawMaterials || []).map((rawMaterial) => (
                                                <tr key={rawMaterial._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                                <Image
                                                                    src={rawMaterial.mainImage || "/placeholder.svg"}
                                                                    alt={rawMaterial.name}
                                                                    className="w-full h-full object-cover"
                                                                    width={40}
                                                                    height={40}
                                                                />
                                                            </div>
                                                            <div className="ml-2 sm:ml-4 min-w-0">
                                                                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-32 sm:max-w-xs">
                                                                    {rawMaterial.name}
                                                                </div>
                                                                {rawMaterial.subcategory && (
                                                                    <div className="text-xs text-gray-500 truncate">{rawMaterial.subcategory}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                                                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                                            {rawMaterial.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                                                        <div className="text-xs sm:text-sm font-medium text-gray-900">₹{rawMaterial.price.toLocaleString()}</div>
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                                                        <div
                                                            className={`text-xs sm:text-sm flex items-center ${rawMaterial.quantity <= 0
                                                                    ? "text-red-600"
                                                                    : rawMaterial.quantity <= 5
                                                                        ? "text-amber-600"
                                                                        : "text-green-600"
                                                                }`}
                                                        >
                                                            {rawMaterial.quantity <= 0 && <AlertTriangle size={12} className="mr-1" />}
                                                            {rawMaterial.quantity <= 5 && rawMaterial.quantity > 0 && (
                                                                <AlertTriangle size={12} className="mr-1" />
                                                            )}
                                                            {rawMaterial.quantity > 5 && <CheckCircle size={12} className="mr-1" />}
                                                            {rawMaterial.quantity <= 0
                                                                ? "Out of Stock"
                                                                : rawMaterial.quantity <= 5
                                                                    ? `Low Stock (${rawMaterial.quantity})`
                                                                    : `In Stock (${rawMaterial.quantity})`}
                                                        </div>
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                                                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                                            <Link
                                                                href={`/supplier/rawmaterials/${rawMaterial._id}`}
                                                                className="text-teal-600 hover:text-teal-700 bg-teal-50 px-2 sm:px-3 py-1 rounded-md text-xs"
                                                            >
                                                                View
                                                            </Link>
                                                            <Link
                                                                href={`/supplier/rawmaterials/${rawMaterial._id}/edit`}
                                                                className="text-blue-600 hover:text-blue-700 bg-blue-50 px-2 sm:px-3 py-1 rounded-md text-xs"
                                                            >
                                                                Edit
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Right sidebar */}
                        <div className="space-y-4 sm:space-y-6">
                            {/* Recent Activity */}
                            <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 lg:p-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center mb-4 sm:mb-6">
                                    <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg mr-2 sm:mr-3 text-purple-600">
                                        <Activity size={16} className="sm:hidden" />
                                        <Activity size={20} className="hidden sm:block" />
                                    </div>
                                    Recent Activity
                                </h2>

                                {(dashboardData.recentActivity || []).length === 0 ? (
                                    <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <Clock size={24} className="mx-auto mb-2 text-gray-300 sm:hidden" />
                                        <Clock size={32} className="mx-auto mb-2 text-gray-300 hidden sm:block" />
                                        <p className="text-gray-600 text-sm sm:text-base">No recent activity</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-80 overflow-y-auto pr-1 sm:pr-2 -mr-1 sm:-mr-2">
                                        {(dashboardData.recentActivity || []).map((activity, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors"
                                            >
                                                <div className="h-7 w-7 sm:h-9 sm:w-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    {getActivityIcon(activity.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs sm:text-sm text-gray-700 break-words">{activity.description}</p>
                                                    <p className="text-xs text-gray-500 mt-1 bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded-full inline-block">
                                                        {formatTime(activity.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Recent Orders */}
                            <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 lg:p-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center mb-4 sm:mb-6">
                                    <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg mr-2 sm:mr-3 text-amber-600">
                                        <ShoppingCart size={16} className="sm:hidden" />
                                        <ShoppingCart size={20} className="hidden sm:block" />
                                    </div>
                                    Recent Orders
                                </h2>

                                {(dashboardData.recentOrders || []).length === 0 ? (
                                    <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <ShoppingCart size={24} className="mx-auto mb-2 text-gray-300 sm:hidden" />
                                        <ShoppingCart size={32} className="mx-auto mb-2 text-gray-300 hidden sm:block" />
                                        <p className="text-gray-600 text-sm sm:text-base">No orders yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-80 overflow-y-auto pr-1 sm:pr-2 -mr-1 sm:-mr-2">
                                        {(dashboardData.recentOrders || []).map((order) => (
                                            <div
                                                key={order._id}
                                                className="p-3 sm:p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs sm:text-sm font-medium text-gray-900 flex items-center">
                                                            <User size={12} className="mr-1 text-gray-500 flex-shrink-0" />
                                                            <span className="truncate">{order.user?.name || "Unknown Vendor"}</span>
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate mt-1">{order.user?.email}</p>
                                                        <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-2 bg-gray-50 px-2 py-1 rounded inline-block">
                                                            ₹{order.totalAmount.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-left sm:text-right ml-0 sm:ml-4 flex-shrink-0">
                                                        <span
                                                            className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                        <p className="text-xs text-gray-500 mt-1 flex items-center sm:justify-end">
                                                            <Calendar size={10} className="mr-1" />
                                                            {formatDate(order.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Popular Categories */}
                            <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 lg:p-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center mb-4 sm:mb-6">
                                    <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg mr-2 sm:mr-3 text-blue-600">
                                        <Layers size={16} className="sm:hidden" />
                                        <Layers size={20} className="hidden sm:block" />
                                    </div>
                                    Category Distribution
                                </h2>

                                {(dashboardData.categoryStats || []).length === 0 ? (
                                    <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <BarChart2 size={24} className="mx-auto mb-2 text-gray-300 sm:hidden" />
                                        <BarChart2 size={32} className="mx-auto mb-2 text-gray-300 hidden sm:block" />
                                        <p className="text-gray-600 text-sm sm:text-base">No category data</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 sm:space-y-5">
                                        {(dashboardData.categoryStats || []).slice(0, 5).map((category, index) => {
                                            const maxCount = Math.max(...(dashboardData.categoryStats || []).map((c) => c.count))
                                            const percentage = Math.round((category.count / maxCount) * 100)

                                            return (
                                                <div key={category._id} className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-xs sm:text-sm font-medium text-gray-800 truncate">{category._id}</span>
                                                        <span className="text-xs sm:text-sm font-medium text-gray-800 bg-white px-1.5 sm:px-2 rounded">
                                                            {category.count}
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-2 sm:h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-teal-500 rounded-full transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between mt-1 sm:mt-1.5">
                                                        <span className="text-xs text-gray-500 bg-white px-1.5 sm:px-2 py-0.5 rounded">
                                                            ₹{category.totalValue?.toLocaleString() || "0"}
                                                        </span>
                                                        <span className="text-xs text-teal-600 font-medium">{percentage}%</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Quick actions */}
                            <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 lg:p-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center mb-4 sm:mb-6">
                                    <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg mr-2 sm:mr-3 text-green-600">
                                        <Settings size={16} className="sm:hidden" />
                                        <Settings size={20} className="hidden sm:block" />
                                    </div>
                                    Quick Actions
                                </h2>

                                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                    <Link
                                        href="/supplier/add-raw-material"
                                        className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl transition-colors flex items-center group border border-teal-100"
                                    >
                                        <div className="p-1.5 sm:p-2 bg-white rounded-lg mr-2 sm:mr-3 text-teal-600">
                                            <Plus size={14} className="sm:hidden" />
                                            <Plus size={18} className="hidden sm:block" />
                                        </div>
                                        <span className="font-medium text-sm sm:text-base">Add New Raw Material</span>
                                        <ChevronRight size={14} className="ml-auto transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <Link
                                        href="/supplier/rawmaterials"
                                        className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-colors flex items-center group border border-blue-100"
                                    >
                                        <div className="p-1.5 sm:p-2 bg-white rounded-lg mr-2 sm:mr-3 text-blue-600">
                                            <Package size={14} className="sm:hidden" />
                                            <Package size={18} className="hidden sm:block" />
                                        </div>
                                        <span className="font-medium text-sm sm:text-base">Manage Inventory</span>
                                        <ChevronRight size={14} className="ml-auto transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <button
                                        onClick={fetchDashboardData}
                                        disabled={isRefreshing}
                                        className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl transition-colors flex items-center group border border-green-100 disabled:opacity-50"
                                    >
                                        <div className="p-1.5 sm:p-2 bg-white rounded-lg mr-2 sm:mr-3 text-green-600">
                                            <RefreshCw size={14} className={`${isRefreshing ? "animate-spin" : ""} sm:hidden`} />
                                            <RefreshCw size={18} className={`${isRefreshing ? "animate-spin" : ""} hidden sm:block`} />
                                        </div>
                                        <span className="font-medium text-sm sm:text-base">{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
                                        <ChevronRight size={14} className="ml-auto transition-transform group-hover:translate-x-1" />
                                    </button>
                                    <Link
                                        href="/supplier/profile"
                                        className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl transition-colors flex items-center group border border-purple-100"
                                    >
                                        <div className="p-1.5 sm:p-2 bg-white rounded-lg mr-2 sm:mr-3 text-purple-600">
                                            <User size={14} className="sm:hidden" />
                                            <User size={18} className="hidden sm:block" />
                                        </div>
                                        <span className="font-medium text-sm sm:text-base">Update Profile</span>
                                        <ChevronRight size={14} className="ml-auto transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Revenue Chart */}
                    {(dashboardData.monthlyRevenue || []).length > 0 && (
                        <div className="mt-4 sm:mt-6 lg:mt-8 bg-white rounded-xl shadow-md p-3 sm:p-4 lg:p-6">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center mb-4 sm:mb-6">
                                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg mr-2 sm:mr-3 text-green-600">
                                    <TrendingUp size={16} className="sm:hidden" />
                                    <TrendingUp size={20} className="hidden sm:block" />
                                </div>
                                Revenue Trend (Last 6 Months)
                            </h2>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4">
                                {(dashboardData.monthlyRevenue || []).map((month, index) => {
                                    const maxRevenue = Math.max(...(dashboardData.monthlyRevenue || []).map((m) => m.totalRevenue))
                                    const height = maxRevenue > 0 ? (month.totalRevenue / maxRevenue) * 100 : 0
                                    const monthName = new Date(month._id.year, month._id.month - 1).toLocaleDateString("en-US", {
                                        month: "short",
                                    })

                                    return (
                                        <div key={index} className="text-center">
                                            <div className="h-24 sm:h-32 lg:h-40 flex items-end justify-center mb-2">
                                                <div
                                                    className="w-8 sm:w-12 lg:w-16 bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-lg transition-all duration-500 hover:from-teal-700 hover:to-teal-500 cursor-pointer relative group"
                                                    style={{ height: `${Math.max(height, 4)}%` }}
                                                >
                                                    <div className="absolute -top-8 sm:-top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 sm:px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                        ₹{month.totalRevenue.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-100 rounded-lg px-1.5 sm:px-2 py-1 mb-1">
                                                {monthName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                ₹
                                                {month.totalRevenue >= 1000 ? (month.totalRevenue / 1000).toFixed(0) + "k" : month.totalRevenue}
                                            </div>
                                            <div className="text-xs text-teal-600 font-medium">{month.orderCount} orders</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Performance Summary */}
                    <div className="mt-4 sm:mt-6 lg:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 sm:p-6 rounded-xl text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow">
                            <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-white opacity-10 rounded-full -mt-4 sm:-mt-8 -mr-4 sm:-mr-8 group-hover:scale-110 transition-transform"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div className="min-w-0 flex-1">
                                    <p className="text-blue-100 text-xs sm:text-sm font-medium">This Month</p>
                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1">
                                        {(dashboardData.monthlyRevenue || []).length > 0
                                            ? dashboardData.monthlyRevenue[dashboardData.monthlyRevenue.length - 1]?.orderCount || 0
                                            : 0}{" "}
                                        Orders
                                    </p>
                                    <div className="mt-2 text-black bg-white bg-opacity-20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs inline-block">
                                        Monthly performance
                                    </div>
                                </div>
                                <div className="p-2 sm:p-3 bg-white bg-opacity-20 rounded-full flex-shrink-0">
                                    <TrendingUp size={20} className="text-black sm:hidden" />
                                    <TrendingUp size={24} className="text-black hidden sm:block" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-700 p-4 sm:p-6 rounded-xl text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow">
                            <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-white opacity-10 rounded-full -mt-4 sm:-mt-8 -mr-4 sm:-mr-8 group-hover:scale-110 transition-transform"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div className="min-w-0 flex-1">
                                    <p className="text-green-100 text-xs sm:text-sm font-medium">Revenue Growth</p>
                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1">
                                        {(dashboardData.monthlyRevenue || []).length >= 2
                                            ? Math.round(
                                                (((dashboardData.monthlyRevenue[dashboardData.monthlyRevenue.length - 1]?.totalRevenue || 0) -
                                                    (dashboardData.monthlyRevenue[dashboardData.monthlyRevenue.length - 2]?.totalRevenue || 0)) /
                                                    (dashboardData.monthlyRevenue[dashboardData.monthlyRevenue.length - 2]?.totalRevenue || 1)) * 100
                                            )
                                            : 0}
                                        %
                                    </p>
                                    <div className="mt-2 text-black bg-white bg-opacity-20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs inline-block">
                                        Month-over-month
                                    </div>
                                </div>
                                <div className="p-2 sm:p-3 bg-white bg-opacity-20 rounded-full flex-shrink-0">
                                    <ArrowUp size={20} className="text-black sm:hidden" />
                                    <ArrowUp size={24} className="text-black hidden sm:block" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
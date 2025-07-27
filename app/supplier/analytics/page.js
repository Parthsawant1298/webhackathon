"use client"

import SupplierHeader from "@/components/SupplierHeader"
import {
    Activity,
    AlertTriangle,
    Award,
    BarChart2,
    Calendar,
    CreditCard,
    DollarSign,
    Download,
    Mail,
    Package,
    PieChart,
    RefreshCw,
    ShoppingCart,
    Target,
    TrendingDown,
    TrendingUp,
    Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export default function SupplierAnalyticsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState("12months")

  const [analyticsData, setAnalyticsData] = useState({
    dailyRevenue: [],
    monthlyRevenue: [],
    categoryRevenue: [],
    productRevenue: [],
    vendorAnalytics: [],
    paymentAnalysis: [],
    orderSizeAnalysis: [],
    topVendors: [],
    growth: { revenue: 0, orders: 0, vendors: 0 },
    summary: {
      today: { revenue: 0, orders: 0 },
      thisMonth: { revenue: 0, orders: 0 },
      thisYear: { revenue: 0, orders: 0 },
      allTime: { revenue: 0, orders: 0 },
    },
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      fetchAnalytics()
    }
  }, [timeRange, isLoading])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/supplier/auth/user")
      const data = await response.json()

      if (!response.ok) {
        throw new Error("Not authenticated")
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Authentication check failed:", error)
      router.push("/supplier/login")
    }
  }

  const fetchAnalytics = async () => {
    try {
      setIsRefreshing(true)
      setError("")

      const response = await fetch(`/api/supplier/analytics?timeRange=${timeRange}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch analytics")
      }

      // Safely merge fetched data with the initial state
      setAnalyticsData(prevData => ({
        ...prevData,
        ...data.data, // Access the nested data object
      }))

      console.log('Analytics data loaded:', data.data)

    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      setError(`Failed to load analytics data: ${error.message}`)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`
    }
    return `₹${amount.toLocaleString()}`
  }

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  const formatDate = (dateObj) => {
    if (dateObj.day) {
      return `${dateObj.day}/${dateObj.month}`
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${months[dateObj.month - 1]} ${dateObj.year}`
  }

  const getGrowthIcon = (growth) => {
    if (growth > 0) {
      return <TrendingUp size={16} className="text-green-500" />
    } else if (growth < 0) {
      return <TrendingDown size={16} className="text-red-500" />
    }
    return <TrendingUp size={16} className="text-gray-500" />
  }

  const getGrowthColor = (growth) => {
    if (growth > 0) return "text-green-600"
    if (growth < 0) return "text-red-600"
    return "text-gray-600"
  }

  const RevenueChart = ({ data, type }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-48 sm:h-56 lg:h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Activity size={32} className="mx-auto mb-3 sm:mb-4 text-gray-300 sm:hidden" />
            <Activity size={48} className="mx-auto mb-3 sm:mb-4 text-gray-300 hidden sm:block" />
            <p className="text-sm sm:text-base">No data available</p>
          </div>
        </div>
      )
    }

    // Format data for the line chart
    const chartData = data.slice(-30).map((item) => ({
      date: formatDate(item._id),
      revenue: item.revenue,
      orders: item.orders || item.orderIds?.length || 0,
    }))

    return (
      <div className="h-48 sm:h-56 lg:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value), "Revenue"]}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                border: "none",
                padding: "8px 12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#14B8A6"
              strokeWidth={3}
              dot={{ r: 4, fill: "#14B8A6", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "#14B8A6", strokeWidth: 2, stroke: "#fff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const CategoryDonutChart = ({ data }) => {
    if (!data || data.length === 0) return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <div className="text-center">
          <PieChart size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No category data</p>
        </div>
      </div>
    )

    const total = data.reduce((sum, item) => sum + item.revenue, 0)
    const colors = ["#14B8A6", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#10B981"]

    let cumulativePercentage = 0

    return (
      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
          <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90">
            <circle cx="64" cy="64" r="48" fill="none" stroke="#F3F4F6" strokeWidth="16" className="sm:hidden" />
            <circle cx="80" cy="80" r="60" fill="none" stroke="#F3F4F6" strokeWidth="20" className="hidden sm:block" />
            {data.slice(0, 6).map((item, index) => {
              const percentage = (item.revenue / total) * 100
              const strokeDasharray = `${percentage * 3.77} 377`
              const strokeDashoffset = -cumulativePercentage * 3.77
              cumulativePercentage += percentage

              return (
                <circle
                  key={index}
                  cx="64"
                  cy="64"
                  r="48"
                  fill="none"
                  stroke={colors[index]}
                  strokeWidth="16"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 hover:stroke-opacity-80 sm:hidden"
                />
              )
            })}
            {data.slice(0, 6).map((item, index) => {
              const percentage = (item.revenue / total) * 100
              const strokeDasharray = `${percentage * 3.77} 377`
              const strokeDashoffset = -cumulativePercentage * 3.77
              cumulativePercentage += percentage

              return (
                <circle
                  key={index}
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke={colors[index]}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 hover:stroke-opacity-80 hidden sm:block"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs sm:text-sm font-semibold text-gray-900">{formatCurrency(total)}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
        <div className="space-y-1 sm:space-y-2">
          {data.slice(0, 6).map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2" style={{ backgroundColor: colors[index] }}></div>
              <div className="text-xs sm:text-sm">
                <div className="font-medium text-gray-900 truncate max-w-24 sm:max-w-32">{item._id}</div>
                <div className="text-gray-500">{formatCurrency(item.revenue)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const MetricCard = ({ title, value, change, icon: Icon, color, subtext }) => (
    <div
      className={`bg-gradient-to-br ${color} p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 text-white overflow-hidden relative`}
    >
      <div className="absolute top-0 right-0 opacity-10">
        <Icon size={60} className="sm:hidden" />
        <Icon size={80} className="hidden sm:block" />
      </div>
      <div className="relative z-10">
        <p className="text-white opacity-80 text-xs sm:text-sm font-medium mb-1">{title}</p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 break-words">{value}</p>
        {subtext && <p className="text-white opacity-70 text-xs sm:text-sm">{subtext}</p>}
        {change !== undefined && (
          <div className="flex-items-center mt-2 text-black bg-white bg-opacity-20 rounded-full px-2 sm:px-3 py-1 inline-block">
            {getGrowthIcon(change)}
            <span className="text-xs sm:text-sm ml-1 font-medium">{Math.abs(change)}% vs last period</span>
          </div>
        )}
      </div>
    </div>
  )

  const exportData = () => {
    const dataToExport = {
      summary: analyticsData.summary,
      growth: analyticsData.growth,
      categoryRevenue: analyticsData.categoryRevenue,
      topProducts: analyticsData.productRevenue,
      topVendors: analyticsData.topVendors,
      generatedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `revenue-analytics-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "7days":
        return "Last 7 Days"
      case "30days":
        return "Last 30 Days"
      case "90days":
        return "Last 90 Days"
      case "12months":
        return "Last 12 Months"
      case "thisyear":
        return "This Year"
      default:
        return "Custom Range"
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <SupplierHeader />
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="flex flex-col items-center bg-white p-6 sm:p-8 rounded-xl shadow-md max-w-sm w-full">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
            <p className="text-teal-700 font-medium text-sm sm:text-base">Loading analytics dashboard...</p>
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
          {/* Empty state for analytics */}
          {(!analyticsData.dailyRevenue || analyticsData.dailyRevenue.length === 0) &&
            (!analyticsData.monthlyRevenue || analyticsData.monthlyRevenue.length === 0) && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <BarChart2 size={48} className="mb-4 text-gray-300" />
              <p className="text-lg font-semibold">No analytics data available</p>
              <p className="text-sm mt-2">Analytics will appear once you have orders and sales activity.</p>
            </div>
          )}
          {/* Header */}
          <div className="mb-4 sm:mb-6 lg:mb-8 bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Revenue Analytics</h1>
                <p className="text-gray-600 text-sm sm:text-base">Comprehensive insights into your business performance</p>
                <div className="mt-2 inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs sm:text-sm">
                  <Calendar size={12} className="mr-1" />
                  {getTimeRangeLabel()}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm text-sm sm:text-base"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="12months">Last 12 Months</option>
                  <option value="thisyear">This Year</option>
                </select>
                <button
                  onClick={exportData}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center transition-colors shadow-sm text-sm sm:text-base"
                >
                  <Download size={16} className="mr-2" />
                  Export
                </button>
                <button
                  onClick={fetchAnalytics}
                  disabled={isRefreshing}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70 shadow-sm text-sm sm:text-base"
                >
                  <RefreshCw size={16} className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
              <div className="flex items-center">
                <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">{error}</span>
              </div>
            </div>
          )}

          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
            <MetricCard
              title="Today's Revenue"
              value={formatCurrency(analyticsData.summary.today.revenue)}
              icon={DollarSign}
              color="from-blue-500 to-blue-700"
              subtext={`${analyticsData.summary.today.orders} orders`}
            />

            <MetricCard
              title="This Month"
              value={formatCurrency(analyticsData.summary.thisMonth.revenue)}
              change={analyticsData.growth.revenue}
              icon={TrendingUp}
              color="from-green-500 to-green-700"
            />

            <MetricCard
              title="This Year"
              value={formatCurrency(analyticsData.summary.thisYear.revenue)}
              icon={Target}
              color="from-purple-500 to-purple-700"
              subtext={`${analyticsData.summary.thisYear.orders} orders`}
            />

            <MetricCard
              title="All Time"
              value={formatCurrency(analyticsData.summary.allTime.revenue)}
              icon={Award}
              color="from-orange-500 to-orange-700"
              subtext={`${analyticsData.summary.allTime.orders} total orders`}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
            {/* Revenue Trend Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Revenue Trend</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {timeRange === "7days" || timeRange === "30days"
                      ? "Daily"
                      : timeRange === "90days"
                        ? "Weekly"
                        : "Monthly"}{" "}
                    revenue
                  </p>
                </div>
                <div className="p-1.5 sm:p-2 bg-teal-50 rounded-full">
                  <Activity size={16} className="text-teal-600 sm:hidden" />
                  <Activity size={20} className="text-teal-600 hidden sm:block" />
                </div>
              </div>
              <RevenueChart data={analyticsData.dailyRevenue} type="daily" />
            </div>

            {/* Category Revenue Distribution */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Revenue by Category</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Distribution across product categories</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-blue-50 rounded-full">
                  <PieChart size={16} className="text-blue-600 sm:hidden" />
                  <PieChart size={20} className="text-blue-600 hidden sm:block" />
                </div>
              </div>
              <CategoryDonutChart data={analyticsData.categoryRevenue} />
            </div>
          </div>

          {/* Growth Metrics */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Growth Metrics</h3>
                <p className="text-xs sm:text-sm text-gray-500">Performance compared to previous period</p>
              </div>
              <div className="p-1.5 sm:p-2 bg-purple-50 rounded-full">
                <TrendingUp size={16} className="text-purple-600 sm:hidden" />
                <TrendingUp size={20} className="text-purple-600 hidden sm:block" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className={`text-2xl sm:text-3xl font-bold ${getGrowthColor(analyticsData.growth.revenue)} mb-2`}>
                  {analyticsData.growth.revenue >= 0 ? "+" : ""}
                  {analyticsData.growth.revenue}%
                </div>
                <div className="text-gray-600 font-medium text-sm sm:text-base">Revenue Growth</div>
                <div className="flex items-center justify-center mt-2">
                  {getGrowthIcon(analyticsData.growth.revenue)}
                  <span className="text-xs sm:text-sm text-gray-500 ml-1">vs previous period</span>
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className={`text-2xl sm:text-3xl font-bold ${getGrowthColor(analyticsData.growth.orders)} mb-2`}>
                  {analyticsData.growth.orders >= 0 ? "+" : ""}
                  {analyticsData.growth.orders}%
                </div>
                <div className="text-gray-600 font-medium text-sm sm:text-base">Orders Growth</div>
                <div className="flex items-center justify-center mt-2">
                  {getGrowthIcon(analyticsData.growth.orders)}
                  <span className="text-xs sm:text-sm text-gray-500 ml-1">vs previous period</span>
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className={`text-2xl sm:text-3xl font-bold ${getGrowthColor(analyticsData.growth.vendors)} mb-2`}>
                  {analyticsData.growth.vendors >= 0 ? "+" : ""}
                  {analyticsData.growth.vendors}%
                </div>
                <div className="text-gray-600 font-medium text-sm sm:text-base">Vendor Growth</div>
                <div className="flex items-center justify-center mt-2">
                  {getGrowthIcon(analyticsData.growth.vendors)}
                  <span className="text-xs sm:text-sm text-gray-500 ml-1">vs previous period</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
            {/* Top Products */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Top Products</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Best performing products by revenue</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-green-50 rounded-full">
                  <Package size={16} className="text-green-600 sm:hidden" />
                  <Package size={20} className="text-green-600 hidden sm:block" />
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {(analyticsData.productRevenue || []).slice(0, 5).map((product, index) => (
                  <div
                    key={product._id}
                    className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-600 font-semibold text-xs sm:text-sm">#{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{product.productName}</div>
                      <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-teal-500 mr-1"></span>
                        <span className="truncate">{product.category}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(product.revenue)}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{product.quantitySold} sold</div>
                    </div>
                  </div>
                ))}
                {(!analyticsData.productRevenue || analyticsData.productRevenue.length === 0) && (
                  <div className="text-center py-6 text-gray-500">
                    <Package size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No product data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Vendors */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Top Vendors</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Highest spending vendors</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-purple-50 rounded-full">
                  <Users size={16} className="text-purple-600 sm:hidden" />
                  <Users size={20} className="text-purple-600 hidden sm:block" />
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {(analyticsData.topVendors || []).slice(0, 5).map((vendor, index) => (
                  <div
                    key={vendor._id}
                    className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-xs sm:text-sm">#{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{vendor.vendorName}</div>
                      <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                        <Mail size={10} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{vendor.vendorEmail}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(vendor.totalSpent)}</div>
                      <div className="text-xs sm:text-sm text-gray-500 flex items-center justify-end">
                        <ShoppingCart size={10} className="mr-1" />
                        {vendor.orderCount} orders
                      </div>
                    </div>
                  </div>
                ))}
                {(!analyticsData.topVendors || analyticsData.topVendors.length === 0) && (
                  <div className="text-center py-6 text-gray-500">
                    <Users size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No vendor data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Size Analysis */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Order Size Distribution</h3>
                <p className="text-xs sm:text-sm text-gray-500">Analysis of order values by range</p>
              </div>
              <div className="p-1.5 sm:p-2 bg-orange-50 rounded-full">
                <ShoppingCart size={16} className="text-orange-600 sm:hidden" />
                <ShoppingCart size={20} className="text-orange-600 hidden sm:block" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {(analyticsData.orderSizeAnalysis || []).map((range, index) => (
                <div
                  key={range._id}
                  className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-colors"
                >
                  <div className="text-xs sm:text-sm font-medium text-gray-600 mb-2 truncate">{range._id}</div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900">{range.orders}</div>
                  <div className="text-xs text-gray-500">orders</div>
                  <div className="text-xs sm:text-sm text-teal-600 mt-1 font-medium">{formatCurrency(range.revenue)}</div>
                </div>
              ))}
              {(!analyticsData.orderSizeAnalysis || analyticsData.orderSizeAnalysis.length === 0) && (
                <div className="col-span-full text-center py-6 text-gray-500">
                  <ShoppingCart size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No order size data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Analysis */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Payment Method Analysis</h3>
                <p className="text-xs sm:text-sm text-gray-500">Revenue breakdown by payment method</p>
              </div>
              <div className="p-1.5 sm:p-2 bg-blue-50 rounded-full">
                <CreditCard size={16} className="text-blue-600 sm:hidden" />
                <CreditCard size={20} className="text-blue-600 hidden sm:block" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {(analyticsData.paymentAnalysis || []).map((payment, index) => (
                <div
                  key={payment._id}
                  className="p-4 sm:p-5 border border-gray-200 rounded-lg hover:border-teal-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900 flex items-center text-sm sm:text-base">
                      <CreditCard size={14} className="text-teal-500 mr-2 flex-shrink-0" />
                      <span className="truncate">{payment._id}</span>
                    </span>
                    <span className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded-full flex-shrink-0">
                      {Math.round((payment.revenue / (analyticsData.summary.thisYear.revenue || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Revenue:</span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(payment.revenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Orders:</span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{payment.orders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Avg Order Value:</span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(payment.avgOrderValue)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-teal-500 h-1.5 rounded-full"
                        style={{
                          width: `${Math.round((payment.revenue / (analyticsData.summary.thisYear.revenue || 1)) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {(!analyticsData.paymentAnalysis || analyticsData.paymentAnalysis.length === 0) && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <CreditCard size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No payment data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Vendor Analytics */}
          {(analyticsData.vendorAnalytics || []).length > 0 && (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow mt-4 sm:mt-6 lg:mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Vendor Spending Analysis</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Distribution of vendors by spending ranges</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-full">
                  <Users size={16} className="text-indigo-600 sm:hidden" />
                  <Users size={20} className="text-indigo-600 hidden sm:block" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {analyticsData.vendorAnalytics.map((bucket, index) => (
                  <div
                    key={index}
                    className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                      {bucket._id === 'Other' ? 'Other' : `₹${bucket._id.toLocaleString()}`}
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900">{bucket.vendors}</div>
                    <div className="text-xs text-gray-500">vendors</div>
                    <div className="text-xs sm:text-sm text-indigo-600 mt-1 font-medium">
                      {formatCurrency(bucket.totalRevenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Revenue Chart */}
          {(analyticsData.monthlyRevenue || []).length > 0 && (
            <div className="mt-4 sm:mt-6 lg:mt-8 bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg mr-2 sm:mr-3 text-green-600">
                  <TrendingUp size={16} className="sm:hidden" />
                  <TrendingUp size={20} className="hidden sm:block" />
                </div>
                Monthly Revenue Trend
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4">
                {analyticsData.monthlyRevenue.map((month, index) => {
                  const maxRevenue = Math.max(...analyticsData.monthlyRevenue.map((m) => m.revenue))
                  const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
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
                            ₹{month.revenue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-100 rounded-lg px-1.5 sm:px-2 py-1 mb-1">
                        {monthName}
                      </div>
                      <div className="text-xs text-gray-500">
                        ₹
                        {month.revenue >= 1000 ? (month.revenue / 1000).toFixed(0) + "k" : month.revenue}
                      </div>
                      <div className="text-xs text-teal-600 font-medium">{month.orders || month.orderCount} orders</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
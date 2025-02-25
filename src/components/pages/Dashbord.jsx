"use client"

import { useEffect, useState } from "react"
import { db } from "../firebase/firebase"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Home, User, BarChart2, Package, DollarSign, TrendingUp, ShoppingCart, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

const Dashboard = () => {
  const [inventory, setInventory] = useState([])
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [recentSales, setRecentSales] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [topSellingProducts, setTopSellingProducts] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch inventory
        const inventorySnapshot = await getDocs(collection(db, "inventory"))
        setInventory(inventorySnapshot.docs.map((doc) => doc.data()))

        // Fetch recent sales
        const salesQuery = query(collection(db, "sales"), orderBy("date", "desc"), limit(5))
        const salesSnapshot = await getDocs(salesQuery)
        setRecentSales(salesSnapshot.docs.map((doc) => doc.data()))

        // Calculate total revenue
        const revenue = salesSnapshot.docs.reduce((acc, doc) => acc + doc.data().total, 0)
        setTotalRevenue(revenue)

        // Fetch top selling products
        const topProductsQuery = query(collection(db, "inventory"), orderBy("soldQuantity", "desc"), limit(5))
        const topProductsSnapshot = await getDocs(topProductsQuery)
        setTopSellingProducts(topProductsSnapshot.docs.map((doc) => doc.data()))
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        user
          .getIdTokenResult()
          .then((idTokenResult) => {
            setUserRole(idTokenResult.claims.role)
          })
          .catch((error) => {
            console.error("Error getting token result:", error)
          })
      } else {
        setUser(null)
        setUserRole(null)
      }
    })

    return () => unsubscribe() // Cleanup on unmount
  }, [])

  const chartData = inventory.map((item) => ({
    name: item.name,
    quantity: item.quantity,
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {user ? (
        <>
          <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-8 rounded-lg shadow-lg mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <User className="mr-3" /> Welcome back, {user.email}!
            </h1>
            <p className="text-xl">Role: {userRole || "N/A"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventory.length}</div>
                <p className="text-xs text-muted-foreground">+12 since last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Sales</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentSales.length}</div>
                <p className="text-xs text-muted-foreground">+19% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">+201 since last hour</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center">
                  <BarChart2 className="mr-2" /> Inventory Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center">
                  <TrendingUp className="mr-2" /> Top Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topSellingProducts}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="soldQuantity"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {topSellingProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center">
                <ShoppingCart className="mr-2" /> Recent Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 text-left">Invoice No.</th>
                      <th className="py-2 px-4 text-left">Customer</th>
                      <th className="py-2 px-4 text-left">Date</th>
                      <th className="py-2 px-4 text-left">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((sale, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-4">{sale.invoiceNumber}</td>
                        <td className="py-2 px-4">{sale.customer.name}</td>
                        <td className="py-2 px-4">{new Date(sale.date).toLocaleDateString()}</td>
                        <td className="py-2 px-4">₹{sale.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-20">
          <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 flex items-center justify-center">
            <Home className="mr-3" /> Welcome to Bhavani Metal Corporation
          </h1>
          <p className="text-2xl text-gray-700">
            Empowering your business with quality metals and exceptional service.
          </p>
        </div>
      )}
    </div>
  )
}

export default Dashboard


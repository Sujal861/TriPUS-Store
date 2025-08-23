"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Package, ShoppingCart, CreditCard, Receipt, Settings, BarChart3, TrendingUp, Users, Brain } from "lucide-react"
import {
  generateSalesData,
  generateCustomersData,
  generateProductsData,
  generateForecast,
  generateRecommendations,
  type SalesRecord,
  type Customer,
  type ProductData,
} from "@/lib/data-generator"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface Product {
  code: string
  name: string
  price: number
  stock: number
}

interface CartItem extends Product {
  quantity: number
}

interface Bill {
  id: string
  date: string
  items: CartItem[]
  total: number
  paymentMethod: string
  customerName?: string
  customerEmail?: string
  emailSent?: boolean
}

interface EmailSettings {
  apiKey: string
  senderEmail: string
  senderName: string
}

interface CreditTransaction {
  id: string
  customerId: string
  customerName: string
  customerEmail?: string // Added optional email field for individual credit entries
  amount: number
  date: string
  dueDate: string
  status: "pending" | "paid"
  items: CartItem[]
}

interface Transaction {
  id: string
  customerName: string
  customerEmail: string
  items: CartItem[]
  total: number
  paymentMethod: string
  date: string
  status: "completed" | "refunded"
}

export default function RetailStoreApp() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState({ code: "", name: "", price: 0, stock: 0 })
  const [bills, setBills] = useState<Bill[]>([])
  const [customerName, setCustomerName] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [amountReceived, setAmountReceived] = useState(0)

  const [customerEmail, setCustomerEmail] = useState("")
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    apiKey: "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",
    senderEmail: "",
    senderName: "Retail Store",
  })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showUpiQr, setShowUpiQr] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })
  const [selectedBank, setSelectedBank] = useState("")

  const [salesData, setSalesData] = useState<SalesRecord[]>([])
  const [customersData, setCustomersData] = useState<Customer[]>([])
  const [productsData, setProductsData] = useState<ProductData[]>([])
  const [forecastData, setForecastData] = useState<{ date: string; predictedRevenue: number }[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([])
  const [selectedCustomerForCredit, setSelectedCustomerForCredit] = useState<Customer | null>(null)
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false)

  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackBill, setFeedbackBill] = useState<Bill | null>(null)
  const [selectedFeedback, setSelectedFeedback] = useState<string>("")

  const [teamMembers, setTeamMembers] = useState<
    {
      id: string
      name: string
      email: string
      role: string
      joinDate: string
    }[]
  >([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "Manager",
      joinDate: "2024-01-15",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Sales Associate",
      joinDate: "2024-02-01",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "Inventory Specialist",
      joinDate: "2024-01-20",
    },
  ])
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "" })
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [reminderMessage, setReminderMessage] = useState("")

  const { toast } = useToast()

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "TXN001",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      items: [
        { code: "P001", name: "Premium T-Shirt", price: 599, quantity: 2, stock: 48 },
        { code: "P002", name: "Denim Jeans", price: 1299, quantity: 1, stock: 29 },
      ],
      total: 2497,
      paymentMethod: "Credit Card",
      date: "2024-01-15 14:30",
      status: "completed",
    },
    {
      id: "TXN002",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      items: [{ code: "P003", name: "Running Shoes", price: 2499, quantity: 1, stock: 14 }],
      total: 2499,
      paymentMethod: "Cash",
      date: "2024-01-15 15:45",
      status: "completed",
    },
  ])

  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    const sales = generateSalesData(30)
    const customers = generateCustomersData()
    const productsBI = generateProductsData()
    const forecast = generateForecast(sales, 30)
    const recs = generateRecommendations(sales, productsBI)

    setSalesData(sales)
    setCustomersData(customers)
    setProductsData(productsBI)
    setForecastData(forecast)
    setRecommendations(recs)
  }, [])

  const saveEmailSettingsToStorage = (settings: EmailSettings) => {
    try {
      localStorage.setItem("retail-store-email-settings", JSON.stringify(settings))
    } catch (error) {
      console.error("Failed to save email settings to localStorage:", error)
    }
  }

  const saveProductsToStorage = (productsData: Product[]) => {
    try {
      localStorage.setItem("retail-store-products", JSON.stringify(productsData))
    } catch (error) {
      console.error("Failed to save products to localStorage:", error)
    }
  }

  const saveBillsToStorage = (billsData: Bill[]) => {
    try {
      localStorage.setItem("retail-store-bills", JSON.stringify(billsData))
    } catch (error) {
      console.error("Failed to save bills to localStorage:", error)
    }
  }

  const loadDataFromStorage = () => {
    try {
      const savedProducts = localStorage.getItem("retail-store-products")
      const savedBills = localStorage.getItem("retail-store-bills")
      const savedEmailSettings = localStorage.getItem("retail-store-email-settings")

      if (savedProducts) {
        setProducts(JSON.parse(savedProducts))
      } else {
        const defaultProducts = [
          { code: "P001", name: "Rice (1kg)", price: 80, stock: 50 },
          { code: "P002", name: "Milk (1L)", price: 60, stock: 30 },
          { code: "P003", name: "Bread", price: 25, stock: 20 },
          { code: "P004", name: "Onions (1kg)", price: 40, stock: 25 },
          { code: "P005", name: "Eggs (12pcs)", price: 120, stock: 15 },
        ]
        setProducts(defaultProducts)
        saveProductsToStorage(defaultProducts)
      }

      if (savedBills) {
        setBills(JSON.parse(savedBills))
      }

      if (savedEmailSettings) {
        setEmailSettings(JSON.parse(savedEmailSettings))
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error)
      // Fallback to default products on error
      const defaultProducts = [
        { code: "P001", name: "Laptop", price: 50000, stock: 10 },
        { code: "P002", name: "Mouse", price: 500, stock: 25 },
        { code: "P003", name: "Keyboard", price: 1500, stock: 15 },
      ]
      setProducts(defaultProducts)
    }
  }

  useEffect(() => {
    loadDataFromStorage()
  }, [])

  useEffect(() => {
    if (products.length > 0) {
      saveProductsToStorage(products)
    }
  }, [products])

  useEffect(() => {
    if (bills.length > 0) {
      saveBillsToStorage(bills)
    }
  }, [bills])

  useEffect(() => {
    saveEmailSettingsToStorage(emailSettings)
  }, [emailSettings])

  const sendEmailReceipt = async (bill: Bill, customerEmail: string) => {
    if (!emailSettings.apiKey || !emailSettings.senderEmail) {
      toast({
        title: "Email Configuration Missing",
        description: "Please configure email settings first",
        variant: "destructive",
      })
      return false
    }

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bill,
          customerEmail,
          emailSettings,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Email Sent",
          description: `Receipt sent to ${customerEmail}`,
        })
        return true
      } else {
        throw new Error(result.error || "Failed to send email")
      }
    } catch (error) {
      console.error("Email sending error:", error)
      toast({
        title: "Email Failed",
        description: "Failed to send receipt email",
        variant: "destructive",
      })
      return false
    }
  }

  const generateUpiQr = (amount: number) => {
    const upiId = "pruthvinarayanareddy@okicici"
    const merchantName = "Retail Store"
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`
  }

  // Product Management Functions
  const handleAddProduct = () => {
    if (!newProduct.code || !newProduct.name || newProduct.price <= 0 || newProduct.stock < 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill all fields with valid values",
        variant: "destructive",
      })
      return
    }

    if (products.find((p) => p.code === newProduct.code)) {
      toast({
        title: "Product Exists",
        description: "A product with this code already exists",
        variant: "destructive",
      })
      return
    }

    setProducts([...products, { ...newProduct }])
    setNewProduct({ code: "", name: "", price: 0, stock: 0 })
    setIsAddProductOpen(false)
    toast({
      title: "Product Added",
      description: `${newProduct.name} has been added successfully`,
    })
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setNewProduct({ ...product })
    setIsAddProductOpen(true)
  }

  const handleUpdateProduct = () => {
    if (!newProduct.code || !newProduct.name || newProduct.price <= 0 || newProduct.stock < 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill all fields with valid values",
        variant: "destructive",
      })
      return
    }

    setProducts(products.map((p) => (p.code === editingProduct?.code ? { ...newProduct } : p)))
    setNewProduct({ code: "", name: "", price: 0, stock: 0 })
    setEditingProduct(null)
    setIsAddProductOpen(false)
    toast({
      title: "Product Updated",
      description: `${newProduct.name} has been updated successfully`,
    })
  }

  const handleDeleteProduct = (code: string) => {
    setProducts(products.filter((p) => p.code !== code))
    toast({
      title: "Product Deleted",
      description: "Product has been removed from inventory",
    })
  }

  // POS Functions
  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock < quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock} items available`,
        variant: "destructive",
      })
      return
    }

    const existingItem = cart.find((item) => item.code === product.code)
    if (existingItem) {
      setCart(cart.map((item) => (item.code === product.code ? { ...item, quantity: item.quantity + quantity } : item)))
    } else {
      setCart([...cart, { ...product, quantity }])
    }

    toast({
      title: "Added to Cart",
      description: `${quantity}x ${product.name} added to cart`,
    })
  }

  const removeFromCart = (code: string) => {
    setCart(cart.filter((item) => item.code !== code))
  }

  const updateCartQuantity = (code: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(code)
      return
    }

    setCart(cart.map((item) => (item.code === code ? { ...item, quantity } : item)))
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const processPayment = async () => {
    if (cart.length === 0) return

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    if (paymentMethod === "credit") {
      const newCreditTransaction = {
        id: `CR${Date.now()}`,
        customerId: selectedCustomer?.id || `CUST${Date.now()}`,
        customerName: selectedCustomer?.name || customerName,
        customerEmail: selectedCustomer?.email || customerEmail,
        amount: total,
        items: [...cart],
        date: new Date().toISOString(),
        status: "pending" as const,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      }

      setCreditTransactions((prev) => [...prev, newCreditTransaction])

      // Add to regular transactions as well
      const newTransaction = {
        id: `TXN${Date.now()}`,
        date: new Date().toISOString(),
        customer: selectedCustomer?.name || customerName,
        customerEmail: selectedCustomer?.email || customerEmail,
        items: [...cart],
        total,
        paymentMethod: "Credit",
        status: "Completed" as const,
      }

      setTransactions((prev) => [...prev, newTransaction])

      // Clear cart and reset form
      setCart([])
      setCustomerName("")
      setCustomerEmail("")
      setSelectedCustomer(null)
      setPaymentMethod("cash")

      alert(`Credit transaction created successfully! Amount: ₹${total.toLocaleString()}`)
      return
    }

    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const transactionId = `TXN${String(transactions.length + 1).padStart(3, "0")}`

    const newTransaction: Transaction = {
      id: transactionId,
      customerName: customerName || "Walk-in Customer",
      customerEmail: customerEmail || "",
      items: [...cart],
      total: total,
      paymentMethod: paymentMethod,
      date: new Date().toLocaleString(),
      status: "completed",
    }

    setTransactions((prev) => [newTransaction, ...prev])

    // Generate bill
    const newBill: Bill = {
      id: `BILL-${Date.now()}`,
      date: new Date().toLocaleString(),
      items: [...cart],
      total,
      paymentMethod,
      customerName: customerName || "Walk-in Customer",
      customerEmail: customerEmail || "",
      emailSent: false,
    }

    // Send email if customer email is provided
    if (customerEmail && customerEmail.includes("@")) {
      const emailSent = await sendEmailReceipt(newBill, customerEmail)
      newBill.emailSent = emailSent
    }

    // Update stock
    const updatedProducts = products.map((product) => {
      const cartItem = cart.find((item) => item.code === product.code)
      if (cartItem) {
        return { ...product, stock: product.stock - cartItem.quantity }
      }
      return product
    })

    setProducts(updatedProducts)
    setBills((prev) => [...prev, newBill])
    setCart([])
    setAmountReceived(0)
    setCustomerName("")
    setCustomerEmail("")
    setCardDetails({ number: "", expiry: "", cvv: "", name: "" })
    setSelectedBank("")

    setFeedbackBill(newBill)
    setShowFeedback(true)

    toast({
      title: "Payment Processed",
      description: `Bill ${newBill.id} generated successfully`,
    })

    setIsProcessing(false)
    setActiveTab("dashboard")
  }

  const submitFeedback = async () => {
    if (!feedbackBill || !selectedFeedback) return

    // Store feedback (you can extend this to save to database)
    console.log(`Feedback for ${feedbackBill.id}: ${selectedFeedback}`)

    setShowFeedback(false)
    setFeedbackBill(null)
    setSelectedFeedback("")

    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback!",
    })
  }

  const processPaymentOnCredit = async (customer: Customer, customEmail?: string) => {
    if (cart.length === 0) return

    const total = getCartTotal()
    const transactionId = `CREDIT${Date.now()}`
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30) // 30 days credit period

    const creditTransaction: CreditTransaction = {
      id: transactionId,
      customerId: customer.customerId,
      customerName: customer.name,
      customerEmail: customEmail || customer.email, // Use custom email if provided
      amount: total,
      date: new Date().toISOString().split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0],
      status: "pending",
      items: [...cart],
    }

    setCreditTransactions((prev) => [...prev, creditTransaction])

    // Update customer credit balance
    const updatedCustomers = customersData.map((c) =>
      c.customerId === customer.customerId ? { ...c, creditBalance: c.creditBalance + total } : c,
    )
    setCustomersData(updatedCustomers)

    // Update product stock
    const updatedProducts = products.map((product) => {
      const cartItem = cart.find((item) => item.code === product.code)
      if (cartItem) {
        return { ...product, stock: product.stock - cartItem.quantity }
      }
      return product
    })
    setProducts(updatedProducts)

    // Send credit invoice email to the specified email
    const emailToUse = customEmail || customer.email
    if (emailToUse) {
      await sendCreditInvoiceEmail(creditTransaction, emailToUse)
    }

    setCart([])
    setIsCreditDialogOpen(false)
    setSelectedCustomerForCredit(null)

    toast({
      title: "Credit Transaction Processed",
      description: `₹${total.toFixed(2)} credit granted to ${customer.name}`,
    })
  }

  const sendCreditReminder = async (transaction: CreditTransaction) => {
    const emailToUse =
      transaction.customerEmail || customersData.find((c) => c.customerId === transaction.customerId)?.email

    if (!emailToUse) {
      toast({
        title: "No Email Found",
        description: "No email available for this credit transaction",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "credit-reminder",
          customerName: transaction.customerName,
          customerEmail: emailToUse,
          transactionId: transaction.id,
          amount: transaction.amount,
          dueDate: transaction.dueDate,
          status: transaction.status,
        }),
      })

      if (response.ok) {
        toast({
          title: "Reminder Sent",
          description: `Credit reminder sent to ${emailToUse}`,
        })
      } else {
        throw new Error("Failed to send reminder")
      }
    } catch (error) {
      toast({
        title: "Failed to Send Reminder",
        description: "Please check email settings and try again",
        variant: "destructive",
      })
    }
  }

  const getDailySalesData = () => {
    const dailySales = new Map<string, number>()
    salesData.forEach((sale) => {
      const revenue = sale.quantity * sale.unitPrice
      dailySales.set(sale.date, (dailySales.get(sale.date) || 0) + revenue)
    })

    return Array.from(dailySales.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-7)
      .map(([date, revenue]) => ({
        name: new Date(date).toLocaleDateString(),
        value: revenue,
      }))
  }

  const getProductForecastData = () => {
    const productSales = new Map<string, number[]>()
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (13 - i)) // 7 days past + 7 days future
      return date.toISOString().split("T")[0]
    })

    // Professional color palette for better legends
    const colorPalette = [
      "#2563eb", // Blue
      "#dc2626", // Red
      "#16a34a", // Green
      "#ca8a04", // Yellow
      "#9333ea", // Purple
      "#ea580c", // Orange
      "#0891b2", // Cyan
      "#be185d", // Pink
      "#65a30d", // Lime
      "#7c2d12", // Brown
    ]

    // Initialize all products with zero sales
    products.forEach((product) => {
      productSales.set(product.name, new Array(14).fill(0))
    })

    // Populate with actual sales data for past 7 days
    transactions.forEach((transaction) => {
      let transactionDate: string
      try {
        const dateStr = transaction.date.includes(" ") ? transaction.date.split(" ")[0] : transaction.date
        const parsedDate = new Date(dateStr)
        if (isNaN(parsedDate.getTime())) return
        transactionDate = parsedDate.toISOString().split("T")[0]
      } catch (error) {
        return
      }

      const dayIndex = last14Days.indexOf(transactionDate)
      if (dayIndex !== -1 && dayIndex < 7) {
        // Only past 7 days
        transaction.items.forEach((item) => {
          const currentData = productSales.get(item.name) || new Array(14).fill(0)
          currentData[dayIndex] += item.quantity
          productSales.set(item.name, currentData)
        })
      }
    })

    productSales.forEach((salesData, productName) => {
      const pastWeekData = salesData.slice(0, 7)
      const totalSales = pastWeekData.reduce((sum, val) => sum + val, 0)

      // If no historical data, create some baseline predictions
      if (totalSales === 0) {
        const baselineSales = Math.floor(Math.random() * 3) + 1 // 1-3 units baseline
        for (let i = 7; i < 14; i++) {
          const weekdayFactor = [0.8, 1.2, 1.1, 1.0, 1.3, 1.5, 0.9][i % 7] // Weekly pattern
          salesData[i] = Math.round(baselineSales * weekdayFactor * (0.8 + Math.random() * 0.4))
        }
        return
      }

      const avgSales = totalSales / 7

      // Calculate trend using linear regression
      let sumX = 0,
        sumY = 0,
        sumXY = 0,
        sumXX = 0
      pastWeekData.forEach((sales, day) => {
        sumX += day
        sumY += sales
        sumXY += day * sales
        sumXX += day * day
      })

      const n = pastWeekData.length
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) || 0
      const intercept = (sumY - slope * sumX) / n

      // Predict next 7 days with improved algorithm
      for (let i = 7; i < 14; i++) {
        const dayOffset = i - 3 // Center around middle of past week
        const trendPrediction = Math.max(0, intercept + slope * dayOffset)

        // Add weekly seasonality (weekends typically different from weekdays)
        const dayOfWeek = (new Date(last14Days[i]).getDay() + 6) % 7 // Monday = 0
        const weekdayFactors = [1.0, 1.1, 1.0, 0.9, 1.2, 1.4, 0.8] // Mon-Sun
        const seasonalFactor = weekdayFactors[dayOfWeek]

        // Add some controlled randomness for realism
        const randomFactor = 0.85 + Math.random() * 0.3

        const prediction = Math.round(trendPrediction * seasonalFactor * randomFactor)
        salesData[i] = Math.max(0, prediction)
      }
    })

    return {
      labels: last14Days.map((date, index) => {
        try {
          const formattedDate = new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
          return index < 7 ? formattedDate : `${formattedDate} (Pred)`
        } catch (error) {
          return date
        }
      }),
      datasets: Array.from(productSales.entries()).map(([productName, data], index) => ({
        name: productName,
        historicalData: data.slice(0, 7),
        predictedData: data.slice(7, 14),
        allData: data,
        color: colorPalette[index % colorPalette.length],
      })),
    }
  }

  const getProductSalesData = () => {
    const productSales = new Map<string, number[]>()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split("T")[0]
    })

    const colorPalette = [
      "#2563eb",
      "#dc2626",
      "#16a34a",
      "#ca8a04",
      "#9333ea",
      "#ea580c",
      "#0891b2",
      "#be185d",
      "#65a30d",
      "#7c2d12",
    ]

    // Initialize all products with zero sales
    products.forEach((product) => {
      productSales.set(product.name, new Array(7).fill(0))
    })

    // Populate with actual sales data
    transactions.forEach((transaction) => {
      let transactionDate: string
      try {
        const dateStr = transaction.date.includes(" ") ? transaction.date.split(" ")[0] : transaction.date
        const parsedDate = new Date(dateStr)
        if (isNaN(parsedDate.getTime())) return
        transactionDate = parsedDate.toISOString().split("T")[0]
      } catch (error) {
        return
      }

      const dayIndex = last7Days.indexOf(transactionDate)
      if (dayIndex !== -1) {
        transaction.items.forEach((item) => {
          const currentData = productSales.get(item.name) || new Array(7).fill(0)
          currentData[dayIndex] += item.quantity
          productSales.set(item.name, currentData)
        })
      }
    })

    return {
      labels: last7Days.map((date) => {
        try {
          return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        } catch (error) {
          return date
        }
      }),
      datasets: Array.from(productSales.entries()).map(([productName, data], index) => ({
        name: productName,
        data: data,
        color: colorPalette[index % colorPalette.length],
      })),
    }
  }

  const getTopProductsData = () => {
    const productTotals = new Map<string, { quantity: number; value: number }>()

    transactions.forEach((transaction) => {
      transaction.items.forEach((item) => {
        const current = productTotals.get(item.name) || { quantity: 0, value: 0 }
        current.quantity += item.quantity
        current.value += item.price * item.quantity
        productTotals.set(item.name, current)
      })
    })

    return Array.from(productTotals.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }

  const getPaymentMethodData = () => {
    const paymentMethods = new Map<string, number>()
    salesData.forEach((sale) => {
      paymentMethods.set(sale.paymentMethod, (paymentMethods.get(sale.paymentMethod) || 0) + 1)
    })

    return Array.from(paymentMethods.entries()).map(([method, count]) => ({
      name: method,
      value: count,
    }))
  }

  const getForecastChartData = () => {
    return forecastData.slice(0, 7).map((item) => ({
      name: new Date(item.date).toLocaleDateString(),
      value: item.predictedRevenue,
    }))
  }

  const getBestSellers = () => {
    const productSales = new Map<string, number>()
    salesData.forEach((sale) => {
      productSales.set(sale.product, (productSales.get(sale.product) || 0) + sale.quantity)
    })

    return Array.from(productSales.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
  }

  const getSlowMovers = () => {
    const productSales = new Map<string, number>()
    salesData.forEach((sale) => {
      productSales.set(sale.product, (productSales.get(sale.product) || 0) + sale.quantity)
    })

    return Array.from(productSales.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
  }

  const getLoyalCustomers = () => {
    return customersData.filter((customer) => customer.loyaltyStatus === "Regular").slice(0, 5)
  }

  const sendCreditInvoiceEmail = async (transaction: CreditTransaction, email: string) => {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "receipt",
          customerName: transaction.customerName,
          customerEmail: email,
          transactionId: transaction.id,
          items: transaction.items,
          total: transaction.amount,
          paymentMethod: "Credit",
          date: transaction.date,
        }),
      })

      if (response.ok) {
        toast({
          title: "Credit Invoice Sent",
          description: `Credit invoice sent to ${email}`,
        })
      }
    } catch (error) {
      console.error("Failed to send credit invoice:", error)
    }
  }

  const CreditCustomerCard = ({ customer, onGrantCredit, onSendReminder, creditTransactions, cart }) => {
    const [customEmail, setCustomEmail] = useState("")

    const customerTransaction = creditTransactions
      .filter((t) => t.customerId === customer.customerId && t.status === "pending")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    return (
      <div className="p-4 border-2 border-border rounded-lg bg-card">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold text-foreground">{customer.name}</p>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
            <p className="text-sm font-bold text-red-600">Credit Balance: ₹{customer.creditBalance}</p>
            <Input
              type="email"
              placeholder="Custom Email (Optional)"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              className="border-2 border-border rounded-lg mt-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => {
                onGrantCredit(customer, customEmail)
                setCustomEmail("") // Reset after granting credit
              }}
              className="manga-button text-xs"
              disabled={cart.length === 0}
            >
              Grant Credit
            </Button>
            <Button
              onClick={() => {
                if (customerTransaction) {
                  onSendReminder(customerTransaction)
                } else {
                  toast({
                    title: "No Pending Credit",
                    description: "No pending credit transactions found for this customer",
                    variant: "destructive",
                  })
                }
              }}
              variant="outline"
              className="border-2 border-border text-foreground hover:bg-primary hover:text-primary-foreground text-xs"
              disabled={!customerTransaction}
            >
              Send Reminder
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const exportTransactionsToCSV = () => {
    const headers = ["Date", "Transaction ID", "Customer", "Items", "Total Amount", "Payment Method", "Status"]

    const csvData = transactions.map((transaction) => [
      (() => {
        try {
          const dateStr = transaction.date.includes(" ") ? transaction.date.split(" ")[0] : transaction.date
          return new Date(dateStr).toLocaleDateString()
        } catch (error) {
          console.log("[v0] Error formatting CSV date:", transaction.date, error)
          return transaction.date // Return original date if formatting fails
        }
      })(),
      transaction.id,
      transaction.customerName,
      transaction.items.map((item) => `${item.name} (${item.quantity})`).join("; "),
      `₹${transaction.total}`,
      transaction.paymentMethod,
      transaction.status,
    ])

    const csvContent = [headers, ...csvData].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `transactions_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-card to-muted border-4 border-border shadow-[8px_8px_0px_#7F8CAA] mx-4 mt-4 mb-8">
          <div className="grid lg:grid-cols-3 gap-8 p-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white flex items-center justify-center border-2 border-border rounded-lg p-2">
                  <img src="/images/tripus-logo.png" alt="TriPUS Logo" className="w-full h-full object-contain" />
                </div>
                <div className="bg-card border-2 border-border px-4 py-2 rounded-full">
                  <span className="text-foreground font-bold text-sm">⚡ AI-POWERED BUSINESS INTELLIGENCE</span>
                </div>
              </div>

              <h1 className="text-6xl font-black text-foreground uppercase tracking-tight">TriPUS</h1>

              <p className="text-xl text-muted-foreground font-semibold leading-relaxed max-w-2xl">
                Transform your retail business with intelligent insights. From inventory management to customer
                analytics, we make complex data simple and actionable.
              </p>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => setActiveTab("dashboard")}
                  className="bg-primary text-primary-foreground border-2 border-border hover:bg-secondary hover:text-secondary-foreground font-bold px-6 py-3 rounded-lg shadow-[4px_4px_0px_#7F8CAA] transition-all"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  EXPLORE DASHBOARD →
                </Button>
                <Button
                  onClick={() => setActiveTab("pos")}
                  variant="outline"
                  className="bg-card text-foreground border-2 border-border hover:bg-primary hover:text-primary-foreground font-bold px-6 py-3 rounded-lg shadow-[4px_4px_0px_#7F8CAA] transition-all"
                >
                  ⚡ START SELLING →
                </Button>
              </div>
            </div>

            {/* Right Metrics */}
            <div className="space-y-4">
              <Card className="border-4 border-border rounded-lg shadow-[4px_4px_0px_#7F8CAA] bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">TOTAL REVENUE</p>
                      <p className="text-3xl font-black text-foreground">
                        ₹
                        {salesData.length > 0
                          ? salesData.reduce((sum, sale) => sum + sale.quantity * sale.unitPrice, 0).toLocaleString()
                          : "64,613"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-lg">
                      <BarChart3 className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-border rounded-lg shadow-[4px_4px_0px_#7F8CAA] bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                        ACTIVE CUSTOMERS
                      </p>
                      <p className="text-3xl font-black text-foreground">
                        {customersData.filter((c) => c.loyaltyStatus === "Regular").length || 50}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-lg">
                      <Users className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-border rounded-lg shadow-[4px_4px_0px_#7F8CAA] bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">TRANSACTIONS</p>
                      <p className="text-3xl font-black text-foreground">{salesData.length || 200}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-lg">
                      <Receipt className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Settings Button */}
        <div className="absolute top-8 right-8 z-50">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-2 border-border text-foreground hover:bg-primary hover:text-primary-foreground font-bold rounded-lg bg-card shadow-lg"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-gradient-to-br from-card to-muted border-4 border-border rounded-lg shadow-[8px_8px_0px_#7F8CAA] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] max-h-[80vh] overflow-y-auto">
              <DialogHeader className="border-b-2 border-border pb-3 mb-4">
                <DialogTitle className="font-black text-foreground uppercase text-xl tracking-wider">
                  Email Settings
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-semibold">
                  Configure email settings for sending receipts
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-2">
                <div>
                  <Label htmlFor="api-key" className="font-bold text-foreground uppercase text-sm tracking-wide">
                    SendGrid API Key
                  </Label>
                  <Input
                    id="api-key"
                    value={emailSettings.apiKey}
                    onChange={(e) => setEmailSettings({ ...emailSettings, apiKey: e.target.value })}
                    placeholder="Enter SendGrid API Key"
                    className="border-2 border-border rounded-lg bg-card text-foreground font-semibold mt-2 focus:border-secondary focus:ring-0"
                  />
                </div>
                <div>
                  <Label htmlFor="from-email" className="font-bold text-foreground uppercase text-sm tracking-wide">
                    From Email
                  </Label>
                  <Input
                    id="from-email"
                    value={emailSettings.senderEmail}
                    onChange={(e) => setEmailSettings({ ...emailSettings, senderEmail: e.target.value })}
                    placeholder="Enter sender email"
                    className="border-2 border-border rounded-lg bg-card text-foreground font-semibold mt-2 focus:border-secondary focus:ring-0"
                  />
                </div>
              </div>
              <DialogFooter className="border-t-2 border-border pt-4 mt-4">
                <Button
                  onClick={() => setIsSettingsOpen(false)}
                  className="manga-button w-full font-black uppercase bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-primary-foreground"
                >
                  Save Settings
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full bg-card border-4 border-border rounded-lg shadow-[4px_4px_0px_#7F8CAA] mb-8 overflow-x-auto">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-foreground border-r-2 border-border last:border-r-0 rounded-none px-4 py-2 whitespace-nowrap"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="forecasting"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-foreground border-r-2 border-border last:border-r-0 rounded-none px-4 py-2 whitespace-nowrap"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Forecasting
            </TabsTrigger>
            <TabsTrigger
              value="ai-insights"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-foreground border-r-2 border-border last:border-r-0 rounded-none px-4 py-2 whitespace-nowrap"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger
              value="credit"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-foreground border-r-2 border-border last:border-r-0 rounded-none px-4 py-2 whitespace-nowrap"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Credit
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-foreground border-r-2 border-border last:border-r-0 rounded-none px-4 py-2 whitespace-nowrap"
            >
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger
              value="pos"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-foreground border-r-2 border-border last:border-r-0 rounded-none px-4 py-2 whitespace-nowrap"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>

            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-foreground border-r-2 border-border last:border-r-0 rounded-none px-4 py-2 whitespace-nowrap"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Transaction History
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="manga-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-muted-foreground uppercase">Total Revenue</p>
                        <p className="text-2xl font-black text-foreground">
                          ₹
                          {salesData.length > 0
                            ? salesData.reduce((sum, sale) => sum + sale.quantity * sale.unitPrice, 0).toLocaleString()
                            : "0"}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="manga-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-muted-foreground uppercase">Total Transactions</p>
                        <p className="text-2xl font-black text-foreground">{salesData.length}</p>
                      </div>
                      <Receipt className="h-8 w-8 text-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="manga-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-muted-foreground uppercase">Active Customers</p>
                        <p className="text-2xl font-black text-foreground">
                          {customersData.filter((c) => c.loyaltyStatus === "Regular").length}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="manga-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-muted-foreground uppercase">Products in Stock</p>
                        <p className="text-2xl font-black text-foreground">{products.length}</p>
                      </div>
                      <Package className="h-8 w-8 text-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="manga-card">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-black text-foreground uppercase mb-4">Daily Sales (Last 7 Days)</h3>
                    <div className="space-y-2">
                      {getDailySalesData().map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="font-bold text-foreground">{item.name}</span>
                          <span className="font-black text-foreground">₹{item.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="manga-card">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-black text-foreground uppercase mb-4">Top Products</h3>
                    <div className="space-y-2">
                      {getTopProductsData().map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="font-bold text-foreground">{item.name}</span>
                          <span className="font-black text-foreground">₹{item.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Forecasting Tab */}
          {activeTab === "forecasting" && (
            <div className="space-y-6">
              <Card className="manga-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-black text-foreground uppercase mb-6">
                    Product Sales Forecast (7 Days Historical + 7 Days Predicted)
                  </h3>
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={getProductForecastData().labels.map((label, index) => {
                          const dataPoint: any = { date: label, isPredicted: index >= 7 }
                          getProductForecastData().datasets.forEach((dataset) => {
                            dataPoint[dataset.name] = dataset.allData[index]
                          })
                          return dataPoint
                        })}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333446" />
                        <XAxis
                          dataKey="date"
                          stroke="#333446"
                          tick={{ fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis stroke="#333446" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#EAEFEF",
                            border: "2px solid #333446",
                            borderRadius: "8px",
                          }}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />
                        {getProductForecastData().datasets.map((dataset, index) => (
                          <Line
                            key={dataset.name}
                            type="monotone"
                            dataKey={dataset.name}
                            stroke={dataset.color}
                            strokeWidth={3}
                            strokeDasharray={(data: any) => (data.isPredicted ? "5 5" : "0")}
                            dot={{ fill: dataset.color, strokeWidth: 2, r: 4 }}
                            connectNulls={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-4 border-2 border-border bg-muted">
                    <p className="text-sm font-bold text-foreground">
                      📊 <strong>Chart Legend:</strong> Solid lines show historical sales data (last 7 days). Dashed
                      lines show predicted sales (next 7 days) based on trends and seasonal patterns.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="manga-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-black text-foreground uppercase mb-6">Product Forecast Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getProductForecastData()
                      .datasets.slice(0, 6)
                      .map((dataset) => {
                        const totalHistorical = dataset.historicalData.reduce((sum, val) => sum + val, 0)
                        const totalPredicted = dataset.predictedData.reduce((sum, val) => sum + val, 0)
                        const growthRate =
                          totalHistorical > 0
                            ? (((totalPredicted - totalHistorical) / totalHistorical) * 100).toFixed(1)
                            : "0"

                        return (
                          <div key={dataset.name} className="p-4 border-2 border-border bg-muted">
                            <h4 className="font-bold text-foreground mb-2">{dataset.name}</h4>
                            <div className="space-y-2 text-sm">
                              <p>
                                <strong>Last 7 days:</strong> {totalHistorical} units
                              </p>
                              <p>
                                <strong>Next 7 days:</strong> {totalPredicted} units
                              </p>
                              <p
                                className={`font-bold ${Number.parseFloat(growthRate) >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                <strong>Trend:</strong> {growthRate}%
                              </p>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>

              <Card className="manga-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-black text-foreground uppercase mb-6">Sales Forecasting</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-bold text-foreground uppercase mb-4">7-Day Forecast</h4>
                      <div className="space-y-3">
                        {getForecastChartData().map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 border-2 border-border">
                            <span className="font-bold text-foreground">{item.name}</span>
                            <span className="font-black text-foreground">₹{item.value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground uppercase mb-4">Forecast Summary</h4>
                      <div className="space-y-4">
                        <div className="p-4 border-2 border-border bg-muted">
                          <p className="font-bold text-foreground">Expected Revenue (7 days)</p>
                          <p className="text-2xl font-black text-foreground">
                            ₹
                            {forecastData
                              .slice(0, 7)
                              .reduce((sum, item) => sum + item.predictedRevenue, 0)
                              .toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 border-2 border-border bg-muted">
                          <p className="font-bold text-foreground">Growth Trend</p>
                          <p className="text-xl font-black text-green-600">+12.5%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="manga-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-black text-foreground uppercase mb-6">
                    Product Sales Trends (Last 7 Days)
                  </h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={getProductSalesData().labels.map((label, index) => {
                          const dataPoint: any = { date: label }
                          getProductSalesData().datasets.forEach((dataset) => {
                            dataPoint[dataset.name] = dataset.data[index]
                          })
                          return dataPoint
                        })}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333446" />
                        <XAxis dataKey="date" stroke="#333446" />
                        <YAxis stroke="#333446" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#EAEFEF",
                            border: "2px solid #333446",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        {getProductSalesData().datasets.map((dataset, index) => (
                          <Line
                            key={dataset.name}
                            type="monotone"
                            dataKey={dataset.name}
                            stroke={dataset.color}
                            strokeWidth={3}
                            dot={{ fill: dataset.color, strokeWidth: 2, r: 4 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-lg font-bold text-foreground uppercase mb-2">Top Selling Products</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {getBestSellers().map(([product, quantity], index) => (
                        <div key={product} className="p-3 border-2 border-border bg-muted">
                          <p className="font-bold text-foreground">
                            #{index + 1} {product}
                          </p>
                          <p className="text-lg font-black text-foreground">{quantity} units sold</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI Insights Tab */}
          {activeTab === "ai-insights" && (
            <div className="space-y-6">
              <Card className="manga-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-black text-foreground uppercase mb-6">AI-Powered Insights</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-bold text-foreground uppercase mb-4">Recommendations</h4>
                      <div className="space-y-3">
                        {recommendations.map((rec, index) => (
                          <div key={index} className="p-4 border-2 border-border bg-yellow-50">
                            <p className="font-bold text-foreground">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground uppercase mb-4">Business Intelligence</h4>
                      <div className="space-y-4">
                        <div className="p-4 border-2 border-border">
                          <h5 className="font-bold text-foreground mb-2">Best Sellers</h5>
                          {getBestSellers().map(([product, quantity], index) => (
                            <p key={index} className="text-foreground">
                              {product}: {quantity} units
                            </p>
                          ))}
                        </div>
                        <div className="p-4 border-2 border-border">
                          <h5 className="font-bold text-foreground mb-2">Slow Movers</h5>
                          {getSlowMovers().map(([product, quantity], index) => (
                            <p key={index} className="text-foreground">
                              {product}: {quantity} units
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "credit" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-foreground uppercase">Credit Management</h2>
                <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="manga-button">Add Credit Transaction</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-card border-4 border-border rounded-lg shadow-[8px_8px_0px_#7F8CAA] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-black text-foreground uppercase">
                        Select Customer for Credit
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {getLoyalCustomers().map((customer) => (
                        <CreditCustomerCard
                          key={customer.customerId}
                          customer={customer}
                          onGrantCredit={processPaymentOnCredit}
                          onSendReminder={sendCreditReminder}
                          creditTransactions={creditTransactions}
                          cart={cart}
                        />
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="manga-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-foreground uppercase mb-4">Credit Transactions</h3>
                  <div className="space-y-3">
                    {creditTransactions.length > 0 ? (
                      creditTransactions.map((transaction) => (
                        <div key={transaction.id} className="p-4 border-2 border-border rounded-lg bg-card">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-bold text-foreground">{transaction.customerName}</p>
                              <p className="text-sm text-muted-foreground">ID: {transaction.id}</p>
                              <p className="text-sm text-muted-foreground">Due: {transaction.dueDate}</p>
                              {transaction.customerEmail && (
                                <p className="text-sm text-primary font-medium">📧 {transaction.customerEmail}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-black text-foreground">₹{transaction.amount.toFixed(2)}</p>
                              <p
                                className={`text-sm font-bold ${transaction.status === "pending" ? "text-red-600" : "text-green-600"}`}
                              >
                                {transaction.status.toUpperCase()}
                              </p>
                              <Button
                                onClick={() => sendCreditReminder(transaction)}
                                variant="outline"
                                size="sm"
                                className="border-2 border-border text-foreground hover:bg-primary hover:text-primary-foreground mt-2"
                                disabled={
                                  !transaction.customerEmail &&
                                  !customersData.find((c) => c.customerId === transaction.customerId)?.email
                                }
                              >
                                Send Reminder
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No credit transactions found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-foreground uppercase">Product Management</h2>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button className="manga-button">Add Product</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-card border-4 border-border rounded-lg shadow-[8px_8px_0px_#7F8CAA] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-black text-foreground uppercase">
                        {editingProduct ? "Edit Product" : "Add New Product"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="code" className="font-bold text-foreground uppercase">
                          Product Code
                        </Label>
                        <Input
                          id="code"
                          value={newProduct.code}
                          onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                          className="border-2 border-border rounded-lg"
                          disabled={!!editingProduct}
                        />
                      </div>
                      <div>
                        <Label htmlFor="name" className="font-bold text-foreground uppercase">
                          Product Name
                        </Label>
                        <Input
                          id="name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          className="border-2 border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price" className="font-bold text-foreground uppercase">
                          Price (₹)
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          value={newProduct.price}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, price: Number.parseFloat(e.target.value) || 0 })
                          }
                          className="border-2 border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock" className="font-bold text-foreground uppercase">
                          Stock Quantity
                        </Label>
                        <Input
                          id="stock"
                          type="number"
                          value={newProduct.stock}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, stock: Number.parseInt(e.target.value) || 0 })
                          }
                          className="border-2 border-border rounded-lg"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                        className="manga-button w-full"
                      >
                        {editingProduct ? "Update Product" : "Add Product"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {products.map((product) => (
                  <Card key={product.code} className="manga-card">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-foreground">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">Code: {product.code}</p>
                          <p className="text-lg font-black text-foreground">₹{product.price}</p>
                          <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                        </div>
                        <div className="space-x-2">
                          <Button
                            onClick={() => handleEditProduct(product)}
                            variant="outline"
                            size="sm"
                            className="border-2 border-border text-foreground hover:bg-primary hover:text-primary-foreground"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteProduct(product.code)}
                            variant="outline"
                            size="sm"
                            className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "pos" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card className="manga-card">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-black text-foreground uppercase mb-4">Product Search</h3>
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-2 border-border rounded-lg mb-4"
                    />
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.code}
                          className="flex justify-between items-center p-3 border-2 border-border"
                        >
                          <div>
                            <p className="font-bold text-foreground">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ₹{product.price} | Stock: {product.stock}
                            </p>
                          </div>
                          <Button
                            onClick={() => addToCart(product)}
                            className="manga-button text-xs"
                            disabled={product.stock === 0}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="manga-card">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-black text-foreground uppercase mb-4">Shopping Cart</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                      {cart.map((item) => (
                        <div key={item.code} className="flex justify-between items-center p-2 border border-border">
                          <div>
                            <p className="font-bold text-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ₹{item.price} x {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => updateCartQuantity(item.code, item.quantity - 1)}
                              variant="outline"
                              size="sm"
                              className="border border-border text-foreground hover:bg-primary hover:text-primary-foreground"
                            >
                              -
                            </Button>
                            <span className="font-bold text-foreground">{item.quantity}</span>
                            <Button
                              onClick={() => updateCartQuantity(item.code, item.quantity + 1)}
                              variant="outline"
                              size="sm"
                              className="border border-border text-foreground hover:bg-primary hover:text-primary-foreground"
                            >
                              +
                            </Button>
                            <Button
                              onClick={() => removeFromCart(item.code)}
                              variant="outline"
                              size="sm"
                              className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t-2 border-border pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-foreground">Total:</span>
                        <span className="text-2xl font-black text-foreground">₹{getCartTotal().toFixed(2)}</span>
                      </div>
                      <div className="space-y-3">
                        <Input
                          placeholder="Customer Name (Optional)"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="border-2 border-border rounded-lg"
                        />
                        <Input
                          placeholder="Customer Email (Optional)"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="border-2 border-border rounded-lg"
                        />
                        <Button
                          onClick={() => setActiveTab("payment")}
                          className="manga-button w-full"
                          disabled={cart.length === 0}
                        >
                          Proceed to Payment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-foreground uppercase">Transaction History</h2>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="border-2 border-border text-foreground hover:bg-primary hover:text-primary-foreground bg-transparent"
                    onClick={exportTransactionsToCSV}
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-border text-foreground hover:bg-primary hover:text-primary-foreground bg-transparent"
                  >
                    Filter
                  </Button>
                </div>
              </div>

              <Card className="manga-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <div key={transaction.id} className="p-4 border-2 border-border rounded-lg bg-card">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-bold text-foreground text-lg">{transaction.id}</h4>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-bold ${
                                    transaction.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {transaction.status.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                <strong>Customer:</strong> {transaction.customerName}
                              </p>
                              {transaction.customerEmail && (
                                <p className="text-sm text-muted-foreground mb-1">
                                  <strong>Email:</strong> {transaction.customerEmail}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground mb-1">
                                <strong>Date:</strong> {transaction.date}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <strong>Payment:</strong> {transaction.paymentMethod}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black text-foreground">₹{transaction.total.toFixed(2)}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-2 border-border text-foreground hover:bg-primary hover:text-primary-foreground mt-2 bg-transparent"
                              >
                                View Details
                              </Button>
                            </div>
                          </div>

                          <div className="border-t border-border pt-3">
                            <h5 className="font-bold text-foreground mb-2">Items:</h5>
                            <div className="space-y-1">
                              {transaction.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {item.quantity}x {item.name}
                                  </span>
                                  <span className="font-medium text-foreground">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No transactions found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === "payment" && (
            <div className="max-w-2xl mx-auto">
              <Card className="manga-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-black text-foreground uppercase mb-6">Payment Processing</h3>

                  <div className="space-y-6">
                    <div className="p-4 border-2 border-border bg-muted">
                      <h4 className="font-bold text-foreground mb-2">Order Summary</h4>
                      <div className="space-y-1">
                        {cart.map((item) => (
                          <div key={item.code} className="flex justify-between">
                            <span className="text-foreground">
                              {item.name} x {item.quantity}
                            </span>
                            <span className="font-bold text-foreground">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border mt-2 pt-2">
                        <div className="flex justify-between">
                          <span className="font-bold text-foreground">Total:</span>
                          <span className="font-black text-foreground text-lg">₹{getCartTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="font-bold text-foreground uppercase mb-2 block">Payment Method</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {["cash", "card", "upi", "netbanking"].map((method) => (
                          <Button
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            variant={paymentMethod === method ? "default" : "outline"}
                            className={`border-2 border-border rounded-lg font-bold uppercase ${
                              paymentMethod === method
                                ? "bg-primary text-primary-foreground"
                                : "bg-card text-foreground hover:bg-primary hover:text-primary-foreground"
                            }`}
                          >
                            {method}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {paymentMethod === "cash" && (
                      <div>
                        <Label htmlFor="amount-received" className="font-bold text-foreground uppercase">
                          Amount Received (₹)
                        </Label>
                        <Input
                          id="amount-received"
                          type="number"
                          value={amountReceived}
                          onChange={(e) => setAmountReceived(Number.parseFloat(e.target.value) || 0)}
                          className="border-2 border-border rounded-lg mt-2"
                        />
                        {amountReceived > getCartTotal() && (
                          <p className="text-green-600 font-bold mt-2">
                            Change: ₹{(amountReceived - getCartTotal()).toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div className="space-y-4">
                        <Input
                          placeholder="Card Number"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          className="border-2 border-border rounded-lg"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            className="border-2 border-border rounded-lg"
                          />
                          <Input
                            placeholder="CVV"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            className="border-2 border-border rounded-lg"
                          />
                        </div>
                        <Input
                          placeholder="Cardholder Name"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          className="border-2 border-border rounded-lg"
                        />
                      </div>
                    )}

                    {paymentMethod === "upi" && (
                      <div className="text-center">
                        <p className="font-bold text-foreground mb-4">Scan QR Code to Pay</p>
                        <img
                          src={generateUpiQr(getCartTotal()) || "/placeholder.svg"}
                          alt="UPI QR Code"
                          className="mx-auto border-2 border-border"
                        />
                      </div>
                    )}

                    {paymentMethod === "netbanking" && (
                      <div>
                        <Label className="font-bold text-foreground uppercase mb-2 block">Select Bank</Label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full p-2 border-2 border-border rounded-lg bg-card"
                        >
                          <option value="">Select Bank</option>
                          <option value="sbi">State Bank of India</option>
                          <option value="hdfc">HDFC Bank</option>
                          <option value="icici">ICICI Bank</option>
                          <option value="axis">Axis Bank</option>
                        </select>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button
                        onClick={processPayment}
                        className="manga-button flex-1 text-lg"
                        disabled={cart.length === 0 || isProcessing}
                      >
                        {isProcessing ? "Processing..." : `Process Payment - ₹${getCartTotal().toFixed(2)}`}
                      </Button>

                      <Button
                        onClick={() => setIsCreditDialogOpen(true)}
                        variant="outline"
                        className="border-2 border-border rounded-lg font-bold uppercase bg-card text-foreground hover:bg-primary hover:text-primary-foreground"
                        disabled={cart.length === 0}
                      >
                        Allow Credit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "credits" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-foreground uppercase">Team Credits</h2>
                <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                  <DialogTrigger asChild>
                    <Button className="manga-button">Add Team Member</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-card border-4 border-border rounded-lg shadow-[8px_8px_0px_#7F8CAA] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100]">
                    <DialogHeader>
                      <DialogTitle className="font-black text-foreground uppercase">Add New Team Member</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="member-name" className="font-bold text-foreground uppercase">
                          Name
                        </Label>
                        <Input
                          id="member-name"
                          value={newMember.name}
                          onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                          className="border-2 border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="member-email" className="font-bold text-foreground uppercase">
                          Email
                        </Label>
                        <Input
                          id="member-email"
                          type="email"
                          value={newMember.email}
                          onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                          className="border-2 border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="member-role" className="font-bold text-foreground uppercase">
                          Role
                        </Label>
                        <Input
                          id="member-role"
                          value={newMember.role}
                          onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                          className="border-2 border-border rounded-lg"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          if (newMember.name && newMember.email && newMember.role) {
                            setTeamMembers([
                              ...teamMembers,
                              {
                                id: Date.now().toString(),
                                ...newMember,
                                joinDate: new Date().toISOString().split("T")[0],
                              },
                            ])
                            setNewMember({ name: "", email: "", role: "" })
                            setIsAddMemberOpen(false)
                            toast({ title: "Team member added successfully!" })
                          }
                        }}
                        className="manga-button w-full"
                      >
                        Add Member
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="manga-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-black text-foreground uppercase mb-6">Team Members</h3>
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border-2 border-border rounded-lg bg-muted"
                      >
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(member.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMembers([...selectedMembers, member.id])
                              } else {
                                setSelectedMembers(selectedMembers.filter((id) => id !== member.id))
                              }
                            }}
                            className="w-4 h-4 text-primary bg-card border-2 border-border rounded focus:ring-primary"
                          />
                          <div>
                            <h4 className="font-bold text-foreground">{member.name}</h4>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.role} • Joined {member.joinDate}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={async () => {
                            try {
                              const response = await fetch("/api/send-email", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  to: member.email,
                                  subject: "Individual Reminder from TriPUS",
                                  html: `
                                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                      <h2 style="color: #333446;">Hello ${member.name}!</h2>
                                      <p>This is a personal reminder from the TriPUS team.</p>
                                      <p>Role: ${member.role}</p>
                                      <p>Please check your tasks and updates.</p>
                                      <p>Best regards,<br>TriPUS Team</p>
                                    </div>
                                  `,
                                }),
                              })
                              if (response.ok) {
                                toast({ title: `Reminder sent to ${member.name}!` })
                              } else {
                                toast({ title: "Failed to send reminder", variant: "destructive" })
                              }
                            } catch (error) {
                              toast({ title: "Error sending reminder", variant: "destructive" })
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                        >
                          Send Reminder
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="manga-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-black text-foreground uppercase mb-6">Bulk Email Reminders</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reminder-message" className="font-bold text-foreground uppercase">
                        Custom Message
                      </Label>
                      <textarea
                        id="reminder-message"
                        value={reminderMessage}
                        onChange={(e) => setReminderMessage(e.target.value)}
                        placeholder="Enter your reminder message..."
                        className="w-full p-3 border-2 border-border rounded-lg bg-card text-foreground font-semibold mt-2 focus:border-secondary focus:ring-0 min-h-[100px]"
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button
                        onClick={async () => {
                          if (selectedMembers.length === 0) {
                            toast({ title: "Please select team members", variant: "destructive" })
                            return
                          }

                          const selectedMemberData = teamMembers.filter((member) => selectedMembers.includes(member.id))

                          try {
                            for (const member of selectedMemberData) {
                              await fetch("/api/send-email", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  to: member.email,
                                  subject: "Team Reminder from TriPUS",
                                  html: `
                                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                      <h2 style="color: #333446;">Hello ${member.name}!</h2>
                                      <p>${reminderMessage || "This is a team reminder from TriPUS."}</p>
                                      <p>Role: ${member.role}</p>
                                      <p>Best regards,<br>TriPUS Team</p>
                                    </div>
                                  `,
                                }),
                              })
                            }
                            toast({ title: `Reminders sent to ${selectedMembers.length} team members!` })
                            setSelectedMembers([])
                            setReminderMessage("")
                          } catch (error) {
                            toast({ title: "Error sending reminders", variant: "destructive" })
                          }
                        }}
                        className="manga-button flex-1"
                      >
                        Send to Selected ({selectedMembers.length})
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedMembers(teamMembers.map((m) => m.id))
                        }}
                        variant="outline"
                        className="border-2 border-border text-foreground hover:bg-muted"
                      >
                        Select All
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedMembers([])
                        }}
                        variant="outline"
                        className="border-2 border-border text-foreground hover:bg-muted"
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Feedback Modal */}
          {showFeedback && feedbackBill && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
              <div className="bg-card border-4 border-border rounded-lg shadow-[8px_8px_0px_#7F8CAA] p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-black text-foreground uppercase">How was your experience?</h3>
                  <Button
                    onClick={() => setShowFeedback(false)}
                    variant="ghost"
                    className="text-foreground hover:bg-muted p-1 rounded-lg"
                  >
                    ✕
                  </Button>
                </div>
                <p className="text-muted-foreground font-semibold mb-6">
                  Please rate your shopping experience for bill {feedbackBill.id}
                </p>
                <div className="grid grid-cols-5 gap-3 mb-6">
                  {[
                    { emoji: "😡", label: "Very Bad", value: "very-bad" },
                    { emoji: "😞", label: "Bad", value: "bad" },
                    { emoji: "😐", label: "Average", value: "average" },
                    { emoji: "😊", label: "Good", value: "good" },
                    { emoji: "😍", label: "Very Good", value: "very-good" },
                  ].map((feedback) => (
                    <Button
                      key={feedback.value}
                      onClick={() => {
                        setSelectedFeedback(feedback.value)
                        toast({
                          title: "Feedback Submitted",
                          description: `Thank you for rating us as ${feedback.label}!`,
                        })
                        setShowFeedback(false)
                      }}
                      variant="outline"
                      className="border-2 border-border rounded-lg hover:bg-primary hover:text-primary-foreground p-4 h-auto flex flex-col items-center gap-2"
                    >
                      <span className="text-2xl">{feedback.emoji}</span>
                      <span className="text-xs font-bold">{feedback.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Tabs>
      </div>

      <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground uppercase">
              Select Customer for Credit
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {customersData.map((customer) => (
              <div key={customer.customerId} className="p-4 border-2 border-border rounded-lg bg-card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{customer.name}</h3>
                    <p className="text-foreground">{customer.email}</p>
                    <p className="text-red-600 font-bold">Current Credit Balance: ₹{customer.creditBalance}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <Label className="font-bold text-foreground">Custom Email (Optional)</Label>
                  <Input
                    type="email"
                    placeholder="Enter custom email for this transaction"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="border-2 border-border rounded-lg mt-2"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => processPaymentOnCredit(customer, customerEmail || undefined)}
                    className="manga-button"
                  >
                    Grant Credit - ₹{getCartTotal().toFixed(2)}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  )
}

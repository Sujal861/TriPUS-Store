export interface SalesRecord {
  date: string
  product: string
  quantity: number
  unitPrice: number
  paymentMethod: "Cash" | "UPI" | "Card" | "Net Banking" | "QR Scanner"
  customerId: string
}

export interface Customer {
  customerId: string
  name: string
  email: string
  loyaltyStatus: "Regular" | "New"
  creditAllowed: "Yes" | "No"
  creditBalance: number
}

export interface ProductData {
  productId: string
  productName: string
  stockLevel: number
  category: string
}

export function generateSalesData(days = 30): SalesRecord[] {
  const sales: SalesRecord[] = []
  const products = [
    "Rice (1kg)",
    "Wheat Flour (1kg)",
    "Onions (1kg)",
    "Potatoes (1kg)",
    "Tomatoes (1kg)",
    "Milk (1L)",
    "Bread",
    "Eggs (12pcs)",
    "Cooking Oil (1L)",
    "Sugar (1kg)",
    "Tea Powder (250g)",
    "Biscuits",
    "Dal (1kg)",
    "Salt (1kg)",
    "Bananas (1kg)",
  ]
  const paymentMethods: SalesRecord["paymentMethod"][] = ["Cash", "UPI", "Card", "Net Banking", "QR Scanner"]

  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const salesPerDay = Math.floor(Math.random() * 15) + 15

    for (let j = 0; j < salesPerDay; j++) {
      sales.push({
        date: date.toISOString().split("T")[0],
        product: products[Math.floor(Math.random() * products.length)],
        quantity: Math.floor(Math.random() * 5) + 1,
        unitPrice: Math.floor(Math.random() * 490) + 10,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        customerId: `CUST${String(Math.floor(Math.random() * 100) + 1).padStart(3, "0")}`,
      })
    }
  }

  return sales
}

export function generateCustomersData(): Customer[] {
  const customers: Customer[] = []
  const names = [
    "Raj Kumar",
    "Priya Singh",
    "Amit Sharma",
    "Sneha Patel",
    "Vikram Reddy",
    "Anita Gupta",
    "Rohit Jain",
    "Kavya Nair",
    "Suresh Yadav",
    "Meera Devi",
    "Ramesh Kumar",
    "Sunita Sharma",
  ]

  for (let i = 1; i <= 50; i++) {
    const isRegular = Math.random() > 0.2
    customers.push({
      customerId: `CUST${String(i).padStart(3, "0")}`,
      name: names[Math.floor(Math.random() * names.length)] + ` ${i}`,
      email: `customer${i}@example.com`,
      loyaltyStatus: isRegular ? "Regular" : "New",
      creditAllowed: isRegular && Math.random() > 0.4 ? "Yes" : "No",
      creditBalance: Math.floor(Math.random() * 1900) + 100,
    })
  }

  return customers
}

export function generateProductsData(): ProductData[] {
  const products = [
    { name: "Rice (1kg)", category: "Staples" },
    { name: "Wheat Flour (1kg)", category: "Staples" },
    { name: "Onions (1kg)", category: "Fresh Vegetables" },
    { name: "Potatoes (1kg)", category: "Fresh Vegetables" },
    { name: "Tomatoes (1kg)", category: "Fresh Vegetables" },
    { name: "Milk (1L)", category: "Dairy" },
    { name: "Bread", category: "Bakery" },
    { name: "Eggs (12pcs)", category: "Dairy" },
    { name: "Cooking Oil (1L)", category: "Cooking Essentials" },
    { name: "Sugar (1kg)", category: "Staples" },
    { name: "Tea Powder (250g)", category: "Beverages" },
    { name: "Biscuits", category: "Snacks" },
    { name: "Dal (1kg)", category: "Staples" },
    { name: "Salt (1kg)", category: "Cooking Essentials" },
    { name: "Bananas (1kg)", category: "Fresh Fruits" },
    { name: "Apples (1kg)", category: "Fresh Fruits" },
    { name: "Yogurt (500g)", category: "Dairy" },
    { name: "Soap", category: "Personal Care" },
    { name: "Shampoo", category: "Personal Care" },
    { name: "Detergent (1kg)", category: "Household" },
  ]

  return products.map((product, index) => ({
    productId: `PROD${String(index + 1).padStart(3, "0")}`,
    productName: product.name,
    stockLevel: Math.floor(Math.random() * 50) + 5,
    category: product.category,
  }))
}

export function generateForecast(salesData: SalesRecord[], days = 30): { date: string; predictedRevenue: number }[] {
  const dailyRevenue = new Map<string, number>()

  salesData.forEach((sale) => {
    const revenue = sale.quantity * sale.unitPrice
    dailyRevenue.set(sale.date, (dailyRevenue.get(sale.date) || 0) + revenue)
  })

  const revenues = Array.from(dailyRevenue.values())
  const avgRevenue = revenues.reduce((sum, rev) => sum + rev, 0) / revenues.length

  const forecast = []
  for (let i = 1; i <= days; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)

    const variation = (Math.random() - 0.5) * 0.2
    const predictedRevenue = avgRevenue * (1 + variation)

    forecast.push({
      date: date.toISOString().split("T")[0],
      predictedRevenue: Math.round(predictedRevenue),
    })
  }

  return forecast
}

export function generateRecommendations(salesData: SalesRecord[], productsData: ProductData[]): string[] {
  const recommendations: string[] = []

  const productSales = new Map<string, { quantity: number; revenue: number }>()

  salesData.forEach((sale) => {
    const current = productSales.get(sale.product) || { quantity: 0, revenue: 0 }
    productSales.set(sale.product, {
      quantity: current.quantity + sale.quantity,
      revenue: current.revenue + sale.quantity * sale.unitPrice,
    })
  })

  const sortedProducts = Array.from(productSales.entries()).sort((a, b) => b[1].revenue - a[1].revenue)

  if (sortedProducts.length > 0) {
    recommendations.push(
      `📈 Stock more ${sortedProducts[0][0]} - it's your top seller with ₹${sortedProducts[0][1].revenue.toLocaleString()} revenue`,
    )
  }

  const slowMovers = sortedProducts.slice(-2)
  if (slowMovers.length > 0) {
    recommendations.push(`🏷️ Consider 10-15% discount on ${slowMovers[0][0]} to clear slow-moving stock`)
  }

  const currentMonth = new Date().getMonth()
  if (currentMonth >= 3 && currentMonth <= 5) {
    recommendations.push("🌞 Summer season: Stock more cold drinks, ice cream, and fresh fruits")
  } else if (currentMonth >= 9 && currentMonth <= 11) {
    recommendations.push("🎉 Festival season: Increase stock of sweets, dry fruits, and cooking essentials")
  } else if (currentMonth >= 11 || currentMonth <= 1) {
    recommendations.push("❄️ Winter season: Stock more hot beverages, seasonal vegetables, and warm snacks")
  }

  const paymentMethods = new Map<string, number>()
  salesData.forEach((sale) => {
    paymentMethods.set(sale.paymentMethod, (paymentMethods.get(sale.paymentMethod) || 0) + 1)
  })

  const topPaymentMethod = Array.from(paymentMethods.entries()).sort((a, b) => b[1] - a[1])[0]

  if (topPaymentMethod) {
    recommendations.push(
      `💳 ${topPaymentMethod[0]} is your customers' preferred payment method (${topPaymentMethod[1]} transactions)`,
    )
  }

  return recommendations
}

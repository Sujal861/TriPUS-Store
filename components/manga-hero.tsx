"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, Receipt, TrendingUp } from "lucide-react"

interface MangaHeroProps {
  totalRevenue: number
  activeCustomers: number
  transactions: number
  onExploreClick: () => void
  onStartSellingClick: () => void
}

export function MangaHero({
  totalRevenue,
  activeCustomers,
  transactions,
  onExploreClick,
  onStartSellingClick,
}: MangaHeroProps) {
  return (
    <div className="relative overflow-hidden bg-white py-20 px-8 mb-12 rounded-none border-4 border-black manga-panel">
      {/* Background decorative elements - updated to black and white */}
      <div className="absolute top-10 right-10 w-32 h-32 border-4 border-black bg-white rounded-none manga-float" />
      <div
        className="absolute bottom-10 left-10 w-24 h-24 border-3 border-black bg-black rounded-none manga-float"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 right-1/4 w-16 h-16 border-2 border-black bg-white rounded-none manga-float"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-16 items-start">
          {/* Left side - Brand and CTA */}
          <div className="xl:col-span-2 space-y-10">
            {/* Logo and Brand */}
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-black border-4 border-black rounded-none flex items-center justify-center manga-glow">
                  <div className="text-white font-bold text-2xl">
                    <svg viewBox="0 0 100 100" className="w-12 h-12 fill-current">
                      <polygon points="50,10 20,80 80,80" stroke="currentColor" strokeWidth="4" fill="none" />
                      <polygon points="50,25 30,65 70,65" stroke="currentColor" strokeWidth="3" fill="none" />
                      <polygon points="50,40 40,60 60,60" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="manga-text-bubble text-xs">⚡ AI-POWERED BUSINESS INTELLIGENCE</div>
                </div>
              </div>

              <h1 className="text-6xl font-black text-black leading-tight manga-header">
                Tri<span className="text-black">PUS</span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-xl text-black leading-relaxed max-w-2xl font-semibold">
              Transform your retail business with intelligent insights. From inventory management to customer analytics,
              we make complex data simple and actionable.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <Button onClick={onExploreClick} size="lg" className="manga-button px-8 py-4 text-lg rounded-none">
                <BarChart3 className="mr-2 h-5 w-5" />
                EXPLORE DASHBOARD →
              </Button>

              <Button
                onClick={onStartSellingClick}
                variant="outline"
                size="lg"
                className="border-4 border-black text-black hover:bg-black hover:text-white font-black px-8 py-4 text-lg rounded-none transition-all duration-300 hover:scale-105 bg-white uppercase tracking-wide"
              >
                ⚡ START SELLING →
              </Button>
            </div>
          </div>

          {/* Right side - Metrics Cards */}
          <div className="xl:col-span-1 space-y-6">
            {/* Total Revenue Card */}
            <Card className="manga-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-black border-2 border-black rounded-none flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-black uppercase tracking-widest">TOTAL REVENUE</p>
                    <p className="text-3xl font-black text-black">₹{totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Customers Card */}
            <Card className="manga-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-black border-2 border-black rounded-none flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-black uppercase tracking-widest">ACTIVE CUSTOMERS</p>
                    <p className="text-3xl font-black text-black">{activeCustomers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Card */}
            <Card className="manga-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-black border-2 border-black rounded-none flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-black uppercase tracking-widest">TRANSACTIONS</p>
                    <p className="text-3xl font-black text-black">{transactions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

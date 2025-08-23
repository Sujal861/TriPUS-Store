"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface Customer {
  customerId: string
  name: string
  email: string
  creditBalance: number
}

interface CreditTransaction {
  id: string
  customerId: string
  customerName: string
  customerEmail?: string
  amount: number
  date: string
  dueDate: string
  status: "pending" | "paid"
  items: any[]
}

interface CreditCustomerCardProps {
  customer: Customer
  onGrantCredit: (customer: Customer, customEmail?: string) => void
  onSendReminder: (transaction: CreditTransaction) => void
  creditTransactions: CreditTransaction[]
  cart: any[]
}

export function CreditCustomerCard({
  customer,
  onGrantCredit,
  onSendReminder,
  creditTransactions,
  cart,
}: CreditCustomerCardProps) {
  const [customEmail, setCustomEmail] = useState("")
  const [showEmailInput, setShowEmailInput] = useState(false)

  const customerTransaction = creditTransactions.find((t) => t.customerId === customer.customerId)

  return (
    <Card className="border-2 border-border">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <p className="font-bold text-foreground">{customer.name}</p>
            <p className="text-sm text-muted-foreground">Default: {customer.email}</p>
            <p className="text-sm font-bold text-red-600">Credit Balance: ₹{customer.creditBalance}</p>
          </div>

          {/* Custom Email Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`custom-email-${customer.customerId}`}
                checked={showEmailInput}
                onChange={(e) => {
                  setShowEmailInput(e.target.checked)
                  if (!e.target.checked) setCustomEmail("")
                }}
                className="rounded border-border"
              />
              <Label htmlFor={`custom-email-${customer.customerId}`} className="text-sm font-medium text-foreground">
                Use custom email for this credit
              </Label>
            </div>

            {showEmailInput && (
              <div>
                <Label className="text-xs font-bold text-foreground uppercase">Custom Email</Label>
                <Input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="Enter custom email for reminders"
                  className="border-2 border-border rounded-lg text-sm"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => onGrantCredit(customer, showEmailInput ? customEmail : undefined)}
              className="manga-button text-xs flex-1"
              disabled={cart.length === 0 || (showEmailInput && !customEmail)}
            >
              Grant Credit
            </Button>

            {customerTransaction && (
              <Button
                onClick={() => onSendReminder(customerTransaction)}
                variant="outline"
                className="border-2 border-border text-foreground hover:bg-primary hover:text-primary-foreground text-xs"
                disabled={!customerTransaction.customerEmail && !customer.email}
              >
                Send Reminder
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

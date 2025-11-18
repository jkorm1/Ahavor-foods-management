// Financial calculation utilities for Star Pops business

export interface Sale {
  id: string
  date: string
  product: string
  quantity: number
  price: number
  total: number
  employee: string
  businessFund: number
  employeeShare: number
  investorShare: number
  savings: number;
}

export interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
}

export interface Withdrawal {
  id: string
  date: string
  purpose: string
  amount: number
  type: "withdrawal" | "repayment"
}

export interface EmployeeShare {
  employee: string
  totalShare: number
  salesCount: number
}

export interface FinancialSummary {
  totalSales: number
  totalExpenses: number
  businessFund: number
  employeeShare: number
  investorShare: number
  ownerWithdrawals: number
  ownerRepayments: number
  costOfGoods: number
  cash: number
  employeeShares: EmployeeShare[]
}

// Calculate fund split from sales
export function calculateSaleSplit(total: number) {
  const businessFund = (total * 6) / 10  // Changed from 7/10 to 6/10
  const employeeShare = (total * 1.5) / 10  // Changed from 2/10 to 1.5/10
  const investorShare = (total * 1.5) / 10  // Changed from 1/10 to 1.5/10
  const savings = (total * 1) / 10  // Added new savings field


  return {
    businessFund: Math.round(businessFund * 100) / 100,
    employeeShare: Math.round(employeeShare * 100) / 100,
    investorShare: Math.round(investorShare * 100) / 100,
    savings: Math.round(savings * 100) / 100, 
  }
}

// Calculate financial summary from transactions
export function calculateFinancialSummary(
  sales: Sale[],
  expenses: Expense[],
  withdrawals: Withdrawal[],
): FinancialSummary {
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalWithdrawals = withdrawals.filter((w) => w.type === "withdrawal").reduce((sum, w) => sum + w.amount, 0)
  const totalRepayments = withdrawals.filter((w) => w.type === "repayment").reduce((sum, w) => sum + w.amount, 0)

  let businessFund = 0
  let employeeShare = 0
  let investorShare = 0

  // Sum up all sales splits
  for (const sale of sales) {
    businessFund += sale.businessFund
    employeeShare += sale.employeeShare
    investorShare += sale.investorShare
  }

  const ownerWithdrawals = totalWithdrawals
  const costOfGoods = expenses
    .filter((e) => e.category === "Maize" || e.category === "Sugar")
    .reduce((sum, e) => sum + e.amount, 0)
  const cash = businessFund - totalExpenses - ownerWithdrawals + totalRepayments

  return {
    totalSales: Math.round(totalSales * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    businessFund: Math.round(businessFund * 100) / 100,
    employeeShare: Math.round(employeeShare * 100) / 100,
    investorShare: Math.round(investorShare * 100) / 100,
    ownerWithdrawals: Math.round(ownerWithdrawals * 100) / 100,
    ownerRepayments: Math.round(totalRepayments * 100) / 100,
    costOfGoods: Math.round(costOfGoods * 100) / 100,
    cash: Math.round(Math.max(0, cash) * 100) / 100,
  }
}

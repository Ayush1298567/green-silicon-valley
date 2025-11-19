"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, Edit3, Trash2, Receipt, AlertTriangle } from "lucide-react";
import ProfessionalButton from "@/components/ui/ProfessionalButton";

interface BudgetCategory {
  id: string;
  name: string;
  description: string;
  budget_limit: number;
  current_spent: number;
  fiscal_year: number;
}

interface BudgetTransaction {
  id: string;
  category_id: string;
  amount: number;
  description: string;
  transaction_type: 'expense' | 'income' | 'transfer';
  transaction_date: string;
  reference_type?: string;
  approved_by?: string;
  created_by: string;
}

export default function FinanceManagementPage() {
  const supabase = createClientComponentClient();
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    category_id: '',
    amount: '',
    description: '',
    transaction_type: 'expense' as const,
    transaction_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        redirect("/login");
        return;
      }

      const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
      const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
      if (!['founder', 'intern'].includes(role)) {
        redirect(getDashboardPathForRole(role));
        return;
      }

      // Load budget categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("fiscal_year", new Date().getFullYear())
        .order("name");

      if (categoriesError) throw categoriesError;

      // Load recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("budget_transactions")
        .select(`
          *,
          budget_categories(name)
        `)
        .order("transaction_date", { ascending: false })
        .limit(50);

      if (transactionsError) throw transactionsError;

      setCategories(categoriesData || []);
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error("Error loading finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const transactionData = {
        category_id: newTransaction.category_id,
        amount: parseFloat(newTransaction.amount),
        description: newTransaction.description,
        transaction_type: newTransaction.transaction_type,
        transaction_date: newTransaction.transaction_date,
        created_by: session.user.id
      };

      const { error } = await supabase
        .from("budget_transactions")
        .insert(transactionData);

      if (error) throw error;

      // Reset form
      setNewTransaction({
        category_id: '',
        amount: '',
        description: '',
        transaction_type: 'expense',
        transaction_date: new Date().toISOString().split('T')[0]
      });
      setShowAddTransaction(false);
      await loadData();
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const calculateTotalBudget = () => categories.reduce((sum, cat) => sum + (cat.budget_limit || 0), 0);
  const calculateTotalSpent = () => categories.reduce((sum, cat) => sum + (cat.current_spent || 0), 0);
  const calculateTotalRemaining = () => calculateTotalBudget() - calculateTotalSpent();

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center py-12 text-gsv-gray">Loading financial data...</div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">Financial Management</h1>
          <p className="text-gsv-gray">
            Track budgets, expenses, and financial performance across all programs
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-gsv-green" />
              <span className="text-sm text-gsv-gray">Total Budget</span>
            </div>
            <div className="text-2xl font-bold text-gsv-green">
              ${calculateTotalBudget().toLocaleString()}
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <span className="text-sm text-gsv-gray">Total Spent</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              ${calculateTotalSpent().toLocaleString()}
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gsv-gray">Remaining</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ${calculateTotalRemaining().toLocaleString()}
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`w-5 h-5 ${calculateTotalRemaining() < calculateTotalBudget() * 0.1 ? 'text-red-600' : 'text-yellow-600'}`} />
              <span className="text-sm text-gsv-gray">Status</span>
            </div>
            <div className={`text-lg font-semibold ${calculateTotalRemaining() < calculateTotalBudget() * 0.1 ? 'text-red-600' : 'text-green-600'}`}>
              {calculateTotalRemaining() < calculateTotalBudget() * 0.1 ? 'Low Budget' : 'Healthy'}
            </div>
          </div>
        </div>

        {/* Budget Categories */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gsv-charcoal">Budget Categories</h2>
            <ProfessionalButton
              onClick={() => setShowAddTransaction(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </ProfessionalButton>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const spent = category.current_spent || 0;
              const budget = category.budget_limit || 0;
              const remaining = budget - spent;
              const percentage = budget > 0 ? (spent / budget) * 100 : 0;

              return (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gsv-charcoal">{category.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      percentage > 90 ? 'bg-red-100 text-red-800' :
                      percentage > 75 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {percentage.toFixed(0)}% used
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget:</span>
                      <span className="font-medium">${budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Spent:</span>
                      <span className="font-medium text-red-600">${spent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Remaining:</span>
                      <span className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${remaining.toLocaleString()}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentage > 90 ? 'bg-red-500' :
                          percentage > 75 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gsv-charcoal mb-4">Recent Transactions</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gsv-gray">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gsv-charcoal">
                        {transaction.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gsv-gray">
                      {/* Would need to join with categories table */}
                      Category ID: {transaction.category_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.transaction_type === 'expense' ? 'bg-red-100 text-red-800' :
                        transaction.transaction_type === 'income' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {transaction.transaction_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transaction.transaction_type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                        {transaction.transaction_type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.approved_by ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.approved_by ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-12 text-gsv-gray">
              No transactions recorded yet.
            </div>
          )}
        </div>

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gsv-charcoal">Add Transaction</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                    Category
                  </label>
                  <select
                    value={newTransaction.category_id}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                    Type
                  </label>
                  <select
                    value={newTransaction.transaction_type}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, transaction_type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green resize-none"
                    rows={3}
                    placeholder="Transaction description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newTransaction.transaction_date}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, transaction_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                  />
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => setShowAddTransaction(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <ProfessionalButton
                  onClick={addTransaction}
                  disabled={!newTransaction.category_id || !newTransaction.amount || !newTransaction.description}
                >
                  Add Transaction
                </ProfessionalButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

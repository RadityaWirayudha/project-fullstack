<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Payment;
use App\Models\PaymentDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    // Grafik summary pemasukan vs pengeluaran per bulan selama 1 tahun
    public function summary(Request $request)
    {
        $year = (int) $request->query('year', now()->year);

        // Pemasukan dihitung dari tanggal pembayaran diterima (cash basis)
        $incomeByMonth = Payment::whereYear('payment_date', $year)
            ->selectRaw('MONTH(payment_date) as month, SUM(total_amount) as total')
            ->groupBy('month')
            ->pluck('total', 'month');

        $expenseByMonth = Expense::whereYear('expense_date', $year)
            ->selectRaw('MONTH(expense_date) as month, SUM(amount) as total')
            ->groupBy('month')
            ->pluck('total', 'month');

        $months = collect(range(1, 12))->map(fn ($month) => [
            'month' => $month,
            'label' => Carbon::create($year, $month, 1)->translatedFormat('M'),
            'income' => (int) ($incomeByMonth[$month] ?? 0),
            'expense' => (int) ($expenseByMonth[$month] ?? 0),
        ]);

        return response()->json([
            'year' => $year,
            'months' => $months,
            'total_income' => $months->sum('income'),
            'total_expense' => $months->sum('expense'),
            'balance' => $months->sum('income') - $months->sum('expense'),
        ]);
    }

    // Detail report pemasukan & pengeluaran untuk bulan tertentu
    public function monthly(Request $request)
    {
        $year = (int) $request->query('year', now()->year);
        $month = (int) $request->query('month', now()->month);

        $payments = Payment::with(['house', 'resident', 'details'])
            ->whereYear('payment_date', $year)
            ->whereMonth('payment_date', $month)
            ->orderBy('payment_date')
            ->get();

        $expenses = Expense::whereYear('expense_date', $year)
            ->whereMonth('expense_date', $month)
            ->orderBy('expense_date')
            ->get();

        return response()->json([
            'year' => $year,
            'month' => $month,
            'label' => Carbon::create($year, $month, 1)->translatedFormat('F Y'),
            'incomes' => $payments,
            'expenses' => $expenses,
            'total_income' => (int) $payments->sum('total_amount'),
            'total_expense' => (int) $expenses->sum('amount'),
            'balance' => (int) ($payments->sum('total_amount') - $expenses->sum('amount')),
        ]);
    }
}

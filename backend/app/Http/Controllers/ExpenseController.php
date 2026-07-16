<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index()
    {
        return response()->json(
            Expense::orderByDesc('expense_date')->orderByDesc('id')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'description' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'amount' => ['required', 'integer', 'min:1'],
            'expense_date' => ['required', 'date'],
        ]);

        $expense = Expense::create($data);

        return response()->json($expense, 201);
    }

    public function show(Expense $expense)
    {
        return response()->json($expense);
    }

    public function update(Request $request, Expense $expense)
    {
        $data = $request->validate([
            'description' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'amount' => ['required', 'integer', 'min:1'],
            'expense_date' => ['required', 'date'],
        ]);

        $expense->update($data);

        return response()->json($expense);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();

        return response()->json(['message' => 'Pengeluaran dihapus.']);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\PaymentDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['house', 'resident', 'details'])
            ->orderByDesc('payment_date')
            ->orderByDesc('id');

        if ($houseId = $request->query('house_id')) {
            $query->where('house_id', $houseId);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'house_id' => ['required', 'exists:houses,id'],
            'resident_id' => ['required', 'exists:residents,id'],
            'payment_date' => ['required', 'date'],
            'fee_type' => ['required', 'in:kebersihan,satpam'],
            'payment_mode' => ['required', 'in:bulanan,tahunan'],
            'period_month' => ['required', 'integer', 'between:1,12'],
            'period_year' => ['required', 'integer', 'between:2000,2100'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        // Pembayaran tahunan hanya untuk iuran kebersihan
        if ($data['payment_mode'] === 'tahunan' && $data['fee_type'] !== 'kebersihan') {
            return response()->json([
                'message' => 'Pembayaran tahunan hanya berlaku untuk iuran kebersihan.',
            ], 422);
        }

        $amountPerMonth = Payment::FEE_AMOUNTS[$data['fee_type']];
        $monthCount = $data['payment_mode'] === 'tahunan' ? 12 : 1;

        // Kumpulan periode yang akan dibayar
        $periods = collect(range(0, $monthCount - 1))->map(
            fn ($i) => Carbon::create($data['period_year'], $data['period_month'], 1)->addMonths($i)
        );

        // Tolak jika ada periode yang sudah lunas untuk jenis iuran ini
        $alreadyPaid = PaymentDetail::whereHas('payment', fn ($q) => $q->where('house_id', $data['house_id']))
            ->where('fee_type', $data['fee_type'])
            ->whereIn('period', $periods->map(fn ($p) => $p->toDateString()))
            ->get();

        if ($alreadyPaid->isNotEmpty()) {
            $labels = $alreadyPaid->map(fn ($d) => $d->period->translatedFormat('F Y'))->unique()->implode(', ');

            return response()->json([
                'message' => "Iuran {$data['fee_type']} untuk periode berikut sudah lunas: {$labels}.",
            ], 422);
        }

        $payment = DB::transaction(function () use ($data, $periods, $amountPerMonth) {
            $payment = Payment::create([
                'house_id' => $data['house_id'],
                'resident_id' => $data['resident_id'],
                'payment_date' => $data['payment_date'],
                'total_amount' => $amountPerMonth * $periods->count(),
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($periods as $period) {
                PaymentDetail::create([
                    'payment_id' => $payment->id,
                    'fee_type' => $data['fee_type'],
                    'period' => $period->toDateString(),
                    'amount' => $amountPerMonth,
                ]);
            }

            return $payment;
        });

        return response()->json($payment->load(['house', 'resident', 'details']), 201);
    }

    public function show(Payment $payment)
    {
        return response()->json($payment->load(['house', 'resident', 'details']));
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();

        return response()->json(['message' => 'Pembayaran dihapus.']);
    }
}

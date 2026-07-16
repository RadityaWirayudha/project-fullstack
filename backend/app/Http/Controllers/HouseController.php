<?php

namespace App\Http\Controllers;

use App\Models\House;
use App\Models\HouseResident;
use App\Models\PaymentDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class HouseController extends Controller
{
    public function index()
    {
        $houses = House::with('currentOccupancy.resident')
            ->orderBy('house_number')
            ->get();

        return response()->json($houses);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'house_number' => ['required', 'string', 'max:50', 'unique:houses,house_number'],
        ]);

        $house = House::create($data + ['status' => 'tidak_dihuni']);

        return response()->json($house, 201);
    }

    public function show(Request $request, House $house)
    {
        $house->load([
            'currentOccupancy.resident',
            'houseResidents' => fn ($q) => $q->with('resident')->orderByDesc('start_date'),
        ]);

        // Histori pembayaran per bulan (Lunas/Belum per jenis iuran) untuk tahun tertentu
        $year = (int) $request->query('year', now()->year);
        $paidDetails = PaymentDetail::whereHas('payment', fn ($q) => $q->where('house_id', $house->id))
            ->whereYear('period', $year)
            ->get()
            ->groupBy(fn ($d) => $d->period->format('n'));

        $paymentHistory = collect(range(1, 12))->map(function ($month) use ($paidDetails, $year) {
            $details = $paidDetails->get((string) $month, collect());

            return [
                'month' => $month,
                'label' => Carbon::create($year, $month, 1)->translatedFormat('F'),
                'kebersihan' => $details->contains('fee_type', 'kebersihan'),
                'satpam' => $details->contains('fee_type', 'satpam'),
            ];
        });

        return response()->json([
            'house' => $house,
            'payment_history' => [
                'year' => $year,
                'months' => $paymentHistory,
            ],
        ]);
    }

    public function update(Request $request, House $house)
    {
        $data = $request->validate([
            'house_number' => ['required', 'string', 'max:50', 'unique:houses,house_number,' . $house->id],
        ]);

        $house->update($data);

        return response()->json($house);
    }

    public function destroy(House $house)
    {
        $house->delete();

        return response()->json(['message' => 'Rumah dihapus.']);
    }

    // Tambah penghuni ke rumah
    public function assignResident(Request $request, House $house)
    {
        $data = $request->validate([
            'resident_id' => ['required', 'exists:residents,id'],
            'start_date' => ['required', 'date'],
        ]);

        if ($house->currentOccupancy()->exists()) {
            return response()->json([
                'message' => 'Rumah ini masih dihuni. Keluarkan penghuni aktif terlebih dahulu.',
            ], 422);
        }

        $activeElsewhere = HouseResident::where('resident_id', $data['resident_id'])
            ->whereNull('end_date')
            ->exists();
        if ($activeElsewhere) {
            return response()->json([
                'message' => 'Penghuni ini masih tercatat menghuni rumah lain.',
            ], 422);
        }

        $occupancy = HouseResident::create([
            'house_id' => $house->id,
            'resident_id' => $data['resident_id'],
            'start_date' => $data['start_date'],
        ]);

        $house->update(['status' => 'dihuni']);

        return response()->json($occupancy->load('resident'), 201);
    }

    // Keluarkan penghuni aktif dari rumah
    public function checkoutResident(Request $request, House $house)
    {
        $data = $request->validate([
            'end_date' => ['required', 'date'],
        ]);

        $occupancy = $house->currentOccupancy()->first();

        if (! $occupancy) {
            return response()->json(['message' => 'Rumah ini tidak memiliki penghuni aktif.'], 422);
        }

        $occupancy->update(['end_date' => $data['end_date']]);
        $house->update(['status' => 'tidak_dihuni']);

        return response()->json($occupancy->load('resident'));
    }
}

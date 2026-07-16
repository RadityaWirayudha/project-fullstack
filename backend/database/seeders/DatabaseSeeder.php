<?php

namespace Database\Seeders;

use App\Models\Expense;
use App\Models\House;
use App\Models\HouseResident;
use App\Models\Payment;
use App\Models\PaymentDetail;
use App\Models\Resident;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin default
        User::create([
            'name' => 'Admin RT',
            'email' => 'admin@rt.test',
            'password' => 'password',
        ]);

        // Rumah A-01 s/d A-08
        $houses = collect(range(1, 8))->map(fn ($i) => House::create([
            'house_number' => sprintf('A-%02d', $i),
            'status' => 'tidak_dihuni',
        ]));

        // Penghuni contoh
        $residentsData = [
            ['full_name' => 'Budi Santoso', 'resident_status' => 'tetap', 'phone_number' => '081234567801', 'marital_status' => 'sudah'],
            ['full_name' => 'Siti Aminah', 'resident_status' => 'tetap', 'phone_number' => '081234567802', 'marital_status' => 'sudah'],
            ['full_name' => 'Andi Wijaya', 'resident_status' => 'kontrak', 'phone_number' => '081234567803', 'marital_status' => 'belum'],
            ['full_name' => 'Dewi Lestari', 'resident_status' => 'kontrak', 'phone_number' => '081234567804', 'marital_status' => 'belum'],
            ['full_name' => 'Rudi Hartono', 'resident_status' => 'tetap', 'phone_number' => '081234567805', 'marital_status' => 'sudah'],
            ['full_name' => 'Rina Marlina', 'resident_status' => 'kontrak', 'phone_number' => '081234567806', 'marital_status' => 'sudah'],
        ];
        $residents = collect($residentsData)->map(fn ($data) => Resident::create($data));

        $year = now()->year;

        // Penempatan penghuni: 5 rumah dihuni, 1 rumah punya histori penghuni lama
        foreach ($residents->take(5) as $i => $resident) {
            $house = $houses[$i];
            HouseResident::create([
                'house_id' => $house->id,
                'resident_id' => $resident->id,
                'start_date' => Carbon::create($year, 1, 1),
                'end_date' => null,
            ]);
            $house->update(['status' => 'dihuni']);
        }

        // Histori: Rina pernah menghuni A-06 lalu pindah keluar
        HouseResident::create([
            'house_id' => $houses[5]->id,
            'resident_id' => $residents[5]->id,
            'start_date' => Carbon::create($year - 1, 3, 1),
            'end_date' => Carbon::create($year, 2, 28),
        ]);

        // Pembayaran: iuran kebersihan + satpam bulanan Jan-Jun untuk 4 rumah pertama
        foreach ($houses->take(4) as $i => $house) {
            $resident = $residents[$i];
            for ($month = 1; $month <= 6; $month++) {
                $payment = Payment::create([
                    'house_id' => $house->id,
                    'resident_id' => $resident->id,
                    'payment_date' => Carbon::create($year, $month, 5),
                    'total_amount' => 115000,
                    'notes' => 'Iuran bulanan',
                ]);
                foreach (['kebersihan' => 15000, 'satpam' => 100000] as $type => $amount) {
                    PaymentDetail::create([
                        'payment_id' => $payment->id,
                        'fee_type' => $type,
                        'period' => Carbon::create($year, $month, 1),
                        'amount' => $amount,
                    ]);
                }
            }
        }

        // Rumah ke-5: bayar iuran kebersihan tahunan (12 bulan sekaligus)
        $annual = Payment::create([
            'house_id' => $houses[4]->id,
            'resident_id' => $residents[4]->id,
            'payment_date' => Carbon::create($year, 1, 10),
            'total_amount' => 180000,
            'notes' => 'Iuran kebersihan tahunan',
        ]);
        for ($month = 1; $month <= 12; $month++) {
            PaymentDetail::create([
                'payment_id' => $annual->id,
                'fee_type' => 'kebersihan',
                'period' => Carbon::create($year, $month, 1),
                'amount' => 15000,
            ]);
        }

        // Pengeluaran operasional contoh
        $expensesData = [
            ['description' => 'Gaji satpam bulan Januari', 'category' => 'Gaji', 'amount' => 400000, 'month' => 1],
            ['description' => 'Perbaikan lampu jalan', 'category' => 'Perbaikan', 'amount' => 250000, 'month' => 2],
            ['description' => 'Gaji satpam bulan Februari', 'category' => 'Gaji', 'amount' => 400000, 'month' => 2],
            ['description' => 'Kerja bakti & konsumsi', 'category' => 'Kegiatan', 'amount' => 150000, 'month' => 3],
            ['description' => 'Gaji satpam bulan Maret', 'category' => 'Gaji', 'amount' => 400000, 'month' => 3],
            ['description' => 'Perbaikan saluran air', 'category' => 'Perbaikan', 'amount' => 350000, 'month' => 4],
            ['description' => 'Gaji satpam bulan April', 'category' => 'Gaji', 'amount' => 400000, 'month' => 4],
            ['description' => 'Gaji satpam bulan Mei', 'category' => 'Gaji', 'amount' => 400000, 'month' => 5],
            ['description' => 'Pengecatan pos ronda', 'category' => 'Perbaikan', 'amount' => 200000, 'month' => 6],
            ['description' => 'Gaji satpam bulan Juni', 'category' => 'Gaji', 'amount' => 400000, 'month' => 6],
        ];
        foreach ($expensesData as $data) {
            Expense::create([
                'description' => $data['description'],
                'category' => $data['category'],
                'amount' => $data['amount'],
                'expense_date' => Carbon::create($year, $data['month'], 25),
            ]);
        }
    }
}

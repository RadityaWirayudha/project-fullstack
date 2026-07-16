<?php

namespace App\Http\Controllers;

use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResidentController extends Controller
{
    public function index(Request $request)
    {
        $query = Resident::query()->orderBy('full_name');

        if ($search = $request->query('search')) {
            $query->where('full_name', 'like', "%{$search}%");
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'ktp_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'resident_status' => ['required', 'in:tetap,kontrak'],
            'phone_number' => ['required', 'string', 'max:20'],
            'marital_status' => ['required', 'in:sudah,belum'],
        ]);

        if ($request->hasFile('ktp_photo')) {
            $data['ktp_photo'] = $request->file('ktp_photo')->store('ktp', 'public');
        }

        $resident = Resident::create($data);

        return response()->json($resident, 201);
    }

    public function show(Resident $resident)
    {
        $resident->load(['houseResidents.house']);

        return response()->json($resident);
    }

    public function update(Request $request, Resident $resident)
    {
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'ktp_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'resident_status' => ['required', 'in:tetap,kontrak'],
            'phone_number' => ['required', 'string', 'max:20'],
            'marital_status' => ['required', 'in:sudah,belum'],
        ]);

        if ($request->hasFile('ktp_photo')) {
            if ($resident->ktp_photo) {
                Storage::disk('public')->delete($resident->ktp_photo);
            }
            $data['ktp_photo'] = $request->file('ktp_photo')->store('ktp', 'public');
        } else {
            unset($data['ktp_photo']);
        }

        $resident->update($data);

        return response()->json($resident);
    }

    public function destroy(Resident $resident)
    {
        if ($resident->ktp_photo) {
            Storage::disk('public')->delete($resident->ktp_photo);
        }
        $resident->delete();

        return response()->json(['message' => 'Penghuni dihapus.']);
    }
}

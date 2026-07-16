<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\HouseController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ResidentController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('residents', ResidentController::class);

    Route::apiResource('houses', HouseController::class);
    Route::post('houses/{house}/assign-resident', [HouseController::class, 'assignResident']);
    Route::post('houses/{house}/checkout-resident', [HouseController::class, 'checkoutResident']);

    Route::apiResource('payments', PaymentController::class)->only(['index', 'store', 'show', 'destroy']);

    Route::apiResource('expenses', ExpenseController::class);

    Route::get('/reports/summary', [ReportController::class, 'summary']);
    Route::get('/reports/monthly', [ReportController::class, 'monthly']);
});

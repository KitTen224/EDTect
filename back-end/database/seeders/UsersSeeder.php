<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
     public function run(): void
    {
        DB::transaction(function () {
            User::insert([
                [
                    'user_name' => 'admin01',
                    'name' => 'TRUONG THI KIM THUONG',
                    'email' => 'nakamurakimthuong@gmail.com',
                    'password' => Hash::make('C@admin01'),
                    'address' =>'大阪府大阪市生野区中川西',
                    'role' => 'admin'
                ],
                [
                    'user_name' => 'admin02',
                    'name' => 'TRAN QUANG CANH',
                    'email' => 'testad02@gmail.com',
                    'password' => Hash::make('C@admin02'),
                    'address' =>'大阪府大阪市7',
                    'role' => 'admin'
                ],
                [
                    'user_name' => 'admin03',
                    'name' => 'TAMANG DINESH',
                    'email' => 'testad03t@gmail.com',
                    'password' => Hash::make('C@admin03'),
                    'address' =>'大阪府大阪市6',
                    'role' => 'admin'
                ],
                [
                    'user_name' => 'admin04',
                    'name' => 'NGUYEN TRUNG DUC',
                    'email' => 'testad04@gmail.com',
                    'password' => Hash::make('C@admin04'),
                    'address' =>'大阪府大阪市5',
                    'role' => 'admin'
                ],
                [
                    'user_name' => 'admin05',
                    'name' => 'HASHIMOTO TOMOKI',
                    'email' => 'testad05@gmail.com',
                    'password' => Hash::make('C@admin05'),
                    'address' =>'大阪府大阪市4',
                    'role' => 'admin'
                ],
                [
                    'user_name' => 'admin06',
                    'name' => 'E KIMHENG',
                    'email' => 'testad06@gmail.com',
                    'password' => Hash::make('C@admin06'),
                    'address' =>'大阪府大阪市1',
                    'role' => 'admin'
                ],
                [
                    'user_name' => 'user01',
                    'name' => 'USER ONE',
                    'email' => 'testuser01@gmail.com',
                    'password' => Hash::make('C@user01'),
                    'address' =>'大阪府大阪市3',
                    'role' => 'user'
                ],
                [
                    'user_name' => 'user02',
                    'name' => 'USER TWO',
                    'email' => 'testuser02@gmail.com',
                    'password' => Hash::make('C@user02'),
                    'address' =>'大阪府大阪市2',
                    'role' => 'user'
                ],

            ]);
        });
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\AIInteractionLog;

class AIChatController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer',
            'prompt_text' => 'required|string',
            'response_text' => 'nullable|string',
            'action_type' => 'string|nullable',
        ]);

        $validated['timestamp'] = now();

        $log = AIInteractionLog::create($validated);
        return response()->json($log);
    }

    public function recent($userId)
    {
        $logs = AIInteractionLog::where('user_id', $userId)
                ->orderByDesc('timestamp')
                ->take(20)
                ->get();

        return response()->json($logs);
    }
}


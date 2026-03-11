<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deal_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deal_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type');        // note | email | sms | call | todo
            $table->string('subject')->nullable();
            $table->text('body')->nullable();
            $table->date('due_date')->nullable();       // for todos
            $table->boolean('completed')->default(false); // for todos
            $table->timestamps();

            $table->index(['deal_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deal_logs');
    }
};

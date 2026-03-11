<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');          // e.g. "created", "updated", "stage_changed", "note_added"
            $table->string('entity_type');     // e.g. "Lead", "Deal", "Contact"
            $table->unsignedBigInteger('entity_id');
            $table->string('entity_label')->nullable(); // human-readable name snapshot
            $table->text('description')->nullable();    // optional extra context
            $table->timestamps();

            $table->index(['entity_type', 'entity_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};

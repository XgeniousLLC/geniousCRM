<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pivot table connecting deals to tags.
 * Reuses the existing tags table from the Contact module.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deal_tag', function (Blueprint $table) {
            $table->foreignId('deal_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['deal_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deal_tag');
    }
};

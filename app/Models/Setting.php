<?php

/**
 * Setting Model
 *
 * Represents a single key/value application setting for Mini CRM.
 * Used by SettingService to store and retrieve global config such as
 * app title, meta info, logo path, and favicon path.
 *
 * Table     : settings
 * Used by   : App\Services\SettingService
 * Author    : Xgenious (https://xgenious.com)
 * License   : MIT
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];
}

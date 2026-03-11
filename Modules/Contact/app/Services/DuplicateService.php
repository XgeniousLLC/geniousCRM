<?php

/**
 * DuplicateService
 *
 * Checks incoming contact or lead data against existing records
 * to surface potential duplicates before creation.
 * Matches on email or phone — either field triggers a hit.
 *
 * Module  : Contact
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Contact\Services;

use Modules\Contact\Models\Contact;
use Modules\Lead\Models\Lead;

class DuplicateService
{
    /**
     * Find existing contacts whose email or phone matches the supplied values.
     * Returns up to 5 matches with basic identifying fields.
     */
    public static function findContacts(?string $email, ?string $phone): array
    {
        if (!$email && !$phone) {
            return [];
        }

        return Contact::where(function ($q) use ($email, $phone) {
            if ($email) $q->orWhere('email', $email);
            if ($phone) $q->orWhere('phone', $phone);
        })->limit(5)->get(['id', 'first_name', 'last_name', 'email', 'phone'])->toArray();
    }

    /**
     * Find existing leads whose email or phone matches the supplied values.
     * Returns up to 5 matches with basic identifying fields.
     */
    public static function findLeads(?string $email, ?string $phone): array
    {
        if (!$email && !$phone) {
            return [];
        }

        return Lead::where(function ($q) use ($email, $phone) {
            if ($email) $q->orWhere('email', $email);
            if ($phone) $q->orWhere('phone', $phone);
        })->limit(5)->get(['id', 'name', 'email', 'phone'])->toArray();
    }
}

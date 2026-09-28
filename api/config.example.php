<?php
/* ============================================================
   AOVO SERVICES — form delivery settings (TEMPLATE)

   Copy this file to "config.php" in the same folder and fill in the
   mailbox password. config.php is listed in .gitignore and must never
   be committed, because it holds that password.

   Every setting the form scripts need lives here, so switching the
   recipient address or the mailbox never means editing code.
   ============================================================ */

// Refuse to run if someone opens this file directly in a browser.
if (!defined('AOVO_API')) { http_response_code(404); exit; }

return [
  // --- The Hostinger mailbox that SENDS the form emails ---------------
  // Hostinger's standard outgoing server, using SSL on port 465.
  'smtp_host' => 'smtp.hostinger.com',
  'smtp_port' => 465,
  'smtp_user' => 'info@aovoservices.com',
  'smtp_pass' => 'PASTE-THE-MAILBOX-PASSWORD-HERE',

  // Shown as the sender. Must be the same mailbox as smtp_user, or
  // receiving mail servers will treat the email as spoofed.
  'from_address' => 'info@aovoservices.com',
  'from_name'    => 'AOVO Services Website',

  // --- Where submissions are DELIVERED ---------------------------------
  // While testing, put the developer's own address here; switch it to
  // AOVO's address once both forms have been checked end to end.
  'to_address' => 'info@aovoservices.com',

  // --- Sample Test Restore uploads -------------------------------------
  // The site's public address, used to build the download link in the
  // email. On the staging site, set this to the staging address instead.
  'site_url' => 'https://aovoservices.com',

  // Folder where uploaded audio is stored. The default folder is blocked
  // from direct web access by its own .htaccess file.
  'upload_dir' => __DIR__ . '/uploads',

  // Largest file a visitor may upload, in megabytes. Keep this in step
  // with data-max-mb on the file input in audio-services.html.
  'max_upload_mb' => 100,
];

<?php
/* ============================================================
   AOVO SERVICES — download a Sample Test Restore upload

   The uploads folder is closed to the web, so the link in AOVO's
   email points here instead: download.php?file=<random name>. The
   random name is the only key, so only someone holding the email's
   link can fetch the file.
   ============================================================ */

define('AOVO_API', true);
require __DIR__ . '/mailer.php';

$file = isset($_GET['file']) && is_string($_GET['file']) ? $_GET['file'] : '';
$path = rtrim(aovo_config()['upload_dir'], '/\\') . '/' . $file;

// Only names in the exact format sample-restore.php creates are
// accepted, which rules out paths like "../config.php".
if (!preg_match('/^[a-f0-9]{32}\.[a-z0-9]{2,4}$/', $file) || !is_file($path)) {
  http_response_code(404);
  header('Content-Type: text/plain; charset=utf-8');
  exit('This file is no longer available.');
}

// Stream the file to the browser as a download.
while (ob_get_level()) ob_end_clean();
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="aovo-sample-' . substr($file, 0, 8) . substr($file, 32) . '"');
header('Content-Length: ' . filesize($path));
header('X-Content-Type-Options: nosniff');
header('Cache-Control: private, no-store');
readfile($path);

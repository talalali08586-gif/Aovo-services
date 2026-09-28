<?php
/* ============================================================
   AOVO SERVICES — Sample Test Restore form delivery

   Receives the form on audio-services.html, saves the uploaded audio
   in the protected uploads folder, and emails AOVO the visitor's
   details with a download link.

   The file is linked rather than attached because email services
   reject attachments over about 25MB, and customers often send long
   meeting recordings.
   ============================================================ */

define('AOVO_API', true);
require __DIR__ . '/mailer.php';

aovo_require_post();

$config = aovo_config();
$maxMb  = (int) $config['max_upload_mb'];
$tooBig = "That file is larger than {$maxMb}MB. Please send a shorter excerpt.";

// When a file exceeds PHP's own upload limit, PHP discards the whole
// submission, so the form arrives completely empty.
if (empty($_POST) && empty($_FILES) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
  aovo_respond(413, false, $tooBig);
}

// Bots get a normal-looking "thank you" so they have no reason to retry.
if (aovo_is_bot()) aovo_respond(200, true, 'Thank you. Your file has been received.');


/* ---------- Read and check the fields ---------- */

$name     = aovo_line('fullName');
$email    = aovo_line('email');
$comments = aovo_text('comments');

if ($name === '' || strlen($name) > 200) {
  aovo_respond(422, false, 'Please enter your full name.');
}
if (!aovo_valid_email($email)) {
  aovo_respond(422, false, 'Please enter a valid email address.');
}
if ($comments === '' || strlen($comments) > 20000) {
  aovo_respond(422, false, 'Please tell us about the audio issues and timestamps.');
}


/* ---------- Check the uploaded file ---------- */

// Audio formats (plus .mp4, which Zoom and phones often use for
// recordings). Anything else is refused, so nothing runnable can ever
// be uploaded to the server.
$allowedExtensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'oga', 'opus', 'flac', 'aif', 'aiff', 'wma', 'webm', 'mp4'];

$file  = $_FILES['audioFile'] ?? null;
$error = $file ? $file['error'] : UPLOAD_ERR_NO_FILE;

if ($error === UPLOAD_ERR_NO_FILE) {
  aovo_respond(422, false, 'Please choose an audio file to send.');
}
if ($error === UPLOAD_ERR_INI_SIZE || $error === UPLOAD_ERR_FORM_SIZE || $file['size'] > $maxMb * 1024 * 1024) {
  aovo_respond(413, false, $tooBig);
}
if ($error !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
  error_log('AOVO sample restore: upload failed with PHP error code ' . $error);
  aovo_respond(500, false, 'Sorry, your file could not be uploaded. Please try again.');
}

$originalName = aovo_clean_filename($file['name']);
$extension    = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if (!in_array($extension, $allowedExtensions, true)) {
  aovo_respond(422, false, 'Please choose an audio file (for example MP3, WAV or M4A).');
}


/* ---------- Store the file ---------- */

// A long random name, so a download link cannot be guessed.
$storedName = bin2hex(random_bytes(16)) . '.' . $extension;
$uploadDir  = rtrim($config['upload_dir'], '/\\');

if (!is_dir($uploadDir) && !mkdir($uploadDir, 0750, true)) {
  error_log('AOVO sample restore: could not create ' . $uploadDir);
  aovo_respond(500, false, 'Sorry, your file could not be saved. Please try again later.');
}
if (!move_uploaded_file($file['tmp_name'], $uploadDir . '/' . $storedName)) {
  error_log('AOVO sample restore: could not save upload in ' . $uploadDir);
  aovo_respond(500, false, 'Sorry, your file could not be saved. Please try again later.');
}


/* ---------- Email AOVO the details and the link ---------- */

$link = rtrim($config['site_url'], '/') . '/api/download.php?file=' . $storedName;
$size = number_format($file['size'] / (1024 * 1024), 1) . 'MB';

$body = "New Free Sample Test Restore request from the AOVO Services website.\n"
      . "Reply to this email to answer the visitor directly.\n\n"
      . "Name:  $name\n"
      . "Email: $email\n\n"
      . "Comments:\n$comments\n\n"
      . "Audio file: $originalName ($size)\n"
      . "Download:   $link\n";

try {
  aovo_send_mail('Sample test restore request from ' . $name, $body, $email, $name);
} catch (Exception $e) {
  error_log('AOVO sample restore: ' . $e->getMessage());
  // Nobody will be told about this file, so don't keep it.
  @unlink($uploadDir . '/' . $storedName);
  aovo_respond(500, false, 'Sorry, your request could not be sent. Please email us directly at info@aovoservices.com.');
}

aovo_respond(200, true, "Thank you. Your file has been received, and we'll be in touch once we've assessed it.");


// Keeps only the file's own name (no folders) and removes characters
// that could upset an email or a filesystem. Used for display only.
function aovo_clean_filename($name) {
  $name = basename(str_replace('\\', '/', (string) $name));
  $name = preg_replace('/[\x00-\x1F\x7F"<>|:*?]+/', '', $name);
  return $name !== '' ? substr($name, 0, 200) : 'audio';
}

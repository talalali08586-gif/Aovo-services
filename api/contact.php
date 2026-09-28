<?php
/* ============================================================
   AOVO SERVICES — Contact & Order form delivery

   Receives the form on contact.html, checks it, and emails it to
   AOVO through the Hostinger mailbox. Replies to the page with
   { ok, message } for the visitor to see.
   ============================================================ */

define('AOVO_API', true);
require __DIR__ . '/mailer.php';

aovo_require_post();

// Bots get a normal-looking "thank you" so they have no reason to retry.
if (aovo_is_bot()) aovo_respond(200, true, 'Thank you. Your request has been sent.');


/* ---------- Read and check the fields ---------- */

$name         = aovo_line('fullName');
$email        = aovo_line('email');
$company      = aovo_line('company');
$wordCount    = aovo_line('wordCount');
$projectType  = aovo_line('projectType');
$otherProject = aovo_line('otherProject');
$deadline     = aovo_line('targetDeadline');
$message      = aovo_text('message');

if ($name === '' || strlen($name) > 200) {
  aovo_respond(422, false, 'Please enter your full name.');
}
if (!aovo_valid_email($email)) {
  aovo_respond(422, false, 'Please enter a valid email address.');
}
if ($wordCount !== '' && !ctype_digit($wordCount)) {
  aovo_respond(422, false, 'Please enter the word count as a number.');
}
if ($projectType === 'other') {
  if ($otherProject === '') aovo_respond(422, false, 'Please describe your project type.');
  $projectType = 'Other: ' . $otherProject;
}
if (strlen($company) > 200 || strlen($projectType) > 300 || strlen($deadline) > 200 || strlen($message) > 20000) {
  aovo_respond(422, false, 'One of the fields is too long. Please shorten it and try again.');
}


/* ---------- Build and send the email ---------- */

$body = "New project request from the AOVO Services website.\n"
      . "Reply to this email to answer the visitor directly.\n\n"
      . "Name:            $name\n"
      . "Email:           $email\n"
      . "Company:         " . ($company     !== '' ? $company     : '-') . "\n"
      . "Word count:      " . ($wordCount   !== '' ? $wordCount   : '-') . "\n"
      . "Project type:    " . ($projectType !== '' ? $projectType : '-') . "\n"
      . "Target deadline: " . ($deadline    !== '' ? $deadline    : '-') . "\n\n"
      . "Message:\n" . ($message !== '' ? $message : '-') . "\n";

try {
  aovo_send_mail('New project request from ' . $name, $body, $email, $name);
} catch (Exception $e) {
  error_log('AOVO contact form: ' . $e->getMessage());
  aovo_respond(500, false, 'Sorry, your request could not be sent. Please email us directly at info@aovoservices.com.');
}

aovo_respond(200, true, "Thank you. Your request has been sent, and we'll be in touch shortly.");

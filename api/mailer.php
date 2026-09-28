<?php
/* ============================================================
   AOVO SERVICES — shared helpers for the form scripts

   Used by contact.php, sample-restore.php and download.php. It:
     - loads the settings from config.php
     - reads and cleans the submitted form fields
     - sends an email through the Hostinger mailbox over SMTP

   The SMTP code is written out here (about 60 lines) rather than
   pulling in a mail library, to keep the project free of third-party
   dependencies as the contract requires.
   ============================================================ */

// Refuse to run if someone opens this file directly in a browser.
if (!defined('AOVO_API')) { http_response_code(404); exit; }


/* ---------- Settings ---------- */

function aovo_config() {
  static $config = null;
  if ($config === null) {
    $path = __DIR__ . '/config.php';
    if (!is_file($path)) {
      throw new RuntimeException('api/config.php is missing. Copy config.example.php to config.php and fill it in.');
    }
    $config = require $path;
  }
  return $config;
}


/* ---------- Replying to the browser ---------- */

// Sends a small JSON reply ({ ok, message }) and stops the script. The
// page's JavaScript shows "message" to the visitor.
function aovo_respond($status, $ok, $message) {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  echo json_encode(['ok' => $ok, 'message' => $message]);
  exit;
}

function aovo_require_post() {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    aovo_respond(405, false, 'This address only accepts form submissions.');
  }
}

// Spam trap: both forms contain a field called "website" that is hidden
// from people. Real visitors leave it empty; bots that fill in every
// field they find do not.
function aovo_is_bot() {
  return !empty($_POST['website']);
}


/* ---------- Reading form fields ---------- */

// A one-line field (name, email, company...). Line breaks and other
// control characters are removed, which also stops anyone smuggling
// extra email headers in through a field.
function aovo_line($name) {
  $value = aovo_raw_field($name);
  return trim(preg_replace('/[\x00-\x1F\x7F]+/', ' ', $value));
}

// A multi-line field (message, comments). Line breaks are kept.
function aovo_text($name) {
  $value = str_replace(["\r\n", "\r"], "\n", aovo_raw_field($name));
  return trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value));
}

function aovo_raw_field($name) {
  $value = isset($_POST[$name]) && is_string($_POST[$name]) ? $_POST[$name] : '';
  // Discard anything that is not valid UTF-8 text.
  return preg_match('//u', $value) ? $value : '';
}

function aovo_valid_email($email) {
  return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}


/* ---------- Sending email over SMTP ---------- */

// Sends a plain-text email to the configured recipient. Replying to the
// email in AOVO's inbox goes straight to the visitor ($replyTo).
// Throws a RuntimeException if the mail server refuses it.
function aovo_send_mail($subject, $body, $replyTo, $replyName) {
  $c    = aovo_config();
  $from = $c['from_address'];

  $headers = [
    'Date: ' . date('r'),
    'From: ' . aovo_header_text($c['from_name']) . ' <' . $from . '>',
    'To: <' . $c['to_address'] . '>',
    'Reply-To: ' . aovo_header_text($replyName) . ' <' . $replyTo . '>',
    'Subject: ' . aovo_header_text($subject),
    'Message-ID: <' . bin2hex(random_bytes(16)) . '@' . substr(strrchr($from, '@'), 1) . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
  ];
  // The body is base64-encoded so Arabic and other non-English text
  // arrives intact, and so no line can start with "." (which SMTP
  // would otherwise treat specially).
  $message = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($body), 76, "\r\n");

  $socket = @stream_socket_client('ssl://' . $c['smtp_host'] . ':' . $c['smtp_port'], $errno, $errstr, 20);
  if (!$socket) {
    throw new RuntimeException("Could not connect to the mail server: $errstr ($errno)");
  }
  stream_set_timeout($socket, 30);

  try {
    aovo_smtp_expect($socket, [220]);
    aovo_smtp_command($socket, 'EHLO ' . aovo_server_name(), [250]);
    aovo_smtp_command($socket, 'AUTH LOGIN', [334]);
    aovo_smtp_command($socket, base64_encode($c['smtp_user']), [334]);
    aovo_smtp_command($socket, base64_encode($c['smtp_pass']), [235]);
    aovo_smtp_command($socket, 'MAIL FROM:<' . $from . '>', [250]);
    aovo_smtp_command($socket, 'RCPT TO:<' . $c['to_address'] . '>', [250, 251]);
    aovo_smtp_command($socket, 'DATA', [354]);
    aovo_smtp_command($socket, $message . "\r\n.", [250]);
    fwrite($socket, "QUIT\r\n");
  } finally {
    fclose($socket);
  }
}

// Encodes text for an email header so non-English names display correctly.
function aovo_header_text($text) {
  return '=?UTF-8?B?' . base64_encode($text) . '?=';
}

function aovo_server_name() {
  $name = isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : '';
  return preg_match('/^[A-Za-z0-9.-]+$/', $name) ? $name : 'localhost';
}

function aovo_smtp_command($socket, $command, $expectedCodes) {
  fwrite($socket, $command . "\r\n");
  aovo_smtp_expect($socket, $expectedCodes);
}

// Reads the server's reply (which may span several lines) and checks its
// three-digit status code. The command itself is never included in the
// error, so the password can never end up in a log.
function aovo_smtp_expect($socket, $expectedCodes) {
  $reply = '';
  while (($line = fgets($socket, 1024)) !== false) {
    $reply .= $line;
    // "250-..." means more lines follow; "250 ..." is the last line.
    if (strlen($line) < 4 || $line[3] === ' ') break;
  }
  if (!in_array((int) substr($reply, 0, 3), $expectedCodes, true)) {
    throw new RuntimeException('Mail server replied: ' . trim($reply));
  }
}

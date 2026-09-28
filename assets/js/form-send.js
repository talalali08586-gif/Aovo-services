/* ============================================================
   AOVO SERVICES — shared form delivery

   The Contact form (contact.js) and the Sample Test Restore form
   (audio-services.js) both post to a small PHP script in api/, which
   emails AOVO through the Hostinger mailbox. The PHP script replies
   with { ok, message }, and the message is shown to the visitor.

   XMLHttpRequest is used rather than fetch() because it can report
   upload progress, which matters for long audio recordings.

   Forms can only send from the live (or staging) site. Opened
   straight from a folder, the request fails and the visitor sees the
   fallback message with AOVO's email address instead.

   Load this file BEFORE contact.js or audio-services.js.
   ============================================================ */

const FORM_FALLBACK_MESSAGE = 'Sorry, your message could not be sent. Please email us directly at info@aovoservices.com.';

/* Sends every field of `form` to `url`.
   handlers.onSuccess(message) — the email was sent
   handlers.onError(message)   — something went wrong; message says what
   handlers.onProgress(percent) — optional, called while uploading */
function sendForm(form, url, handlers){
  const request = new XMLHttpRequest();
  request.open('POST', url);

  if (handlers.onProgress) {
    request.upload.addEventListener('progress', event => {
      if (event.lengthComputable) handlers.onProgress(Math.round(event.loaded / event.total * 100));
    });
  }

  request.addEventListener('load', () => {
    let reply = null;
    try { reply = JSON.parse(request.responseText); } catch (e) { /* not a reply from our script */ }

    if (request.status >= 200 && request.status < 300 && reply && reply.ok) {
      handlers.onSuccess(reply.message);
    } else {
      handlers.onError(reply && reply.message ? reply.message : FORM_FALLBACK_MESSAGE);
    }
  });
  request.addEventListener('error', () => handlers.onError(FORM_FALLBACK_MESSAGE));

  request.send(new FormData(form));
}

/* Shows a message in a form's status box. Errors are tinted so they
   stand out from progress and thank-you messages. */
function setFormStatus(statusElement, message, isError){
  statusElement.textContent = message;
  statusElement.classList.add('form-notice');
  statusElement.classList.toggle('is-error', Boolean(isError));
}

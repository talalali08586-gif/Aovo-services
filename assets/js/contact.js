/* ============================================================
   AOVO SERVICES — Contact & Order form

   Two jobs: reveal the "Other Project Type" field only when the
   visitor picks "Other", and on submit validate the form and send it
   to api/contact.php, which emails it to AOVO. Sending uses the
   shared helpers in form-send.js. See README.md, "Form delivery".
   ============================================================ */
(function(){
  var form         = document.getElementById('contactForm');
  var projectType  = document.getElementById('projectType');
  var otherField   = document.getElementById('otherProjectField');
  var otherInput   = document.getElementById('otherProject');
  var status       = document.getElementById('formStatus');
  var submitButton = form.querySelector('button[type="submit"]');

  // the extra field is disabled as well as hidden, so a hidden field can
  // never block submission by being required while out of sight
  projectType.addEventListener('change', function(){
    var isOther = projectType.value === 'other';
    otherField.hidden   = !isOther;
    otherInput.disabled = !isOther;
    otherInput.required = isOther;
    if (!isOther) otherInput.value = '';
  });

  form.addEventListener('submit', function(event){
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // the button stays disabled while sending, so a double click can't
    // send the same request twice
    submitButton.disabled = true;
    setFormStatus(status, 'Sending your request…');

    sendForm(form, 'api/contact.php', {
      onSuccess: function(message){
        setFormStatus(status, message);
        form.reset();
        projectType.dispatchEvent(new Event('change')); // re-hide "Other"
        submitButton.disabled = false;
      },
      onError: function(message){
        setFormStatus(status, message, true);
        submitButton.disabled = false;
      }
    });
  });
})();

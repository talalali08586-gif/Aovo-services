/* ============================================================
   AOVO SERVICES — Contact & Order form

   Two jobs: reveal the "Other Project Type" field only when the
   visitor picks "Other", and validate the form on submit.

   DELIVERY TODO — the form does not send anywhere yet. Once the
   client's AOVO mailbox is confirmed, replace the configuration
   notice at the end of the submit handler with the approved
   delivery method. Until then the form never claims a message was
   sent. See README.md.
   ============================================================ */
(function(){
  var form        = document.getElementById('contactForm');
  var projectType = document.getElementById('projectType');
  var otherField  = document.getElementById('otherProjectField');
  var otherInput  = document.getElementById('otherProject');
  var status      = document.getElementById('formStatus');

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

    // TODO: Send the validated form only after client-approved delivery is set.
    status.textContent = 'Thank you. Form delivery is being configured; please check back shortly to submit your project request.';
    status.classList.add('config-notice');
  });
})();

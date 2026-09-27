/* ============================================================
   AOVO SERVICES — Feedback page testimonial slider
   Cycles the review slides, builds one dot per slide from the slide
   count, and pauses while a visitor is reading. Adding a review to
   feedback.html needs no change here.
   ============================================================ */
(function(){
  var track   = document.getElementById('sliderTrack');
  var slider  = document.getElementById('slider');
  var dotsBox = document.getElementById('sliderDots');
  var count   = track.children.length;
  var index   = 0;
  var timer   = null;
  var DELAY   = 15000; // ms between auto-advances

  // one dot per slide, built from the slide count so adding a review
  // to the HTML needs no script changes
  var dots = [];
  for (var i = 0; i < count; i++){
    var dot = document.createElement('button');
    dot.setAttribute('aria-label', 'Go to review ' + (i + 1));
    (function(n){ dot.addEventListener('click', function(){ go(n); restart(); }); })(i);
    dotsBox.appendChild(dot);
    dots.push(dot);
  }

  function go(n){
    index = (n + count) % count;           // wraps around at both ends
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    dots.forEach(function(d, i){ d.classList.toggle('active', i === index); });
  }

  /* auto-cycle — skipped entirely for visitors who ask the OS for
     reduced motion; paused while the pointer or keyboard focus is
     inside the slider */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function start(){ if (!reduced && !timer) timer = setInterval(function(){ go(index + 1); }, DELAY); }
  function stop(){ clearInterval(timer); timer = null; }
  function restart(){ stop(); start(); }

  document.getElementById('slidePrev').addEventListener('click', function(){ go(index - 1); restart(); });
  document.getElementById('slideNext').addEventListener('click', function(){ go(index + 1); restart(); });

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin',  stop);
  slider.addEventListener('focusout', start);

  go(0);
  start();
})();

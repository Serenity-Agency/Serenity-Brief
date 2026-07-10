(function(){
  // scroll reveal
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('is-visible'); }
    });
  }, {threshold:0.18});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  // count-up stats
  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var start = null, duration = 1200;
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = val.toLocaleString('ru-RU') + suffix;
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var statStrip = document.getElementById('stat-strip');
  if(statStrip){
    var statIo = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          statStrip.querySelectorAll('.stat-num').forEach(animateCount);
          statIo.disconnect();
        }
      });
    }, {threshold:0.4});
    statIo.observe(statStrip);
  }

  // proportion bar fill — width comes from data-w attribute (CSP-clean, no inline style)
  var barWrap = document.getElementById('bar-wrap');
  if(barWrap){
    var barIo = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          barWrap.querySelectorAll('.bar-fill[data-w]').forEach(function(el){
            el.style.width = el.getAttribute('data-w') + '%';
          });
          barIo.disconnect();
        }
      });
    }, {threshold:0.5});
    barIo.observe(barWrap);
  }

  // dot nav
  var dots = document.querySelectorAll('#dotnav button');
  var sections = document.querySelectorAll('.section');
  dots.forEach(function(d){
    d.addEventListener('click', function(){
      var target = document.getElementById(d.getAttribute('data-target'));
      if(target) target.scrollIntoView({behavior:'smooth'});
    });
  });
  var navIo = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        dots.forEach(function(d){ d.classList.remove('active'); });
        var match = document.querySelector('#dotnav button[data-target="'+e.target.id+'"]');
        if(match) match.classList.add('active');
      }
    });
  }, {threshold:0.5});
  sections.forEach(function(s){ navIo.observe(s); });
})();

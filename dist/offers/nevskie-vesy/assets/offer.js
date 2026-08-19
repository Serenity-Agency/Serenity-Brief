(function(){
  // generic: fill any [data-w] width bar once its container enters view (CSP-clean, no inline style in HTML)
  function wireFillGroup(containerSelector, fillSelector){
    document.querySelectorAll(containerSelector).forEach(function(container){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){
            container.querySelectorAll(fillSelector).forEach(function(el){
              var w = el.getAttribute('data-w');
              if(w) el.style.width = w + '%';
            });
            io.disconnect();
          }
        });
      }, {threshold:0.35});
      io.observe(container);
    });
  }
  wireFillGroup('.cpa-compare', '.cpa-fill');
  wireFillGroup('.geo-list', '.geo-fill');
  wireFillGroup('.dash-panel', '.dash-bar-fill');

  // baseline marker position on cpa tracks (percentage of track width)
  document.querySelectorAll('.cpa-track[data-baseline]').forEach(function(track){
    var pct = track.getAttribute('data-baseline');
    var marker = document.createElement('div');
    marker.className = 'cpa-baseline';
    marker.style.left = pct + '%';
    track.appendChild(marker);
  });

  // mediaplan bars: height from data-h (0-100), triggered on view
  var mpChart = document.querySelector('.mp-chart');
  if(mpChart){
    var mpIo = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          mpChart.querySelectorAll('.mp-bar[data-h]').forEach(function(el){
            el.style.height = el.getAttribute('data-h') + '%';
          });
          mpIo.disconnect();
        }
      });
    }, {threshold:0.3});
    mpIo.observe(mpChart);
  }

  // dashboard fact/plan toggle — swaps data-mode driven text nodes, no data invented,
  // just switches between two pre-rendered, source-backed states already in the DOM
  var dashToggle = document.getElementById('dash-toggle');
  if(dashToggle){
    var buttons = dashToggle.querySelectorAll('button');
    var dash = document.getElementById('dashboard-widget');
    buttons.forEach(function(btn){
      btn.addEventListener('click', function(){
        buttons.forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        var mode = btn.getAttribute('data-mode');
        dash.setAttribute('data-active-mode', mode);
        dash.querySelectorAll('[data-mode]').forEach(function(el){
          if(el.tagName === 'BUTTON') return;
          el.style.display = (el.getAttribute('data-mode') === mode) ? '' : 'none';
        });
      });
    });
  }

  // dashboard cross-links: real in-page navigation to related screens
  document.querySelectorAll('[data-scroll-to]').forEach(function(el){
    el.addEventListener('click', function(){
      var target = document.getElementById(el.getAttribute('data-scroll-to'));
      if(target) target.scrollIntoView({behavior:'smooth'});
    });
  });

  // awards rail: hide left fade at rest, enable mouse-drag scroll on desktop
  var rail = document.querySelector('.awards-rail');
  var fadeL = document.querySelector('.awards-fade-l');
  var fadeR = document.querySelector('.awards-fade-r');
  if(rail){
    function updateFades(){
      if(fadeL) fadeL.style.opacity = rail.scrollLeft > 4 ? '1' : '0';
      var atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
      if(fadeR) fadeR.style.opacity = atEnd ? '0' : '1';
    }
    updateFades();
    rail.addEventListener('scroll', updateFades);
    var isDown = false, startX, startScroll;
    rail.addEventListener('mousedown', function(e){ isDown = true; rail.classList.add('is-dragging'); startX = e.pageX; startScroll = rail.scrollLeft; });
    window.addEventListener('mouseup', function(){ isDown = false; rail.classList.remove('is-dragging'); });
    window.addEventListener('mousemove', function(e){
      if(!isDown) return;
      e.preventDefault();
      rail.scrollLeft = startScroll - (e.pageX - startX);
    });
  }
})();


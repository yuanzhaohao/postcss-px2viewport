;(function(win) {
  var doc = win.document;
  var docEl = doc.documentElement;
  var metaEl = doc.querySelector('meta[name="viewport"]');
  var tid = 0;
  var dpr = 1;
  var scale = 0;

  if (!metaEl) {
    metaEl = doc.createElement('meta');
  }

  win.addEventListener('resize', function() {
    clearTimeout(tid);
    tid = setTimeout(refresh, 300);
  }, false);
  win.addEventListener('pageshow', function(e) {
    if (e.persisted) {
      clearTimeout(tid);
      tid = setTimeout(refreshRem, 300);
    }
  }, false);
  refresh();

  function refresh() {
    var isIPhone = win.navigator.userAgent.match(/iphone/gi);
    var devicePixelRatio = win.devicePixelRatio;
    if (isIPhone) { // iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
      if (devicePixelRatio >= 3) {
        dpr = 3;
      } else if (devicePixelRatio >= 2){
        dpr = 2;
      } else {
        dpr = 1;
      }
    } else {
      dpr = 1;
    }
    scale = 1 / dpr;

    metaEl.setAttribute('name', 'viewport');
    metaEl.setAttribute('content', 'width=device-width,initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
    if (docEl.firstElementChild) {
      docEl.firstElementChild.appendChild(metaEl);
    } else {
      var wrap = doc.createElement('div');
      wrap.appendChild(metaEl);
      doc.write(wrap.innerHTML);
    }
    docEl.setAttribute('data-dpr', dpr);
    win.dpr = dpr;
  }

})(window);

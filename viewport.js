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

  metaEl.setAttribute('name', 'viewport');
  win.addEventListener('resize', function() {
    clearTimeout(tid);
    tid = setTimeout(refresh, 300);
  }, false);
  win.addEventListener('pageshow', function(e) {
    if (e.persisted) {
      clearTimeout(tid);
      tid = setTimeout(refresh, 300);
    }
  }, false);

  function refresh() {
    var devicePixelRatio = win.devicePixelRatio;
    var detector = new Detector();
    var isUseRem;
    if (devicePixelRatio >= 3) {
      dpr = 3;
    } else if (devicePixelRatio >= 2){
      dpr = 2;
    } else {
      dpr = 1;
    }
    scale = 1 / dpr;


    metaEl.setAttribute('content', 'width=device-width,initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
    if (docEl.firstElementChild) {
      docEl.firstElementChild.appendChild(metaEl);
    } else {
      var wrap = doc.createElement('div');
      wrap.appendChild(metaEl);
      doc.write(wrap.innerHTML);
    }
    docEl.setAttribute('data-dpr', dpr);
    // if (detector.Android && !detector.checkAndVer([4, 5])) {// 低于Android4.4版本的，则使用rem方案
      var width = docEl.getBoundingClientRect().width;
      var rem;
      if (width / dpr > 540) {
        width = 540 * dpr;
      }
      rem = width / 10;
      docEl.setAttribute('data-rem', 'true');
      docEl.style.fontSize = rem + 'px';
    // }
  }

  function Detector() {
    var ua = win.navigator.userAgent;
    this.androidMatch = ua.match(/Android ([\d\.]+)/);
    this.iOSMatch = ua.match(/(ipod|iphone|ipad)/i);
    this.Android = !!this.androidMatch;
    this.iOS = !!this.iOSMatch;
  }

  Detector.prototype.checkAndVer = function(version) {
    if (this.Android) {
      var localVersion = this.androidMatch[1].split('.');
      var len = version.length > localVersion.length ? version.length : localVersion.length;
      console.log(localVersion);
      for (var i = 0; i < len; i++) {
        if (localVersion[i] > version[i]) {
          return true;
        }
      }
      return false;
    }
  }

  refresh();

})(window);

;(function(win) {
  var doc = win.document;
  var docEl = doc.documentElement;
  var metaEl = doc.querySelector('meta[name="viewport"]');
  var tid = 0;
  var dpr = 1;
  var scale = 0;
  var androidMinVer = [4, 3]; //低于或等于Android4.3版本的，则使用rem方案

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
    if (detector.iOS || (detector.Android && detector.checkAndVer(androidMinVer))) {
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


    metaEl.setAttribute('content', 'width=device-width,initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
    if (docEl.firstElementChild) {
      docEl.firstElementChild.appendChild(metaEl);
    } else {
      var wrap = doc.createElement('div');
      wrap.appendChild(metaEl);
      doc.write(wrap.innerHTML);
    }
    docEl.setAttribute('data-dpr', dpr);
    if (detector.Android && !detector.checkAndVer(androidMinVer)) {
      var width = docEl.getBoundingClientRect().width;
      var rem = width / 10;
      docEl.setAttribute('data-rem', 'true');
      docEl.style.fontSize = rem + 'px';
    } else {
      docEl.setAttribute('data-rem', 'false');
    }
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
      var len = Math.min(version.length, localVersion.length);
      for (var i = 0; i < len; i++) {
        if (parseInt(localVersion[i]) == parseInt(version[i])) continue;
        return parseInt(localVersion[i]) > parseInt(version[i]) ? true :false;
      }
      return false;
    }
  }

  refresh();

})(window);

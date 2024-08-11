(function (window) {
  var isTest = location.host.indexOf("test") != -1;
  var config = {
    version: 1.1,
    domain: "cifnews.com",
    mainSite: (isTest ? "test" : "www") + ".cifnews.com",
    mMainSite: (isTest ? "test-m" : "m") + ".cifnews.com",
    sellerSite: (isTest ? "test." : "") + "seller.cifnews.com",
    passportSite: (isTest ? "test." : "") + "passport.cifnews.com",
    staticSite: (isTest ? "test." : "") + "static1.cifnews.com"
  };
  if (
    !window.cifnewsConfig ||
    !window.cifnewsConfig.version ||
    window.cifnewsConfig.version < config.version
  ) {
    window.cifnewsConfig = config;
  }
  function UrlSearchParams2Object(originSearch) {
    originSearch = originSearch || location.search;
    var search = originSearch.replace(/((^\?)|(((#\/)|\/)$))/gi, "");
    var params = search.split("&");
    var result = {};
    params.forEach(function (param) {
      var keyAndVal = param.split("="),
        paramKey = keyAndVal[0],
        paramVal = keyAndVal[1] || null;
      if (paramKey && (paramVal != null || paramVal != undefined)) {
        result[paramKey] = paramVal;
      }
    });
    return result;
  }
  function getUrlParam(key, originSearch) {
    return UrlSearchParams2Object(originSearch)[key] || null;
  }
  if (
    /miniprogram/i.test(navigator.userAgent) ||
    /swan/i.test(navigator.userAgent)
  ) {
    var clientKey = getUrlParam("client") || sessionStorage.getItem("client");
    if (clientKey) {
      sessionStorage.setItem("client", clientKey);
      if (axios) {
        axios.defaults.headers.common.client = clientKey;
      }
      if (jQuery) {
        jQuery.ajaxSetup({
          headers: { client: clientKey }
        });
      }
    }
  }
})(window);
if (typeof SSOApi !== "object") {
  var SSOApi = {
    Config: {
      NoClose: false,
      NoBoss: false,
      tabName: "", //boss老板会员 其他企业会员
      Boxid: "SSOBox",
      BoxHeight: $(window).height(),
      BoxWidth: "100%",
      Register: false,
      IsFirst: true,
      IsWXMPWithoutUserCheck: false,
      IsWxBaseFirst: false,
      IsAppWxOnly: false,
      Guest: false,
      wxLoginImg: "",
      IsWxLogin: false,
      IsAutoLogin: true,
      isTelVerify: true,
      loginStatus: false,
      isScanLogin: false, // 判断自助开户是否是扫码登录后点击跳转
      isLoginV2: false,
      crossDomainJumpHost: '', // 需要使用跳转登录返回原页面自动登录的原页面域名
      checkMacSafari: function(){
        const isMac = /macintosh|mac os x/i.test(navigator.userAgent) //是否为mac系统（包含iphone手机）
        const isSafari = (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent))
        return isMac && isSafari
      },
      checkMobile: function () {
        //是否是移动端
        return (
          window.navigator.userAgent
            .toLowerCase()
            .toLowerCase()
            .match(
              /(ipod|iphone|android|coolpad|mmp|smartphone|midp|wap|xoom|symbian|j2me|blackberry|win ce)/i
            ) != null
        );
      },
      checkWX: function () {
        //是否是微信
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/micromessenger/i)) {
          return true;
        } else {
          return false;
        }
      },
      checkMp: function () {
        //是否是微信
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/miniprogram/i)) {
          return true;
        } else {
          return false;
        }
      },
      checkApp: function () {
        //是否为app
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/cifnewsapp/i) || typeof cifnewsApp === 'object') {
          return true;
        } else {
          return false;
        }
      },
      isLogin: function () {
        //是否已经登录
        var ck = document.cookie.toLowerCase();
        if (ck.match("passport_token")) {
          // 兼容这段时间异常登录 2025-06-15删除这段代码
          try {
            var time = Number(SSOApi.getPassPort())
            var startTime = new Date('2024-06-13 19:30:00').getTime()
            var endTime = new Date('2024-06-14 09:40:00').getTime()
            if (time && (time > startTime && time < endTime)) {
              return false;
            }
          } catch (error) {
            console.error(error)
            return false
          }
          return true;
        } else {
          return false;
        }
      },
      checkAppDevice: function () {
        //判断设备 0：安卓 1：苹果 -1：未知
        var u = navigator.userAgent;
        var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Adr") > -1; //android终端
        var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        if (isAndroid) {
          return 0;
        } else if (isiOS) {
          return 1;
        } else {
          return -1;
        }
      },
      rootHost:
        "https://" +
        (location.origin.indexOf("test") > -1 ||
        location.origin.indexOf("localhost") > -1
          ? "test."
          : "") +
        "passport.cifnews.com",
      host:
        "https://" +
        (location.origin.indexOf("test") > -1 ||
        location.origin.indexOf("localhost") > -1
          ? "test."
          : "") +
        "passport.cifnews.com/passport",
      url:
        "https://" +
        (location.origin.indexOf("test") > -1 ||
        location.origin.indexOf("localhost") > -1
          ? "test."
          : "") +
        "passport.cifnews.com",
      callback: null, //弹窗回调函数
      PopupFrameId: "popup_sso_iframe", //弹窗IFRAME元素ID,
      crossDomainList: [
        {
          setUrl:
            "https://www.yuguo.com/tools/setlogin?key=PassPort_Token&domain=yuguo.com&origin=cross_set_yuguo",
          getUrl: "https://www.yuguo.com/tools/getcookie?key=PassPort_Token",
          domain: "yuguo.com"
        }
      ],
      oldDomain: "cifnews.com",
      currentDomain: location.host.split(".").slice(-2).join("."),
      backUrl: "",
      minipLoginConfig: [
        {
          domain: "ccee.com",
          type: 'exhibition'
        }
      ]
    },
    getQueryString: function (name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
      var r = window.location.href.substr(1).match(reg);
      if (r != null) return unescape(r[2]);
      return null;
    },
    setCookie: function (cname, cvalue, span, mainDomain) {
      if (cname && /[\u4e00-\u9fa5]/.test(cname)) {
        cname = encodeURIComponent(cname);
      }
      var d = new Date();
      d.setTime(d.getTime() + span);
      var expires = "expires=" + d.toGMTString();
      if (
        !/(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)/.test(
          location.host
        ) &&
        mainDomain
      ) {
        var domain = "; domain=";
        if (typeof mainDomain === "string") {
          domain += mainDomain + ";path=/";
        } else {
          domain +=
            "." + location.host.split(".").slice(1).join(".") + ";path=/";
        }
        document.cookie = cname + "=" + cvalue + "; " + expires + domain;
      } else {
        document.cookie = cname + "=" + cvalue + "; " + expires;
      }
    },
    checkCrossDomain: function (url) {
      var domainMatch = url && url.match(/(:.*\/)/);
      var loginDomain =
        domainMatch &&
        domainMatch.length > 1 &&
        domainMatch[1].split(".").slice(-2).join(".");
      var domain = location.host.split(".").slice(-2).join(".");
      return loginDomain && loginDomain.replace(/\//g, "") != domain;
    },
    crossStorage: {
      key: "__CROSS_LIST",
      get: function () {
        var crossComplete =
          localStorage && localStorage.getItem(SSOApi.crossStorage.key);
        if (crossComplete) {
          crossComplete = JSON.parse(crossComplete);
        }
        if (!crossComplete) {
          crossComplete = {};
        }
        return crossComplete;
      },
      set: function (data) {
        localStorage &&
          localStorage.setItem(SSOApi.crossStorage.key, JSON.stringify(data));
      },
      expires: 1000 * 60 * 60 * 24, //1d
      check: function (crossComplete, domain) {
        if (crossComplete && domain) {
          let cross = crossComplete[domain];
          if (cross && !isNaN(cross)) {
            var now = new Date().getTime();
            return now - cross < SSOApi.crossStorage.expires;
          }
        }
        return false;
      },
      clear: function () {
        localStorage && localStorage.removeItem(SSOApi.crossStorage.key);
      }
    },
    setCrossCookie: function () {
      //跨域
      if (SSOApi.Config.oldDomain == SSOApi.Config.currentDomain) {
        var token = SSOApi.getPassPort();
        if (token) {
          if (document.domain.indexOf("test") > -1) {
            SSOApi.Config.crossDomainList = [
              {
                setUrl:
                  "https://test.cifcloud.com/tools/setlogin?key=PassPort_Token&domain=test.cifcloud.com&origin=cross_set_cifcloud",
                getUrl:
                  "https://test.cifcloud.com/tools/getcookie?key=PassPort_Token",
                domain: "test.cifcloud.com"
              }
            ];
          }
          var crossComplete = SSOApi.crossStorage.get();
          for (
            var index = 0;
            index < SSOApi.Config.crossDomainList.length;
            index++
          ) {
            var element = SSOApi.Config.crossDomainList[index];
            if (!SSOApi.crossStorage.check(crossComplete, element.domain)) {
              $.ajax({
                url: element.getUrl,
                type: "post",
                async: false,
                xhrFields: { withCredentials: true },
                success: function (res) {
                  if (res && res.data && res.data == token) {
                    crossComplete[element.domain] = new Date().getTime();
                    SSOApi.crossStorage.set(crossComplete);
                  } else {
                    SSOApi.AjaxSubSite(
                      [element.setUrl],
                      token,
                      null,
                      function (resu) {}
                    );
                  }
                }
              });
            }
          }
        }
      }
    },
    setCrossMessage: function (url) {
      if (url) {
        window.addEventListener("message", function (e) {
          if (e && e.origin && url.indexOf(e.origin) == 0 && e.data) {
            try {
              //console.log("receive message:"+e.data)
              var msg = JSON.parse(e.data);
              if (msg && msg.action && msg.value) {
                if (msg.action == "setCookie") {
                  document.cookie = msg.value;
                  sessionStorage.setItem("___message", e.data);
                }
                else if (msg.action == "iframe") {
                  var iframeId = "cross_" + new Date().getTime()
                  var frame =
                    "<iframe id='" + iframeId + "' style='display:none;'></iframe>";
                  $("body").append(frame);
                  $("#" + iframeId)
                    .attr("src", msg.value)
                    .unbind("load")
                    .load(function () {
                      $("#" + iframeId).remove()
                    });
                }
              }
            } catch (error) {
              console.log(error);
            }
          }
        });
      }
    },
    /**
     * 设置小程序登录
     * @param {String} loginUrl 登录链接
     * @returns 登录链接
     */
    setMinipLogin (loginUrl) {
      if (loginUrl) {
        for (let index = 0; index < SSOApi.Config.minipLoginConfig.length; index++) {
          const element = SSOApi.Config.minipLoginConfig[index];
          if (element.domain === SSOApi.Config.currentDomain) {
            return loginUrl + '/login/minip?type=' + element.type
          }
        }
      }
      return loginUrl;
    },
    ShowSSOBox: function (isReg, backurlConf, callback, originConfig) {
      //2018/12/10 修改
      //居中
      try {
        var appUrl = "";
        var backurl = "";
        if (typeof backurlConf === "object") {
          backurl = backurlConf.backurl || "";
          appUrl = backurlConf.appUrl || "";
        } else {
          backurl = backurlConf;
        }
        backurl = backurl || document.location.href;
        originConfig = originConfig || {};
        if (SSOApi.Config.checkApp()) {
          SSOApi.layer.showCover();
          SSOApi.layer.hideCover();
          SSOApi.layer.appCoverInit();
          SSOApi.layer.appCoverShow();
          if (typeof cifnewsSpm == "object") {
            // var spm = window.cifnewsSpm.sdk.getSpmStr(
            //   window.cifnewsSpm.runTime.closedParentSpm,
            //   true
            // )
            var SpmConfigByDom = cifnewsSpm.sdk.getSpmConfigByDom();
            for (var i in originConfig) {
              if (["i", "p", "t", "b", "m"].indexOf(i) > -1) {
                SpmConfigByDom[i] = originConfig[i];
              }
            }
            var spm = window.cifnewsSpm.sdk.getSpmStr(SpmConfigByDom);
            originConfig = {
              origin: originConfig.origin,
              spm: originConfig.spm || spm
            };
          }
          if (typeof app == "undefined") {
            var url =
              "//static1.cifnews.com/common/js/app.js?v=" + SSOApi.getVersion();
            head = document.getElementsByTagName("head")[0];
            js = document.createElement("script");
            js.type = "text/javascript";
            js.src = url;
            head.appendChild(js);
            js.onload = function () {
              SSOApi.AppReady(backurl, callback, originConfig);
            };
          } else {
            SSOApi.AppReady(backurl, callback, originConfig);
          }
        } else {
          var origin_module = "";
          var origin_page = "";
          var origin_id = "";
          var origin_terms = "";
          var origin_medium = "";
          var origin_item = "";
          var origin =
            originConfig.origin || SSOApi._getUrlParams("origin") || "";
          var origin_property = $('meta[name="originproperty"]').attr(
            "content"
          );
          var ABtest = originConfig.ABtest || "";
          if (origin_property) {
            origin_property = origin_property.replace(/%20/g, "");
            var property = {};
            origin_property.split(",").forEach(function (item) {
              item = item.split("=");
              if (item.length == 2) {
                property[[item[0]]] = item[1];
              }
            });
            origin_module =
              originConfig["origin_module"] || property["module"] || "";
            origin_page = originConfig["origin_page"] || property["page"] || "";
            origin_id = originConfig["origin_id"] || property["id"] || "";
            origin_terms = originConfig["origin_terms"] || "";
            origin_medium =
              originConfig["origin_medium"] || property["medium"] || "";
            origin_item = originConfig["origin_item"] || "";
          } else {
            var originBox = $("#hidOriginProperty");
            origin_module =
              originConfig["origin_module"] ||
              originBox.attr("data-origin-module") ||
              SSOApi._getUrlParams("origin_module") ||
              "";
            origin_page =
              originConfig["origin_page"] ||
              originBox.attr("data-origin-page") ||
              SSOApi._getUrlParams("origin_page") ||
              "";
            origin_id =
              originConfig["origin_id"] ||
              originBox.attr("data-origin-id") ||
              SSOApi._getUrlParams("origin_id") ||
              "";
            origin_terms =
              originConfig["origin_terms"] ||
              originBox.attr("data-origin-terms") ||
              SSOApi._getUrlParams("origin_terms") ||
              "";
            origin_medium =
              originConfig["origin_medium"] ||
              originBox.attr("data-origin-medium") ||
              SSOApi._getUrlParams("origin_medium") ||
              "";
            origin_item =
              originConfig["origin_item"] ||
              originBox.attr("data-origin-item") ||
              SSOApi._getUrlParams("origin_item") ||
              "";
          }

          var loginUrl = SSOApi.Config.host;
          var loginQueryStr =
            "?returnUrl=" +
            encodeURIComponent(backurl) +
            "&appUrl=" +
            encodeURIComponent(appUrl) +
            "&ABtest=" +
            ABtest +
            "&origin=" +
            origin;
          if (!originConfig.spm) {
            loginQueryStr +=
              "&origin_module=" +
              origin_module +
              "&origin_page=" +
              origin_page +
              "&origin_id=" +
              origin_id +
              "&origin_terms=" +
              origin_terms +
              "&origin_item=" +
              origin_item +
              "&origin_medium=" +
              origin_medium;
            if (typeof cifnewsSpm == "object") {
              // var spm = window.cifnewsSpm.sdk.getSpmStr(
              //   window.cifnewsSpm.runTime.closedParentSpm,
              //   true
              // )
              var SpmConfigByDom = cifnewsSpm.sdk.getSpmConfigByDom();
              for (var i in originConfig) {
                if (["i", "p", "t", "b", "m"].indexOf(i) > -1) {
                  SpmConfigByDom[i] = originConfig[i];
                }
              }
              var spm = window.cifnewsSpm.sdk.getSpmStr(SpmConfigByDom);
              // loginUrl = cifnewsSpm.sdk.getSpmUrlByUrl(loginUrl, SpmConfigByDom);
              loginQueryStr += "&spm=" + spm;
            }
          } else {
            loginQueryStr += "&spm=" + originConfig.spm;
          }
          if (SSOApi.Config.checkWX()) {
            var url =
              SSOApi.Config.rootHost + "/passport/wechat/oauth" + loginQueryStr;
            //M端登陆，直接跳到登录页
            document.location.href = url;
            return;
          }
          //如果登录链接包含问号，则query需要去除问号
          //小程序登录需要
          loginUrl = SSOApi.setMinipLogin(loginUrl)
          if (loginUrl && loginUrl.indexOf("?") > -1 && loginQueryStr) {
            loginQueryStr = loginQueryStr.replace("?", "&")
          }
          loginUrl += loginQueryStr;
          var crossDomain = SSOApi.checkCrossDomain(loginUrl);
          //跨域处理
          if (crossDomain) {
            SSOApi.setCrossMessage(loginUrl);
          }
          if (SSOApi.Config.NoClose) {
            loginUrl += "&noClose=true";
          }
          if (SSOApi.Config.NoBoss) {
            loginUrl += "&noBoss=true";
          }
          if (SSOApi.Config.tabName) {
            loginUrl += "&tabName=" + SSOApi.Config.tabName;
          }
          loginUrl += "&isLoginV2=" + SSOApi.Config.isLoginV2;
          if (SSOApi.Config.checkMobile()) {
            // ios-safria登录
            if (SSOApi.Config.checkMacSafari()){
              document.location.href = loginUrl.replace('returnUrl=', 'backurl=')
              return
            }
            // m端iframe登录
            SSOApi.Popup(loginUrl, callback, true);
            //跨域使用iframe登录
            // if (crossDomain) {
            // SSOApi.Popup(loginUrl, callback, true);
            // } else {
            //   //M端登陆，直接跳到登录页
            //   document.location.href = loginUrl;
            // }
            
          } else {
            //PC弹窗登录
            if (SSOApi.Config.checkMacSafari()){
              document.location.href = loginUrl.replace('returnUrl=', 'backurl=')
              return
            }
            // 跳转登录后，再返回原页面进行自动登录
            if(location.host.indexOf(SSOApi.Config.crossDomainJumpHost)>0){
              if(!localStorage.getItem('crossDomain_jump')){
                  document.location.href = loginUrl;
                  localStorage.setItem('crossDomain_jump',SSOApi.Config.crossDomainJumpHost);
                  return
              }else{
                  localStorage.removeItem('crossDomain_jump');
              }
              
            }
            SSOApi.Popup(loginUrl, callback);
          }
        }
        //box.css({ display: 'block' });
      } catch (ex) {
        alert("cuowu:" + ex.message);
      }
    },
    CloseSSOBox: function () {
      document.location.reload();
    },
    InitSSOBox: function (flag) {
      //console.log("该方法已过期");
    },
    LogOutSSO: function (backurl) {
      backurl = backurl || document.location.href;
      try {
        // 清除缓存的__distinct_id
        localStorage.removeItem('__distinct_id')
        if (document.domain.indexOf("cifnews.com") > 0) {
          document.domain = "cifnews.com";
        }
        if ($("#SSOLogOut").length == 0) {
          var frame2 =
            "<div id ='SSOLogOut' style='display:none;' ><iframe scrolling='auto'  src=''></iframe></div>";
          $("body").append(frame2);
        }
        var logouturl =
          SSOApi.Config.host +
          "/logout?returnUrl=" +
          encodeURIComponent(backurl);
        if (SSOApi.getPassPort()) {
          logouturl += "&token=" + SSOApi.getPassPort();
        }
        var crossDomain = SSOApi.checkCrossDomain(logouturl);
        //跨域处理
        if (crossDomain) {
          SSOApi.setCrossMessage(logouturl);
        }
        $("#SSOLogOut iframe")
          .attr("src", logouturl)
          .unbind("load")
          .load(function () {
            SSOApi.Event._run(SSOApi.Event._logout);
          });
      } catch (ex) {
        location.href = backurl;
      }
      this._delCookie("PassPort_Token", SSOApi.getPassPort(), {
        domain: ".cifnews.com"
      });
      // $('#SSOLogOut').css({ height: "1px", display: 'block' });
    },
    LogOutReturn: function () {
      document.location.reload();
    },
    HideSSOBox: function () {
      $("#" + SSOApi.Config.Boxid).hide();
      SSOApi.layer.hideCover();
      SSOApi.layer.appCoverHide();
    },
    layer: {
      showCover: function () {
        $("#layer_Cover").height($(window).height()).show();
      },
      initCover: function () {
        var div =
          "<div id='layer_Cover' style='top:0px;width: 100%;position: fixed;background: #fff;z-index: 9998;opacity: 0.97;display:none'></div>";
        $("body").append(div);
      },
      hideCover: function () {
        $("#layer_Cover").height($(window).height()).hide();
      },
      appCoverInit: function () {
        var div =
          '<div id="layer_app_cover" style="display:none;width:100%;z-index:9999;top:0;position:fixed;background:#fff;"><img style="width:100%;" src="//static.cifnews.com/common/image/loading.gif?v=2333" /></div>';
        $("body").append(div);
      },
      appCoverShow: function () {
        $("#layer_app_cover").height($(window).height()).show();
      },
      appCoverHide: function () {
        $("#layer_app_cover").height($(window).height()).hide();
      }
    },
    AppReady: function (backurl, callback, originConfig) {
      app.addComplete(function () {
        try {
          var unionId = cifnewsApp.getUnionId();
          var deviceid = "";

          if (SSOApi.Config.checkAppDevice() == 1) {
            //iOS特有  Android暂不需
            deviceid = cifnewsApp.getNeedId("device");
          }
          if (unionId != "") {
            //不为空
            if (unionId.match(/0?(13|14|15|18|17)[0-9]{9}/g)) {
              //手机格式
              if (SSOApi.Config.IsAppWxOnly) {
                //只允许微信登录
                SSOApi._wxLogin(originConfig);
                return;
              }
            }
          } else {
            if (!SSOApi.Config.Guest) {
              //不允许游客登录
              if (SSOApi.Config.IsAppWxOnly) {
                //只允许微信登录
                SSOApi._wxLogin(originConfig);
                return;
              } else {
                if (window.cifnewsApp.login) {
                  cifnewsApp.login(JSON.stringify(originConfig || {}));
                } else {
                  cifnewsApp.noLogin();
                }
                app.addNotice(function (f) {
                  if (
                    f.Type &&
                    "noLogin,wxLogin".indexOf(f.Type) !== -1 &&
                    f.Data
                  ) {
                    var deviceid = "";
                    if (SSOApi.Config.checkAppDevice() == 1) {
                      //iOS特有  Android暂不需
                      deviceid = cifnewsApp.getNeedId("device");
                    }
                    SSOApi._ssoLogin(
                      cifnewsApp.getUnionId(),
                      deviceid,
                      backurl,
                      callback
                    );
                  } else {
                    if (typeof SSOApi.close === "function") {
                      SSOApi.close();
                    } else {
                      SSOApi.HideSSOBox();
                    }
                  }
                });
                return;
              }
            }
          }
          SSOApi._ssoLogin(unionId, deviceid, backurl, callback);
        } catch (ex) {
          alert(ex.message);
        }
      });
    },
    _wxLogin: function (originConfig) {
      var version = parseInt(
        window.navigator.userAgent
          .toLowerCase()
          .match(/\d+.\d+.\d+/g)
          .pop()
          .replace(/\./g, "")
      );
      if (SSOApi.Config.checkAppDevice() == 1 && version < 350) {
        //iOS旧版轮询查看状态是否登录(无wxLogin且noLogin无回调）
        var _c = 0;
        var _t = setInterval(function () {
          try {
            if (
              cifnewsApp.getNeedId("openid") != "" ||
              cifnewsApp.getNeedId("loginToken") != ""
            ) {
              clearInterval(_t);
              SSOApi._ssoLogin(cifnewsApp.getUnionId(), ""); //旧版不做deviceid
            }
            if (_c > 30) {
              alert("登录超时" + version);
              clearInterval(_t);
            }
          } catch (ex) {
            alert(ex.message);
          }
          _c++;
        }, 500);
        if (window.cifnewsApp.login) {
          cifnewsApp.login(JSON.stringify(originConfig || {}));
        } else {
          cifnewsApp.noLogin();
        }
      } else {
        cifnewsApp.wxLogin(SSOApi.Config.wxLoginImg);
        app.addNotice(function (f) {
          if (f.Type == "wxLogin" && f.Data) {
            var deviceid = "";
            if (SSOApi.Config.checkAppDevice() == 1) {
              //iOS特有  Android暂不需
              deviceid = cifnewsApp.getNeedId("device");
            }
            SSOApi._ssoLogin(cifnewsApp.getUnionId(), deviceid);
          } else {
            SSOApi.HideSSOBox();
          }
        });
      }
    },
    _ssoLogin: function (unionid, deviceid, backurl, callback) {
      var token = "";
      var userid = 0;
      if (
        typeof cifnewsApp !== "undefined" &&
        typeof cifnewsApp.getVipId == "function"
      ) {
        userid = cifnewsApp.getVipId();
      }
      if (
        typeof cifnewsApp !== "undefined" &&
        typeof cifnewsApp.getNeedId == "function"
      ) {
        token = cifnewsApp.getNeedId("token");
      }
      SSOApi.jsonp({
        url: SSOApi.Config.host + "/ajax/login/app",
        data: {
          token: token,
          unionid: unionid,
          deviceid: deviceid,
          userid: userid
        },
        callback: "callback",
        success: function (data) {
          SSOApi.AjaxSubSite(
            data.urlList,
            data.token,
            location.href,
            function () {
              SSOApi.HideSSOBox();
              SSOApi.Config.loginStatus = true;
              if (typeof callback == "function") {
                callback();
                return;
              }
              if (
                SSOApi.Config.checkApp() &&
                typeof cifnewsApp == "object" &&
                typeof cifnewsApp.redirect == "function" &&
                SSOApi.Config.checkAppDevice() == 0
              ) {
                cifnewsApp.redirect(
                  (backurl || location.href).replace(/\#\/.*/gi, "")
                );
                // cifnewsApp.close();
              } else {
                if (backurl) {
                  location.href = backurl;
                } else {
                  location.reload();
                }
              }
            }
          );
        }
      });
    },
    AjaxSubSite: function (sites, token, rurl, cb) {
      var siteLength = sites ? sites.length : 0;
      if (siteLength == 0) {
        cb();
      } else {
        for (var i = sites.length - 1; i >= 0; i--) {
          var site = sites[i];
          if (site) {
            (function (site) {
              $.ajax({
                type: "get",
                url: site,
                data: {
                  Token: token
                },
                dataType: "jsonp",
                timeout: 3000,
                error: function (e) {
                  console.log(site + "注册失败:" + e.statusText);
                },
                success: function () {
                  console.log(site + "注册成功");
                },
                complete: function () {
                  siteLength--;
                  if (siteLength == 0) {
                    cb();
                  }
                }
              });
            })(site);
          } else {
            siteLength--;
            if (siteLength == 0) {
              cb();
            }
          }
        }
      }
    },
    jsonp: function (options) {
      options = options || {};
      if (!options.url || !options.callback) {
        throw new Error("参数不合法");
      }

      //创建 script 标签并加入到页面中
      var callbackName = ("jsonp_" + Math.random()).replace(".", "");
      var oHead = document.getElementsByTagName("head")[0];
      options.data[options.callback] = callbackName;
      var params = SSOApi.formatParams(options.data);
      var oS = document.createElement("script");
      oHead.appendChild(oS);

      //创建jsonp回调函数
      window[callbackName] = function (json) {
        oHead.removeChild(oS);
        clearTimeout(oS.timer);
        window[callbackName] = null;
        options.success && options.success(json);
        options.complete && options.complete();
      };

      options.beforeSend && options.beforeSend(options);
      if (!options.cancel) {
        //发送请求
        oS.src = options.url + "?" + params;
        //超时处理
        if (options.time) {
          oS.timer = setTimeout(function () {
            window[callbackName] = null;
            oHead.removeChild(oS);
            options.fail &&
              options.fail({
                message: "超时"
              });
            options.complete && options.complete();
          }, options.time);
        }
      }
    },
    formatParams: function (data) {
      var arr = [];
      for (var name in data) {
        arr.push(name + "=" + encodeURIComponent(data[name]));
      }
      return arr.join("&");
    },
    getVersion: function () {
      for (var i = 0; i < document.scripts.length; i++) {
        var src = document.scripts[i].src;
        if (src.indexOf("/a.js") > -1) {
          var ps = src.split("/a.js?");
          if (ps.length > 1) {
            ps = ps[1].split("&");
            for (var j = 0; j < ps.length; j++) {
              var pps = ps[j];
              if (pps.indexOf("v=") > -1) {
                var ppps = pps.split("=");
                if (ppps.length > 1) {
                  return ppps[1];
                }
              }
            }
          }
        }
      }
      return "";
    },
    getPassPort: function () {
      var name = "PassPort_Token=";
      var ca = document.cookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
      }
      return "";
    },
    getJwtToken: function (token, cb) {
      $.ajax({
        url: "https://" +
            (location.origin.indexOf("test") > -1 ? "test.seller" : "seller") +
            ".cifnews.com/jwt",
        contentType: "application/json",
        data: JSON.stringify({
          PassPort_Token: token
        }),
        method: "post",
        success: function(res) {
          if(typeof cb == "function") {
            cb(res.authorization)
          }
        }
      });
    },
    Popup: function (iframeUrl, callback, isMobile) {
      //IFRAME弹窗
      if (document.domain.indexOf("cifnews.com") > 0) {
        document.domain = "cifnews.com";
      }
      var url = iframeUrl;
      var iframe = document.createElement("iframe");
      iframe.id = this.Config.PopupFrameId;
      iframe.src = url;
      iframe.scrolling = 0;
      iframe.style =
        "width:100%;height:100%;z-index:999999;position:fixed;top:0;border:none;";
      if (isMobile) {
        // document.body.innerHTML = iframe.outerHTML;
        iframe.style =
          "width:100%;height:100%;z-index:999999;position:fixed;top:0;border:none;background: #fff;";
        document.body.appendChild(iframe);
      } else {
        document.body.appendChild(iframe);
      }
      if (typeof callback === "function") {
        this.Config.callback = function () {
          SSOApi.CheckLoginState(callback);
        };
      }
    },
    CallBack: function (url, loginType) {
      if(loginType !== "telephone"){
        SSOApi.Config.isScanLogin = true
      }
      var registPopup = localStorage.getItem("registPopup")
        ? JSON.parse(localStorage.getItem("registPopup"))
        : {};
      registPopup.login = true;
      localStorage.setItem("registPopup", JSON.stringify(registPopup));
      //弹窗回调
      this.ClosePopup();
      SSOApi.Config.loginStatus = true;
      if (typeof this.Config.callback === "function") {
        this.Config.callback();
      } else if (
        typeof url == "string" &&
        /(http|https|cifnewsapp):\/\/\S+/.test(url)
      ) {
        location.href = url;
      } else {
        window.location.reload();
      }
    },
    ClosePopup: function () {
      //关闭弹窗
      var el = document.getElementById(this.Config.PopupFrameId);
      if (el) {
        document.body.removeChild(el);
      }
    },
    Bindphone: function () {
      //绑定手机弹窗
      var returnUrl = this._getUrlParams("returnUrl") || window.location.href;
      var url =
        this.Config.host +
        "/bind/phone?returnUrl=" +
        encodeURIComponent(returnUrl);
      if (this.Config.checkMobile()) {
        window.location.href = url;
      } else {
        if (document.domain.indexOf("cifnews.com") > 0) {
          document.domain = "cifnews.com";
        }
        this.Popup(url);
      }
    },
    CheckLoginState: function (callback) {
      var isNeedCheck = SSOApi.Config.isLogin(),
        token = SSOApi.getPassPort();
      // 在小程序或者app内并且url上带有token进行校验
      if (
        SSOApi._getUrlParams("token") &&
        (SSOApi.Config.checkMp() || SSOApi.Config.checkApp())
      ) {
        token = SSOApi._getUrlParams("token");
        isNeedCheck = true;
      }
      if (isNeedCheck) {
        $.ajax({
          url: SSOApi.Config.host + "/ajax/user_info",
          type: "GET",
          xhrFields: { withCredentials: true },
          data: {
            key: token
          },
          success: function (data) {
            //console.log(ret);
            window.userInfo = data;
            SSOApi.Event.checkLoginStateComplete = true;
            if (data) {
              if (!data.headImg) {
                data.headImg =
                  "//static.cifnews.com/yuguo3.0/vip/images/head_normal.png";
              }
              $("#userHeadImg")
                .attr("alt", data.name)
                .attr("src", data.headImg.replace("http://", "//"));
              $("#username").html(" " + data.name);
              $("#notlogin").addClass("none");
              $("#islogin").removeClass("none");
              SSOApi.Config.loginStatus = true;
              SSOApi.Event._run(SSOApi.Event._loginSuccess, data);
              if (typeof localStorage !== "undefined") {
                localStorage.setItem("__distinct_id", data.distinctId);
              }
              if (typeof LoginSuccess === "function") {
                LoginSuccess(data);
              }
              if (typeof callback === "function") {
                callback(true);
              }
              if (!data.isTelVerify && SSOApi.Config.isTelVerify) {
                // && !data.isWxVerify) {
                SSOApi.Bindphone();
              }
              SSOApi.setCrossCookie();
            } else {
              if (typeof LoginFaild === "function") {
                LoginFaild();
              }
              if (typeof callback === "function") {
                callback(false);
              }
              SSOApi.Config.loginStatus = false;
              SSOApi.Event._run(SSOApi.Event._loginFaild);
            }
          },
          error: function (xhr, status) {
            SSOApi.Event.checkLoginStateComplete = true;
            console.log(xhr);
            console.log(status);
            if (typeof LoginFaild === "function") {
              LoginFaild();
            }
            if (typeof callback === "function") {
              callback(false);
            }
            SSOApi.Config.loginStatus = false;
            SSOApi.Event._run(SSOApi.Event._loginFaild);
          }
        });
      }
    },
    _cookie: function $cookie(name, value, options) {
      if (typeof value !== "undefined") {
        // name and value given, set cookie
        options = options || {};
        if (value === null) {
          value = "";
          options.expires = -1;
        }
        var expires = "";
        if (
          options.expires &&
          (typeof options.expires === "number" || options.expires.toUTCString)
        ) {
          var date;
          if (typeof options.expires === "number") {
            date = new Date();
            date.setTime(
              date.getTime() + options.expires * 24 * 60 * 60 * 1000
            );
          } else {
            date = options.expires;
          }
          expires = "; expires=" + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        var path = options.path ? "; path=" + options.path : "";
        var domain = options.domain ? "; domain=" + options.domain : "";
        var secure = options.secure ? "; secure" : "";
        document.cookie = [
          name,
          "=",
          encodeURIComponent(value),
          expires,
          path,
          domain,
          secure
        ].join("");
      } else {
        // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie !== "") {
          var cookies = document.cookie.split(";");
          for (var i = 0; i < cookies.length; i++) {
            var cookie = window.jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === name + "=") {
              cookieValue = decodeURIComponent(
                cookie.substring(name.length + 1)
              );
              break;
            }
          }
        }
        return cookieValue;
      }
    },
    _delCookie: function (name, val, options) {
      SSOApi._cookie(name, null, options);
    },
    _getUrlParams: function (name) {
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == name) {
          return pair[1];
        }
      }
      return "";
    },
    Event: {
      _loginSuccess: [],
      _loginFaild: [],
      _logout: [],
      _ssoFrameReady: [],
      _run: function (fs, data) {
        if (fs && fs.length > 0) {
          var errors = [];
          for (var i = 0; i < fs.length; i++) {
            var f = fs[i];
            try {
              if (data) {
                f(data);
              } else {
                f();
              }
            } catch (e) {
              errors.push(
                JSON.stringify({
                  error: e,
                  func: f
                })
              );
            }
          }
          if (errors.length > 0) {
            var msg = "";
            for (var i = 0; i < errors.length; i++) {
              msg += errors[i];
            }
            console.log(msg);
          }
        }
      },
      checkLoginStateComplete: false,
      addLoginSuccess: function (f) {
        SSOApi.Event._loginSuccess.push(f);
      },
      addLoginFaild: function (f) {
        SSOApi.Event._loginFaild.push(f);
      },
      addLogout: function (f) {
        SSOApi.Event._logout.push(f);
      },
      addSSOIframeReady: function (f) {
        if (f) {
          SSOApi.Event._ssoFrameReady.push(f);
        }
      }
    }
  };
  $(function () {
    var minip = SSOApi._getUrlParams("token") || SSOApi._getUrlParams("minip");
    if (minip) {
      SSOApi.setCookie(
        "PassPort_Token",
        minip,
        240 * 60 * 1000,
        ".cifnews.com"
      );
    }
    SSOApi.layer.initCover();
    SSOApi.CheckLoginState();
    if (SSOApi.Config.IsAutoLogin) {
      if (
        typeof window.app !== "undefined" &&
        typeof app.addReady === "function"
      ) {
        app.addReady(function () {
          if (
            typeof cifnewsApp !== "undefined" &&
            typeof cifnewsApp.getNeedId === "function"
          ) {
            var appToken = cifnewsApp.getNeedId("token");
            if (appToken && !SSOApi.getPassPort()) {
              SSOApi.ShowSSOBox();
            }
          }
        });
      }
    }
    //
    window.addEventListener(
      "message",
      function (e) {
        if (
          e.origin != "https://test.passport.cifnews.com" &&
          e.origin != "https://passport.cifnews.com"
        ) {
          return;
        }
        if (e.data) {
          var res;
          try {
            res = JSON.parse(e.data);
          } catch (ex) {
            res = e.data;
          }
          if (res.type == "_ssoFrameReady") {
            if (
              typeof SSOApi != "undefined" &&
              typeof SSOApi.Event != "undefined" &&
              typeof SSOApi.Event._ssoFrameReady == "object"
            ) {
              SSOApi.Event._ssoFrameReady.forEach(function (fn, index) {
                if (typeof fn == "function") {
                  fn(window);
                }
              });
            }
          } else if (res.type == "longinSucess") {
            var registPopup = localStorage.getItem("registPopup")
              ? JSON.parse(localStorage.getItem("registPopup"))
              : {};
            registPopup.login = true;
            localStorage.setItem("registPopup", JSON.stringify(registPopup));
            if (res.href) {
              if (res.displayType == 3) {
                sessionStorage.setItem("detailLogined", true);
              }
            }
            localStorage.setItem("loaded", true);
            SSOApi.CallBack(res.href);
          } else if (res.type == "closePopup") {
            try {
              if (
                SSOApi !== undefined &&
                typeof SSOApi.ClosePopup === "function"
              ) {
                SSOApi.ClosePopup(SSOApi.Config.PopupLoginFrameId);
              } else if (window.top === window.self && res.href) {
                location.href = res.href;
              } else {
                document.body.removeChild(
                  document.getElementById("popup_sso_iframe")
                );
              }
              if (res.displayType == 3) {
                articlePopUpClose();
              }
            } catch (ex) {
              console.log("关闭登录弹窗失败");
              if (res.href) {
                location.href = res.href;
              }
            }
          } else if (res.type == "logoutSuccess") {
            document.location.href = res.href
          }
        }
      },
      false
    );
  });
}

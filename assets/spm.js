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
/**
 * 注意，此js需要放在d.js,f.js前面
 * ?spm=b业务.p页面.t物品类型.i物品id.c展示块.s组件.m模板.r资源位.aAB测试,另外由于m模板与c展示块放在一起，所以前端暂时不将m抽出
 * ?spm=[d1]b1.p1.t1.i1.c1.s1.[m{Title}].r1_t11_i55.a样式a
 * 优化 TODO: 
 * 1. 文件最好优化到500行内（ 公共方法抽出去 | 按职能去分文件 ） 500能否通过配置上检测（如eslint
 * 2. 如果要新的规范，注意点：
 *   - 函数只有部分暴露出去，给别人调用
 *   - 保证单例
 */
window.cifnewsSpm =
  window.cifnewsSpm ||
  (function () {
    var cifnewsSpm;
    var SpmInstance = {
      config: {
        dom: {
          // 各个dom属性
          sensorOriginMeta: "meta[name='originproperty']",
          pageMata: "meta[name='cifnews_page']",
          blockClass: "cifnews_block",
          blockAttr: "data-cifnews-block",
          componentClass: "cifnews_component",
          componentAttr: ["data-cifnews-component","data-origin-terms","data-origin-medium"],
          resourceAttr: "data-cifnews-resource",
          abtestAttr: "abtest",
          positionAttr: "data-cifnews-block-position",
          replacedAttr: "data-cifnews-block-replaced",
          linkClass: "cifnews_block_linkUrl",
          btnLinkClass: "cifnews_block_button_url",
          jsLinkClass: "cifnews_block_js_linkUrl", // gotoLink方法中的jsLink跳转
          isRedirectPage:"redirect"//是否是中转页 中转页本身不产生来源（即跳转下一页或点击本身使用的还是上个页面的）
        },
        property: {
          // 内部的，自定义的
          spm: ["b", "p", "t", "i", "c", "s", "m", "a", "r", "k", "d", "o_d", "o_b", "o_p", "o_t", "o_i", "o_m"], // spm属性 "c", "s", "m"逐步废弃
          // 给神策使用的
          sensor: [
            "module",
            "page",
            "item",
            "id",
            "medium",
            "terms",
            "ABtest",
            "resource",
            "resource_type",
            "resource_id",
            "search_word",
            "origin",
            "traffic_device",
            "traffic_mp_name"
          ], // 神策属性
          spmMapAttr: {
            b: "module",
            p: "page",
            t: "item_type",
            i: "item_id"
          },
          sensorMapSpm: {
            origin: "origin",
            module: "b",
            page: "p",
            item: "t",
            ABtest: function (spm) {
              var result = (spm.a || "").replace(/^a/, "");
              return result;
            },
            id: function (spm) {
              var result = (spm.i || "").replace(/^i/, "");
              return result;
            },
            medium: function (spm) {
              /**
               *   c1_c2
               *   medium：c1_c2
               *   terms：无
               *
               *   c1_m2
               *   medium：c1
               *   terms：m2
               *
               */
              var result = spm.c || spm.s;
              // if (typeof result == "string") {
              //   var resultArr = result.split("_"),
              //     lastProperty = resultArr[resultArr.length - 1];
              //   if (lastProperty.startsWith("m")) {
              //     if (resultArr.length > 1) {
              //       result = resultArr.slice(0, resultArr.length - 1).join("_");
              //     } else {
              //       result = "";
              //     }
              //   }
              // }
              return result;
            },
            terms: function (spm) {
              var result = (spm.m || "").replace(/^m/, "");
              // return decodeURIComponent(result);
              return result;
            },
            resource: function (spm) {
              var result = (spm.r || "")
                .split("_")
                .filter(function (item) {
                  return item.startsWith("r");
                })
                .map(function (item) {
                  return item.replace(/^r/, "");
                })
                .join("_");

              return result || "";
            },
            resource_type: function (spm) {
              var result = (spm.r || "")
                .split("_")
                .filter(function (item) {
                  return item.startsWith("t");
                })
                .join("_");
              return result || "";
            },
            resource_id: function (spm) {
              var result = (spm.r || "")
                .split("_")
                .filter(function (item) {
                  return item.startsWith("i");
                })
                .join("_");
              return result || "";
            },
            traffic_device: function (spm) {
              var result = (spm.r || "")
                .split("_")
                .filter(function (item) {
                  return item.startsWith("d");
                })
                .join("_");
              return result || "";
            },
            traffic_mp_name: function (spm) {
              var result = (spm.r || "")
                .split("_")
                .filter(function (item) {
                  return item.startsWith("n");
                })
                .join("_");
              return result || "";
            },
            search_word: function (spm) {
              var result = (spm.k || "").replace(/^k/, "");
              return result;
            },
            device: "d"
          }
        },
        cookieTimeOut: 2 * 60 * 1000
      }, //配置
      utils: {
        deviceChecker: {
          isAndroid: /(Android)/i.test(navigator.userAgent),
          isIos: /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent),
          isWechat: /MicroMessenger/i.test(navigator.userAgent),
          isApp: /cifnewsapp/i.test(navigator.userAgent) || typeof cifnewsApp === 'object',
          isPc: !/iPhone|iPad|iPod|iOS|Android|Symbianos|MicroMessenger|cifnewsapp/i.test(
            navigator.userAgent
          ),
          isMiniApp: /miniprogram/i.test(navigator.userAgent),
          isSmartApp: /swan/i.test(navigator.userAgent),
          isTest:
            /test./i.test(window.location.origin) ||
            /localhost./i.test(window.location.origin)
        },
        trim: function (str) {
          return null == str
            ? ""
            : (str + "").replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
        },
        /**
         * 操作cookie，具体操作参考jquery的$cookie插件
         * 如果只传一个name参数，则返回cookie值
         * 否则就是设置cookie
         * @param {String} name cookie名
         * @param {String} value cookie值
         * @param {CookieOption} options cookie选项
         */
        cookie: function (name, value, options) {
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
              (typeof options.expires === "number" ||
                options.expires.toUTCString)
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
                var cookie = SpmInstance.utils.trim(cookies[i]);
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
        /**
         * 使用例子：
         * 如果当前url是 https://www.cifnews.com/form/6669?spm=t1
         * 这时候如果调用 getUrlParam('spm', url)会返回t1
         */
        getUrlParam: function (key, urlSearch) {
          var urlParam = SpmInstance.utils.UrlSearchParams2Object(urlSearch);
          return urlParam && urlParam[key] ? urlParam[key] : null;
        },
        /**
         * 是否同域名
         *@param {String} url 链接地址
         */
        checkIsSanmeOrigin: function (url) {
          return (
            url.match(/^((\/[^\/])|(\/$))/gi) !== null ||
            url.match(
              new RegExp("^((https{0,1}:){0,1}\\/\\/)" + location.host)
            ) !== null
          );
        },
        /**
         * 将对象转化为url参数字符串(不包含?)
         * @param {Object} obj 待转化的对象
         */
        Object2UrlSearchParams: function (obj) {
          var result = "";
          for (var key in obj) {
            if (typeof obj[key] != "undefined" && obj[key] != null) {
              result += key + "=" + obj[key] + "&";
            }
          }
          return result.slice(0, -1);
        },
        /**
         * 将url参数字符串转化为对象
         *@param {String} originSearch 如果有传值，则从此参数中获取对应key的值 例：?origin=pc_01
         */
        UrlSearchParams2Object: function (originSearch) {
          originSearch = decodeURIComponent(originSearch || location.search);
          if (typeof originSearch != "string" || !originSearch) {
            return null;
          }
          var search = originSearch.replace(/((^\?)|(((#\/)|\/)$))/gi, "");
          var params = search.split("&");
          var result = {};
          params.forEach(function (param) {
            var keyAndVal = param.split("="),
              paramKey = keyAndVal[0],
              paramVal = keyAndVal[1];
            if (paramVal != null && paramVal != undefined) {
              result[paramKey] = paramVal;
            }
          });
          return result;
        },
        /**
         * 将传入的url转为完整的url
         * @param {String} url
         * @returns 
         */
        getFullUrl: function (url) {
          if (typeof url != "string" || url == "") {
            return location.href;
          } 
          if (url.startsWith("http") || url.startsWith("cifnewsapp://")) {
            return url
          }
          if (url.startsWith("//")) {
            return location.protocol + url;
          }
          if (url.startsWith('/')) {
            return location.protocol + "//" + location.hostname + url;
          }

          var resultUrl = location.protocol +
            "//" +
            location.hostname +
            (location.pathname.endsWith("/")
              ? location.pathname
              : location.pathname.replace(/([^\/]*)$/, "")) +
            url;
          
          return resultUrl
        },
        /**
         * 将spm对象转化成神策所需数据
         * @param {Object} spm 通过getSpmFromStr方法生成的spm数据对象
         */
        spmToSensor: function (spm) {
          var sensorData;
          if (spm) {
            sensorData = {};
            SpmInstance.config.property.sensor.forEach(function (property) {
              var propertyVal = null,
                propertyMap =
                  SpmInstance.config.property.sensorMapSpm[property];
              if (typeof propertyMap == "string") {
                propertyVal = spm[propertyMap];
              } else if (typeof propertyMap == "function") {
                propertyVal = propertyMap(spm);
              }
              if (propertyVal) {
                sensorData[property] = propertyVal;
              }
            });
          }
          return sensorData;
        },
        /**
         * 从urlSearch中获取的spmStr对象如 p1.b2.t3
         * 跟 SpmInstance.config.property.spm 进行匹配
         * 匹配出来的内容转成一个对象，如 { p: p1, b:b2, t:t3 }
         * @param {String} urlSearch
         */
        getSpmFromStr: function (spmStr) {
          // var spmStr = SpmInstance.utils.getUrlParam("spm", urlSearch);
          if (spmStr) {
            var spmArr = spmStr.split("."); // p1.b2.t3 -> [p1,b2,t3]
            var spm = {};
            SpmInstance.config.property.spm.forEach(function (property, index) {
              for (var j = 0; j < spmArr.length; j++) {
                if (spmArr[j].startsWith(property)) {
                  spm[property] = spmArr[j];
                  break;
                }
              }
            });
            return spm;
          } else {
            return null;
          }
        },
        /**
         * 这里origin的规则期望得到的是 spm=b17.p6.t19.i1157.o_b17_p1_t19 ,
         * 从 .o_b17 开始的部分是origin(前置页)的spm
         * @param {*} config getSpmData带过来的
         * @returns { originSpmStr, originSpmObj }
         */
        handleOriginSpm(config) {
          // 获取前置页信息,这时候会得到类似 { closedParentSpmStr: "", spmConfigStr: "b17.p1" } 的数据
          var storageSpm = cifnewsSpm.sdk.getStorageSpm();
          
          var EMPTY_OBJ = { originSpmStr: '', originSpmObj: {} };
          // 说明没有前置页信息，直接return 空
          if (!storageSpm) return EMPTY_OBJ;
          if (!storageSpm.spmConfigStr) return EMPTY_OBJ;

          try {
            // 这里返回前置页的spm对象 例如 { b: 17, p:1 }
            var _storageSpmObj = SpmInstance.utils.getSpmFromStr(storageSpm.spmConfigStr) || {};
            const originKey = ['p', 'b', 't', 'i']
            // 过滤一下，origin只要p,b,t,i
            _storageSpmObj = Object.keys(_storageSpmObj)
              .filter(i => originKey.includes(i))
              .reduce((obj, cur) => {
                obj[cur] = _storageSpmObj[cur]
                return obj
              }, {})

            // 在getSpmData中，config的优先级是更大的，这边也沿用这个逻辑
            var storageSpmObj = { ..._storageSpmObj, ...config };
  
            // { b:17, p:1 } -> .o_b17_p1
            var originSpmStr = Object.keys(storageSpmObj).reduce((str, key) => {
              return str + ( 
                storageSpmObj[key] 
                ? '_' + storageSpmObj[key] 
                : ''
              )
            },'.o') || '';
            
            // 这里将 { b:17, p:1 } 转为 { o_b:17, o_p: 1 }
            var originSpmObj = Object.keys(storageSpmObj).reduce((acc, key) => {
              if (storageSpmObj[key]) {
                acc['o_' + key] = storageSpmObj[key];
              }
              return acc;
            }, {});
            
            return {
              originSpmStr,
              originSpmObj
            }
          } catch(e) {
            console.log('e.. 转换失败', e)
            return EMPTY_OBJ
          }
          
          
          
        },

        /**
         * 帮助getSpmData去匹配config和SpmInstance.config.property.spm
         */
        matchSpmFromConfig(property, onlyBuildConfig) {
          switch (property) {
            case "b":
            case "p":
            case "t":
            case "i":
              if (!onlyBuildConfig) {
                return SpmInstance.runTime.meta[
                    SpmInstance.config.property.spmMapAttr[property]
                  ]
              }
              break;
            case "k":
              // TODO 这里的keyword有点奇怪，后面再看看
              var keyword;
             if (
                location.pathname.indexOf("/search") == 0 &&
                (keyword = SpmInstance.utils.getUrlParam("keyword"))
              ) {
                return "k" + decodeURIComponent(
                    SpmInstance.utils.getUrlParam("keyword")
                  ).slice(0, 120);
              } else if (SpmInstance.runTime.spm[property]) {
                return SpmInstance.runTime.spm[property];
              }
              break;
            case "r":
              if (SpmInstance.runTime.spm[property]) {
                return SpmInstance.runTime.spm[property];
              }
              break;
            case "d":
              if (
                SpmInstance.utils.deviceChecker.isSmartApp ||
                SpmInstance.utils.deviceChecker.isMiniApp ||
                SpmInstance.utils.deviceChecker.isAndroid ||
                SpmInstance.utils.deviceChecker.isIos
              ) {
                return SpmInstance.runTime.meta.d;
              }
              break;
            case "a":
            case "c":
            case "s":
            case "m":
              return
            default:
              break;
          }
        },

        /**
         * @param {*} config
         * @param {*} onlyBuildConfig 是否只渲染传入的spm配置
         * @returns 
         * 例子：可能传入 { config: {b: 'b42', p: 'p1'}, onlyBuildConfig: undefined}
         * 这时候返回 { spmObj: {b: 'b42', p: 'p1'} spmStr : "b42.p1" }
         */
        getSpmData: function (config, onlyBuildConfig) {
          // var spmArr = [],
          //   spmObj = {};
           var config = typeof config == "object" ? config : {};
          
            // 把 origin 的 spm 剔除出去（以o开头的
          var spmInstanceConfigCurrentSpm = SpmInstance.config.property.spm.filter( item => !item.startsWith['o'] )
          var matchSpmFromConfig = SpmInstance.utils.matchSpmFromConfig;
          var spmArr = spmInstanceConfigCurrentSpm
            .map((property) => {
              return config[property] ? config[property] : matchSpmFromConfig(property, onlyBuildConfig)
            })
            .filter(i => i !== undefined && typeof i == "string")
            .map(i => i.replace(/\./gi, ""))

          var spmObj = spmInstanceConfigCurrentSpm
            .reduce((obj, property) => {
              let spmVal = config[property] || matchSpmFromConfig(property, onlyBuildConfig);
              if (spmVal) {
                obj[property] = spmVal 
              };
              return obj
            }, {})

          if (config.other) {
            spmArr.push(config.other);
            spmObj.other = config.other;
          }
          if (SpmInstance.utils.deviceChecker) {
            // 把origin的spm添加到当前页的spm上
            var { originSpmStr, originSpmObj } = SpmInstance.utils.handleOriginSpm(config, onlyBuildConfig);
            return { 
              spmStr: spmArr.join(".") + originSpmStr,
              spmObj: { ...spmObj, ...originSpmObj }
            };
          }
        },
        /**
         * 根据传入的链接与配置生成对应spm链接
         * @param {String} url 要替换的url
         * @param {SpmConfig} spmConfig spm设置选项
         * @param {object} options 其他配置选项 onlyBuildConfig 是否只渲染传入的spm配置
         * 
         * 这里应该是，例如传入参数：
         *   url: "http://example.com/page"
         *   spmConfig: { b: "1", p: "2", t: "3", i: "4" }
         *   options: { onlyBuildConfig: false }
         *   传出参数 http://example.com/page?spm=b.1.p.2.t.3.i.4
         */
        getSpmUrlByUrl: function (url, spmConfig, options) {
          if (!url || url.startsWith("javascript")) {
            return;
          }
          options = options || {};
          spmConfig = typeof spmConfig == "object" ? spmConfig : {};
          var spmStr = SpmInstance.utils.getSpmData(
              spmConfig,
              options.onlyBuildConfig
            ).spmStr,
            urlParam = {
              spm: spmStr
            },
            pathArr = url.split("?");
          var utm = SpmInstance.utils.cookie("utm");
          if (utm) {
            urlParam.utm = utm;
          }
          if (!urlParam.origin && spmConfig.origin) {
            urlParam.origin = spmConfig.origin;
          }
          if (typeof URL == "function") {
            try {
              var resultUrl = SpmInstance.utils.getFullUrl(url);
              var urlObj = new URL(resultUrl);
              if (urlObj.search) {
                $.extend(
                  urlParam,
                  SpmInstance.utils.UrlSearchParams2Object(urlObj.search)
                );
              }
              urlObj.search =
                "?" + SpmInstance.utils.Object2UrlSearchParams(urlParam);
              return urlObj.toString();
            } catch (error) {
              console.warn(error);
              return url;
            }
          } else {
            if (pathArr.length > 1) {
              if (pathArr[1].indexOf("#") != -1) {
                pathArr[1] = pathArr[1].split("#");
                $.extend(
                  urlParam,
                  SpmInstance.utils.UrlSearchParams2Object(pathArr[1][0])
                );
                pathArr[1][0] =
                  SpmInstance.utils.Object2UrlSearchParams(urlParam);
                pathArr[1] = pathArr[1].join("#");
              } else {
                $.extend(
                  urlParam,
                  SpmInstance.utils.UrlSearchParams2Object(pathArr[1])
                );
                pathArr[1] = SpmInstance.utils.Object2UrlSearchParams(urlParam);
              }
            }
            return pathArr.join("?");
          }
        },
        /**
         * 根据传入的a标签返回spm设置选项
         * @param {HTMLElement} el 需要替换链接的a标签
         * @param {object} options 配置
         */
        getSpmConfigByDom: function (el, options) {
          options = options || {};
          var spmConfig = {};
          if (el) {
            // blockClass 就是 cifnews_block
            // componentClass 就是 cifnews_component
            var blockParents = $(el)
              .parents(
                "." +
                  SpmInstance.config.dom.blockClass +
                  ",." +
                  SpmInstance.config.dom.componentClass
              )
              .add($(el));
            var attrVals = {
              position: "",
              component: [],
              blocks: [],
              resource: [],
              ABtest: []
            };
            blockParents.each(function () {
              var $this = $(this);
              var blockAttr = $this.attr(SpmInstance.config.dom.blockAttr),
                resourceAttr = $this.attr(SpmInstance.config.dom.resourceAttr),
                abtestAttr = $this.attr(SpmInstance.config.dom.abtestAttr),
                position = $this.attr(SpmInstance.config.dom.positionAttr);
              var componentAttr = $this.attr(SpmInstance.config.dom.componentAttr[0]);
              if(!componentAttr) {
                componentAttr = $this.attr(SpmInstance.config.dom.componentAttr[1]);
                if (!componentAttr) {
                  componentAttr = $this.attr(SpmInstance.config.dom.componentAttr[2]);
                }
                //兼容处理
                //config.dom.componentAttr 1-2 不会带m
                //config.dom.componentAttr 0 会带m
                if(componentAttr) {
                  componentAttr = "m" + componentAttr;
                }
              }
              if (position) {
                attrVals.position = position;
              } else {
                if (blockAttr) {
                  attrVals.blocks.push(blockAttr);
                }
                if (componentAttr) {
                  if (componentAttr.indexOf('m') == 0) {
                    componentAttr = componentAttr.substr(1);
                  }
                  attrVals.component.push(componentAttr);
                }
              }
              if (resourceAttr) {
                if(/^[\d]*[-]?[\d]*$/.test(resourceAttr)){
                  var preResourceAttr = resourceAttr.replace(/\d+$/,'');
                  var index = $this.index(':visible[data-cifnews-resource^="'+preResourceAttr+'"]')
                  if(index>=0){
                    attrVals.resource.push(preResourceAttr + (index + 1));
                  } else {
                    console.log('获取到当前resource不在显示的模块中，采用原有绑定属性');
                    attrVals.resource.push(resourceAttr);
                  }
                } else {
                  attrVals.resource.push(resourceAttr);
                }
              }
              if (abtestAttr) {
                attrVals.ABtest.push(abtestAttr);
              }
            });
            if (attrVals.position) {
              spmConfig.other = attrVals.position;
            } else {
              if (attrVals.blocks.length > 0) {
                spmConfig.c = attrVals.blocks.join("_");
              }
            }
            if (attrVals.component.length > 0) {
              spmConfig.m = "m" + attrVals.component.join("_");
            }
            if (attrVals.ABtest.length > 0) {
              spmConfig.a = "a" + attrVals.ABtest.join("_");
            }
            if (attrVals.resource.length > 0) {
              if (SpmInstance.runTime.meta.item_type) {
                attrVals.resource.push(SpmInstance.runTime.meta.item_type);
              }
              if (SpmInstance.runTime.meta.item_id) {
                attrVals.resource.push(SpmInstance.runTime.meta.item_id);
              }
              if (SpmInstance.runTime.meta.d) {
                attrVals.resource.push(SpmInstance.runTime.meta.d);
              }
              spmConfig.r = attrVals.resource.join("_");
            }
            // needLinkClass存在且没有cifnews_block_linkUrl cifnews_block_button_url类名的话，只保留k、r、a以及页面meta的spm字段
            if (
              options.needLinkClass &&
              !$(el).hasClass(SpmInstance.config.dom.linkClass)
              && !$(el).hasClass(SpmInstance.config.dom.btnLinkClass)
            ) {
              spmConfig = { r: spmConfig.r, a: spmConfig.a };
            }
          }
          return SpmInstance.utils.getSpmData(spmConfig).spmObj;
        },
        setStorageSpm: function (nhref, spmConfig) {
          nhref = SpmInstance.utils.getFullUrl(nhref);
          var pathArr = nhref.split("?"),
            origin =
              SpmInstance.utils.getUrlParam("origin", "?" + pathArr[1]) ||
              SpmInstance.runTime.origin,
            urlSpm = SpmInstance.utils.getUrlParam("spm", "?" + pathArr[1]);
          var spmData = SpmInstance.utils.getSpmData(spmConfig),
            spmConfigStr = encodeURIComponent(spmData.spmStr),
            // prevPageSpmObj = SpmInstance.runTime.spm,
            // currentPageMeta = SpmInstance.runTime.meta,
            saveData = {
              closedParentSpmStr: encodeURIComponent(
                SpmInstance.utils.getSpmData(
                  SpmInstance.runTime.closedParentSpm,
                  true
                ).spmStr
              ),
              spmConfigStr: urlSpm || spmConfigStr
            };
          // if()

          // if (
          //   currentPageMeta.item_type && currentPageMeta.item_id &&
          //   currentPageMeta.item_type == prevPageSpmObj.t &&
          //   currentPageMeta.item_id == prevPageSpmObj.i
          // ) {
          //   saveData.closedParentSpmStr = encodeURIComponent(
          //     SpmInstance.utils.getSpmData(SpmInstance.runTime.closedParentSpm).spmStr
          //   );
          // }
          if (origin) {
            saveData.origin = origin;
          }

          // var isSameOrigin = false; // 是否同域名
          // if (
          //   nhref.match(/^((\/[^\/])|(\/$))/gi) !== null ||
          //   nhref.match(
          //     new RegExp("^((https{0,1}:){0,1}\\/\\/)" + location.host)
          //   ) !== null
          // ) {
          //   isSameOrigin = true;
          // }
          var isSameOrigin = SpmInstance.utils.checkIsSanmeOrigin(nhref);
          console.log("isSameOrigin", isSameOrigin);
          if (!isSameOrigin) {
            var cookieReferrer = location.origin + "/";
            if (
              !SpmInstance.utils.deviceChecker.isPc &&
              nhref.match(
                new RegExp("^((https{0,1}:){0,1}\\/\\/)www.cifnews.com")
              ) != null
            ) {
              cookieReferrer = location.protocol + "//www.cifnews.com/";
            }
            SpmInstance.utils.cookie(
              encodeURIComponent(btoa(cookieReferrer)), //谷歌浏览器中，不同域名跳转referrer只会保留域名,ios中referrer完整
              encodeURIComponent(JSON.stringify(saveData)),
              {
                expires: new Date(
                  Date.now() + SpmInstance.config.cookieTimeOut
                ),
                path: "/",
                domain: ".cifnews.com"
              }
            );
            SpmInstance.utils.cookie(
              encodeURIComponent(btoa(location.origin + location.pathname)),
              encodeURIComponent(JSON.stringify(saveData)),
              {
                expires: new Date(
                  Date.now() + SpmInstance.config.cookieTimeOut
                ),
                path: "/",
                domain: ".cifnews.com"
              }
            );
          } else {
            sessionStorage.setItem(
              btoa(location.origin + location.pathname + location.search),
              JSON.stringify(saveData)
            );
          }
          return saveData;
        },
        /**
         * 跳转链接并传递spm配置
         * @param {String} url 跳转链接
         * @param {Object} spmConfig spm配置
         */
        gotoLinkBySpm: function (url, spmConfig) {
          var spmStr = SpmInstance.utils.getSpmData(
            spmConfig || {},
            true
          ).spmStr;
          var a = document.createElement("a");
          a.href = url;
          if (SpmInstance.utils.deviceChecker.isPc) {
            a.target = "_blank";
          }
          $(a)
            .addClass("cifnews_block cifnews_block_linkUrl")
            .attr("data-cifnews-block-position", spmStr);
          document.body.appendChild(a);
          a.click();
          $(a).remove();
        },
        // 判断是否需要从父页面获取spm
        // 返回true时：说明当前页是iframe中被嵌套的子页面
        // 并且 这个子页面没有 meta 埋点的标签
        // 父子页面只要一个spm就可以了，避免一个页面两个页面触发spm
        checkNeedParent() {
          return (
            window.top !== window &&
            $(SpmInstance.config.dom.pageMata).length <= 0
          );
        },
        /**
         * 更新 SpmInstance.runTime.meta 缓存数据
         * 这里做的事情是，遍历 spm 数组，然后根据 spmMapAttr 获取对应的【属性值】
         * 获取到【属性值】后，如果key是 b, p, t, i 就去匹配html中的<meta>标签
         * 
         * 例如页面的<meta>是 
         * <meta name="cifnews_page" key="category_index" module="b42" page="p1" data-fetch-property="device_type=pc;business_module=南;page_type=首;$title=跨">
         * 这时候 SpmInstance.runTime.meta = { module: 'b42', page: 'p1', item_type: undefined, item_id: undeifined }
         */
        updateRunTime() {
          if (!SpmInstance.utils.checkNeedParent()) {
            SpmInstance.runTime.meta = {};
            SpmInstance.config.property.spm.forEach(function (property, index) {
              var metaProperty =
                SpmInstance.config.property.spmMapAttr[property];
              switch (property) {
                case "b":
                case "p":
                case "t":
                case "i":
                  SpmInstance.runTime.meta[metaProperty] = $(
                    SpmInstance.config.dom.pageMata
                  ).attr(metaProperty);
                  break;
                case "d":
                  if (SpmInstance.utils.deviceChecker.isSmartApp) {
                    SpmInstance.runTime.meta.d = "d7";
                  } else if (SpmInstance.utils.deviceChecker.isMiniApp) {
                    SpmInstance.runTime.meta.d = "d6";
                  } else if (SpmInstance.utils.deviceChecker.isApp) {
                    if(SpmInstance.utils.deviceChecker.isAndroid) {
                      SpmInstance.runTime.meta.d = "d5";
                    } else if (SpmInstance.utils.deviceChecker.isIos) {
                      SpmInstance.runTime.meta.d = "d4";
                    }else{
                      SpmInstance.runTime.meta.d = "d0";
                    }
                  } else if (SpmInstance.utils.deviceChecker.isWechat) {
                    SpmInstance.runTime.meta.d = "d3";
                  } else if (SpmInstance.utils.deviceChecker.isPc) {
                    SpmInstance.runTime.meta.d = "d1";
                  } else {
                    SpmInstance.runTime.meta.d = "d2";
                  }
                  break;
                case "c":
                case "k":
                case "r":
                case "m":
                case "s":
                  break;
                default:
                  break;
              }
            });
          }
        }
      },
      // TODO: 被替换的a标签数据
      runTime: {
        link: {},
        meta: {},
        sensor: {},
        spm: {}
      }, //运行时的内存数据
      api: {}, //远程调用
      event: {
        // 事件回调
        beforeCb: [],
        afterCb: []
      },
      dom: {
        /**
         * 这个函数做了一下几件事情：
         *  a. 获取referrer
         *  b. 变量 sessionParam 根据【是|否】跨域从 【sessionStorage|cookie】中获取数据
         *  c. 变量spmData，从 sessionParam 中获取，并且根据某些if else进行调整，最后赋值给SpmInstance.runTime.spm，这个变量主要是最后赋值 SpmInstance.runTime.spm
         *  d. 变量closedParentSpmData从sessionParam.closedParentSpmStr中获取，并且最后赋值给SpmInstance.runTime.closedParentSpm
         *  e. 将currentPageMeta（SpmInstance.runTime.meta）和 spmData 进行比较，
         *     if (currentPageMeta.item_type == spmData.t && currentPageMeta.item_id == spmData.i)，
         *     根据他们是否相等去设置 SpmInstance.runTime.closedParentSpm 和 sensorOriginData
         *  f. 对SpmInstance.runTime的sensor和spm进行赋值
         *  g. 向head中追加 <meta name="originproperty" content="">'
         */
        setOrigin: function () {
          // 设置神策origin
          var referrer = document.referrer;
          if (referrer && referrer != location.href) {
            sessionStorage.setItem("referrer", document.referrer);
          } else {
            referrer = sessionStorage.getItem("referrer") || document.referrer;
          }
          // var isSameOrigin = false; // 是否同域名
          // if (
          //   referrer.match(/^((\/[^\/])|(\/$))/gi) !== null ||
          //   referrer.match(
          //     new RegExp("^((https{0,1}:){0,1}\\/\\/)" + location.host)
          //   ) !== null
          // ) {
          //   isSameOrigin = true;
          // }
          var isSameOrigin = SpmInstance.utils.checkIsSanmeOrigin(referrer);
          var spmData = {},
            closedParentSpmData = {},
            urlOrigin = SpmInstance.utils.getUrlParam("origin"),
            sessionParam = JSON.parse(
              isSameOrigin
                ? sessionStorage.getItem(window.btoa(referrer || ""))
                : decodeURIComponent(
                    SpmInstance.utils.cookie(
                      encodeURIComponent(window.btoa(referrer || ""))
                    )
                  )
            );
          if (sessionParam) {
            // SpmInstance.runTime.sessionParam = sessionParam
            sessionParam.spmConfigStr = decodeURIComponent(
              sessionParam.spmConfigStr
            );
            sessionParam.closedParentSpmStr = decodeURIComponent(
              sessionParam.closedParentSpmStr
            );
            closedParentSpmData =
              SpmInstance.utils.getSpmFromStr(
                sessionParam.closedParentSpmStr
              ) || closedParentSpmData;
            spmData =
              SpmInstance.utils.getSpmFromStr(sessionParam.spmConfigStr) ||
              spmData;
            if (sessionParam.origin) {
              closedParentSpmData.origin = spmData.origin = sessionParam.origin;
            }
          }
          var urlSearchSpmStr = SpmInstance.utils.getUrlParam("spm");
          if (urlSearchSpmStr) {
            spmData =
              SpmInstance.utils.getSpmFromStr(
                decodeURIComponent(urlSearchSpmStr)
              ) || spmData;
          }
          if (urlOrigin) {
            spmData.origin = urlOrigin;
          }
          SpmInstance.runTime.origin = spmData.origin;
          var sensorOriginData,
            currentPageMeta = SpmInstance.runTime.meta;
          if (currentPageMeta.item_type &&
            currentPageMeta.item_id &&
            spmData.t &&
            spmData.i &&
            currentPageMeta.item_type == spmData.t &&
            currentPageMeta.item_id == spmData.i
          ) {
            sensorOriginData =
              SpmInstance.utils.spmToSensor(closedParentSpmData);
            SpmInstance.runTime.closedParentSpm = closedParentSpmData;
          } else {
            SpmInstance.runTime.closedParentSpm = spmData;
            sensorOriginData = SpmInstance.utils.spmToSensor(spmData);
          }
          if (sensorOriginData) {
            var originArr = [];
            for (var key in sensorOriginData) {
              const element = sensorOriginData[key];
              originArr.push(key + "=" + element);
            }
            SpmInstance.runTime.sensor = sensorOriginData;
            SpmInstance.runTime.spm = spmData;
            // SpmInstance.runTime.closedParentSpm = closedParentSpmData;
            if ($(SpmInstance.config.dom.sensorOriginMeta).length == 0) {
              $("head").append('<meta name="originproperty" content="">');
            }
            var originStr=originArr.join(";");
            $(SpmInstance.config.dom.sensorOriginMeta).attr("data-origin",originStr);
            var isRedirect=$(SpmInstance.config.dom.pageMata).attr(SpmInstance.config.dom.isRedirectPage);
            if(isRedirect){
              $(SpmInstance.config.dom.sensorOriginMeta).attr("content",originStr);
            }
          }
        },
        buildSpm: function () {
          // 对应cifnews_block中a标签替换链接
          $("a." + SpmInstance.config.dom.linkClass)
            .filter("[" + SpmInstance.config.dom.replacedAttr + '!="true"]')
            .each(function (index, el) {
              var nhref = $(this).attr("href");
              if (!nhref || nhref.startsWith("javascript")) {
                return true;
              }
              var spmConfig = SpmInstance.utils.getSpmConfigByDom(el, {
                needLinkClass: true
              });
              // if (!$(this).hasClass(SpmInstance.config.dom.linkClass)) {
              //   spmConfig = {};
              // }
              SpmInstance.event.beforeCb.forEach(function (cb) {
                cb(el, spmConfig);
              });
              var result = SpmInstance.utils.getSpmUrlByUrl(nhref, spmConfig);
              $(this)
                .attr("href", result)
                .attr(SpmInstance.config.dom.replacedAttr, "true");
              var spmKey = SpmInstance.utils.getSpmData(spmConfig).SpmStr;
              if (SpmInstance.runTime.link[spmKey]) {
                SpmInstance.runTime.link[spmKey].push({
                  el: el,
                  spmConfig: spmConfig,
                  before: nhref,
                  after: result
                });
              } else {
                SpmInstance.runTime.link[spmKey] = [
                  {
                    el: el,
                    before: nhref,
                    spmConfig: spmConfig,
                    after: result
                  }
                ];
              }
              SpmInstance.event.afterCb.forEach(function (cb) {
                cb(el);
              });
            });
        },
        setATagSpm: function () {
          $(document).on(
            "click",
            // "a." + SpmInstance.config.dom.linkClass,
            "a",
            function () {
              var el = $(this),
                nhref = el.attr("href");
              if (!nhref || nhref.startsWith("javascript")) {
                return true;
              }
              if(SpmInstance.utils.checkIsSanmeOrigin(window.location.origin)) {
                el.attr("rel", "opener");
              }
              var spmConfig = SpmInstance.utils.getSpmConfigByDom(el, {
                needLinkClass: true
              });
              if (
                window.top !== window &&
                $(SpmInstance.config.dom.pageMata).length <= 0
              ) {
                // spmConfig = {};
                if (
                  window.CifnewsData &&
                  CifnewsData.config &&
                  CifnewsData.config.runTime &&
                  CifnewsData.config.runTime.parentRunTime
                ) {
                  spmConfig = {
                    m: spmConfig.m,
                    c: spmConfig.c,
                    other: spmConfig.other
                  };
                  try {
                    spmConfig.m =
                      CifnewsData.config.runTime.parentRunTime.cacheData._clickList.m;
                  } catch (error) {
                    console.log(error);
                  }
                }

                SpmInstance.event.beforeCb.forEach(function (cb) {
                  cb(el, spmConfig);
                });
                window.top.postMessage(
                  JSON.stringify({
                    type: "spm_gotoLink",
                    data: {
                      url: el.attr("href"),
                      spmConfig: spmConfig
                    }
                  }),
                  "*"
                );
                return false;
              }
              SpmInstance.event.beforeCb.forEach(function (cb) {
                cb(el, spmConfig);
              });
              var sessionSaveData = SpmInstance.utils.setStorageSpm(
                nhref,
                spmConfig
              );
              if (sessionSaveData.origin) {
                spmConfig.origin = sessionSaveData.origin;
              }
              if (SpmInstance.utils.deviceChecker.isApp) {
                var resultAppLink = nhref;
                var queryStr = "";
                if (
                  resultAppLink.indexOf("origin") == -1 &&
                  sessionSaveData.origin
                ) {
                  queryStr += "&origin=" + sessionSaveData.origin;
                }
                if (
                  resultAppLink.indexOf("spm") == -1 &&
                  sessionSaveData.spmConfigStr
                ) {
                  queryStr += "&spm=" + sessionSaveData.spmConfigStr;
                }
                if (resultAppLink.indexOf("?") > 0) {
                  resultAppLink += queryStr;
                } else {
                  resultAppLink += "?" + queryStr;
                }
                el.attr("href", resultAppLink);

                if (
                  SpmInstance.utils.checkIsSanmeOrigin(window.location.origin)
                ) {
                  el.attr("rel", "opener");
                }
                // if (!nhref.startsWith("cifnewsapp://")) {
                //   el.attr("data-spm-param", sessionSaveData.spmConfigStr);
                //   el.attr("data-spm-origin", sessionSaveData.origin);
                // }
              }
              SpmInstance.runTime.link.activeATag = {
                el: el,
                url: nhref,
                spmConfig: spmConfig,
                sessionSaveData: sessionSaveData
              };
              SpmInstance.event.afterCb.forEach(function (cb) {
                cb(el);
              });
            }
          );
          $(document).on("contextmenu", "a", function (e) {
            CifnewsData._event.track(
              {
                creative_title: "contextmenu",
                creative_description: e.currentTarget.href || ""
              },
              e,
              "click"
            );
          });
        }
      }, //页面对象操作 单向绑定
      init: function () {
        // 处理数据，将<meta>上的数据赋值到 SpmInstance.runTime.meta
        SpmInstance.utils.updateRunTime();
        // 这个函数做了很多事情，可以跳过去看一下
        SpmInstance.dom.setOrigin();
        // SpmInstance.dom.buildSpm();
        SpmInstance.dom.setATagSpm();
      }
    };
    // 初始化只进行一次
    if ($("meta[name='cifnews_page'][view]").length > 0) {
      $(window).on("vueReady", function (event) {
        SpmInstance.init();
      });
    } else {
      SpmInstance.init();
    }
    cifnewsSpm = {
      runTime: SpmInstance.runTime,
      event: {
        /**
         * 替换链接前回调函数，接受两个参数
         * dom：正在替换的a标签，
         * spmConfig: spm配置对象，可通过设置其中的"b", "p", "t", "i", "c", "s"等字段替换生成链接的参数
         * @param {(dom,spmConfig)=>void} cb
         */
        addBefore: function (cb) {
          if (typeof cb == "function") {
            SpmInstance.event.beforeCb.push(cb);
          } else {
            throw new Error("参数cb需要function类型");
          }
        },
        /**
         * 链接替换后回调函数
         * dom：正在替换的a标签
         * @param {(dom)=>void} cb
         */
        addAfter: function (cb) {
          if (typeof cb == "function") {
            SpmInstance.event.afterCb.push(cb);
          } else {
            throw new Error("参数cb需要function类型");
          }
        }
      },
      // 提供给vue项目的spm埋点
      vueMixins: {
        router: {
          beforeEach: function(to, from, next){
            if (from.query.origin && !to.query.origin) {
              to.query.origin = from.query.origin
              next({
                path: to.fullPath,
                params: to.params,
                query: to.query
              })
            } else {
              next()
            }
          },
          afterEach: function(to, from){
            var timer = setInterval(() => {
              if(SpmInstance.runTime.setATagSpmReady){
                console.log('设置currentReferrer')
                sessionStorage.setItem("currentReferrer", '#' + to.fullPath)
                clearInterval(timer)
              }
            }, 50);
            // next()
          },
        },
        page: {
          beforeRouteLeave(to, from, next) {
            sessionStorage.setItem(
              "referrer",
              SpmInstance.utils.getFullUrl("#" + from.fullPath)
            );
            SpmInstance.runTime.setATagSpmReady = false
            SpmInstance.runTime.setSpmMetaReady = false
            next();
          },
          methods: {
            trackSensor(config, originEvent, type){
              var timer = setInterval(() => {
                console.log('获取spm')
                if(SpmInstance.runTime.setATagSpmReady){
                  SpmInstance.utils.updateRunTime();
                  CifnewsData._event.track(config, originEvent, type)
                  clearInterval(timer)
                }
              }, 50);
            }
          },
          mounted() {
            if (this.spmMeta && typeof this.spmMeta == "object") {
              for (let key in this.spmMeta) {
                $("meta[name='cifnews_page']").attr(key, this.spmMeta[key]);
              }
            }
            SpmInstance.runTime.setSpmMetaReady = true
            // SpmInstance.utils.updateRunTime();
            // setTimeout(() => {
            //   SpmInstance.dom.setOrigin();
            // },300)
          },
          beforeDestroy() {
            if (this.spmMeta && typeof this.spmMeta == "object") {
              for (let key in this.spmMeta) {
                $("meta[name='cifnews_page']").removeAttr(key);
              }
            }
            if(!SpmInstance.runTime.setATagSpmReady){
              $(SpmInstance.config.dom.sensorOriginMeta).removeAttr(
                "data-origin"
              );
            }
          }
        }
      },
      sdk: {
        //外部调用方法
        reRender: function (isRenderAll) {
          // if (isRenderAll) {
          //   $("a[" + SpmInstance.config.dom.replacedAttr + "]").removeAttr(
          //     SpmInstance.config.dom.replacedAttr
          //   );
          // }
          // SpmInstance.init();
          SpmInstance.dom.setOrigin();
        },
        getStorageSpm: function () {
          var referrer = document.referrer;
          if (referrer == location.href) {
            referrer = sessionStorage.getItem("referrer") || document.referrer;
          }
          // var isSameOrigin = false; // 是否同域名
          // if (
          //   referrer.match(/^((\/[^\/])|(\/$))/gi) !== null ||
          //   referrer.match(
          //     new RegExp("^((https{0,1}:){0,1}\\/\\/)" + location.host)
          //   ) !== null
          // ) {
          //   isSameOrigin = true;
          // }
          var isSameOrigin = SpmInstance.utils.checkIsSanmeOrigin(referrer);
          var sessionParam = JSON.parse(
            isSameOrigin
              ? sessionStorage.getItem(window.btoa(referrer || ""))
              : decodeURIComponent(
                  SpmInstance.utils.cookie(
                    encodeURIComponent(window.btoa(referrer || ""))
                  )
                )
          );
          return sessionParam;
        },
        getSpmStr: function (config, onlyBuildConfig) {
          return SpmInstance.utils.getSpmData(config, onlyBuildConfig).spmStr;
        },
        getSpmStrByDevice: function (config, onlyBuildConfig) {
          if (!config.d) {
            config.d = SpmInstance.runTime.meta.d;
          }
          return SpmInstance.utils.getSpmData(config, onlyBuildConfig).spmStr;
        },
        gotoLinkBySpm: SpmInstance.utils.gotoLinkBySpm,
        spmToSensor: SpmInstance.utils.spmToSensor,
        setStorageSpm: SpmInstance.utils.setStorageSpm,
        getSpmUrlByUrl: SpmInstance.utils.getSpmUrlByUrl,
        getSpmConfigByDom: SpmInstance.utils.getSpmConfigByDom
      }
    };
    window.addEventListener(
      "message",
      function (e) {
        if (e.origin.indexOf(cifnewsConfig.domain) == -1) {
          return;
        }
        if (e.data) {
          var res;
          try {
            res = JSON.parse(e.data);
          } catch (ex) {
            res = e.data;
          }
          switch (res.type) {
            case "spm_gotoLink":
              SpmInstance.utils.gotoLinkBySpm(res.data.url, res.data.spmConfig);
              break;
            case "spm_getData":
              SpmInstance.utils.updateRunTime();
              e.source.postMessage(
                JSON.stringify({
                  type: "spm_setData",
                  data: {
                    runTime: SpmInstance.runTime
                  }
                }),
                "*"
              );
              break;
            case "spm_setData":
              cifnewsSpm.runTime = SpmInstance.runTime = res.data.runTime;
              break;

            default:
              break;
          }
        }
      },
      false
    );
    if (SpmInstance.utils.checkNeedParent()) {
      window.top.postMessage(
        JSON.stringify({
          type: "spm_getData"
        }),
        "*"
      );
    }
    return cifnewsSpm;
  })();

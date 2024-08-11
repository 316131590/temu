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
$(function () {
  var HomeIndex = function () {
    this.moduleId =
      parseFloat(location.hash.slice(1)) ||
      $(".act-first__body--item.is-active").data("id");
    this.linkUrl = $(".cif-catalogue").data("url") || "";
    this.timer = null;
  };
  HomeIndex.prototype.init = function () {
    var scope = this;
    scope.bindEvent();
    scope.initPortrait();
    scope.updateLog();
    if (scope.moduleId) {
      scope.triggerScroll(scope.moduleId);
    }
    cifnewsNumber.event.addBefore(function (source, type, key, id, method) {
      if (source == "like" && type == "guide" && method == "off") {
        layer.msg("您已经赞过了哦~");
        return false;
      }
      return true;
    });
  };
  // 初始化头部
  HomeIndex.prototype.initPortrait = function () {
    if (SSOApi.Config.isLogin()) {
      SSOApi.CheckLoginState(() => {
        $(".cif-header__container--right .portrait").attr(
          "src",
          window.userInfo.headImg
        );
        $(".cif-header__container--right .center").removeClass("none");
        $(".cif-header__container--right .login").addClass("none");
      });
    } else {
      $(".cif-header__container--right .login").removeClass("none");
      $(".cif-header__container--right .center").addClass("none");
    }
  };
  // 目录滚动定位
  HomeIndex.prototype.cataglogueScroll = function (id) {
    var $target = $(`.act-first__body--item[data-id="${id}"]`);
    var contHeight = $(".cif-catalogue__body").outerHeight();
    var height = $target.height();
    var offsetTop = $target[0].offsetTop;
    var scrollTop = offsetTop - contHeight / 2 - height / 2;
    $(".cif-catalogue__body").animate(
      {
        scrollTop: scrollTop
      },
      300
    );
  };
  // 滚动事件
  HomeIndex.prototype.handleScrollEvent = function () {
    var scope = this;
    var scrollTop = $(window).scrollTop() + 1;
    $(".act-module").each((i, dom) => {
      var top = $(dom).offset().top;
      var height = $(dom).height();
      // 对应模块区域
      if (scrollTop >= top && scrollTop <= top + height) {
        var id = $(dom).data("id");
        var $target = $(`.act-first__body--item[data-id="${id}"]`);
        if ($target.length) {
          $(`.act-first__body--item`).removeClass("is-active");
          $target.addClass("is-active");
          $target.parents(".act-first").addClass("is-active");
          $target.parent().slideDown();
          if (this.timer) {
            clearInterval(this.timer);
          }
          this.timer = setTimeout(() => {
            scope.cataglogueScroll(id);
          }, 300);
        }
      }
    });
  };
  // 内容滚动定位
  HomeIndex.prototype.triggerScroll = function (id) {
    $(window).off("scroll");
    var $target = $(`.act-first__body--item[data-id="${id}"]`);
    if ($target.length) {
      $(`.act-first__body--item`).removeClass("is-active");
      $target.addClass("is-active");
      $target.parents(".act-first").addClass("is-active");
      $target.parent().slideDown();
    }
    var $module = $(`.act-module[data-id='${id}']`);
    var top = $module.offset().top;
    $("html,body").animate({ scrollTop: top }, 300, () => {
      this.cataglogueScroll(id);
      $(window).on("scroll", this.handleScrollEvent.bind(this));
    });
  };
  HomeIndex.prototype.bindEvent = function () {
    var scope = this;
    // 登录事件绑定
    $(".cif-header__container--right .login").click(function () {
      SSOApi.ShowSSOBox();
    });
    $(".cif-header__container--right .layer-exit").click(function () {
      SSOApi.LogOutSSO();
    });
    // 一级目录点击
    $(".act-first").on("click", ".act-first__head", function () {
      $(this).parent().toggleClass("is-active");
      $(this).next().slideToggle("is-active");
    });
    // 二级目录点击
    $("body").on("click", ".act-first__body--item,.content-box-item", function (e) {
      console.log(1111)
      var id = $(this).data("id");
      if (scope.linkUrl) {
        var url = scope.linkUrl + "#" + id;
        var $a = $(`<a href="${url}" target="_blank"></a>`);
        $("body").append($a);
        $a[0].click();
        $a.remove();
      } else {
        scope.triggerScroll(id);
      }
    });
    // 滚动事件
    $(window).on("scroll", scope.handleScrollEvent.bind(scope));
  };
  HomeIndex.prototype.updateLog = function() {
    var tipsIndex = 0;
    $(".cif-header__container--updateLog")
      .find(".content-box-item")
      .each(function (inx, ele) {
        let time = $(ele).find(".conten-item__span").text();
        if (time) {
          $(ele)
            .find(".conten-item__span")
            .text(CifnewsUtil.dateFormat(new Date(time), "MM-dd"));
        }
        $(ele).click(function () {
          HomeIndex.prototype.track(
            {
              business_module: "b50",
              page_type: "p1",
              $title: document.title,
              item_type: "t49",
              item_id:
                window.cifnewsSpm &&
                window.cifnewsSpm.runTime.meta.item_id.slice(1),
              $element_name: "更新记录"
            },
            "click"
          );
        });
      });

    $(".cif-header__container--updateLog .hover-box").show();
    // 提示
    $(".cif-header__container--updateLog")
      .find(".content-box-item")
      .each(function (inx, ele) {
        let title = $(ele).find(".expanding-item__title--span").text();
        let titleWidth = $(ele)
          .find(".expanding-item__title--span")
          .outerHeight();
        console.log("titleWidth", titleWidth);
        if (titleWidth > 42) {
          $(ele).hover(
            function () {
              tipsIndex = layer.tips(title, $(ele)[0], {
                tips: 4,
                area: ["258px", "auto"]
              });
            },
            function () {
              layer.close(tipsIndex);
            }
          );
        }
      });
    var hideTimer = setTimeout(function () {
      $(".cif-header__container--updateLog .hover-box").hide();
    }, 5000);
    $(".cif-header__container--updateLog").mouseenter(function () {
      clearTimeout(hideTimer);
    });
    $(".cif-header__container--updateLog").mouseleave(function () {
      $(this).find(".hover-box").hide();
    });
    $(".cif-header__container--updateLog").mouseenter(function () {
      $(".cif-header__container--updateLog .hover-box").show();
    });
  };

  (function() {
    
    // 调整富文本中的表格大小
    function adjustEditorTable() {
      $('.cif-main table').each((_, item) => {
        let $item = $(item);
        if($item.parent().width() < $item.width()) {
          $item.parent().addClass('w-full').addClass('overflow-x-scroll');
        }
      })
    }

    // 调整富文本的下划线
    function adjustEditorBorder() {
      $('.act-module__body a').each((_, ele) => {
        $(ele)[0].style.backgroundImage = '';
        $(ele)[0].style.borderBottom = '1px dashed';
        $(ele)[0].style.paddingBottom = '1px';
        $(ele)[0].style.textDecoration = 'none';
        
        if ( $(ele).find('span').length !== 0) {
            const color = $(ele).find('span')[0].style.color;
            $(ele).find('span')[0].style.borderBottom = 'none'
            $(ele)[0].style.borderBottom = '1px dashed ' + color;
        }
      })
    }

    // 宽度已经手动设置width = 100%了，高度也要调整
    function adjustImg() {
      $('img').each((_, item) => {
        const $item = $(item);
        const parentEle = $item.parent()[0];
        if ($item.attr('align') && parentEle.tagName === 'SPAN') {
          $item.parent().addClass('clear');
        }
      })
    }

    adjustEditorTable();
    adjustEditorBorder();
    $('img.logo').hide();
    adjustImg()

    function handleCollectionTip() {
      const isShowCollectionTip = localStorage.getItem('collectionTip') === 'true';
      // 未登录，并且
      if (!SSOApi.Config.isLogin()) {
        $('.cif-header__container--tips').show();
      } else if(!isShowCollectionTip) {
        $('.cif-header__container--tips').show();
        localStorage.setItem('collectionTip', 'true');
      }
    }
    handleCollectionTip()

    $('#closeCollection').click(function() {
      $('.cif-header__container--tips').hide();
      localStorage.setItem('collectionTip', 'true');
    })

    $('.cif-header__container--left__right-icon').attr('href', location.href)

  })();

  // 神策事件
  HomeIndex.prototype.track = function (property, sensorsType) {
    var propertyStr = "";
    for (var key in property) {
      if (property.hasOwnProperty(key)) {
        var element = property[key];
        propertyStr += key + "=" + element + ";";
      }
    }
    var $triggerDom = $("<div></div>");
    $triggerDom.attr({ "data-fetch-property": propertyStr });
    $("body").append($triggerDom);
    $triggerDom.trigger("action", {
      el: $triggerDom[0],
      event: sensorsType
    });
    $triggerDom.remove();
  };
  window.guide = new HomeIndex();
  guide.init();
});

const Util = (($) => {
  let transition = false;

  const TransitionEndEvent = {
    WebkitTransition: 'webkitTransitionEnd',
    MozTransition: 'transitionend',
    OTransition: 'oTransitionEnd otransitionend',
    transition: 'transitionend'
  };

  function getSpecialTransitionEndEvent() {
    return {
      bindType: transition.end,
      delegateType: transition.end,
      handle(event) {
        if ($(event.target).is(this)) {
          return event.
          handleObj.
          handler.
          apply(this, arguments);
        }
        return undefined;
      }
    };
  }

  function transitionEndTest() {
    if (window.QUnit) {
      return false;
    }

    const el = document.createElement('mm');

    for (const name in TransitionEndEvent) {
      if (el.style[name] !== undefined) {
        return {
          end: TransitionEndEvent[name]
        };
      }
    }

    return false;
  }

  function transitionEndEmulator(duration) {
    let called = false;

    $(this).one(Util.TRANSITION_END, () => {
      called = true;
    });

    setTimeout(() => {
      if (!called) {
        Util.triggerTransitionEnd(this);
      }
    }, duration);

    return this;
  }

  function setTransitionEndSupport() {
    transition = transitionEndTest();
    $.fn.emulateTransitionEnd = transitionEndEmulator;

    if (Util.supportsTransitionEnd()) {
      $.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
    }
  }

  const Util = {
    TRANSITION_END: 'mmTransitionEnd',

    triggerTransitionEnd(element) {
      $(element).trigger(transition.end);
    },

    supportsTransitionEnd() {
      return Boolean(transition);
    }
  };

  setTransitionEndSupport();

  return Util;

})(jQuery);

const MetisMenu = (($) => {

  const NAME = 'metisMenu';
  const DATA_KEY = 'metisMenu';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  const JQUERY_NO_CONFLICT = $.fn[NAME];
  const TRANSITION_DURATION = 350;

  const Default = {
    toggle: true,
    preventDefault: true,
    activeClass: 'active',
    collapseClass: 'collapse',
    collapseInClass: 'in',
    collapsingClass: 'collapsing',
    triggerElement: 'a',
    parentTrigger: 'li',
    subMenu: 'ul'
  };

  const Event = {
    SHOW: `show${EVENT_KEY}`,
    SHOWN: `shown${EVENT_KEY}`,
    HIDE: `hide${EVENT_KEY}`,
    HIDDEN: `hidden${EVENT_KEY}`,
    CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`
  };

  class MetisMenu {
    constructor(element, config) {
      this._element = element;
      this._config = this._getConfig(config);
      this._transitioning = null;

      this.init();
    }
    init() {
      let self = this;

      $(this._element)
        .find(this._config.parentTrigger)
        .has(this._config.subMenu)
        .children(this._config.triggerElement)
        .attr('aria-expanded', false);

      $(this._element)
        .find(this._config.parentTrigger + '.' + this._config.activeClass)
        .has(this._config.subMenu)
        .children(this._config.triggerElement)
        .attr('aria-expanded', true);

      $(this._element)
        .find(this._config.parentTrigger + '.' + this._config.activeClass)
        .has(this._config.subMenu)
        .children(this._config.subMenu)
        .addClass(this._config.collapseClass + ' ' + this._config.collapseInClass);

      $(this._element)
        .find(this._config.parentTrigger)
        .not('.' + this._config.activeClass)
        .has(this._config.subMenu)
        .children(this._config.subMenu)
        .addClass(this._config.collapseClass);

      $(this._element)
        .find(this._config.parentTrigger)
        .children(this._config.triggerElement)
        .on(Event.CLICK_DATA_API, function (e) {
          var _this = $(this);
          var _parent = _this.parent(self._config.parentTrigger);
          var _siblings = _parent.siblings(self._config.parentTrigger).children(self._config.triggerElement);
          var _list = _parent.children(self._config.subMenu);
          if (_list.length && self._config.preventDefault) {
            e.preventDefault();
          }
          if (_this.attr('aria-disabled') === 'true') {
            return;
          }
          if (_parent.hasClass(self._config.activeClass)) {
            if (_list.length) {
              _this.attr('aria-expanded', false);
              self._hide(_list);
            }

          } else {
            if (_list.length) {
              _this.attr('aria-expanded', true);
              self._show(_list);
            } else {
              if (self._config.toggle) {
                var _siblingsSubMenu = _parent.siblings(self._config.parentTrigger + '.' + self._config.activeClass).children(self._config.subMenu);
                self._hide(_siblingsSubMenu);

                _siblings.attr('aria-expanded', false);
              }
            }
          }

          if (self._config.onTransitionStart) {
            self._config.onTransitionStart(e);
          }
        });

    }

    _show(element) {
      if (this._transitioning ||
        $(element).hasClass(this._config.collapsingClass)) {
        return;
      }
      let _this = this;
      let _el = $(element);

      let startEvent = $.Event(Event.SHOW);
      _el.trigger(startEvent);

      if (startEvent.isDefaultPrevented()) {
        return;
      }

      _el
        .parent(this._config.parentTrigger)
        .addClass(this._config.activeClass);


      if (this._config.toggle) {
        this.
        _hide(_el
          .parent(this._config.parentTrigger)
          .siblings()
          .children(this._config.subMenu + '.' + this._config.collapseInClass)
        );
      }

      _el
        .removeClass(this._config.collapseClass)
        .addClass(this._config.collapsingClass)
        .height(0);

      this.setTransitioning(true);

      let complete = function () {

        _el
          .removeClass(_this._config.collapsingClass)
          .addClass(_this._config.collapseClass + ' ' + _this._config.collapseInClass)
          .height('');

        _this.setTransitioning(false);

        _el.trigger(Event.SHOWN);
      };

      if (!Util.supportsTransitionEnd()) {
        complete();
        return;
      }

      _el
        .height(_el[0].scrollHeight)
        .one(Util.TRANSITION_END, complete)
        .emulateTransitionEnd(TRANSITION_DURATION);

    }

    _hide(element) {

      if (this._transitioning || !$(element).hasClass(this._config.collapseInClass)) {
        return;
      }
      let _this = this;
      let _el = $(element);

      let startEvent = $.Event(Event.HIDE);
      _el.trigger(startEvent);

      if (startEvent.isDefaultPrevented()) {
        return;
      }

      _el.parent(this._config.parentTrigger).removeClass(this._config.activeClass);
      _el.height(_el.height())[0].offsetHeight;

      _el
        .addClass(this._config.collapsingClass)
        .removeClass(this._config.collapseClass)
        .removeClass(this._config.collapseInClass);

      this.setTransitioning(true);

      let complete = function () {
        if (_this._transitioning && _this._config.onTransitionEnd) {
          _this._config.onTransitionEnd();
        }

        _this.setTransitioning(false);
        _el.trigger(Event.HIDDEN);

        _el
          .removeClass(_this._config.collapsingClass)
          .addClass(_this._config.collapseClass);
      };

      if (!Util.supportsTransitionEnd()) {
        complete();
        return;
      }

      (_el.height() == 0 || _el.css('display') == 'none') ? complete(): _el
        .height(0)
        .one(Util.TRANSITION_END, complete)
        .emulateTransitionEnd(TRANSITION_DURATION);
    }

    setTransitioning(isTransitioning) {
      this._transitioning = isTransitioning;
    }

    dispose() {
      $.removeData(this._element, DATA_KEY);

      $(this._element)
        //   .find(this._config.parentTrigger)
        //   .has(this._config.subMenu)
        //   .children(this._config.triggerElement)
        .find(this._config.triggerElement)
        .off('click');

      this._transitioning = null;
      this._config = null;
      this._element = null;
    }

    _getConfig(config) {
      config = $.extend({}, Default, config);
      return config;
    }

    static _jQueryInterface(config) {
      return this.each(function () {
        let $this = $(this);
        let data = $this.data(DATA_KEY);
        let _config = $.extend({},
          Default,
          $this.data(),
          typeof config === 'object' && config
        );

        if (!data && /dispose/.test(config)) {
          this.dispose();
        }

        if (!data) {
          data = new MetisMenu(this, _config);
          $this.data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error(`No method named "${config}"`);
          }
          data[config]();
        }
      });
    }
  }
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = MetisMenu._jQueryInterface;
  $.fn[NAME].Constructor = MetisMenu;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return MetisMenu._jQueryInterface;
  };
  return MetisMenu;

})(jQuery);
/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 *
 * Usage:
 *  fk('img').imagePreview();
 */

"use strict";

(function () {
    var fk = function (selector) {
        if (this === undefined) {
            return new $(selector);
        }
        if (selector instanceof Function) {

        } else if (typeof selector === 'string') {
            var createTag;
            if (createTag = selector.match(/<(\w+)>/)) {
                var $dom = document.createElement(createTag[1]);
                return [].push.call(this, $dom);
            } else {
                var $doms = document.querySelectorAll(selector);
                if (selector.indexOf('#') === 0 && $doms.length === 1) {
                    $doms = $doms[0];
                }
                return [].push.apply(this, $doms);
            }
        } else if (selector instanceof HTMLElement) {
            return [].push.call(this, selector);
        }
    };
    window.fk = fk;

    var $ = fk;

    function ImageHelper(selector) {
        if (selector instanceof HTMLElement) {
            this.image = selector
        } else {
            this.image = $(selector)[0];
        }
    }

    Object.defineProperties(ImageHelper.prototype, {
        isPortrait: {
            value: function () {
                var img = this.image;
                return img.naturalHeight > img.naturalWidth;
            }
        },
        resize: {
            value: function (size, prop) {
                var img = this.image;
                var value = size[prop];
                if (prop == 'width') {
                    return img.naturalHeight / img.naturalWidth * value;
                } else {
                    return img.naturalWidth / img.naturalHeight * value;
                }
            }
        }
    });

    function definePrototypeFunctions(obj, functions) {
        for (var name in functions) {
            if (functions.hasOwnProperty(name)) {
                Object.defineProperty(obj.prototype, name, {value: functions[name]});
            }
        }
    }

    fk.extend = function (obj) {
        if (arguments.length === 1) {

        }
        for (var i = 1; i < arguments.length; i++) {
            for (var p in arguments[i]) {
                obj[p] = arguments[i][p];
            }
        }
        return obj;
    };

    fk.prototype.css = function (styles) {
        for (var i = 0; i < this.length; i++) {
            for (var p in styles) {
                if (styles.hasOwnProperty(p)) {
                    this[i].style[cssCamelCase(p)] = cssValue(p, styles[p]);
                }
            }
        }
        return this;
    };

    function cssValue(name, value) {
        switch (name) {
            case 'width':
            case 'height':
            case 'left':
            case 'top':
                return typeof value === 'number' ? value + 'px' : value;
            default:
                return value;
        }
    }

    function cssCamelCase(str) {
        // todo -webkit-transition
        // var words = str.split('-');
        return str.indexOf('-') === -1 ? str : str.replace(/-\w/, function (word) {
            return word.substr(1).toUpperCase();
        });
    }

    fk.prototype.click = function (callback) {
        for (var i = 0; i < this.length; i++) {
            this[i].addEventListener('click', callback);
        }
        return this;
    };

    fk.prototype.data = function (name, value) {
        if (value === undefined) {
            return this[0].dataset[name];
        } else {
            var elem;
            for (var i = 0; i < this.length; i++) {
                elem = this.get(i);
                if (elem.dataset === undefined) elem.dataset = {};
                elem.dataset[name] = value;
            }
            return this;
        }
    };

    fk.prototype.attr = function (name, value) {
        if (value === undefined) {
            return this[0][name];
        } else {
            for (var i = 0; i < this.length; i++) {
                this[i][name] = value;
            }
            return this;
        }
    };

    fk.prototype.appendTo = function (selector) {
        var parent;
        if (typeof selector === 'string') {
            parent = document.querySelector(selector);
        } else if (selector instanceof fk) {
            parent = selector[0];
        } else {
            parent = selector;
        }
        parent.appendChild(this[0]);
        return this;
    };

    fk.prototype.prop = function (name, value) {
        return this.attr(name, value);
    };

    fk.prototype.get = function (index) {
        return this[index];
    };

    fk.prototype.addClass = function (className) {
        for (var i = 0; i < this.length; i++) {
            this[i].className = this[i].className
                    .split(' ')
                    .filter(function (v) {
                        return !!v;
                    })
                    .join(' ') + ' ' + className;
        }
        return this;
    };

    fk.prototype.width = function () {
        return this[0].clientWidth;
    };

    fk.prototype.height = function () {
        return this[0].clientHeight;
    };

    fk.prototype.remove = function () {
        for (var i = 0; i < this.length; i++) {
            this.get(i).remove();
        }
    };

    fk.prototype.paint = function () {
        this[0].clientHeight;
        return this;
    };

    fk.prototype.imagePreview = function (options) {
        options = $.extend({
            animationTime: 300,
            previewOccupies: 0.9
        }, options || {});

        this.css({'cursor': 'zoom-in'});
        this.click(function () {
            var elem = this;
            var data = {};

            var src = $(elem).data('src') ? $(elem).data('src') : $(elem).attr('src');
            var $cover = $('<div>').appendTo('body').css({
                height: '100%',
                width: '100%',
                position: 'fixed',
                top: 0,
                left: 0,
                transition: 'opacity ' + options.animationTime + 'ms linear',
                opacity: 0,
                'z-index': 999,
                'background-color': 'black'
            }).paint();

            var coverSize = {
                width: $cover.width(),
                height: $cover.height()
            };

            var $imgBox = $('<div>').css({display: 'block', position: 'absolute'});
            $('<img>').prop('src', src).css({'width': '100%'}).appendTo($imgBox);
            // Calculate image width, makes sure the preview image is in the container completely
            var size = {width: 0, height: 0};
            (function () {
                if (coverSize.width < elem.naturalWidth || coverSize.height < elem.naturalHeight) {
                    var percent = options.previewOccupies;
                    var helper = new ImageHelper(elem);
                    if (helper.isPortrait()) {
                        size.height = coverSize.height * percent;
                        size.width = helper.resize(size, 'height');
                        // when the image is still wider than container
                        if (coverSize.width < size.width) {
                            size.width = coverSize.width * percent;
                            size.height = helper.resize(size, 'width');
                        }
                    } else {
                        size.width = coverSize.width * percent;
                        size.height = helper.resize(size, 'width');
                        // When the image is still higher than container
                        if (coverSize.height < size.height) {
                            size.height = coverSize.height * percent;
                            size.width = helper.resize(size, 'height');
                        }
                    }
                } else {
                    size = {
                        height: elem.naturalHeight,
                        width: elem.naturalWidth
                    };
                }

                var offset = {
                    left: (coverSize.width - size.width) / 2,
                    top: (coverSize.height - size.height) / 2
                };
                var scale = elem.width / size.width;
                var body = document.body;
                var x = elem.x - body.scrollLeft + elem.width / 2 - offset.left - size.width / 2;
                var y = elem.y - body.scrollTop + elem.height / 2 - offset.top - size.height / 2;

                data.transform = [
                    'scale(' + scale + ')',
                    'translate(' + x / scale + 'px, ' + y / scale + 'px)'
                ].join(' ');

                $imgBox
                    .css(size)
                    .css(offset)
                    .css(uniform('transition', 'transform ' + options.animationTime + 'ms linear'))
                    .css({'transform': data.transform})
            })();

            $('<div>').addClass('close')
                .css({position: 'fixed', left: 0, top: 0, width: '100%', height: '100%'})
                .click(function () {
                    $('body').css({'overflow': 'auto'});
                    $imgBox.css({'transform': data.transform});
                    $cover.css({'opacity': 0});
                    setTimeout(function () {
                        $cover.remove();
                    }, options.animationTime);
                })
                .appendTo($cover);

            $imgBox.appendTo($cover).paint();

            function uniform(property, value) {
                var names = ['-webkit-', ''], css = {}, name;
                for (var i = 0; i < names.length; i++) {
                    name = names[i];
                    css[name + property] = value
                }
                return css;
            }

            // Animate
            $cover.css({'opacity': 1});
            $imgBox.css({'transform': 'scale(1)'});
            setTimeout(function () {
                $('body').css({'overflow': 'hidden'});
            }, options.animationTime);
        });
    };

})();

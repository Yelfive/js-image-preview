/**
 * Created by felix on 16/6/30.
 * Usage:
 *  $('img').imagePreview();
 */

+(function ($) {
    if (typeof $ === 'undefined') {
        console.error('This is jQuery based, please load jQuery first.');
        return;
    }

    function log() {
        console.log.apply(console, arguments);
    }

    /**
     * - fn.func
     * - $('<tag>') Create tag
     * - $.fn.data
     * - $.fn.attr
     * - $.fn.appendTo
     * - $.fn.css
     * - $.fn.addClass
     * - $.fn.prop
     * - $.fn.text
     * - $.fn.width
     * - $.fn.height
     *
     */
    var helper = {
        image: {
            img: null,
            set: function (img) {
                if (!(img instanceof HTMLImageElement)) {
                    throw new Error('Param img should be instanceof HTMLImageElement');
                }
                this.img = img;
                return this;
            },
            isPortrait: function () {
                var img = this.img;
                return img.naturalHeight > img.naturalWidth;
            },
            resize: function (size, prop) {
                var img = this.img;
                var value = size[prop];
                if (prop == 'width') {
                    return img.naturalHeight / img.naturalWidth * value;
                } else {
                    return img.naturalWidth / img.naturalHeight * value;
                }
            }
        }
    };
    $(function () {
        $.fn.imagePreview = function (options) {
            options = options || {};
            $.extend(options, {
                renderTime: 0.3
            });
            console.log(options);
            this.css({'cursor': 'zoom-in'});
            this.click(function () {
                var elem = this;

                var src = $(elem).data('src') ? $(elem).data('src') : $(elem).attr('src');
                var $cover = $('<div>').appendTo('body').css({
                    height: '100%',
                    width: '100%',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    'z-index': 999,
                    'background-color': 'black'
                });
                var coverSize = {
                    width: $cover.width(),
                    height: $cover.height()
                };
                $('<div>').addClass('close')
                    .css({position: 'fixed', left: 0, top: 0, width: '100%', height: '100%'})
                    .click(function () {
                        $('body').css({'overflow': 'auto'});
                        $cover.fadeOut('fast', function () {
                            $(this).remove();
                        });
                    })
                    .appendTo($cover);


                var $imgBox = $('<div>').css({display: 'block', 'position': 'absolute'})//.append($img);
                $('<img>').prop('src', src).css({'width': '100%'}).appendTo($imgBox);
                // Calculate image width, makes sure the preview image is in the container completely
                var size = {width: 0, height: 0};
                (function () {
                    if (coverSize.width < elem.naturalWidth || coverSize.height < elem.naturalHeight) {
                        var percent = 0.9;
                        helper.image.set(elem);
                        if (helper.image.isPortrait()) {
                            size.height = coverSize.height * percent;
                            size.width = helper.image.resize(size, 'height');
                            // when the image is still wider than container
                            if (coverSize.width < size.width) {
                                size.width = coverSize.width * percent;
                                size.height = helper.image.resize(size, 'width');
                            }
                        } else {
                            size.width = coverSize.width * percent;
                            size.height = helper.image.resize(size, 'width');
                            // When the image is still higher than container
                            if (coverSize.height < size.height) {
                                size.height = coverSize.height * percent;
                                size.width = helper.image.resize(size, 'height');
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
                    var transform = [
                        'scale(' + scale + ')',
                        'translate(' + x / scale + 'px, ' + y / scale + 'px)'
                    ];
                    $imgBox.css(size).css(offset)
                        .css(uniform('transition', 'transform ' + options.renderTime + 's linear'))
                        .css({'transform': transform.join(' ')});
                })();
                $imgBox.appendTo($cover);

                function uniform(property, value) {
                    var names = ['-webkit-'], css = {}, name;
                    for (var i = 0; i < names.length; i++) {
                        name = names[i];
                        css[name + property] = value
                    }
                    return css;
                }

                // Force to paint
                $imgBox.get(0).clientHeight;
                $imgBox.css({'transform': 'scale(1)'});
                // Transform after paint, animate
                $('body').css({'overflow': 'hidden'});
            });
        };
    });
})(jQuery);

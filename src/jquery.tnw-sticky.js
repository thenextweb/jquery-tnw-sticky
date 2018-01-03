/**
 * TNW Sticky
 * Copyright © 2017, Alexander Griffioen <alexander@thenextweb.com>
 * Published under MIT license.
 */

const pluginName = "tnwSticky"

class TNWSticky {
    constructor(el, options) {
        this.options = $.extend({}, this.defaults, options)
        this.$el = $(el)
        this.init()
    }

    init() {
        this.$content = this.$el.find(`.${this.options.classNameContent}`).first()

        if (window.hasOwnProperty("Modernizr") && Modernizr.csspositionsticky) {
            // Yay, a modern browser! Let CSS do the heavy-lifting.
            this.$content.css({
                "-webkit-position": "sticky",
                "position": "sticky",
                "-webkit-transform": "translate3d(0, 0, 0)",
                "transform": "translate3d(0, 0, 0)"
            })
        } else {
            this.$content.wrap($("<div/>").addClass(this.options.classNameContentWrapper))
            this.$contentWrapper = this.$content.parent()
            this.$contentWrapper.css("width", "100%")
            this.contentHeight = 0
            this.contentTop = 0
            this.isStickable = false
            this.isVisible = false
            this.offset = parseInt(this.$content.css("top"), 10) || 0
            this.top = 0;
            this.tnwStickyEnd = 0
            this.tnwStickyStart = 0

            // Get initial bounds.
            this.updateBounds()

            // Update dimensions every second.
            this.interval = setInterval(this.updateBounds.bind(this), this.options.updateInterval)

            // Handle screen resizes.
            $(window).on("orientationchange resize", this.onResize.bind(this))

            // Handle scrolling.
            $(window).on("scroll:scroll", this.onScroll.bind(this))
        }
    }

    onResize() {
        if (this.interval) {
            clearInterval(this.interval)
        }

        this.$content.css({
            bottom: "auto",
            position: "static"
        })

        setTimeout(this.updateBounds.bind(this), 10)
        this.interval = setInterval(this.updateBounds.bind(this), this.options.updateInterval)
    }

    onScroll(e) {
        if (this.isStickable && this.isVisible) {
            if (e.top > this.tnwStickyStart) {
                // Make tnwSticky
                if ((e.top + this.contentHeight) < this.tnwStickyEnd) {
                    // Stick content to top of screen
                    this.$content.css({
                        bottom: "auto",
                        position: "fixed",
                        top: this.offset + "px"
                    })
                } else {
                    // Stick content to bottom of sidebar
                    this.$content.css({
                        bottom: this.$el.css("padding-bottom"),
                        position: "absolute",
                        top: "auto"
                    })
                }
            } else {
                // Unstick
                this.$content.css({
                    bottom: "auto",
                    position: "static",
                    top: this.offset + "px"
                })
            }
        }
    }

    updateBounds() {
        this.isVisible = this.$el.is(":visible")

        if (this.isVisible) {
            // Set content width
            this.$content.css("width", this.$contentWrapper.width())

            // Get element top
            this.top = this.$el.offset().top

            // Get content height and top
            this.contentHeight = Math.ceil(this.$content.outerHeight(true))
            this.contentTop = this.$contentWrapper.offset().top

            if (this.$content.css("position") !== "absolute") {
                this.offset = parseInt(this.$content.css("top"), 10) || 0
            }

            // Set sticky breakpoints
            this.tnwStickyStart = this.contentTop - this.offset
            this.tnwStickyEnd = (this.top + this.$el.height()) - this.offset

            // Determine if sidebar should get sticky
            this.isStickable = (this.$el.height() - (this.contentTop - this.$el.offset().top)) > this.contentHeight

            // Handle resizing
            $(window).on("orientationchange resize", this.onResize.bind(this))
        }
    }
}

TNWSticky.prototype.defaults = {
    classNameContent: "js-tnwSticky-content",
    classNameContentWrapper: "js-tnwSticky-contentWrapper",
    updateInterval: 1000
}

$.fn[pluginName] = function (options) {
    return this.each(function () {
        let instance = $(this).data(pluginName)

        if (!instance) {
            $(this).data(pluginName, new TNWSticky(this, options))
        } else {
            if (typeof options === "string") {
                instance[options]()
            }
        }
    })
}
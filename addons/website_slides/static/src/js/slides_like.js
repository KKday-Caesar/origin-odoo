odoo.define('website_slides.slides_like', function (require) {
'use strict';

var core = require('web.core');
var publicWidget = require('web.public.widget');
require('website_slides.slides');

var _t = core._t;

var LikeButton = publicWidget.Widget.extend({
    events: {
        'click .o_wslides_like_up': '_onClickUp',
        'click .o_wslides_like_down': '_onClickDown',
    },

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * @private
     * @param {Object} $el
     * @param {String} message
     */
    _popoverAlert: function ($el, message) {
        $el.popover({
            trigger: 'focus',
            placement: 'bottom',
            container: 'body',
            html: true,
            content: function () {
                return message;
            }
        }).popover('show');
    },

    //--------------------------------------------------------------------------
    // Handlers
    //--------------------------------------------------------------------------

    /**
     * @private
     */
    _onClick: function (slideId, voteType) {
        var self = this;
        this._rpc({
            route: '/slides/slide/like',
            params: {
                slide_id: slideId,
                upvote: voteType === 'like',
            },
        }).then(function (data) {
            if (! data.error) {
                self.$el.find('span.o_wslides_like_up span').text(data.likes);
                self.$el.find('span.o_wslides_like_down span').text(data.dislikes);
            } else {
                if (data.error === 'public_user') {
                    self._popoverAlert(self.$el, _.str.sprintf(_t('Please <a href="/web/login?redirect=%s">login</a> to vote this slide'), (document.URL)));
                } else if (data.error === 'vote_done') {
                    self._popoverAlert(self.$el, _t('You have already voted for this slide'));
                } else {
                    self._popoverAlert(self.$el, _t('Unknown error'));
                }
            }
        });
    },

    _onClickUp: function (event) {
        var slideId = $(event.currentTarget).data('slide-id');
        return this._onClick(slideId, 'like');
    },

    _onClickDown: function (event) {
        var slideId = $(event.currentTarget).data('slide-id');
        return this._onClick(slideId, 'dislike');
    },
});

publicWidget.registry.websiteSlidesLike = publicWidget.Widget.extend({
    selector: '#wrapwrap',

    /**
     * @override
     * @param {Object} parent
     */
    start: function () {
        var self = this;
        var defs = [this._super.apply(this, arguments)];
        $('.o_wslides_like').each(function () {
            defs.push(new LikeButton(self).attachTo($(this)));
        });
        return $.when.apply($, defs);
    },
});
});

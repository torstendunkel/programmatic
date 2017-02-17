/* AST v0.5.1 Updated : 2017-01-30 */
!function (e) {
    function t(r) {
        if (n[r])return n[r].exports;
        var a = n[r] = {exports: {}, id: r, loaded: !1};
        return e[r].call(a.exports, a, a.exports, t), a.loaded = !0, a.exports
    }

    var n = {};
    return t.m = e, t.c = n, t.p = "", t(0)
}([function (e, t, n) {
    n(1), n(6), n(14), n(11), n(8), n(5), n(18), n(13), n(9), n(10), n(20), n(7), n(16), n(17), n(15), n(19), n(12), n(2), e.exports = n(3)
}, function (e, t, n) {
    function r(e) {
        if (e.nobid)return this.nobid = !0, this.tagId = e.tag_id, this.auctionId = e.auction_id, this;
        e.ads && e.ads.length > 1;
        var t = e.ads[0];
        this.adType = t.ad_type, this.buyerMemberId = t.buyer_member_id, this.tagId = e.tag_id, this.auctionId = e.auction_id, this.source = t.content_source, this.cpm = t.cpm, this.creativeId = t.creative_id;
        var n, r, o = a(i(e.uuid));
        if (s.isArray(o) && o[0] && (n = o[0].height, r = o[0].width), t.rtb && t.rtb.banner) this.banner = {
            width: t.rtb.banner.width,
            height: t.rtb.banner.height,
            content: t.rtb.banner.content,
            trackers: t.rtb.trackers
        }, n = t.rtb.banner.height, r = t.rtb.banner.width; else if (t.rtb && t.rtb.video) {
            var u = t.rtb.video;
            this.video = {
                duration: u.duration_ms,
                playbackMethods: u.playback_methods,
                frameworks: u.frameworks,
                content: u.content,
                trackers: t.rtb.trackers
            }
        } else if (t.rtb && t.rtb[d.MEDIA_TYPE.NATIVE]) {
            var l = t.rtb[d.MEDIA_TYPE.NATIVE][d.MEDIA_TYPE.NATIVE][0];
            this[d.MEDIA_TYPE.NATIVE] = {
                type: l.type,
                title: l.title,
                description: l.description,
                fullText: l.fullText,
                iconImgUrl: l.icon_img_url,
                mainMedia: l.main_media,
                cta: l.cta,
                sponsoredBy: l.sponsored_by,
                impressionTrackers: l.impression_trackers,
                clickTrackers: l.click_trackers,
                rating: l.rating,
                clickUrl: l.click_url,
                clickFallbackUrl: l.click_fallback_url,
                custom: l.custom
            }
        }
        this.height = n, this.width = r
    }

    function a(e) {
        var t = [];
        return s.isEmpty(e.sizes) || (t = o.getSizes(e.sizes)), t
    }

    function i(e) {
        var t = {};
        return s._each(apntag.requests.tags, function (n) {
            e === n.uuid && (t = n)
        }), t
    }

    var o = n(2), s = n(3), d = n(4), u = {}, l = function (e) {
        return new r(e)
    };
    t.getAdObj = function (e) {
        if (!e || !e.uuid)return {};
        if (u[e.uuid])return u[e.uuid];
        try {
            var t = l(e);
            return u[e.uuid] = t, t
        } catch (n) {
            s.logError("adManager.getAdObj: Error trying to instantiate new adObj: " + n.message)
        }
    }, t.getAdErrorObj = function (e, t, n, r) {
        return {code: r, errMessage: e || n.message, exception: n, targetId: t}
    }
}, function (e, t, n) {
    function r(e, t, n) {
        var r = {};
        return apntag.debug && !i.isEmpty(t) && (r.enabled = !0, e ? r.member_id = Number(e) : "", t ? r.dongle = String(t) : "", n ? r.bidder_id = Number(n) : "", r.debug_timeout = 1e3), apntag.test && (r.test = apntag.test), r
    }

    function a(e) {
        var t = [];
        return i._each(e, function (e, n) {
            if (i.isArray(e)) {
                var r = [];
                i._each(e, function (e) {
                    e = i.getValueString("keywords." + n, e), e && r.push(e)
                }), e = r
            } else {
                if (e = i.getValueString("keywords." + n, e), !i.isStr(e))return;
                e = [e]
            }
            var a = {key: n, value: e};
            t.push(a)
        }), t
    }

    var i = n(3), o = n(4), s = n(5), d = o.TYPE.STRING, u = o.TYPE.NUM, l = o.TYPE.BOOL, g = t, c = o.DEBUG.AST_DONGLE, f = o.DEBUG.AST_TEST, p = o.DEBUG.AST_DEBUG_MEMBER, m = o.DEBUG.AST_DEBUG_BIDDER, E = function (e) {
        var t = {}, n = e.site;
        return i.isEmpty(n) || i.isEmpty(n.id) || (t.id = n.id), t
    }, v = function (e) {
        var t = {}, n = e.app;
        return i.isEmpty(n) || i.isEmpty(n.appid) || (t.appid = n.appid), t
    }, h = function (e) {
        var t = {}, n = e.device;
        if (!i.isEmpty(n)) {
            i.isEmpty(n.useragent) || (t.useragent = n.useragent), i.isEmpty(n.geo) || (t.geo = n.geo), i.isEmpty(n.ip) || (t.ip = n.ip), i.isEmpty(n.deviceType) || (t.devicetype = n.deviceType), i.isEmpty(n.make) || (t.make = n.make), i.isEmpty(n.model) || (t.model = n.model), i.isEmpty(n.os) || (t.os = n.os), i.isEmpty(n.osVersion) || (t.os_version = n.osVersion), i.isEmpty(n.carrier) || (t.carrier = n.carrier);
            var r = i.getValueAsType("device.connectionType", n.connectionType, u);
            t.connectiontype = r, i.isEmpty(n.mcc) || (t.mcc = n.mcc), i.isEmpty(n.mnc) || (t.mnc = n.mnc), i.isEmpty(n.lmt) || (t.lmt = n.lmt), i.isEmpty(n.deviceId) || (t.device_id = n.deviceId);
            var a = i.getValueAsType("device.devTime", n.devTime, u);
            t.devtime = a
        }
        return t
    };
    g.createPageUser = function (e) {
        var t = {};
        if (!i.isEmpty(e)) {
            e.externalUid && i.isStr(e.externalUid) && (t.external_uid = e.externalUid), i.isEmpty(e.segments) || (t.segments = e.segments);
            var n = i.getValueAsType("user.age", e.age, u);
            t.age = n;
            var r = i.getValueAsType("user.gender", e.gender, u);
            t.gender = r;
            var a = i.getValueAsType("user.language", e.language, d);
            t.language = a;
            var o = i.getValueAsType("user.dnt", e.dnt, l);
            t.dnt = o
        }
        return t
    }, g.createTag = function (e) {
        var t = {};
        if (e.uuid = i.getUUID(), !i.isEmpty(e.sizes)) {
            var n = this.getSizes(e.sizes);
            i.isEmpty(n) || (t.sizes = n, t.primary_size = n[0])
        }
        if (!i.isEmpty(e.privateSizes)) {
            var r = this.getSizes(e.privateSizes);
            i.isEmpty(r) || (t.private_sizes = r)
        }
        if (e.supplyType && i.isStr(e.supplyType) && (t.supply_type = e.supplyType), e.pubClick && i.isStr(e.pubClick) && (t.pubclick = e.pubClick), e.pubClickEnc && i.isStr(e.pubClickEnc) && (t.pubclickenc = e.pubClickEnc), e.reserve && (i.isNumber(e.reserve) || i.isArray(e.reserve)) && (t.reserve = e.reserve), e.extInvCode && i.isStr(e.extInvCode) && (t.ext_inv_code = e.extInvCode), t.uuid = e.uuid, e.tagId && (t.id = e.tagId), e.formats && (t.formats = e.formats), e.position && ("above" === e.position ? t.position = 1 : "below" === e.position ? t.position = 2 : t.position = 0), e.invCode && (t.code = e.invCode), e.prebid && (t.prebid = e.prebid), e.externalImpId && (t.external_imp_id = e.externalImpId), e.allowSmallerSizes === !0 ? t.allow_smaller_sizes = !0 : t.allow_smaller_sizes = !1, e.disablePsa === !0 && (t.disable_psa = !0), e.allowedFormats && (t.ad_types = e.allowedFormats), !i.isEmpty(e.video)) {
            var o = e.video, s = {};
            o.id && (s.id = o.id), i.isEmpty(o.mimes) || (s.mimes = o.mimes), o.maxDuration && (s.maxduration = o.maxDuration), o.minDuration && (s.minduration = o.minDuration), o.startDelay && (s.startdelay = o.startDelay), o.skippable && (s.skippable = o.skippable), i.isEmpty(o.playbackMethod) || (s.playback_method = o.playbackMethod), i.isEmpty(o.frameworks) || (s.frameworks = o.frameworks), t.video = s
        }
        if (!i.isEmpty(e.keywords)) {
            var d = a(e.keywords);
            t.keywords = d
        }
        if (e.forceCreativeId) {
            var u = Number(e.forceCreativeId);
            isNaN(u) ? i.logError("Force Creative must be a number") : (t.force_creative_id = u, i.logMessage("Force Creative in use for targetId: " + e.targetId))
        }
        return e.nobidIfUnsold && (t.nobid_if_unsold = !0), e.trafficSourceCode && (t.traffic_source_code = e.trafficSourceCode.toString()), t
    }, g.getSizes = function (e) {
        var t = [], n = {};
        if (i.isArray(e) && 2 === e.length && !i.isArray(e[0])) n.width = parseInt(e[0], 10), n.height = parseInt(e[1], 10), t.push(n); else if ("object" == typeof e)for (var r = 0; r < e.length; r++) {
            var a = e[r];
            n = {}, n.width = parseInt(a[0], 10), n.height = parseInt(a[1], 10), t.push(n)
        }
        return t
    }, g.buildRequestJsonByMemberId = function (e, t, n) {
        var o = {};
        e.disablePsa && i._each(e.tags, function (e) {
            e.disablePsa = !0
        });
        var d = [], u = 0;
        i._each(e.tags, function (e) {
            if (!e.utCalled && e.member === t) {
                var n = g.createTag(e);
                e.utCalled = !0, e.tagNumber = u, u++, d.push(n)
            }
        }), s.build(e.tags, d, n), o.tags = d, o.uuid = i.getUUID(), o.member_id = t;
        var l = null;
        i.isEmpty(e.keywords) ? i.isEmpty(e.targetingParams) || (l = a(e.targetingParams), o.keywords = l) : (l = a(e.keywords), o.keywords = l), i.isEmpty(e.user) || (o.user = this.createPageUser(e.user)), i.isEmpty(e.device) || (o.device = h(e)), i.isEmpty(e.app) || (o.app = v(e)), i.isEmpty(e.site) || (o.site = E(e)), o.tags = d;
        var y = i.getParameterByName(c);
        y && "" !== y && (apntag.dongle = y);
        var b = i.getParameterByName(p);
        b && "" !== b && (apntag.debug_member = b);
        var I = i.getParameterByName(m);
        I && "" !== I && (apntag.debug_bidder = I);
        var w = "TRUE" === i.getParameterByName(f).toUpperCase();
        if (w && "" !== w && (apntag.test = w), apntag.test || apntag.debug && !i.isEmpty(apntag.dongle)) {
            var T = "";
            apntag.debug_member && (T = apntag.debug_member);
            var A = r(T, apntag.dongle, apntag.debug_bidder);
            o.debug = A
        }
        return o
    }
}, function (e, t, n) {
    function r() {
        return !(typeof $sf === f || !$sf.ext.debug)
    }

    var a = n(4), i = a.TYPE.ARRAY, o = a.TYPE.STRING, s = a.TYPE.FUNC, d = a.TYPE.NUM, u = a.TYPE.OBJ, l = Object.prototype.hasOwnProperty, g = !1, c = a.DEBUG.DEBUG_MODE, f = a.OBJECT_TYPE.UNDEFINED, p = a.CONTENT_SOURCE.RTB, m = a.CONTENT_SOURCE.CSM, E = a.CONTENT_SOURCE.SSM, v = null;
    try {
        v = "object" == typeof console.info ? console.info : console.info.bind(window.console)
    } catch (h) {
    }
    t.addEventHandler = function (e, t, n, r) {
        e.addEventListener ? e.addEventListener(t, n, r) : e.attachEvent && e.attachEvent("on" + t, n)
    }, t.isA = function (e, t) {
        return Object.prototype.toString.call(e) === "[object " + t + "]"
    }, t.isObj = function (e) {
        return this.isA(e, u)
    }, t.isFn = function (e) {
        return this.isA(e, s)
    }, t.isStr = function (e) {
        return this.isA(e, o)
    }, t.isArray = function (e) {
        return this.isA(e, i)
    }, t.isNumber = function (e) {
        return this.isA(e, d)
    }, t.isEmpty = function (e) {
        if (!e)return !0;
        if (this.isArray(e) || this.isStr(e))return !(e.length > 0);
        for (var t in e)if (l.call(e, t))return !1;
        return !0
    }, t.logMessage = function (e) {
        var t = b();
        if (this.debugTurnedOn() && y()) {
            var n = r() ? "SAFEFRAME MESSAGE: " : "MESSAGE: ";
            console.log(t + n + e)
        }
    }, t.logWarn = function (e) {
        var t = b();
        if (this.debugTurnedOn() && y()) {
            var n = r() ? "SAFEFRAME WARN: " : "WARN: ";
            console.warn ? console.warn(t + n + e) : console.log(t + n + e)
        }
    }, t.logError = function (e, t) {
        var n = t || "GENERAL_ERROR", a = b();
        if (this.debugTurnedOn() && y()) {
            var i = r() ? "SAFEFRAME " : "";
            console.error ? console.error(a + i + n + ": " + e) : console.log(a + i + n + ": " + e)
        }
    }, t.logTimestamp = function (e) {
        this.debugTurnedOn() && y() && console.timeStamp && console.timeStamp(e)
    }, t.logInfo = function (e, t) {
        if (this.debugTurnedOn() && y()) {
            var n = b();
            if (v) {
                t && 0 !== t.length || (t = "");
                var a = r() ? "SAFEFRAME INFO: " : "INFO: ";
                v(n + a + e + ("" === t ? "" : " : params : "), t)
            }
        }
    }, t.loadScript = function (e, t, n) {
        var r = e.document, a = r.createElement("script");
        a.type = "text/javascript", a.async = !0, n && "function" == typeof n && (a.readyState ? a.onreadystatechange = function () {
                "loaded" !== a.readyState && "complete" !== a.readyState || (a.onreadystatechange = null, n())
            } : a.onload = function () {
                n()
            }), a.src = t;
        var i = r.getElementsByTagName("head");
        return i = i.length ? i : r.getElementsByTagName("body"), i.length && (i = i[0], i.insertBefore(a, i.firstChild)), a
    }, t.getUUID = function () {
        var e = (new Date).getTime(), t = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (t) {
            var n = (e + 16 * Math.random()) % 16 | 0;
            return e = Math.floor(e / 16), ("x" === t ? n : 3 & n | 8).toString(16)
        });
        return t
    }, t.loadPixelUrl = function (e, t, n) {
        var r, a = e.document.getElementsByTagName("head");
        if (e && a && t) {
            r = new Image, r.id = n, r.src = t, r.height = 0, r.width = 0, r.style.display = "none", r.onload = function () {
                try {
                    this.parentNode.removeChild(this)
                } catch (e) {
                }
            };
            try {
                a = a.length ? a : e.document.getElementsByTagName("body"), a.length && (a = a[0], a.insertBefore(r, a.firstChild))
            } catch (i) {
                this.logError("Error logging impression for tag: " + n + " :" + i.message)
            }
        }
    }, t._each = function (e, t) {
        if (!this.isEmpty(e)) {
            if (this.isFn(e.forEach))return e.forEach(t);
            var n = 0, r = e.length;
            if (r > 0)for (; n < r; n++)t(e[n], n, e); else for (n in e)l.call(e, n) && t(e[n], n, e)
        }
    }, t.contains = function (e, t) {
        if (this.isEmpty(e))return !1;
        for (var n = e.length; n--;)if (e[n] === t)return !0;
        return !1
    };
    var y = function () {
        return window.console && window.console.log
    };
    t.debugTurnedOn = function () {
        return !!r() || (this.getWindow().apntag = this.getWindow().apntag || {}, apntag && apntag.debug === !1 && g === !1 && (apntag.debug = "TRUE" === this.getParameterByName(c).toUpperCase(), g = !0), !(!apntag || !apntag.debug))
    }, t.stringContains = function (e, t) {
        return !!e && e.indexOf(t) !== -1
    }, t.getSearchQuery = function () {
        try {
            return window.top.location.search
        } catch (e) {
            try {
                return window.location.search
            } catch (e) {
                return ""
            }
        }
    }, t.getParameterByName = function (e, t) {
        var n = "[\\?&]" + e + "=([^&#]*)", r = new RegExp(n), a = r.exec(t || this.getSearchQuery());
        return null === a ? "" : decodeURIComponent(a[1].replace(/\+/g, " "))
    }, t.hasOwn = function (e, t) {
        return e.hasOwnProperty ? e.hasOwnProperty(t) : typeof e[t] !== f && e.constructor.prototype[t] !== e[t]
    };
    var b = function () {
        var e = new Date, t = "[" + e.getHours() + ":" + e.getMinutes() + ":" + e.getSeconds() + ":" + e.getMilliseconds() + "] ";
        return t
    };
    t.getTargetArrayforRefresh = function (e) {
        var t = [];
        return this.isArray(e) ? t = e : this.isStr(e) && t.push(e), t
    }, t._map = function (e, t) {
        if (this.isEmpty(e))return [];
        if (this.isFn(e.map))return e.map(t);
        var n = [];
        return this._each(e, function (r, a) {
            n.push(t(r, a, e))
        }), n
    }, t.getValueString = function (e, t, n) {
        return void 0 === t || null === t ? n : this.isStr(t) ? t : this.isNumber(t) ? t.toString() : void this.logWarn("Unsuported type for param: " + e + " required type: String")
    }, t.getValueAsType = function (e, t, n, r) {
        return void 0 === t || null === t ? r : this.isA(t, n) ? t : (this.logWarn("Unsuported type for param: " + e + " required type: " + n), n === d && (t = Number(t)), isNaN(t) ? r : t)
    }, t.getWindow = function () {
        return window
    }, t.getAdObjFromAdsArray = function (e) {
        if (e && e.length > 0) {
            if (e[0][p])return e[0][p];
            if (e[0][m])return e[0][m];
            if (e[0][E])return e[0][E]
        }
    }, t.cloneAsObject = function (e) {
        if (null === e || !(e instanceof Object))return e;
        var t = e instanceof Array ? [] : {};
        for (var n in e)t[n] = this.cloneAsObject(e[n]);
        return t
    }
}, function (e, t) {
    e.exports = {
        PREFIX: {UT_IFRAME: "utif_", UT_DIV: "div_utif_"},
        LOG: {WARN: "WARN"},
        DEBUG: {
            DEBUG_MODE: "ast_debug",
            AST_DONGLE: "ast_dongle",
            AST_DEBUG_MEMBER: "ast_debug_member",
            AST_DEBUG_BIDDER: "ast_debug_bidder",
            AST_TEST: "ast_test",
            AST_OVERRIDE: {BASE: "ast_override_", DIV: "div", INDEX: "index", TAG_ID: "tag_id", INV_CODE: "inv_code"}
        },
        OBJECT_TYPE: {UNDEFINED: "undefined", OBJECT: "object", STRING: "string", NUMBER: "number"},
        BROWSER_TYPE: {IE: "msie", OPERA: "opera"},
        RENDERER_EVENTS: {LOADED: "loaded", IMPRESSION: "impression"},
        ENDPOINT: {UT_BASE: "/ut/v2", IMPBUS: "ib.adnxs.com", UT_PREBID: "/ut/v2/prebid"},
        UT_RESPONSE_PROP: {
            MEDIA_TYPE: "media_type",
            CREATIVE_ID: "creative_id",
            AD_TYPE: "ad_type",
            BANNER: "banner",
            VIDEO: "video",
            CONTENT: "content",
            UUID: "uuid"
        },
        MEDIA_TYPE: {BANNER: "banner", NATIVE: "native", VIDEO: "video"},
        AD: {
            CREATIVE_ID: "creative_id",
            NOTIFY: "notify_url",
            NOAD: "no_ad_url",
            IMP_URLS: "impression_urls",
            TRACKERS: "trackers"
        },
        CONTENT_SOURCE: {RTB: "rtb", CSM: "csm", SSM: "ssm"},
        AD_TYPE: {BANNER: "banner", NATIVE: "native", VIDEO: "video"},
        EXTERNAL_LIB: {
            VIDEO_MEDIATION_JS: "https://acdn.adnxs.com/video/astMediation/AstMediationManager.js",
            BANNER_MEDIATION_JS: "https://acdn.adnxs.com/mediation/v2/mediation.js",
            SAFE_FRAME_URL: "//acdn.adnxs.com/ast/safeframe/1-0-0/html/safeframe-v2.html",
            CDN_ORIGIN: "http://acdn.adnxs.com"
        },
        EVENTS: {
            REQUEST: "adRequested",
            AVAILABLE: "adAvailable",
            LOADED: "adLoaded",
            REQUEST_FAIL: "adRequestFailure",
            NO_BID: "adNoBid",
            DEFAULT: "adDefault",
            ERROR: "adError",
            COLLAPSE: "adCollapse",
            BAD_REQUEST: "adBadRequest"
        },
        TYPE: {ARRAY: "Array", STRING: "String", FUNC: "Function", NUM: "Number", OBJ: "Object", BOOL: "Boolean"},
        SAFEFRAME: {
            DEFAULT_ZINDEX: 3e3,
            STATUS: {READY: "ready", NOTIFY_EXPANDED: "expanded", NOTIFY_COLLAPSED: "collapsed", NOTIFY_ERROR: "error"}
        }
    }
}, function (e, t, n) {
    function r(e) {
        return o.getParameterByName(e, d.queryString)
    }

    function a(e, t) {
        var n = null;
        return o._each(t, function (t) {
            t.uuid === e.uuid && (n = t.targetId)
        }), n
    }

    function i(e, t, n) {
        var r = Number(t);
        if (isNaN(r)) o.logError("Force Creative must be a number"); else {
            e[h] = r, apntag.test = !0;
            var i = a(e, n);
            o.logMessage("Force Creative in use for targetId: " + i)
        }
    }

    var o = n(3), s = n(4), d = t, u = [], l = s.DEBUG.AST_OVERRIDE, g = l.BASE, c = g + l.DIV, f = g + l.INDEX, p = g + l.TAG_ID, m = g + l.INV_CODE, E = ",", v = ":", h = "force_creative_id";
    d.queryString = void 0, d.build = function (e, t, n) {
        if (o.stringContains(d.queryString || o.getSearchQuery(), g)) {
            if (!o.isEmpty(r(f))) {
                u = r(f).split(E);
                for (var a = 0; a < u.length; a++) {
                    var s = u[a].split(v), l = Number(s[0]);
                    if (isNaN(l) || void 0 === t[l]) o.logError("Invalid ast_override value for index : " + l); else {
                        for (var h = null, y = null, b = 0; b < n.length; b++)b === l && (y = n[b].uuid);
                        for (var I = 0; I < t.length; I++)t[I].uuid === y && i(t[I], s[1], e)
                    }
                }
            }
            if (!o.isEmpty(r(c))) {
                u = r(c).split(E);
                for (var a = 0; a < u.length; a++) {
                    var s = u[a].split(v), w = null;
                    if (o._each(e, function (e, t) {
                            t === s[0] && (w = e.uuid)
                        }), w)for (var T = 0; T < t.length; T++)t[T].uuid === w && i(t[T], s[1], e); else o.logError("Invalid ast_override value for target div id : " + s[0])
                }
            }
            if (!o.isEmpty(r(p))) {
                u = r(p).split(E);
                for (var a = 0; a < u.length; a++) {
                    for (var s = u[a].split(v), A = !1, T = 0; T < t.length; T++) {
                        var h = t[T];
                        h.id === Number(s[0]) && (i(h, s[1], e), A = !0)
                    }
                    A || o.logError("Invalid ast_override value for tag id : " + s[0])
                }
            }
            if (!o.isEmpty(r(m))) {
                u = r(m).split(E);
                for (var a = 0; a < u.length; a++) {
                    for (var s = u[a].split(v), _ = !1, T = 0; T < t.length; T++) {
                        var h = t[T];
                        h.code === s[0] && (i(h, s[1], e), _ = !0)
                    }
                    _ || o.logError("Invalid ast_override value for invCode : " + s[0])
                }
            }
            return t
        }
    }
}, function (e, t, n) {
    function r(e) {
        e ? (w = T.stringContains(e, "http") ? e : "https:" + "//" + e, T.logMessage("Setting endpoint to: " + w)) : T.logError("Cannot set an empty endpoint")
    }

    function a(e) {
        G[e.targetId] = ve(e)
    }

    function i(e) {
        var t = Ae(e);
        return t
    }

    function o(e) {
        return T.logMessage("getTag called for tag " + e), xe(e) ? e && z[e] ? z[e] : void 0 : void T.logError("the " + e + " tag is not defined.", _.LOG.WARN)
    }

    function s(e) {
        var t = "defaultKey";
        return e.targetId && (t = e.targetId), t
    }

    function d(e, t) {
        T.logMessage("showTag called for " + e), Y[e] = !0;
        var n = xe(e);
        if (n) {
            var r = fe.requests.tags[e];
            if (r.showTagCalled = !0, r.curWindow = t, r.displayed)return void T.logWarn("Attempting to display ad that is already displayed, will not render this ad again: " + e);
            fe.requests.utCalled ? r.adResponse ? (E(r), fe.requests.hasLeft && qe()) : fe.requests.checkDisplay = !0 : T.logWarn(e + " : showTag() called before ad request was made. This placement might not display if a subsequent loadTags() call is not made")
        } else T.logMessage("the " + e + " tag was loaded before the ad placement was available.", _.LOG.WARN)
    }

    function u(e, t) {
        var n = t, r = s(e);
        n || (n = G[r]);
        var a = null;
        if (!n)return void T.logError("Issue writing iframe into document. No ad available to render");
        try {
            a = JSON.parse(n)
        } catch (i) {
            return void T.logError("Issue writing iframe into document :" + i.message)
        }
        if (a && a.tags) {
            var o = a.tags[0];
            if (!o)return void T.logError("Issue writing iframe into document. No ad available to render");
            var d = o.ad;
            if (d && d.banner && d.banner.content)try {
                var u = '<div style="border-style: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);">' + d.banner.content + "</div>";
                window.document.write(u), T.loadPixelUrl(ge, d[ne], T.getUUID()), T.logTimestamp("Ad is loaded")
            } catch (i) {
                T.logError("Issue writing iframe into document :" + i.message)
            }
            d && d.video && d.video.content && (T.loadPixelUrl(ge, d[ne], T.getUUID()), x.pcLoadVideo(d.video.content))
        }
    }

    function l(e, t, n, r, a) {
        T._each(V[t], function (t) {
            g(e, t, n, r, a)
        })
    }

    function g(e, t, n, r, a) {
        0 === n && (e = "Failure to contact endpoint. This can be caused by invalid CORS headers or failure of server to respond.");
        var i = fe.requests.tags[t];
        if (i)var o = R.getAdObj(i.adResponse);
        var s = R.getAdErrorObj(e, t, a, n);
        A.emit(r, t, s, o)
    }

    function c(e, t, n) {
        T.logMessage("renderAd is called"), T._each(fe.requests.tags, function (e) {
            e.uuid === t && (e.adResponse = n, E(e))
        })
    }

    function f(e) {
    }

    function p(e) {
        var t = null;
        if (fe.requests.cbCalled = !0, typeof e === se || null === e || e.error) {
            var n = "malformed response from ad server";
            return e && e.error && (n = e.error), T.logError("Error response from impbus: " + n), void T._each(fe.requests.tags, function (e, t) {
                var r = R.getAdErrorObj(n, t, void 0, 200);
                if (e)var a = R.getAdObj(e.adResponse);
                A.emit(_.EVENTS.BAD_REQUEST, t, r, a)
            })
        }
        e.debug && e.debug.debug_info && N.load(e.debug.debug_info), T._each(e.tags, function (e) {
            if (e.error)return void T._each(fe.requests.tags, function (t) {
                if (t.uuid === e.uuid) {
                    var n = "There was an exception from targetId:" + t.targetId + " this usually means there is a setup error on the tag (invalid ID etc)";
                    T.logError(n, e.error);
                    var r = R.getAdErrorObj(n, t.targetId, void 0, 200);
                    A.emit(_.EVENTS.BAD_REQUEST, t.targetId, r)
                }
            });
            var n = e.ads, r = S.checkIfMediatedResponse(n);
            r ? T._each(fe.requests.tags, function (r, a) {
                    if (r.uuid === e.uuid) {
                        r.utCalled = !0, r.isMediated = !0;
                        var i = S.getMediationType(n), o = S.getMediationOptions(fe.requests.tags, e);
                        if (i === $) t = R.getAdObj(e), A.emit(_.EVENTS.AVAILABLE, a, t), S.callMediationFramework(i, e, o, c); else {
                            var s = S.getContentForBannerMediation(r.targetId, e);
                            e.ad = {ad_type: Z}, r.ad = {mediatedContent: s}, m(r, e, a)
                        }
                    }
                }) : T._each(fe.requests.tags, function (t, n) {
                    m(t, e, n)
                })
        }), fe.requests.checkDisplay && qe()
    }

    function m(e, t, n) {
        var r;
        e.uuid === t.uuid && (t.nobid === !0 ? (T.logMessage("No bid for targetId:" + e.targetId), r = R.getAdObj(t), A.emit(_.EVENTS.NO_BID, n, r)) : (e.adResponse = t, e.utCalled = !0, r = R.getAdObj(t), A.emit(_.EVENTS.AVAILABLE, n, r), e.prebid || e.displayed || E(e)))
    }

    function E(e) {
        var t, n, r, a, i = ge, o = e.adResponse;
        if (e.adResponse && e.adResponse.ads) {
            var s = T.getAdObjFromAdsArray(e.adResponse.ads);
            s.banner && (e.initialHeight = s.banner.height, e.initialWidth = s.banner.width)
        }
        if (r = S.getAdObjByMediation(e), null === r || typeof r.error !== se)return void b(o);
        if (typeof o !== se && e.showTagCalled) {
            if (o && r.renderer_url && r.renderer_id) {
                var d = r.renderer_id, u = S.getContentSourceForMediation(r);
                if (typeof u === se)return void T.logError("No Content Source Found");
                if (r[r.ad_type] = u, U[d]) {
                    var l = U[d];
                    T.isFn(l) || T.isObj(l) ? (y(e), S.copyAdObjforMediation(e), D.invokeRendererRenderAd(l, e, v), e.displayed = !0, a = R.getAdObj(e.adResponse), A.emit(_.EVENTS.LOADED, e.targetId, a), T.logTimestamp("The " + e.targetId + " ad is loaded.")) : (B[d] = typeof B[d] === se ? [] : B[d], B[d].push(e))
                } else T.loadScript(ge, r.renderer_url), B[d] = typeof B[d] === se ? [] : B[d], B[d].push(e), U[d] = !0
            } else if (r[Q] === K) T.logMessage("Render for the following ad should be handled outside of ast.js :" + e.tagId), e.displayed = !0, a = R.getAdObj(e.adResponse), A.emit(_.EVENTS.LOADED, e.targetId, a), T.logTimestamp("The " + e.targetId + " ad is loaded."); else {
                if (r[Q] === $)return void T.logWarn("Response has no renderer for video");
                if (r[Q] === Z) {
                    if (!e.isMediated) {
                        var g = r[re][ee];
                        if (T.isEmpty(g) || typeof g !== de)return void T.logError("Response has no banner object");
                        if (!T.hasOwn(g, te))return void T.logError("Response has no banner content");
                        if (!T.hasOwn(g, "width"))return void T.logError("Response has no banner width");
                        if (!T.hasOwn(g, "height"))return void T.logError("Response has no banner height")
                    }
                    if (T.hasOwn(J, e.targetId))var c = J[e.targetId];
                    if (e.alwaysUseXDomainIframe || e.enableSafeFrame) {
                        var f = i.document.getElementById(e.targetId), p = f.style.height, m = f.style.width;
                        f.style.height = e.initialHeight, f.style.width = e.initialWidth, e.bounds = M.geom(e.targetId), f.style.height = p, f.style.width = m
                    }
                    T.isEmpty(H) || (e.safeframe = H), t = C.getIframe(e);
                    var E = k.getInstance(), h = {};
                    if (h.iframe = t, h.originalWidth = e.initialWidth, h.originalHeight = e.initialHeight, E.add(e.targetId, h), n = we(e), (e.alwaysUseXDomainIframe || e.enableSafeFrame) && (n.style.height = e.initialHeight + "px", n.style.width = e.initialWidth + "px"), J[e.targetId] = t, typeof c !== se && i.document.getElementById(c.id) ? n.replaceChild(t, c) : n.appendChild(t), e.displayed = !0, i.document.body)try {
                        e.showTagCalled && (Te(e, n, t), n.style.display = "inline")
                    } catch (I) {
                        T.logError("Error rendering ad: " + I.message)
                    } else T.logError("Error rendering ad: window.document.body is undefined")
                } else T.logError("Error rendering ad: unknown type")
            }
            F.push(e.targetId)
        }
    }

    function v(e, t, n) {
        if (T.logMessage("handling event for:  " + e + " eventType : " + t), t === _.EVENTS.LOADED) {
            var r = h(e), a = R.getAdObj(r.adResponse);
            A.emit(_.EVENTS.LOADED, e, a)
        } else A.emit(t, e)
    }

    function h(e) {
        var t = {};
        return T._each(fe.requests.tags, function (n) {
            e === n.targetId && (t = n)
        }), t
    }

    function y(e) {
        if (!e || !e.isMediated) {
            var t = S.getAdObjByMediation(e);
            T.loadPixelUrl(ge, t[ne], t[ue])
        }
    }

    function b(e) {
        T.loadPixelUrl(ge, e[ae], e.uuid)
    }

    function I(e) {
        for (var t = e[re][oe][0][ie], n = 0; n < t.length; n++)T.loadPixelUrl(ge, t[n], e[ue])
    }

    n(7);
    var w, T = n(3), A = n(8), _ = n(4), S = (n(9), n(10)), N = n(11), O = n(2), R = n(1), D = n(12), C = n(13), P = n(14), x = n(15), q = (n(16), n(17)), M = n(18), k = n(19), U = {}, B = {}, F = [], L = [], V = {}, j = 0, W = 0, Y = {}, G = {}, J = {}, z = {}, X = [], H = {}, Q = _.UT_RESPONSE_PROP.AD_TYPE, K = _.AD_TYPE.NATIVE, Z = _.AD_TYPE.BANNER, $ = _.AD_TYPE.VIDEO, ee = _.UT_RESPONSE_PROP.BANNER, te = _.UT_RESPONSE_PROP.CONTENT, ne = _.AD.NOTIFY, re = _.CONTENT_SOURCE.RTB, ae = _.AD.NOAD, ie = _.AD.IMP_URLS, oe = _.AD.TRACKERS, se = _.OBJECT_TYPE.UNDEFINED, de = _.OBJECT_TYPE.OBJECT, ue = _.AD.CREATIVE_ID, le = _.OBJECT_TYPE.NUMBER, ge = T.getWindow();
    q.attach(ge, "message", q.handleMessage);
    try {
        console.info ? console.info("AST library loaded: 0.5.1") : console.log("AST library loaded: 0.5.1")
    } catch (ce) {
    }
    ge.apntag = typeof ge.apntag !== se ? ge.apntag : {};
    var fe = ge.apntag;
    fe.anq = fe.anq || [], fe.debug = fe.debug || !1, fe.dongle = fe.dongle || void 0, fe.test = fe.test || !1, fe.loaded = !0, fe.requests = fe.requests || {}, fe.requests.keywords = fe.requests.keywords || {}, r(_.ENDPOINT.IMPBUS), fe.requests.tagsOnPageCount = fe.requests.tagsOnPageCount || j, fe.requests.waitOnTagsCount = fe.requests.waitOnTagsCount || W, fe.requests.showTagDefinedMap = fe.requests.showTagDefinedMap || Y, fe.highlightAd = function (e) {
        if (T.logInfo("Invoking apntag.highlightAd", arguments), e) {
            var t = J[e];
            t && (t.style.border = "3px solid #e67300")
        }
    }, fe.anq.push = function (e) {
        e.call()
    }, fe.setEndpoint = function (e) {
        T.logInfo("Invoking apntag.setEndpoint", arguments), r(e)
    }, fe.setPageOpts = function (e) {
        T.logInfo("Invoking apntag.setPageOpts", arguments), e && (e.member && (fe.requests.member = e.member), e.targetingParams && (fe.requests.targetingParams = e.targetingParams, T.logWarn("targetingParams will be deprecated soon. Please use keywords instead")), e.keywords && (fe.requests.keywords = e.keywords), e.user && (fe.requests.user = e.user), e.app && (fe.requests.app = e.app), e.device && (fe.requests.device = e.device), e.site && (fe.requests.site = e.site), e.disablePsa && (fe.requests.disablePsa = !0), fe.requests.enableSafeFrame = !1, e.enableSafeFrame && (fe.requests.enableSafeFrame = !0))
    }, fe.defineTag = function (e) {
        T.logInfo("Invoking apntag.defineTag", arguments);
        var t = null;
        if (fe.syncLoad ? a(e) : (t = i(e), X.push(t)), z[t.targetId])return z[t.targetId];
        var n = {targetId: t.targetId, on: t.on, off: t.off, modifyTag: t.modifyTag, setKeywords: t.setKeywords};
        return z[t.targetId] = n, n
    }, fe.getAdWrap = function (e) {
        return T.logInfo("Invoking apntag.getAdWrap", arguments), xe(e) ? e && fe.requests.tags && fe.requests.tags[e] && fe.requests.tags[e].adWrap ? fe.requests.tags[e].adWrap : void 0 : void T.logError("the " + e + " tag is not defined.", _.LOG.WARN)
    }, fe.setSizes = function (e, t) {
        return T.logInfo("Invoking apntag.setSizes", arguments), arguments.length < 2 && (t = e, e = this.targetId), xe(e) ? void(fe.requests.tags[e].sizes = t) : void T.logError("the " + e + " tag is not defined.", _.LOG.WARN)
    }, fe.modifyTag = function (e, t) {
        T.logInfo("Invoking apntag.modifyTag", arguments);
        var n = {};
        return arguments.length < 2 && (t = e, e = this.targetId), xe(e) ? (T._each(fe.requests.tags[e], function (e, t) {
                n[t] = e
            }), T._each(t, function (e, t) {
                n[t] = e
            }), void(fe.requests.tags[e] = n)) : void T.logError("the " + e + " tag is not defined.", _.LOG.WARN)
    }, fe.setKeywords = function (e, t) {
        T.logInfo("Invoking apntag.setKeywords", arguments);
        var n = {};
        return arguments.length < 2 && (t = e, e = this.targetId), xe(e) ? (T._each(fe.requests.tags[e], function (e, t) {
                n[t] = e
            }), n.keywords = n.keywords || {}, T._each(t, function (e, t) {
                T.hasOwn(n.keywords, t) ? T.isArray(n.keywords[t]) ? n.keywords[t] = n.keywords[t].concat(e) : n.keywords[t] = [n.keywords[t]].concat(e) : n.keywords[t] = e
            }), void(fe.requests.tags[e] = n)) : void T.logError("the " + e + " tag is not defined.", _.LOG.WARN)
    }, fe.onEvent = function (e, t, n) {
        if (T.logInfo("Invoking apntag.onEvent", arguments), 2 === arguments.length && "function" == typeof t && typeof this.targetId === se) n = t, t = "*"; else if (arguments.length < 3 && (n = t, t = this.targetId, !xe(t)))return void T.logError("the " + t + " tag is not defined.", _.LOG.WARN);
        A.on(e, t, n)
    }, fe.offEvent = function (e, t, n) {
        if (T.logInfo("Invoking apntag.offEvent", arguments), 1 === arguments.length && typeof this.targetId === se) t = "*"; else if (arguments.length < 2 && (t = this.targetId, !xe(t)))return void T.logError("the " + t + " tag is not defined.", _.LOG.WARN);
        if (T.isArray(e))for (var r = 0; r < e.length; r++)A.off(e[r], t, n); else A.off(e, t, n)
    }, fe.loadTags = function () {
        T.logInfo("Invoking apntag.loadTags", arguments), Oe()
    }, fe.refresh = function (e) {
        T.logInfo("Invoking apntag.refresh", arguments), _e(e)
    }, fe.showAdFromURL = function (e) {
        T.logInfo("Invoking apntag.showAdFromURL", arguments);
        var t = ve(e);
        u(e, t)
    }, fe.resizeAd = function (e, t) {
        T.logInfo("Invoking apntag.resizeAd", arguments);
        var n = 0, r = 0;
        T.isArray(t) && 2 === t.length ? (r = t[0], n = t[1]) : T.logError("resizeAd must be invoked with a (targetId,[width, height])");
        var a = J[e];
        if (!a)return void T.logError("Failed to find target for resizeAd : " + e);
        var i = o(e), s = Ie(i), d = ge.document.getElementById(s);
        return d ? (d.style.height = n, d.style.width = r, a.height = n + "px", a.width = r + "px", a.height = n, a.width = r, void T.logMessage("ResizeAd successful for targetId: " + e)) : void T.logError("Failed to find target for resizeAd: " + e)
    }, fe.collapseAd = function (e, t, n) {
        T.logInfo("Invoking apntag.collapseAd", arguments);
        var r, a = 0, i = 0, s = o(e);
        if (!s)return void T.logError("CollapseAd failed to find targetId : " + e);
        r = Ie(s), typeof t === le && (a = t), typeof n === le && (i = n);
        var d = ge.document.getElementById(r);
        if (null === d)return void T.logError("CollapseAd failed to find ad div : " + e);
        fe.resizeAd(e, [i, a]), d.style.height = a, d.style.width = i, d.style.display = "none";
        var u = fe.requests.tags[e], l = R.getAdObj(u.adResponse);
        A.emit(_.EVENTS.COLLAPSE, e, l)
    }, fe.showTag = function (e, t) {
        T.logInfo("Invoking apntag.showTag", arguments), t = t || ge, fe.syncLoad ? u(e) : d(e, t)
    }, fe.setPageTargeting = function (e, t) {
        T.logInfo("Invoking apntag.setPageTargeting", arguments), fe.requests.targetingParams && e && t && (fe.requests.targetingParams[e] = t)
    }, fe.getPageTargeting = function (e) {
        if (T.logInfo("Invoking apntag.getPageTargeting", arguments), fe.requests.targetingParams && e)return fe.requests.targetingParams[e]
    }, fe.clearPageTargeting = function (e) {
        T.logInfo("Invoking apntag.clearPageTargeting", arguments), fe.requests.targetingParams && e && delete fe.requests.targetingParams[e]
    }, fe.enableDebug = function () {
        fe.debug = !0, T.logInfo("Invoking apntag.enableDebug", arguments)
    }, fe.disableDebug = function () {
        T.logInfo("Invoking apntag.disableDebug", arguments), fe.debug = !1
    }, fe.notify = function (e, t, n) {
        if (!e)return void T.logError("apntag.notify must be called with `messageType`");
        var r = D.createNotifyObj(e, t, n);
        L.push(r), T._each(U, function (e) {
            D.invokeNotify(L, e)
        })
    }, fe.registerRenderer = function (e, t) {
        T.logInfo("Invoking apntag.registerRenderer", arguments), e && (T.isFn(t) || T.isObj(t)) ? (U[e] = t, D.invokeNotify(L, t), B[e] && T._each(B[e], function (t) {
                t.displayed || (y(t), S.copyAdObjforMediation(t), D.invokeRendererRenderAd(U[e], t, v), t.displayed = !0)
            })) : T.logError("ast.js", "registerRenderer must be called with (id, cbFn)")
    }, fe.recordErrorEvent = function (e, t) {
        T.logInfo("Invoking apntag.recordErrorEvent", arguments);
        var n = fe.requests.tags[t], r = R.getAdObj(n.adResponse), a = R.getAdErrorObj(e.message, t, e, 200);
        A.emit(_.EVENTS.ERROR, t, a, r)
    };
    var pe = function (e) {
        T._each(fe.requests.tags, function (e) {
            e.utCalled || A.emit(_.EVENTS.REQUEST, e.targetId)
        }), T.logTimestamp("Ad is requested for member " + e)
    };
    fe.clearRequest = function () {
        T.logInfo("Invoking apntag.clearRequest", arguments), fe.requests = {}, fe.requests.tags = {}, Y = {}
    }, fe.handleCb = function (e) {
        T.logInfo("Invoking apntag.handleCb", arguments);
        try {
            p(e)
        } catch (t) {
            var n = t.message ? t.message : t;
            T.logError("Internal AST error : " + n);
            var r = f(e);
            l(n, r, 200, _.EVENTS.BAD_REQUEST, t)
        }
    }, fe.emitEvent = function (e, t, n) {
        T.logInfo("Invoking apntag.emitEvent", arguments), v(e, t, n)
    }, fe.getAdMarkup = function (e, t) {
        if (fe.requests.tags && fe.requests.tags[e]) {
            var n = fe.requests.tags[e];
            if (n.uuid === t)return n.adResponse.ads
        }
    }, fe.setSafeFrameConfig = function (e) {
        H.expansionByPush = !1, H.expansionByOverlay = !0, H.readCookie = !1, H.writeCookie = !1, T.hasOwn(e, "allowExpansionByPush") && (H.expansionByPush = e.allowExpansionByPush), T.hasOwn(e, "allowExpansionByOverlay") && (H.expansionByOverlay = e.allowExpansionByOverlay)
    };
    var me = function () {
        for (var e = 0; e < fe.anq.length; e++)typeof fe.anq[e].called === se && (fe.anq[e].call(), fe.anq[e].called = !0)
    }, Ee = function (e, t) {
        var n = !0;
        return T._each(t, function (t) {
            T.isEmpty(e[t]) && (T.logError("Tag has missing paramater: " + t), n = !1)
        }), n
    }, ve = function (e) {
        var t = ["utUrlEncoded"];
        if (Ee(e, t)) {
            var n = decodeURIComponent(e.utUrlEncoded), r = null, a = new XMLHttpRequest;
            return a.open("GET", n, !1), a.withCredentials = "true", a.send(null), T.logTimestamp("Ad is requested"), 200 === a.status ? r = a.responseText : T.logError("Error request ut URL"), r
        }
    }, he = function (e, t) {
        var n = e.data, r = !0, a = new XMLHttpRequest;
        a.onload = function () {
            var e = null;
            if (200 === a.status)try {
                e = JSON.parse(a.responseText), fe.handleCb(e)
            } catch (n) {
                T.logError("failed to parse ad response from impbus: " + n.message), l(n.message, t, a.status, _.EVENTS.REQUEST_FAIL, n)
            } else T.logError(a.status + " : " + a.statusText), l(a.statusText, t, a.status, _.EVENTS.REQUEST_FAIL)
        }, a.onerror = function (n) {
            var r = n.target.status, a = "Error contacting impbus endpoint: " + e.url + " http response code:" + r;
            l(a, t, r, _.EVENTS.REQUEST_FAIL)
        }, a.open("POST", e.url, r), a.setRequestHeader("Content-Type", "text/plain"), a.withCredentials = !0;
        try {
            a.send(n), fe.requests.utCalled = !0
        } catch (i) {
            T.logError("Error making POST request: " + i), Ce(e, t)
        }
    }, ye = function (e) {
        var t = {}, n = be();
        return t.url = n, t.data = JSON.stringify(e), t
    }, be = function () {
        var e = !1;
        return T._each(fe.requests.tags, function (t) {
            t.prebid && (e = !0)
        }), e ? w + _.ENDPOINT.UT_PREBID : w + _.ENDPOINT.UT_BASE
    }, Ie = function (e) {
        return _.PREFIX.UT_DIV + e.targetId
    }, we = function (e) {
        var t, n = Ie(e), r = e.curWindow || ge;
        return t = r.document.getElementById(n) ? r.document.getElementById(n) : r.document.createElement("div"),
            t.style.display = "none", t.id = n, t
    }, Te = function (e, t, n) {
        var r = P.getBrowserType(), a = e.curWindow || ge, i = a.document.getElementById(e.targetId);
        if (i) {
            i.appendChild(t), e.utDivId = t.id, e.utiframeId = n.id, r === _.BROWSER_TYPE.IE || r === _.BROWSER_TYPE.OPERA ? C.loadIeIframe(n, e) : C.loadIframe(n, e), e.isMediated || (I(e.adResponse.ads[0]), T.logMessage("Win notification sent for ad tag: " + e.targetId));
            var o = S.getContentSourceForMediation(e.adResponse.ads[0]), s = Number(i.style.width.replace(/[^\d\.\-]/g, ""));
            !isNaN(s) && s > o.width && ("center" === e.promoAlignment ? i.setAttribute("align", "center") : i.setAttribute("align", "left")), T.logMessage("The " + e.targetId + " ad is loaded."), T.logTimestamp("The " + e.targetId + " ad is loaded.");
            var d = R.getAdObj(e.adResponse);
            A.emit(_.EVENTS.LOADED, e.targetId, d)
        } else T.logWarn("No div element found for display ad. This ad will not show. Div id: " + e.targetId)
    }, Ae = function (e) {
        if (e.rid && (fe.requests.keywords.rid = e.rid), e.provider_id && (fe.requests.keywords.provider_id = e.provider_id), e.debug && (fe.debug = e.debug), e.size)return void T.logError("Size is deprecated, please use sizes instead.");
        if (e.member || (e.member = fe.requests.member), e.member || (e.member = "none"), !(e.tagId || e.invCode && e.member))return void T.logError("tagId or (invCode & memberId) should be defined for targetId: " + e.targetId);
        try {
            var t = e.targetId, n = De(e, t);
            return T.logMessage("defineTag called for: " + t), fe.requests && fe.requests.utCalled === !0 && !fe.requests.tags[t].utCalled && T.logMessage("A placement was loaded after ut call was started. These ad calls will not be coordinated"), n
        } catch (r) {
            T.logError("buildAdTagContainer: " + r.message)
        }
    }, _e = function (e) {
        fe.requests.utCalled = !1, fe.requests.hasLeft = !1, fe.requests.cbCalled = !1, fe.requests.errorReported = !1;
        var t = T.getTargetArrayforRefresh(e), n = Ne(t);
        T._each(n, function (e, t) {
            T._each(F, function (e) {
                if (t === e) {
                    var n = ge.document, r = n.getElementById(e);
                    if (!r)return;
                    for (; r.hasChildNodes();)r.removeChild(r.firstChild)
                }
            })
        }), T._each(n, function (e) {
            e.utCalled = !1, e.displayed = !1
        });
        try {
            Oe()
        } catch (r) {
            T.logError("refreshTags " + r.message)
        }
    }, Se = function () {
        _e(this.targetId)
    }, Ne = function (e) {
        var t = {};
        return 0 === e.length ? fe.requests.tags : (T._each(fe.requests.tags, function (n, r) {
                for (var a = 0; a < e.length; a++)e[a] === r && (t[r] = n)
            }), t)
    }, Oe = function () {
        T._each(V, function (e, t) {
            if ("none" === t) Re(t); else {
                var n = Number(t);
                isNaN(n) ? T.logError("Invalid value for member") : Re(n)
            }
        })
    }, Re = function (e) {
        pe(e);
        var t = O.buildRequestJsonByMemberId(fe.requests, e, X), n = ye(t);
        return T.isEmpty(t.tags) ? void T.logWarn("ast.loadTagsByMemberId: no defined tags at this point so no /UT request will be made") : void("withCredentials" in new XMLHttpRequest ? he(n, e) : Ce(n, e))
    }, De = function (e, t) {
        var n = e.member;
        return fe.requests = fe.requests || {}, fe.requests.tags = fe.requests.tags || {}, fe.requests.utCalled = fe.requests.utCalled || !1, fe.requests.hasLeft = fe.requests.hasLeft || !1, fe.requests.cbCalled = fe.requests.cbCalled || !1, fe.requests.enableSafeFrame && (e.enableSafeFrame = !0), fe.requests.tags[t] = e, fe.requests.tags[t].utCalled = fe.requests.tags[t].utCalled || !1, fe.requests.tags[t].showTagCalled = fe.requests.tags[t].showTagCalled || !1, fe.requests.tags[t].displayed = fe.requests.tags[t].displayed || !1, fe.requests.tags[t].on = fe.onEvent || void 0, fe.requests.tags[t].off = fe.offEvent || void 0, fe.requests.tags[t].setSizes = fe.setSizes || void 0, fe.requests.tags[t].modifyTag = fe.modifyTag || void 0, fe.requests.tags[t].setKeywords = fe.setKeywords || void 0, fe.requests.tags[t].refresh = Se || void 0, V[n] = typeof V[n] === se ? [] : V[n], V[n].push(e.targetId), Y[e.targetId] && (fe.requests.tags[t].showTagCalled = !0), fe.requests.tags[t]
    }, Ce = function (e, t) {
        var n = ge, r = Pe(e), a = T.loadScript(n, r);
        fe.requests.utCalled = !0, a.onload = function () {
            T.logMessage("JSONP fallback used instead of POST.")
        }, a.onerror = function (n) {
            if (!fe.requests.errorReported) {
                var r = "Unknown script error contacting endpoint over JSONP. Endpoint: " + e.url;
                l(r, t, "-1", _.EVENTS.REQUEST_FAIL, n), T.logError(r)
            }
        }, a.onreadystatechange = function (n) {
            if (!("loaded" !== a.readyState && "complete" !== a.readyState || fe.requests.cbCalled || fe.requests.errorReported)) {
                fe.requests.errorReported = !0;
                var r = "Unknown network error contacting endpoint over JSONP. Endpoint: " + e.url;
                l(r, t, "-1", _.EVENTS.REQUEST_FAIL, n), T.logError(r)
            }
        }
    }, Pe = function (e) {
        var t = e.url + (e.url.indexOf("?") + 1 ? "&" : "?") + "cb=apntag.handleCb&q=" + encodeURI(e.data);
        return t
    }, xe = function (e) {
        fe.requests.tags = fe.requests.tags || {};
        var t = !0, n = fe.requests.tags[e];
        return typeof n === se && (t = !1), t
    }, qe = function () {
        fe.requests.hasLeft = !1, T._each(fe.requests.tags, function (e, t) {
            e.displayed || e.prebid || e.isMediated || (T.logWarn(t + " is not displayed.", _.LOG.WARN), fe.requests.hasLeft = !0)
        }), fe.requests.hasLeft || T.logMessage("all Tags are displayed.")
    }, Me = function (e) {
        function t() {
            n || (n = !0, e())
        }

        var n = !1;
        if (document.addEventListener) document.addEventListener("DOMContentLoaded", t, !1); else if (document.attachEvent) {
            try {
                var r = null !== window.frameElement
            } catch (a) {
            }
            if (document.documentElement.doScroll && !r) {
                var i = function () {
                    if (!n)try {
                        document.documentElement.doScroll("left"), t()
                    } catch (e) {
                        setTimeout(i, 10)
                    }
                };
                i()
            }
            document.attachEvent("onreadystatechange", function () {
                "complete" === document.readyState && t()
            })
        }
        if (window.addEventListener) window.addEventListener("load", t, !1); else if (window.attachEvent) window.attachEvent("onload", t); else {
            var o = window.onload;
            window.onload = function () {
                o && o(), t()
            }
        }
    };
    T.logTimestamp("AST library loaded"), me(), fe.requests.checkDisplay || Me(qe), "function" == typeof window.define && window.define.amd && window.define("appnexusAst", [], function () {
        return window.apntag
    }), window.apn_testonly = {};
    var ke = window.apn_testonly;
    ke.getPageTargetingParams = function () {
        return fe.requests.targetingParams
    }, ke.getEvents = function () {
        return A.get()
    }, ke.getEvent = function (e, t) {
        var n, r = A.get();
        return T._each(r[e], function (e) {
            null !== e[t] && void 0 !== e[t] && (n = e[t])
        }), n
    }, ke.buildPostRequestParams = function (e) {
        return ye(e)
    }, ke.getContentSourceForMediation = function (e) {
        return S.getContentSourceForMediation(e)
    }, ke.getRequestTagsforRefresh = function (e) {
        return Ne(e)
    }, ke.getTag = function (e) {
        return T.logMessage("getTag called for tag " + e), xe(e) ? e && fe.requests.tags && fe.requests.tags[e] ? fe.requests.tags[e] : void 0 : void T.logError("the " + e + " tag is not defined.", _.LOG.WARN)
    }, ke.getEndPoint = function () {
        return be()
    }, ke.getKeyForSyncTags = function (e) {
        return s(e)
    }, ke.getAllRequest = function () {
        return fe.requests
    }, ke.getJSONPUrl = function (e) {
        return Pe(e)
    }, ke.getInternalTagArr = function () {
        return X
    }, ke.makeGetRequest = function (e) {
        return ve(e)
    }, ke.doSyncShowTag = function (e, t) {
        return u(e, t)
    }
}, function (e, t) {
    Array.prototype.indexOf || (Array.prototype.indexOf = function (e, t) {
        var n;
        if (null === this)throw new TypeError('"this" is null or not defined');
        var r = Object(this), a = r.length >>> 0;
        if (0 === a)return -1;
        var i = +t || 0;
        if (Math.abs(i) === 1 / 0 && (i = 0), i >= a)return -1;
        for (n = Math.max(i >= 0 ? i : a - Math.abs(i), 0); n < a;) {
            if (n in r && r[n] === e)return n;
            n++
        }
        return -1
    })
}, function (e, t, n) {
    var r = n(3), a = n(4), i = Array.prototype.slice, o = r._map(a.EVENTS, function (e) {
        return e
    });
    e.exports = function () {
        function e(e, t) {
            var a = t[0], o = i.call(t, 1);
            r.logMessage("Emitting event for: " + e + " for ad tag: " + a), r._each(n[e], function (e) {
                var t = "";
                if (t = r.hasOwn(e, "*") ? e["*"] : e[a], null !== t && void 0 !== t && "function" == typeof t)try {
                    t.apply(null, o)
                } catch (n) {
                    r.logError("events._dispatch: Error executing event handler function: " + n.message)
                }
            })
        }

        function t(e) {
            return r.contains(o, e)
        }

        var n = {}, a = {};
        return a.on = function (e, a, i) {
            if (t(e)) {
                var s = {};
                s[a] = i, n[e] = n[e] || [], n[e].push(s)
            } else r.logError("Wrong event name : " + e + " Valid event names :" + o)
        }, a.emit = function (t) {
            var n = i.call(arguments, 1);
            e(t, n)
        }, a.off = function (e, t, a) {
            r.isEmpty(n[e]) || r._each(n[e], function (e) {
                "*" === t && null !== e[Object.keys(e)[0]] && void 0 !== e[Object.keys(e)[0]] ? "undefined" != typeof a && Object.values(e) !== a || (e[Object.keys(e)[0]] = null) : null !== e[t] && void 0 !== e[t] && ("undefined" != typeof a && e[t] !== a || (e[t] = null))
            })
        }, a.get = function () {
            return n
        }, a
    }()
}, function (e, t) {
    "object" != typeof JSON && (JSON = {}), function () {
        "use strict";
        function e(e) {
            return e < 10 ? "0" + e : e
        }

        function t() {
            return this.valueOf()
        }

        function n(e) {
            return a.lastIndex = 0, a.test(e) ? '"' + e.replace(a, function (e) {
                    var t = s[e];
                    return "string" == typeof t ? t : "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4)
                }) + '"' : '"' + e + '"'
        }

        function r(e, t) {
            var a, s, u, l, g, c = i, f = t[e];
            switch (f && "object" == typeof f && "function" == typeof f.toJSON && (f = f.toJSON(e)), "function" == typeof d && (f = d.call(t, e, f)), typeof f) {
                case"string":
                    return n(f);
                case"number":
                    return isFinite(f) ? String(f) : "null";
                case"boolean":
                case"null":
                    return String(f);
                case"object":
                    if (!f)return "null";
                    if (i += o, g = [], "[object Array]" === Object.prototype.toString.apply(f)) {
                        for (l = f.length, a = 0; a < l; a += 1)g[a] = r(a, f) || "null";
                        return u = 0 === g.length ? "[]" : i ? "[\n" + i + g.join(",\n" + i) + "\n" + c + "]" : "[" + g.join(",") + "]", i = c, u
                    }
                    if (d && "object" == typeof d)for (l = d.length, a = 0; a < l; a += 1)"string" == typeof d[a] && (s = d[a], u = r(s, f), u && g.push(n(s) + (i ? ": " : ":") + u)); else for (s in f)Object.prototype.hasOwnProperty.call(f, s) && (u = r(s, f), u && g.push(n(s) + (i ? ": " : ":") + u));
                    return u = 0 === g.length ? "{}" : i ? "{\n" + i + g.join(",\n" + i) + "\n" + c + "}" : "{" + g.join(",") + "}", i = c, u
            }
        }

        var a = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        "function" != typeof Date.prototype.toJSON && (Date.prototype.toJSON = function () {
            return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + e(this.getUTCMonth() + 1) + "-" + e(this.getUTCDate()) + "T" + e(this.getUTCHours()) + ":" + e(this.getUTCMinutes()) + ":" + e(this.getUTCSeconds()) + "Z" : null
        }, Boolean.prototype.toJSON = t, Number.prototype.toJSON = t, String.prototype.toJSON = t);
        var i, o, s, d;
        "function" != typeof JSON.stringify && (s = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            '"': '\\"',
            "\\": "\\\\"
        }, JSON.stringify = function (e, t, n) {
            var a;
            if (i = "", o = "", "number" == typeof n)for (a = 0; a < n; a += 1)o += " "; else"string" == typeof n && (o = n);
            if (d = t, t && "function" != typeof t && ("object" != typeof t || "number" != typeof t.length))throw new Error("JSON.stringify");
            return r("", {"": e})
        })
    }()
}, function (e, t, n) {
    var r = n(3), a = n(4), i = t, o = [], s = !1, d = a.EXTERNAL_LIB.VIDEO_MEDIATION_JS, u = a.EXTERNAL_LIB.BANNER_MEDIATION_JS, l = a.UT_RESPONSE_PROP.AD_TYPE, g = a.AD_TYPE.BANNER, c = a.AD_TYPE.VIDEO;
    i.checkIfMediatedResponse = function (e) {
        var t = !1;
        return e && r._each(e, function (e) {
            if ("csm" === e.content_source)return void(t = !0)
        }), t
    }, i.getMediationType = function (e) {
        var t = g;
        return e && r._each(e, function (e) {
            if (e[l] === c)return void(t = c)
        }), t
    }, i.callMediationFramework = function (e, t, n, a) {
        var i = this;
        e === c && (null !== t && o.push(t), s && window.APNVideo_AstMediationManager ? r._each(o, function (e) {
                if (!e.called)try {
                    window.APNVideo_AstMediationManager.selectAd(e.uuid, e, n, a), e.called = !0
                } catch (t) {
                    r.logError("Error invoking video mediation", "mediationmanager.js", t)
                }
            }) : (r.loadScript(window, d, function () {
                i.callMediationFramework(c, null, n, a)
            }), s = !0))
    }, i.getMediationOptions = function (e, t) {
        var n = {};
        return r._each(e, function (e) {
            e.uuid === t.uuid && e.mediationOptions && (n = e.mediationOptions)
        }), n
    }, i.getAdObjByMediation = function (e) {
        return e.isMediated ? e.adResponse.ad : e.adResponse.ads[0]
    }, i.copyAdObjforMediation = function (e) {
        return e.isMediated || (e.adResponse.ad = e.adResponse.ads[0]), e
    }, i.getContentSourceForMediation = function (e) {
        var t = e.content_source, n = e.ad_type;
        if (t)return e[t][n]
    }, i.getContentForBannerMediation = function (e, t) {
        var n = "<script>";
        return n += "var APN_macros = {};", n += 'APN_macros.uuid = "' + e + '";', n += "APN_macros.ads = ", n += 'window.parent.apntag.getAdMarkup("' + e + '", "' + t.uuid + '");', n += ";", n += "document.write('<scr' + 'ipt src=\"" + u + "\"></scr' + 'ipt>');", n += "</script>"
    }
}, function (e, t) {
    function n() {
        var e = document.createElement("iframe");
        return e.id = "loader", e.height = "100%", e.width = "100%", e.border = "0px", e.hspace = "0", e.vspace = "0", e.marginWidth = "0", e.marginHeight = "0", e.style.border = "0", e.frameBorder = "0", e
    }

    var r = t;
    r.load = function (e) {
        e = e.replace(/(\n)/g, "<br>");
        var t = document.body, r = document.createElement("div");
        r.id = "appnexus_debug_window";
        var a = document.createElement("div");
        a.style.width = "100%", a.style.height = "400px", a.style.clear = "both", t.insertBefore(a, null);
        var i = r.style;
        i.position = "fixed", i.bottom = "0px", i.left = "0px", i.width = "100%", i.height = "450px", i.overflow = "hidden", i["border-top"] = "1px solid", i["z-index"] = 999999, i.background = "white", t.insertBefore(r, null);
        var o = document.createElement("div");
        o.style.width = "100%", o.style.height = "30px";
        var s = n();
        r.appendChild(s);
        var d = s.contentWindow.document;
        s.onload = function () {
            var e, t, n, r = d.getElementsByTagName("br"), a = r.length, i = 0;
            for (i; i < a - 1; i++)n = !1, e = r[i].nextSibling, t = e.nodeName.toLowerCase(), "br" === t && (n = !0), n && (e.style.display = "none")
        };
        var u = "</script>";
        d.open(), d.write(e), d.write(u), d.close()
    }
}, function (e, t, n) {
    var r = n(3), a = t;
    a.invokeNotify = function (e, t) {
        r.isFn(t) ? r.logWarn("apntag.notify not supported by renderer") : r.isObj(t) && r._each(e, function (e) {
                r.isFn(t.notify) && !e.sent && (e.sent = !0, t.notify(e.messageType, e.messagePayload))
            })
    }, a.invokeRendererRenderAd = function (e, t, n) {
        r.isFn(e) ? e.call(apntag, t, n) : r.isObj(e) && (r.isFn(e.renderAd) ? e.renderAd.call(apntag, t, n) : r.logError("Error invoking rendererObj.renderAd(). renderAd must be a function"))
    }, a.createNotifyObj = function (e, t, n) {
        return {messageType: e, messagePayload: t, targetId: n, sent: !1}
    }
}, function (e, t, n) {
    function r(e) {
        var t = e.targetId, n = "";
        if (e.isMediated) n = e.ad.mediatedContent, u.logMessage("Invoking mediation for displaying banner ad: " + t); else if (e.adResponse && 1 === e.adResponse.ads.length) {
            var r = u.getAdObjFromAdsArray(e.adResponse.ads);
            n = r[l][g]
        }
        return i(t, n, e.alwaysUseXDomainIframe || e.enableSafeFrame)
    }

    function a(e, t) {
        return t ? "" : 'window.onerror = function(e) {\n        if(window.parent && window.parent.apntag) {\n          window.parent.apntag.recordErrorEvent(e,"' + e + '");\n          return true;\n        }\n      };'
    }

    function i(e, t, n) {
        var r = a(e, n);
        return '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><head>\n    <base target="_top" /><script>inDapIF=true;\n    apntag_targetId = "' + e + '";\n    ' + r + '\n    </script></head>\n    <body>\n    <script>\n    document.body.id = "' + e + '";\n    </script>\n    ' + t + "\n    </body></html>"
    }

    function o(e) {
        return e.replace("/&/g", "&amp;").replace("/</g", "&lt;").replace("/>/g", "&gt;").replace('/"/g', "&quot;").replace("/'/g", "&#39;")
    }

    var s = n(4), d = t, u = n(3), l = s.UT_RESPONSE_PROP.BANNER, g = s.UT_RESPONSE_PROP.CONTENT;
    d.getIframe = function (e) {
        var t, n = c(e), a = u.getWindow();
        if (t = null !== a.document.getElementById(n) ? a.document.getElementById(n) : a.document.createElement("iframe"), t.id = n, e.alwaysUseXDomainIframe || e.enableSafeFrame) {
            u.logMessage("targetId: " + e.targetId + " is using safeFrame. Loading this ad into sandboxed iframe");
            var i = r(e);
            i = o(i), i = "" + i;
            var s = {
                targetId: e.targetId,
                ad: i,
                host: a.location.protocol + "//" + a.location.host,
                bounds: u.cloneAsObject(e.bounds),
                debug: u.debugTurnedOn(),
                hostSfSupport: e.safeframe
            };
            t.name = JSON.stringify(s)
        } else t.name = n;
        return t.setAttribute("height", e.initialHeight), t.setAttribute("width", e.initialWidth), t.tabIndex = "-1", t.width = e.initialWidth + "px", t.height = e.initialHeight + "px", t.border = "0", t.hspace = "0", t.vspace = "0", t.marginWidth = "0", t.marginHeight = "0", t.style.border = "0", t.scrolling = "no", t.frameBorder = "0", t
    }, d.loadIeIframe = function (e, t) {
        if (t.alwaysUseXDomainIframe || t.enableSafeFrame) e.src = s.EXTERNAL_LIB.SAFE_FRAME_URL; else {
            var n = "";
            n = r(t);
            try {
                e.contentWindow.contents = n
            } catch (a) {
                e.src = "javascript:document.write('<script>document.domain=\"" + document.domain + "\"</script>')", e.contentWindow.contents = n
            }
            e.src = 'javascript:window["contents"];'
        }
    }, d.loadIframe = function (e, t) {
        if (t.alwaysUseXDomainIframe || t.enableSafeFrame) e.src = s.EXTERNAL_LIB.SAFE_FRAME_URL; else {
            var n = "", a = f(e);
            n = r(t), a.open("text/html", "replace"), a.write(n), a.close()
        }
    };
    var c = function (e) {
        return s.PREFIX.UT_IFRAME + e.targetId + "_" + u.getUUID()
    }, f = function (e) {
        var t;
        try {
            t = e.contentWindow ? e.contentWindow.document : e.contentDocument.document ? e.contentDocument.document : e.contentDocument
        } catch (n) {
            u.logError("Error getting iframe document: " + n)
        }
        return t
    }
}, function (e, t) {
    t.getBrowserType = function () {
        var e = n(), t = /(webkit)[ \/]([\w.]+)/.exec(e) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(e) || /(msie) ([\w.]+)/.exec(e) || e.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(e) || [];
        return t[1]
    };
    var n = function () {
        return navigator.userAgent.toLowerCase()
    }
}, function (e, t, n) {
    function r() {
        window.mraid.removeEventListener("ready", r), o()
    }

    function a() {
        "loading" === window.mraid.getState() ? window.mraid.addEventListener("ready", r) : o()
    }

    function i(e) {
        e && (window.mraid.removeEventListener("viewableChange", i), d())
    }

    function o() {
        window.mraid.useCustomClose(!0), window.mraid.isViewable() ? d() : window.mraid.addEventListener("viewableChange", i)
    }

    function s(e) {
        e && (window.mraid.removeEventListener("viewableChange", s), window.mraid.close())
    }

    function d() {
        u.loadScript(window, "https://acdn.adnxs.com/mobile/pricecheck/MobileVastPlayer.js", function () {
            try {
                var e = window.innerWidth, t = window.innerHeight, n = "video-content", r = window.document.createElement("div");
                r.id = n, r.style.width = e + "px", r.style.height = t + "px", r.style.top = "0px", r.style.left = "0px", r.style.position = "absolute", document.body.appendChild(r);
                var a = {
                    autoInitialSize: !1,
                    aspectRatio: "16:9",
                    delayExpandUntilVPAIDImpression: !1,
                    delayExpandUntilVPAIDInit: !0,
                    initialAudio: "on",
                    initialPlayback: "auto",
                    showMute: !0,
                    showProgressBar: !0,
                    showPlayToggle: !1,
                    showBigPlayButton: !1,
                    allowFullscreen: !1,
                    forceAdInFullscreen: !1,
                    disableCollapse: !1,
                    fitInContainer: !0,
                    shouldResizeVideoToFillMobileWebview: !0,
                    enableInlineVideoForIos: !1,
                    preloadInlineAudioForIos: !1,
                    enableNativeInline: !0,
                    fixedSizePlayer: !1,
                    controlBarPosition: "below",
                    terminateUnresponsiveVPAIDCreative: !1,
                    vpaidTimeout: 2e4,
                    waterfallTimeout: 15e3,
                    waterfallSteps: -1,
                    useCustomOpenForClickthrough: !0,
                    vpaidEnvironmentVars: {rhythmone: !0},
                    playerSkin: {dividerColor: "black", controlBarColor: "black"},
                    skippable: {
                        skipLocation: "top-right",
                        skipText: "Video can be skipped in %%TIME%% seconds",
                        skipButtonText: "SKIP"
                    }
                };
                a.targetElementId = n, top.window.options = a, window.APNVideo_MobileVastPlayer.playVast(r, a, window.videoContent, function (e) {
                    "video-complete" !== e && "video-skip" !== e || window.mraid && window.mraid.close();
                    var t = e;
                    "undefined" != typeof e && "undefined" != typeof e.name && "undefined" != typeof e.url && "video_click_open_url" === t.name && (window.mraid ? (window.mraid.open(t.url), window.mraid.addEventListener("viewableChange", s)) : window.open(t.url))
                })
            } catch (i) {
                u.logError("Issue loading video into document :", i)
            }
        })
    }

    var u = n(3);
    t.pcLoadVideo = function (e) {
        window.videoContent = e, window.mraid ? a() : d()
    }
}, function (e, t, n) {
    var r = n(3), a = (n(8), t);
    a.startListening = function () {
        r.addEventHandler(window, "message", function (e) {
            if (e && e.origin && e.origin.indexOf(".adnxs.com") > 0)try {
                var t = JSON.parse(e.data);
                "adError" === t.eventType && apntag.recordErrorEvent(t.exception, t.targetId)
            } catch (n) {
                r.logError(n)
            }
        })
    }, a.sendMessage = function (e, t) {
        e && e.postMessage(t, "*")
    }
}, function (e, t, n) {
    var r = n(4), a = n(3), i = n(18), o = t;
    o.attach = function (e, t, n) {
        a.addEventHandler(e, t, n)
    }, o.handleMessage = function (e) {
        if (a.logInfo("Data sent from creative", t), e.origin !== r.EXTERNAL_LIB.CDN_ORIGIN)return void a.logMessage("Received post message from mismatched origin. Ignoring.");
        var t;
        try {
            t = JSON.parse(e.data)
        } catch (n) {
            return void a.logError(n)
        }
        if (a.hasOwn(t, "eventType")) "adError" === t.eventType && window.apntag.recordErrorEvent(t.exception, t.targetId); else switch (t.name) {
            case"expand":
                i.expandIframe(t);
                break;
            case"collapse":
                i.collapseIframe(t);
                break;
            case"message":
        }
    }, o.sendMessage = function (e, t, n) {
        e.postMessage(t, n)
    }
}, function (e, t, n) {
    var r = n(3), a = n(4), i = n(19), o = n(17), s = a.TYPE.NUM, d = t;
    d.expandIframe = function (e) {
        r.logMessage("Expand iframe started by host");
        var t, n, d, u, l = !1, g = !1, c = 0, f = 0, p = 0, m = 0, E = r.getWindow(), v = E.document.getElementById(a.PREFIX.UT_DIV + e.targetId), h = i.getInstance(), y = h.getIframe(e.targetId), b = y.iframe.style, I = v.style;
        I.display = "";
        var w = parseInt(I.width, 10), T = parseInt(I.height, 10);
        if (e.bounds.multiDir ? (n = r.getValueAsType("data.bounds.left", e.bounds.left, s), u = r.getValueAsType("data.bounds.right", e.bounds.right, s), t = r.getValueAsType("data.bounds.top", e.bounds.top, s), d = r.getValueAsType("data.bounds.bottom", e.bounds.bottom, s), p = w + n + u, m = T + t + d, t ? (f = t * -1, g = !0) : f = 0, n ? (c = n * -1, l = !0) : c = 0) : (c = e.bounds.x, f = e.bounds.y, l = c < 0, g = f < 0, p = l ? w + c * -1 : w + c, m = g ? T + f * -1 : T + f), !(p <= w && m <= T)) {
            b.width = p + "px", b.height = m + "px", l && (b.left = c + "px"), g && (b.top = f + "px"), b.zIndex = a.SAFEFRAME.DEFAULT_ZINDEX;
            var A = E.document.getElementById(a.PREFIX.UT_DIV + e.targetId), _ = A.style;
            _.position = "relative", e.bounds.push ? (_.width = p + "px", _.height = m + "px") : (_.width = w + "px", _.height = T + "px");
            var S = y.iframe.contentWindow, N = {};
            N.targetId = e.targetId, N.status = a.SAFEFRAME.STATUS.NOTIFY_EXPANDED, o.sendMessage(S, JSON.stringify(N), a.EXTERNAL_LIB.CDN_ORIGIN)
        }
    }, d.collapseIframe = function (e) {
        r.logMessage("Collapse iframe started by host");
        var t = r.getWindow(), n = t.document.getElementById(a.PREFIX.UT_DIV + e.targetId), s = n.style, d = i.getInstance(), u = d.getIframe(e.targetId), l = u.iframe.style, g = u.originalWidth, c = u.originalHeight;
        l.left = "", l.top = "0px", s.width = g + "px", l.width = g + "px", s.height = c + "px", l.height = c + "px", l.zIndex = "";
        var f = u.iframe.contentWindow, p = {};
        p.targetId = e.targetId, p.status = a.SAFEFRAME.STATUS.NOTIFY_COLLAPSED, o.sendMessage(f, JSON.stringify(p), a.EXTERNAL_LIB.CDN_ORIGIN)
    }, d.geom = function (e) {
        r.logMessage("Geom starting");
        var t = r.getWindow(), n = t.document.getElementById(e).getBoundingClientRect();
        return n = r.cloneAsObject(n)
    }
}, function (e, t, n) {
    var r = n(3), a = function () {
        function e() {
            return {
                add: function (e, t) {
                    n[e] = t
                }, getIframe: function (e) {
                    return r.hasOwn(n, e) ? n[e] : null
                }, getIframes: function () {
                    return n
                }
            }
        }

        var t, n = {};
        return {
            getInstance: function () {
                return t || (t = e()), t
            }
        }
    }();
    e.exports = a
}, function (e, t) {
    function n(e, t, n, r) {
        return {eventType: e, targetId: t, data: n, exception: r}
    }

    var r = t;
    r.createMessage = function (e, t, r, a) {
        return new n(e, t, r, a)
    }
}]);
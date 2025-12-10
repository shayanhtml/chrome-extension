function log(e) {
    0 == arguments.length ? Logger.print("") : Logger.print(e);
}

let Logger = (function () {
    "use strict";

    // ---- Zmienne prywatne (DOM + stan) ----
    let i = null,   // container główny (loggerContainer)
        n = null,   // zakładka (loggerTab)
        d = null,   // właściwy obszar logów (div#logger)
        o = null,   // przycisk fullscreen
        e = !0,     // widoczność modułu
        r = !1,     // czy panel otwarty
        t = !0,     // czy logowanie włączone
        l = !1,     // fullscreen on/off
        s = 215,    // wysokość panelu w px (gdy nie fullscreen)
        a = 0,      // czas startu animacji
        u = 200;    // czas animacji w ms

    // ---- Nowe: Limit logów i helper do przycinania ----
    const MAX_LOGS = 20; // docelowy limit wpisów (wierszy)
    function pruneLogs() {
        // Każdy wpis składa się z 3 elementów: .timeDiv, .msgDiv, .newLineDiv
        const timeDivs = d.getElementsByClassName("timeDiv");
        while (timeDivs.length > MAX_LOGS) {
            timeDivs[0]?.remove();
            d.getElementsByClassName("msgDiv")[0]?.remove();
            d.getElementsByClassName("newLineDiv")[0]?.remove();
        }
    }

    // ---- Utilities ----
    function c() {
        let e = new Date,
            t = "0" + e.getHours(),
            n = (t = t.substring(t.length - 2), "0" + e.getMinutes()),
            o = (n = n.substring(n.length - 2), "0" + e.getSeconds());
        return o = o.substring(o.length - 2), t + ":" + n + ":" + o;
    }

    function p() {
        let t =
            window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.webkitRequestAnimationFrame;
        return t
            ? function (e) {
                  return t(e);
              }
            : function (e) {
                  return setTimeout(e, 16);
              };
    }

    return {
        init: function () {
            if (!i) {
                if (
                    !(
                        document &&
                        document.createElement &&
                        document.body &&
                        document.body.appendChild
                    )
                )
                    return !1;

                var tId = "loggerContainer";
                if (!(i = document.getElementById(tId))) {
                    (i = document.createElement("div")).id = tId;
                    i.setAttribute(
                        "style",
                        "width:100%;margin:0;padding:0;text-align:left;box-sizing:border-box;position:fixed;left:0;z-index:9999;bottom:-215px;"
                    );

                    (n = document.createElement("div")).id = "loggerTab";
                    n.appendChild(document.createTextNode("LOG"));
                    n.setAttribute(
                        "style",
                        "width:40px;box-sizing:border-box;overflow:hidden;font:bold 10px verdana,helvetica,sans-serif;line-height:19px;color:#fff;position:absolute;left:20px;top:-20px;margin:0; padding:0;text-align:center;border:1px solid #aaa;border-bottom:none;background:rgba(0,0,0,0.8);border-top-right-radius:8px;border-top-left-radius:8px;"
                    );

                    (o = document.createElement("div")).id = "fullscreen";
                    o.appendChild(document.createTextNode("↑"));
                    o.setAttribute(
                        "style",
                        "width:40px;box-sizing:border-box;overflow:hidden;font:bold 10px verdana,helvetica,sans-serif;line-height:19px;color:#fff;position:absolute;right:1px;top:-20px;margin:0; padding:0;text-align:center;border:1px solid #aaa;border-bottom:none;background:rgba(0,0,0,0.8);border-top-right-radius:8px;border-top-left-radius:8px;"
                    );

                    n.onmouseover = function () {
                        this.style.cursor = "pointer";
                        this.style.textShadow =
                            "0 0 1px #fff, 0 0 2px #0f0, 0 0 6px #0f0";
                    };
                    n.onmouseout = function () {
                        this.style.cursor = "auto";
                        this.style.textShadow = "none";
                    };
                    n.onclick = function () {
                        Logger.toggle();
                        this.style.textShadow = "none";
                    };

                    o.onclick = function () {
                        Logger.fsToggle();
                    };
                    o.onmouseover = function () {
                        this.style.cursor = "pointer";
                        this.style.textShadow =
                            "0 0 1px #fff, 0 0 2px #0f0, 0 0 6px #0f0";
                    };

                    (d = document.createElement("div")).id = "logger";
                    d.setAttribute(
                        "style",
                        "font:12px monospace;height: 215px;box-sizing:border-box;color:#fff;overflow-x:hidden;overflow-y:auto;visibility:hidden;position:relative;bottom:0px;margin:0px;padding:5px;background:rgba(0,0,0,0.8);border-top:1px solid #aaa;"
                    );

                    let startSpan = document.createElement("span");
                    startSpan.style.color = "#afa";
                    startSpan.style.fontWeight = "bold";

                    let header =
                        "===== Rozpoczęto pobieranie o " +
                        (function () {
                            let e = new Date;
                            var t = "" + e.getFullYear();
                            let n = "0" + (e.getMonth() + 1),
                                o = (n = n.substring(n.length - 2), "0" + e.getDate());
                            return (
                                (o = o.substring(o.length - 2)),
                                t + "-" + n + "-" + o
                            );
                        })() +
                        " " +
                        c() +
                        " =====";

                    startSpan.appendChild(document.createTextNode(header));
                    d.appendChild(startSpan);
                    d.appendChild(document.createElement("br"));
                    d.appendChild(document.createElement("br"));

                    i.appendChild(n);
                    i.appendChild(o);
                    i.appendChild(d);
                    document.body.appendChild(i);
                }
            }
            return !0;
        },

        print: function (msg) {
            if (!t) return; // logowanie wyłączone
            if (!i && !this.init()) return;

            // konwersja / normalizacja wiadomości
            let isPlain = !0;
            if (void 0 === msg) {
                msg = "undefined";
                isPlain = !1;
            } else if ("function" == typeof msg) {
                msg = "function";
                isPlain = !1;
            } else if (null === msg) {
                msg = "null";
                isPlain = !1;
            } else if (msg instanceof Array) {
                msg = this.arrayToString(msg);
            } else if (msg instanceof Object) {
                msg = msg.toString();
            } else {
                msg += "";
            }

            const lines = msg.split(/\r\n|\r|\n/);
            for (let idx = 0, len = lines.length; idx < len; ++idx) {
                // time
                let timeDiv = document.createElement("div");
                timeDiv.setAttribute("class", "timeDiv");
                timeDiv.setAttribute("style", "color:#999;float:left;");
                let timeText = document.createTextNode(c() + " ");
                timeDiv.appendChild(timeText);

                // message
                let msgDiv = document.createElement("div");
                msgDiv.setAttribute("class", "msgDiv");
                msgDiv.setAttribute("style", "word-wrap:break-word;margin-left:6.0em;");
                if (!isPlain) msgDiv.style.color = "#afa";

                let bodyText = lines[idx].replace(/ /g, " ");
                msgDiv.appendChild(document.createTextNode(bodyText));

                // newline separator
                let nl = document.createElement("div");
                nl.setAttribute("class", "newLineDiv");
                nl.setAttribute("style", "clear:both;");

                // append wiersza
                d.appendChild(timeDiv);
                d.appendChild(msgDiv);
                d.appendChild(nl);

                // przytnij nadmiar
                pruneLogs();

                // autoscroll
                d.scrollTop = d.scrollHeight;
            }
        },

        fsToggle: function () {
            l ? this.fsClose() : this.fsOpen();
        },

        fsOpen: function () {
            this.open();
            l = !0;
            d.style.height = "calc(100vh - 20px)";
            o.innerText = "↓";
        },

        fsClose: function () {
            l = !1;
            d.style.height = s + "px";
            o.innerText = "↑";
        },

        toggle: function () {
            r ? this.close() : this.open();
        },

        open: function () {
            if (this.init() && e && !r) {
                d.style.visibility = "visible";
                a = Date.now();
                let raf = p();
                raf(function step() {
                    let tMs = Date.now() - a;
                    if (tMs >= u) {
                        i.style.bottom = 0;
                        r = !0;
                        return;
                    }
                    let nPx = Math.round(-s * (1 - 0.5 * (1 - Math.cos(Math.PI * tMs / u))));
                    i.style.bottom = nPx + "px";
                    raf(step);
                });
            }
        },

        close: function () {
            if (this.init() && e && r) {
                if (l) this.fsClose();
                a = Date.now();
                let raf = p();
                raf(function step() {
                    let tMs = Date.now() - a;
                    if (tMs >= u) {
                        i.style.bottom = -s + "px";
                        d.style.visibility = "hidden";
                        r = !1;
                        return;
                    }
                    let nPx = Math.round(0.5 * -s * (1 - Math.cos(Math.PI * tMs / u)));
                    i.style.bottom = nPx + "px";
                    raf(step);
                });
            }
        },

        show: function () {
            this.init() && (i.style.display = "block", e = !0);
        },

        hide: function () {
            this.init() && (i.style.display = "none", e = !1);
        },

        enable: function () {
            this.init() && (t = !0, n.style.color = "#fff", d.style.color = "#fff");
        },

        disable: function () {
            this.init() && (t = !1, n.style.color = "#666", d.style.color = "#666");
        },

        clear: function () {
            this.init() && (d.innerHTML = "");
        },

        arrayToString: function (arr) {
            let out = "[";
            for (let e = 0, len = arr.length; e < len; ++e) {
                out += arr[e] instanceof Array ? this.arrayToString(arr[e]) : arr[e];
                if (e < len - 1) out += ", ";
            }
            out += "]";
            return out;
        }
    };
})();

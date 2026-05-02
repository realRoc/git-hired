/* global window, document, navigator */
(function () {
  "use strict";

  var POSTHOG_API_KEY = "phc_JQHakHYG7KOiZUXCqdojoXuAll5QW8DwkdJzk0Qzg0e";
  var POSTHOG_API_HOST = "https://us.i.posthog.com";

  var ROLE_BY_PAGE = {
    "growth.html": "Global Growth",
    "agent.html": "Agent Engineer",
    "pm.html": "Product Manager",
    "ops.html": "Product Operations",
  };

  var ROLE_BY_PROMPT_BASE = {
    "prompt-growth": "Global Growth",
    "prompt-engineer": "Agent Engineer",
    "prompt-pm": "Product Manager",
    "prompt-ops": "Product Operations",
  };

  function initPostHog() {
    /* eslint-disable */
    !function (t, e) {
      var o, n, p, r;
      e.__SV || (window.posthog && window.posthog.__loaded) || (window.posthog = e, e._i = [], e.init = function (i, s, a) {
        function g(t, e) {
          var o = e.split(".");
          2 == o.length && (t = t[o[0]], e = o[1]);
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        }
        (p = t.createElement("script")).type = "text/javascript";
        p.crossOrigin = "anonymous";
        p.async = !0;
        p.src = s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js";
        (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r);
        var u = e;
        void 0 !== a ? u = e[a] = [] : a = "posthog";
        u.people = u.people || [];
        u.toString = function (t) {
          var e = "posthog";
          "posthog" !== a && (e += "." + a);
          t || (e += " (stub)");
          return e;
        };
        u.people.toString = function () {
          return u.toString(1) + ".people (stub)";
        };
        o = "init capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags reloadFeatureFlags group".split(" ");
        for (n = 0; n < o.length; n++) g(u, o[n]);
        e._i.push([i, s, a]);
      }, e.__SV = 1);
    }(document, window.posthog || []);
    /* eslint-enable */

    window.posthog.init(POSTHOG_API_KEY, {
      api_host: POSTHOG_API_HOST,
      defaults: "2026-01-30",
      person_profiles: "identified_only",
      capture_pageview: true,
      autocapture: true,
      disable_session_recording: true,
    });
  }

  function resolvedLang() {
    var lang = document.documentElement.dataset.lang || document.body?.dataset.lang || "";
    return lang === "zh" ? "zh" : "en";
  }

  function currentPagePath() {
    return window.location.pathname || "/";
  }

  function eventProperties(properties) {
    return Object.assign({
      location: "page",
      role: null,
      result_type: null,
      question_id: null,
      page_path: currentPagePath(),
      page_title: document.title || "",
      language: resolvedLang(),
    }, properties || {}, {
      page_path: currentPagePath(),
    });
  }

  function track(eventName, properties) {
    if (!eventName || !window.posthog || typeof window.posthog.capture !== "function") return;
    window.posthog.capture(eventName, eventProperties(properties));
  }

  function basenameFromHref(href) {
    var anchor = document.createElement("a");
    anchor.href = href;
    var path = anchor.pathname || "";
    return path.split("/").filter(Boolean).pop() || "";
  }

  function searchParamFromHref(href, key) {
    try {
      var anchor = document.createElement("a");
      anchor.href = href;
      return new URL(anchor.href).searchParams.get(key) || null;
    } catch (error) {
      return null;
    }
  }

  function roleFromHref(href) {
    return ROLE_BY_PAGE[basenameFromHref(href)] || null;
  }

  function promptBaseFromButton(button) {
    var onclick = button?.getAttribute("onclick") || "";
    var match = onclick.match(/copyPrompt\(['"]([^'"]+)['"]/);
    return match ? match[1] : "";
  }

  function trackStartClick(link) {
    track("click_start", {
      location: "home_hero",
      target_path: basenameFromHref(link.href) || "start.html",
      track: searchParamFromHref(link.href, "track"),
    });
  }

  function trackRoleLink(link) {
    var role = roleFromHref(link.href);
    if (!role) return;
    track("select_role", {
      location: "role_link",
      role: role,
      selection_type: "role",
      target_path: basenameFromHref(link.href),
    });
  }

  function trackRoleCommand(button) {
    var promptBase = promptBaseFromButton(button);
    var role = ROLE_BY_PROMPT_BASE[promptBase];
    if (!role) return;
    track("select_role", {
      location: "role_command_copy",
      role: role,
      selection_type: "role",
      prompt_base: promptBase,
    });
  }

  function initManualClickTracking() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== "function") return;

      var startLink = target.closest(".home-shell .big-cta[href*='start.html']");
      if (startLink) {
        trackStartClick(startLink);
        return;
      }

      var copyButton = target.closest("button[onclick*='copyPrompt(']");
      if (copyButton) {
        trackRoleCommand(copyButton);
        return;
      }

      var link = target.closest("a[href]");
      if (link) trackRoleLink(link);
    }, true);
  }

  initPostHog();
  window.gitHiredAnalytics = {
    track: track,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initManualClickTracking);
  } else {
    initManualClickTracking();
  }
}());

(() => {
  "use strict";

  const init = () => {
    const magazine = document.querySelector("#magazine");
    const spreads = Array.from(document.querySelectorAll(".spread"));
    if (!magazine || spreads.length === 0) return;

    const reader = document.querySelector("#reader");
    const indicator = document.querySelector("#page-indicator");
    const sectionLabel = document.querySelector("#section-label");
    const status = document.querySelector("#reader-status");
    const contentsToggle = document.querySelector("#contents-toggle");
    const contentsClose = document.querySelector("#contents-close");
    const contentsDialog = document.querySelector("#contents-dialog");
    const fullscreenToggle = document.querySelector("#fullscreen-toggle");
    const readingToggle = document.querySelector("#reading-toggle");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pageCounts = spreads.map(
      (spread) => spread.querySelectorAll(".page").length || 2,
    );
    const totalPages = pageCounts.reduce((total, count) => total + count, 0);
    const pad = (number) => String(number).padStart(2, "0");
    let current = 0;
    let readingMode = false;
    let expanded = false;
    let fullscreenRequestPending = false;
    let transitionTimer;
    let touchStart = null;

    const indexFromHash = () => {
      const match = window.location.hash.match(/^#spread-(\d+)$/);
      const index = match ? Number(match[1]) - 1 : 0;
      return index >= 0 && index < spreads.length ? index : 0;
    };

    const isEditable = (element) =>
      element instanceof Element &&
      Boolean(
        element.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]',
        ),
      );

    const pageRange = (index) => {
      const start =
        pageCounts.slice(0, index).reduce((total, count) => total + count, 0) +
        1;
      return [start, start + pageCounts[index] - 1];
    };

    const render = () => {
      spreads.forEach((spread, index) => {
        const visible = readingMode || index === current;
        spread.classList.toggle("is-active", index === current);
        spread.hidden = !visible;
        spread.inert = !visible;
        spread.setAttribute("aria-hidden", String(!visible));
      });

      document.querySelectorAll("[data-spread]").forEach((control) => {
        if (Number(control.dataset.spread) === current + 1) {
          control.setAttribute("aria-current", "true");
        } else {
          control.removeAttribute("aria-current");
        }
      });
      document.querySelectorAll("[data-prev]").forEach((control) => {
        control.disabled = current === 0;
        control.setAttribute("aria-disabled", String(current === 0));
      });
      document.querySelectorAll("[data-next]").forEach((control) => {
        control.disabled = current === spreads.length - 1;
        control.setAttribute(
          "aria-disabled",
          String(current === spreads.length - 1),
        );
      });

      const [start, end] = pageRange(current);
      if (indicator)
        indicator.textContent = `${pad(start)} — ${pad(end)} / ${pad(totalPages)}`;
      if (sectionLabel)
        sectionLabel.textContent =
          spreads[current].dataset.title || `Spread ${current + 1}`;
    };

    const updateHash = (replace = false) => {
      const hash = `#spread-${current + 1}`;
      if (window.location.hash === hash) return;
      const url = new URL(window.location.href);
      url.hash = hash;
      try {
        window.history[replace ? "replaceState" : "pushState"](null, "", url);
      } catch {
        // Hash navigation also works when a browser restricts History on local files.
        if (replace) window.location.replace(url.href);
        else window.location.hash = hash;
      }
    };

    const navigate = (
      index,
      { history = true, announce = true, scroll = true } = {},
    ) => {
      if (!Number.isInteger(index) || index < 0 || index >= spreads.length)
        return;
      const changed = index !== current;
      const moveFocus =
        !readingMode &&
        changed &&
        spreads[current].contains(document.activeElement);
      current = index;
      render();
      if (history) updateHash();

      if (changed && !readingMode && !reducedMotion.matches) {
        window.clearTimeout(transitionTimer);
        magazine.classList.add("is-turning");
        transitionTimer = window.setTimeout(
          () => magazine.classList.remove("is-turning"),
          360,
        );
      }

      if (moveFocus) {
        if (!spreads[current].hasAttribute("tabindex"))
          spreads[current].tabIndex = -1;
        spreads[current].focus({ preventScroll: true });
      }
      if (scroll) {
        // Mobile spreads stack two pages, so a page turn must reset their scroll position.
        // Explicitly choosing the current spread (including the cover) also returns to its top.
        spreads[current].scrollIntoView({
          behavior:
            readingMode && !reducedMotion.matches ? "smooth" : "instant",
          block: "start",
        });
      }
      if (changed && announce && status) {
        const [start, end] = pageRange(current);
        status.textContent = `${spreads[current].dataset.title || `Spread ${current + 1}`}. Pages ${start} and ${end} of ${totalPages}.`;
      }
    };

    const syncContents = () => {
      if (contentsToggle && contentsDialog)
        contentsToggle.setAttribute(
          "aria-expanded",
          String(contentsDialog.open),
        );
    };

    const closeContents = () => {
      if (!contentsDialog || !contentsDialog.open) return;
      if (typeof contentsDialog.close === "function") {
        contentsDialog.close();
      } else {
        contentsDialog.removeAttribute("open");
        syncContents();
        contentsToggle?.focus({ preventScroll: true });
      }
    };

    contentsToggle?.addEventListener("click", () => {
      if (!contentsDialog) return;
      if (contentsDialog.open) {
        closeContents();
        return;
      }
      if (typeof contentsDialog.showModal === "function") {
        contentsDialog.showModal();
      } else {
        contentsDialog.setAttribute("open", "");
        (contentsClose || contentsDialog.querySelector("a, button"))?.focus();
      }
      syncContents();
    });
    contentsClose?.addEventListener("click", closeContents);
    contentsDialog?.addEventListener("close", () => {
      syncContents();
      contentsToggle?.focus({ preventScroll: true });
    });
    syncContents();

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest(
        "[data-next], [data-prev], [data-first], [data-spread]",
      );
      if (!control) return;
      if (
        control.disabled ||
        control.getAttribute("aria-disabled") === "true"
      ) {
        event.preventDefault();
        return;
      }
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      )
        return;
      event.preventDefault();
      let index = current;
      if (control.hasAttribute("data-spread"))
        index = Number(control.dataset.spread) - 1;
      else if (control.hasAttribute("data-first")) index = 0;
      else if (control.hasAttribute("data-next")) index += 1;
      else if (control.hasAttribute("data-prev")) index -= 1;
      // Restore the dialog trigger's focus before scrolling to the selected chapter.
      if (contentsDialog?.contains(control)) closeContents();
      navigate(index);
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      )
        return;
      if (contentsDialog?.open) {
        if (
          event.key === "Escape" &&
          typeof contentsDialog.showModal !== "function"
        ) {
          event.preventDefault();
          closeContents();
        }
        return;
      }
      if (event.key === "Escape" && expanded) {
        event.preventDefault();
        exitExpanded();
        return;
      }
      if (readingMode || isEditable(event.target)) return;
      let index;
      if (event.key === "ArrowRight") index = current + 1;
      else if (event.key === "ArrowLeft") index = current - 1;
      else if (event.key === "Home") index = 0;
      else if (event.key === "End") index = spreads.length - 1;
      else return;
      event.preventDefault();
      navigate(index);
    });

    magazine.addEventListener(
      "touchstart",
      (event) => {
        touchStart = null;
        if (
          readingMode ||
          event.touches.length !== 1 ||
          !(event.target instanceof Element)
        )
          return;
        if (
          event.target.closest(
            'a, button, input, select, textarea, form, [contenteditable], [role="button"]',
          )
        )
          return;
        const touch = event.touches[0];
        touchStart = {
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
        };
      },
      { passive: true },
    );
    magazine.addEventListener(
      "touchend",
      (event) => {
        if (!touchStart) return;
        const start = touchStart;
        touchStart = null;
        const touch = Array.from(event.changedTouches).find(
          (item) => item.identifier === start.id,
        );
        if (!touch || readingMode) return;
        const deltaX = touch.clientX - start.x;
        const deltaY = touch.clientY - start.y;
        if (
          Math.abs(deltaX) >= 70 &&
          Math.abs(deltaX) > Math.abs(deltaY) * 1.3
        ) {
          navigate(current + (deltaX < 0 ? 1 : -1));
        }
      },
      { passive: true },
    );
    magazine.addEventListener(
      "touchcancel",
      () => {
        touchStart = null;
      },
      { passive: true },
    );

    readingToggle?.addEventListener("click", () => {
      readingMode = !readingMode;
      document.body.classList.toggle("reading-mode", readingMode);
      readingToggle.setAttribute("aria-pressed", String(readingMode));
      readingToggle.setAttribute(
        "aria-label",
        readingMode ? "Magazine view" : "Read as a page",
      );
      readingToggle.title = readingMode ? "Magazine view" : "Read as a page";
      const label = readingToggle.querySelector("[data-reading-label]");
      if (label)
        label.textContent = readingMode ? "Magazine view" : "Read as a page";
      window.clearTimeout(transitionTimer);
      magazine.classList.remove("is-turning");
      render();
      if (readingMode)
        spreads[current].scrollIntoView({
          behavior: "instant",
          block: "start",
        });
      else reader?.scrollIntoView({ behavior: "instant", block: "start" });
    });
    readingToggle?.setAttribute("aria-pressed", "false");

    const syncFullscreen = () => {
      if (!fullscreenToggle) return;
      fullscreenToggle.setAttribute("aria-pressed", String(expanded));
      const label = expanded ? "Exit full screen" : "Enter full screen";
      fullscreenToggle.setAttribute("aria-label", label);
      fullscreenToggle.title = label;
      const text = fullscreenToggle.querySelector("[data-fullscreen-label]");
      if (text)
        text.textContent = expanded ? "Exit full screen" : "Full screen";
    };

    const setExpanded = (active) => {
      expanded = active;
      reader?.classList.toggle("is-expanded", active);
      document.body.classList.toggle("reader-expanded", active);
      syncFullscreen();
    };

    const exitNativeFullscreen = () => {
      if (document.fullscreenElement !== reader) return;
      try {
        Promise.resolve(document.exitFullscreen()).catch(() => {});
      } catch {
        // The full-window fallback remains independently controllable.
      }
    };

    const exitExpanded = () => {
      setExpanded(false);
      exitNativeFullscreen();
    };

    const enterExpanded = () => {
      // The full-window reader responds immediately, even if native fullscreen stays pending.
      if (contentsDialog && !reader.contains(contentsDialog))
        reader.append(contentsDialog);
      setExpanded(true);
      if (fullscreenRequestPending || document.fullscreenElement === reader)
        return;
      fullscreenRequestPending = true;
      try {
        Promise.resolve(reader.requestFullscreen()).then(
          () => {
            fullscreenRequestPending = false;
            // A late native completion must respect a more recent exit action.
            if (!expanded) exitNativeFullscreen();
          },
          () => {
            fullscreenRequestPending = false;
          },
        );
      } catch {
        fullscreenRequestPending = false;
      }
    };

    if (fullscreenToggle) {
      if (
        !reader ||
        typeof reader.requestFullscreen !== "function" ||
        !document.fullscreenEnabled
      ) {
        fullscreenToggle.hidden = true;
      } else {
        fullscreenToggle.addEventListener("click", () => {
          if (expanded) exitExpanded();
          else enterExpanded();
        });
        document.addEventListener("fullscreenchange", () => {
          if (document.fullscreenElement !== reader) setExpanded(false);
          else if (!expanded) exitNativeFullscreen();
        });
        syncFullscreen();
      }
    }

    const restoreFromHistory = () => {
      // In-page accessibility links should not change the selected chapter.
      if (window.location.hash && !/^#spread-\d+$/.test(window.location.hash)) return;
      const index = indexFromHash();
      // Back/forward can dispatch both events for the same hash navigation.
      if (index !== current) navigate(index, { history: false });
    };
    window.addEventListener("hashchange", restoreFromHistory);
    window.addEventListener("popstate", restoreFromHistory);
    navigate(indexFromHash(), {
      history: false,
      announce: false,
      scroll: false,
    });
    updateHash(true);
  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();

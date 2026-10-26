/* ==========================================================================
   airZoon Pulse — Reader Page — preview bar + demo flow
   Same generic toggle pattern as the sibling archetypes: any preview-bar
   button group keyed on a data-* attribute sets that attribute on
   .splash-page-container. Add new attribute names to TOGGLE_ATTRS.

   This archetype is a click-through demo, so the page also moves itself
   through the screens: a click on the empty form fills it with sample
   data, a click on the button confirms. Nothing is typed, sent or stored.
   ========================================================================== */

(function(){
  var TOGGLE_ATTRS = ["flow-state", "ad-target", "theme-bg", "header", "fields"];

  function wireToggleGroup(container, attr){
    var buttons = document.querySelectorAll(".preview-bar [data-" + attr + "]");
    buttons.forEach(function(btn){
      btn.addEventListener("click", function(){
        if (container) container.setAttribute("data-" + attr, btn.getAttribute("data-" + attr));
      });
    });
  }

  /* Keep each group's pressed button in sync with the container, whether
     the change came from the bar or from the demo flow itself. */
  function syncPressed(container){
    TOGGLE_ATTRS.forEach(function(attr){
      var value = container.getAttribute("data-" + attr);
      document.querySelectorAll(".preview-bar [data-" + attr + "]").forEach(function(b){
        b.setAttribute("aria-pressed", b.getAttribute("data-" + attr) === value ? "true" : "false");
      });
    });
  }

  /* Demo form: sample values appear once the form is "filled". */
  function renderForm(container){
    var state = container.getAttribute("data-flow-state");
    var filled = state === "filled" || state === "confirmed";
    document.querySelectorAll("[data-demo-value]").forEach(function(input){
      input.value = filled ? input.getAttribute("data-demo-value") : "";
    });
    document.querySelectorAll("[data-demo-check]").forEach(function(box){
      box.checked = filled;
    });
  }

  function scrollToEl(el){
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function wireDemoForm(container){
    var form = document.querySelector("[data-demo-form]");
    if (!form) return;
    var anchor = document.querySelector("[data-demo-anchor]") || form;

    function fill(){
      if (container.getAttribute("data-flow-state") !== "empty") return;
      container.setAttribute("data-flow-state", "filled");
    }

    form.querySelectorAll(".signup-field-input").forEach(function(input){
      input.addEventListener("focus", function(){ fill(); input.blur(); });
      input.addEventListener("click", fill);
    });
    form.querySelectorAll("[data-demo-check]").forEach(function(box){
      box.addEventListener("click", function(e){ e.preventDefault(); fill(); });
    });
    form.addEventListener("submit", function(e){
      e.preventDefault();
      if (container.getAttribute("data-flow-state") === "empty") {
        fill();
      } else {
        container.setAttribute("data-flow-state", "confirmed");
        setTimeout(function(){ scrollToEl(anchor); }, 0);
      }
    });
  }

  /* Screen 0 only: the ad points at option A or B. */
  function renderAdTarget(container){
    var target = container.getAttribute("data-ad-target");
    if (!target) return;
    document.querySelectorAll("[data-ad-link]").forEach(function(a){
      a.setAttribute("href", a.getAttribute("data-href-" + target));
    });
  }

  function wireCollapse(){
    var bar = document.querySelector(".preview-bar");
    var hideBtn = document.getElementById("preview-bar-hide");
    var revealBtn = document.getElementById("preview-bar-show");
    if (!bar || !hideBtn || !revealBtn) return;

    function setOpen(open){
      bar.classList.toggle("is-hidden", !open);
      revealBtn.classList.toggle("is-hidden", open);
    }
    setOpen(/[?&]preview=1/.test(window.location.search));
    hideBtn.addEventListener("click", function(){ setOpen(false); });
    revealBtn.addEventListener("click", function(){ setOpen(true); });
  }

  function init(){
    var container = document.querySelector(".splash-page-container");
    if (!container) return;

    var next = (window.location.search.match(/[?&]next=(a|b)/) || [])[1];
    if (next && container.hasAttribute("data-ad-target")) container.setAttribute("data-ad-target", next);

    TOGGLE_ATTRS.forEach(function(attr){ wireToggleGroup(container, attr); });

    function render(){
      syncPressed(container);
      renderForm(container);
      renderAdTarget(container);
    }
    new MutationObserver(render).observe(container, { attributes: true });
    render();

    wireDemoForm(container);
    wireCollapse();

    var nav = document.getElementById("variant-nav");
    if (nav) {
      nav.addEventListener("change", function(e){ window.location.href = e.target.value; });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

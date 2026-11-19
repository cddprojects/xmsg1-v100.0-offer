(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
      toggle.textContent = open ? "Close" : "Menu";
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
        toggle.textContent = "Menu";
      }
    });
  }

  document.querySelectorAll("[data-band]").forEach(function (link) {
    link.addEventListener("click", function () {
      var band = document.getElementById("band");
      if (!band) return;
      band.value = link.getAttribute("data-band");
      band.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });

  var form = document.getElementById("enquire-form");
  if (!form) return;

  var summary = document.getElementById("form-errors");

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validMobile(value) {
    var digits = value.replace(/[^\d]/g, "");
    if (digits.indexOf("65") === 0 && digits.length === 10) digits = digits.slice(2);
    return /^[89]\d{7}$/.test(digits);
  }

  function setInvalid(field, invalid) {
    field.classList.toggle("is-invalid", invalid);
    var control = field.querySelector("input, select, textarea");
    if (control) control.setAttribute("aria-invalid", invalid ? "true" : "false");
  }

  form.addEventListener("input", function (event) {
    var field = event.target.closest(".field, .check");
    if (!field) return;
    setInvalid(field, false);
    if (!form.querySelector(".is-invalid")) {
      summary.classList.remove("show");
      summary.textContent = "";
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (form.company && form.company.value.trim() !== "") return;

    var errors = [];
    var checks = [
      { id: "name", bad: form.name.value.trim().length < 2, message: "Please enter your name." },
      { id: "email", bad: !validEmail(form.email.value.trim()), message: "Please enter a valid email address." },
      { id: "whatsapp", bad: !validMobile(form.whatsapp.value.trim()), message: "Please enter a Singapore mobile number." },
      { id: "residency", bad: form.residency.value === "", message: "Please select Citizen or PR." },
      { id: "hours", bad: form.hours.value === "", message: "Please let us know how many hours suit you." },
      { id: "band", bad: form.band.value === "", message: "Please choose a rate range." },
      { id: "skill", bad: form.skill.value === "", message: "Please choose a role, or let us guide you." }
    ];

    checks.forEach(function (item) {
      var field = form.querySelector("#" + item.id).closest(".field");
      setInvalid(field, item.bad);
      if (item.bad) errors.push(item.message);
    });

    [["eligible", "Please confirm your eligibility to continue."],
      ["consent", "Please give consent so we can review your application."]].forEach(function (pair) {
      var input = form.querySelector("#" + pair[0]);
      var field = input.closest(".check");
      setInvalid(field, !input.checked);
      if (!input.checked) errors.push(pair[1]);
    });

    if (errors.length) {
      summary.textContent = errors[0];
      summary.classList.add("show");
      var first = form.querySelector(".is-invalid input, .is-invalid select, .is-invalid textarea");
      if (first) first.focus();
      return;
    }

    summary.classList.remove("show");
    summary.textContent = "";

    var lines = [
      "Remote role application",
      "",
      "Name: " + form.name.value.trim(),
      "Email: " + form.email.value.trim(),
      "WhatsApp: " + form.whatsapp.value.trim(),
      "Residency: " + form.residency.value,
      "Hours per week: " + form.hours.value,
      "Preferred hourly rate: " + form.band.value,
      "Role: " + form.skill.value,
      "Note: " + (form.note.value.trim() || "None"),
      "",
      "I confirm I am a Singapore Citizen or PR, aged 25 or above, and eligible to work in Singapore.",
      "I agree to Pogo Hire using these details to review my application and contact me."
    ];

    var payload = {
      subject: "Remote role application — " + form.name.value.trim(),
      body: lines.join("\n")
    };

    try {
      sessionStorage.setItem("pogoEnquiryV3", JSON.stringify(payload));
    } catch (err) {
      summary.textContent = "Your browser didn’t let us save the form. Please email contact@pogohire.com and we’ll help you from there.";
      summary.classList.add("show");
      return;
    }

    window.location.href = "thank-you/";
  });
})();

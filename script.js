// Runs the 5-question checkup. Nothing is saved or sent anywhere.

// ---------- 1. Recommendation rules (edit these!) ----------
// Each rule says: "If the answer to `question` is one of the `triggers`,
// show this `text`." Question names match the `name` attributes in index.html.
// Answer values are "yes", "no", or "unsure".
const RULES = [
  {
    question: "settings",
    triggers: ["no", "unsure"],
    text: "Take a few minutes to open the privacy or permission settings in your apps. Turn off anything an app doesn't need to work, such as location or contacts."
  },
  {
    question: "sharing",
    triggers: ["no", "unsure"],
    text: "Look for the privacy policy or data-sharing settings in each app or portal, and see whether sharing with other companies is described. [Add a verified source about data sharing here]"
  },
  {
    question: "deletion",
    triggers: ["no", "unsure"],
    text: "Find out how to delete your data or account before you need to. Check the app's help page or settings, or contact the provider."
  },
  {
    question: "security",
    triggers: ["no", "unsure"],
    text: "Use a unique password for each account and turn on two-step verification where it's offered. A password manager can help."
  },
  {
    question: "shared",
    // Notice the logic is flipped here: "yes" is the risky answer.
    triggers: ["yes", "unsure"],
    text: "On shared devices or public Wi-Fi, log out when you finish and avoid opening sensitive accounts if you can wait for a private connection."
  }
];

// Shown if none of the rules trigger.
const ALL_GOOD_MESSAGE =
  "Nice work. Your answers don't point to any obvious gaps. Privacy settings and policies can change, so it's worth rechecking them now and then.";

// Most suggestions to display (set higher to show more).
const MAX_SUGGESTIONS = 4;

// ---------- 2. Grab page elements ----------
const form = document.getElementById("checkup-form");
const formError = document.getElementById("form-error");
const intro = document.getElementById("checkup-intro");
const results = document.getElementById("results");
const resultsHeading = document.getElementById("results-heading");
const resultsList = document.getElementById("results-list");
const restartButton = document.getElementById("restart");
const questionBoxes = document.querySelectorAll(".question");

// ---------- 3. Helper functions ----------

// Returns the selected value for a question, or null if nothing is selected.
function getAnswer(questionName) {
  const selected = form.querySelector(`input[name="${questionName}"]:checked`);
  return selected ? selected.value : null;
}

// Checks that every question has an answer and shows messages if not.
// Returns true when the form is complete.
function validateForm() {
  let firstMissing = null;

  questionBoxes.forEach((box) => {
    const name = box.dataset.question;
    const message = box.querySelector(".field-error");
    const missing = getAnswer(name) === null;

    box.classList.toggle("has-error", missing);
    message.hidden = !missing;

    if (missing && firstMissing === null) {
      firstMissing = box;
    }
  });

  if (firstMissing) {
    formError.textContent = "Please answer every question. Choose “Not sure” if you're unsure.";
    formError.hidden = false;
    // Move keyboard focus to the first unanswered question's first option.
    firstMissing.querySelector("input").focus();
    return false;
  }

  formError.hidden = true;
  return true;
}

// Builds the list of suggestions by checking each rule against the answers.
function buildSuggestions() {
  const suggestions = [];

  RULES.forEach((rule) => {
    const answer = getAnswer(rule.question);
    // includes() is true when the answer is in the rule's trigger list.
    if (rule.triggers.includes(answer)) {
      suggestions.push(rule.text);
    }
  });

  // Keep only the first few so the page isn't overwhelming.
  return suggestions.slice(0, MAX_SUGGESTIONS);
}

// Displays the results and hides the form.
function showResults(suggestions) {
  resultsList.innerHTML = "";

  const items = suggestions.length > 0 ? suggestions : [ALL_GOOD_MESSAGE];
  items.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text; // textContent is safe: it never runs HTML
    resultsList.appendChild(li);
  });

  form.hidden = true;
  intro.hidden = true;
  results.hidden = false;
  resultsHeading.focus(); // helps keyboard and screen reader users
}

// Clears everything and shows the form again.
function restart() {
  form.reset();
  formError.hidden = true;
  questionBoxes.forEach((box) => {
    box.classList.remove("has-error");
    box.querySelector(".field-error").hidden = true;
  });

  results.hidden = true;
  form.hidden = false;
  intro.hidden = false;
  form.querySelector("input").focus();
}

// ---------- 4. Wire up events ----------
form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page from reloading
  if (validateForm()) {
    showResults(buildSuggestions());
  }
});

restartButton.addEventListener("click", restart);

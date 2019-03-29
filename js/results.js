const RESULT_PATH = "js/results.json";

async function loadResults() {
  let response = await fetch(RESULT_PATH);
  return response.json();
}

const result_promise = loadResults();

function convertText(text) {
  if (text.startsWith("0x")) {
    return parseInt(text.substring(2), 16);
  } else {
    let value = parseInt(text, 10);
    if (value < 0) {
      value = (-value ^ 0xFFFFFFFF) + 1;
    }
    return value;
  }
}

async function lookupResult(value) {
  let results = await result_promise;
  for (let name of Object.keys(results)) {
    if (value == results[name].value) {
      return {
        name,
        message: results[name].message,
      };
    }
  }

  return null;
}

async function convert() {
  let value = convertText(document.getElementById("value").value);

  document.getElementById("code").textContent = `0x${value.toString(16)}`;

  let result = await lookupResult(value);
  document.getElementById("info").hidden = true;
  document.getElementById("results").hidden = false;

  document.getElementById("noresult").hidden = result !== null;
  document.getElementById("found").hidden = result === null;

  if (result !== null) {
    document.getElementById("name").textContent = result.name;
    if (result.message) {
      document.getElementById("message").textContent = result.message;
    } else {
      document.getElementById("message").textContent = "No defined message.";
    }
  }
}

function keydown(event) {
  if (event.key == "Enter") {
    convert();
  }
}

function init() {
  document.getElementById("results").hidden = true;
  document.getElementById("value").addEventListener("keydown", keydown);
  document.getElementById("lookup").addEventListener("click", convert);
}

document.addEventListener("DOMContentLoaded", init, { once: true });

// Globals
const enhancements = {};
const context = this;

// Decorator of sorts
function register(pathRegex, callback) {
  enhancements[pathRegex] = callback;
}

function inform(message) {
  console.log(message);
  context.alert(message);
}

function mapKeyBinding(checkFn, matchFn) {
  context.addEventListener("keyup", e => {
    if (checkFn(e)) {
      matchFn.apply(context);
    }
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// This is a bit ugly due to iframes
register("twilio.com/console/project/users", () => {
  async function addDeveloper(email) {
    console.log("Clicking add button");
    document.querySelectorAll(".ui-component-button_circle")[0].click();
    sleep(1000);
    document.querySelectorAll("input[name=email]")[0].value = email;
    document.querySelectorAll("input[name=Developer]")[0].click();
    sleep(500);
    document.querySelectorAll(".btn.btn-inverse")[0].click();
    // Check status? 
    sleep(500);
  }
  console.log("Activated. Call `addDeveloper`");
  window.addDeveloper = addDeveloper;
});

// TODO: This is a little broad still
register("twilio.com/docs/admin/.*", () => {
  function stripMatch(text, regex) {
    if (!regex.toString().includes("(")) {
      throw "This function will replace your first match in a regex, so you need to use parens";
    }
    return text.replace(regex, (match, p1) => {
      return match.replace(p1, "");
    });
  }

  function removeTableStyling(html) {
    let result = stripMatch(html, /<table[\W]+(style=".*")/gi);
    result = stripMatch(result, /<tr[\W]+(style=".*")/gi);
    result = stripMatch(result, /<td[\W]+(style=".*")/gi);
    return result;
  }

  function getSourceCodeTextArea() {
    const els = document.querySelectorAll(".mce-window-body textarea");
    if (els.length !== 1) {
      const msg = "Make sure you open the Source Code Window";
      context.alert(msg);
      throw msg;
    }
    return els[0];
  }

  function cleanupSourceCode() {
    const textArea = getSourceCodeTextArea();
    const orig = textArea.value;
    textArea.value = removeTableStyling(orig);
    console.log(`Cleaned up ${orig.length - textArea.value.length} characters`);
  }
  const setupMessage = `Press F2 when in Source Code window modal to clean`;
  inform(setupMessage);
  mapKeyBinding(e => e.code === 'F2', () => {
    cleanupSourceCode();
  });
});

// Router of sorts
function onLoad() {
  let enhanced = false;
  Object.keys(enhancements).forEach(function(pathRegex) {
    if (window.location.href.match(pathRegex)) {
      console.log("Matched on", pathRegex);
      enhanced = true;
      enhancements[pathRegex].apply(context);
    }
  });

  if (!enhanced) {
    console.warn("No enhancements found for", window.location.href);
    console.log("Available enhancements:", Object.keys(enhancements));
  }
}

onLoad();

// set up array for toggles modules
var expandedModules = [];

// hook on Settings Config Window
Hooks.on("renderSettingsConfig", (app, html) => {
  // wrap separat module settings
  html
    .find(
      ":not(.sidebar) :not(.form-group) + .form-group, * :not(.sidebar) > .form-group:first-of-type"
    )
    .each(function () {
      $(this)
        .nextUntil(":not(.form-group)")
        .addBack()
        .wrapAll('<section class="module-settings-wrapper" />');
    });

  // toggle checkboxes
  html.find(".form-group label").each(function () {
    if ($(this).next("div").find('input[type="checkbox"]').length) {
      $(this).wrapInner("<span>");
    }
  });

  html.find(".form-group label span").on("click", function () {
    var checkbox = $(this).parent().parent().find('input[type="checkbox"]');
    checkbox.click();
  });
});

// hook on Module Management Window
Hooks.on("renderModuleManagement", (app, html) => {
  // console.log('renderModuleManagement!');

  let form = html.find("form");
  if (!html.hasClass("form")) {
    form = html;
  }

  let disable = `<button class="disable-all-modules">${game.i18n.localize(
    "TidyUI.uncheckAll"
  )}</button>`;
  let enable = `<button class="enable-all-modules">${game.i18n.localize(
    "TidyUI.checkAll"
  )}</button>`;
  let exportBtn = `<button class="modules-export" title="${game.i18n.localize(
    "TidyUI.export"
  )}"><i class="fas fa-file-export"></i></button>`;
  let importBtn = `<button class="modules-import" title="${game.i18n.localize(
    "TidyUI.import"
  )}"><i class="fas fa-file-import"></i></button>`;
  let exportOptions = `<section class="export-options"><button class="modules-export-copy">${game.i18n.localize(
    "TidyUI.toClipboard"
  )}</button><button class="modules-download-json">${game.i18n.localize(
    "TidyUI.toFile"
  )}</button><section>`;
  let importOptions = `<section class="import-options"><button class="modules-import-json">${game.i18n.localize(
    "TidyUI.fromFile"
  )}</button><button class="modules-import-confirm">${game.i18n.localize(
    "TidyUI.activate"
  )}</button><section>`;
  let modalExport = `<div id="importExportModal"><div class="modal-wrap"><span id="close" title="${game.i18n.localize(
    "TidyUI.close"
  )}"><i class="fas fa-times"></i></span><div id="exportToast"><p>${game.i18n.localize(
    "TidyUI.notice"
  )}</p></div><textarea spellcheck="false" id="modalIO" placeholder="${game.i18n.localize(
    "TidyUI.paste"
  )}"></textarea></div></div>`;
  let warningText = `<section class="warning"><span>${game.i18n.localize(
    "TidyUI.warning"
  )}</span> ${game.i18n.localize("TidyUI.instruction")}<section>`;

  // add buttons
  form.prepend(modalExport);
  form
    .find("#importExportModal .modal-wrap")
    .append(warningText, exportOptions, importOptions);
  form.prepend('<div class="enhanced-module-management"></div>');

  form
    .find(".enhanced-module-management")
    .append(disable, enable, exportBtn, importBtn);

  let disableAll = html.find(".disable-all-modules");
  let enableAll = html.find(".enable-all-modules");

  // sorting
  // clean module names
  let title = html.find(".package-title");
  title.each(function () {
    var titleString = $(this).text();
    var cleanString = titleString
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s/g, "");
    $(this).closest(".package").attr("data-sort-name", cleanString);
  });

  // sort by displayed module name
  function Ascending_sort(a, b) {
    return $(b).attr("data-sort-name").toUpperCase() <
      $(a).attr("data-sort-name").toUpperCase()
      ? 1
      : -1;
  }

  html
    .find("#module-list li.package")
    .sort(Ascending_sort)
    .appendTo("#module-list");

  // remove all checkboxes except fvtt uii
  disableAll.on("click", function (e) {
    e.preventDefault();
    var checkbox = $("#module-management").find(
      '.package:not([data-module-id="tidy-ui_game-settings"]):not([data-module-id="tidy-ui"]) input[type="checkbox"]'
    );
    checkbox.prop("checked", false);
  });

  // set all checkboxes
  enableAll.on("click", function (e) {
    e.preventDefault();
    var checkbox = $("#module-management").find(
      '.package input[type="checkbox"]'
    );
    checkbox.prop("checked", true);
  });

  // export module list
  let modules = "";
  let modulesToImport = [];
  let activeModules = "";
  let inactiveModules = "";
  let activeModuleList;
  let inactiveModuleList;
  const json = {};

  let jsonProvided = false;

  let exportButton = form.find(".modules-export");
  let importButton = form.find(".modules-import");
  let exportMsg = form.find(".modal");
  let exportCopyButton = form.find(".modules-export-copy");
  let downloadJsonButton = form.find(".modules-download-json");
  let importJsonButton = form.find(".modules-import-json");
  let importConfirmButton = form.find(".modules-import-confirm");

  // open export window and generate list
  exportButton.on("click", function (e) {
    e.preventDefault();
    // create json for modules
    let jsonActive = [];
    let jsonInactive = [];
    json.activeModules = jsonActive;
    json.inactiveModules = jsonInactive;

    modules = "";
    activeModules = "";
    inactiveModules = "";
    activeModuleList = $("#module-list input:checked");
    inactiveModuleList = $("#module-list input:not(:checked)");

    // get active Modules
    for (let i = 0; i < activeModuleList.length; i++) {
      let moduleTitle = $(activeModuleList[i]).parent().text().trim();
      let moduleId = activeModuleList[i].attributes.name.value;
      let version = $('input[name="' + moduleId + '"')
        .closest(".package-overview")
        .find(".version")
        .text();
      version = version.slice(8);
      if (i == activeModuleList.length - 1) {
        activeModules += moduleTitle + " v" + version + ";";
      } else {
        activeModules += moduleTitle + " v" + version + ";\n";
      }
      let moduleObj = {};
      moduleObj.id = moduleId;
      moduleObj.title = moduleTitle;
      moduleObj.version = version;
      jsonActive.push(moduleObj);
    }

    // get inactive Modules
    for (let i = 0; i < inactiveModuleList.length; i++) {
      let moduleTitle = $(inactiveModuleList[i]).parent().text().trim();
      let moduleId = inactiveModuleList[i].attributes.name.value;
      let version = $('input[name="' + moduleId + '"')
        .closest(".package-overview")
        .find(".version")
        .text();
      version = version.slice(8);
      if (i == inactiveModuleList.length - 1) {
        inactiveModules += moduleTitle + " v" + version + ";";
      } else {
        inactiveModules += moduleTitle + " v" + version + ";\n";
      }
      let moduleObj = {};
      moduleObj.id = moduleId;
      moduleObj.title = moduleTitle;
      moduleObj.version = version;
      jsonInactive.push(moduleObj);
    }

    // build and display copy text
    modules = `Active Modules:\n----------\n${activeModules}\n\nInactive Modules:\n----------\n${inactiveModules}`;
    html
      .find("#importExportModal")
      .removeClass()
      .addClass("export")
      .find("#modalIO")
      .val(modules);

    html.find("#importExportModal").fadeIn();
  });

  // copy list to clipboard
  exportCopyButton.on("click", function (e) {
    e.preventDefault();
    html.find("#modalIO").select();
    document.execCommand("copy");
    html.find("#importExportModal #exportToast").fadeIn();
    return false;
  });

  // download json file
  downloadJsonButton.on("click", function (e) {
    e.preventDefault();
    const moduleListFile = JSON.stringify(json, null, 2);
    saveDataToFile(moduleListFile, "application/json", "moduleList.json");
  });

  // close the import/export window
  $("#importExportModal #close").on("click", function (e) {
    e.preventDefault();
    html.find("#importExportModal").fadeOut(function () {
      html.find("#modalIO").val("");
      html.find("#importExportModal #exportToast").hide();
    });
  });

  // open import input
  importButton.on("click", function (e) {
    e.preventDefault();
    modules = "";
    jsonProvided = false;
    html.find("#importExportModal").removeClass().addClass("import").fadeIn();
  });

  // download json file
  importJsonButton.on("click", function (e) {
    e.preventDefault();
    const input = $('<input type="file">');
    input.on("change", importGameSettings);
    input.trigger("click");
  });

  function importGameSettings() {
    const file = this.files[0];
    if (!file) {
      console.log("No file provided for game settings importer.");
      return;
    }

    readTextFromFile(file).then(async (result) => {
      try {
        console.log("json provided");
        const modulesToActivate = JSON.parse(result);
        let modules = "Modules to activate \n ---------- \n\n";

        for (let i = 0; i < modulesToActivate.activeModules.length; i++) {
          modulesToImport.push(modulesToActivate["activeModules"][i]["id"]);
          modules += modulesToActivate["activeModules"][i]["title"] + "\n";
        }
        html
          .find("#importExportModal")
          .removeClass()
          .addClass("import")
          .find("#modalIO")
          .val(modules);
        jsonProvided = true;
      } catch (e) {
        console.log("Could not parse import data.");
      }
    });
  }

  // Activate all pasted Modules and close window
  importConfirmButton.on("click", function (e) {
    e.preventDefault();
    if (!jsonProvided) {
      let importPaste = html.find("#importExportModal #modalIO").val();
      if (isJSON(importPaste)) {
        console.log("is valid JSON");
        const modulesToActivate = JSON.parse(result);

        for (let i = 0; i < modulesToActivate.activeModules.length; i++) {
          modulesToImport.push(modulesToActivate["activeModules"][i]["id"]);
        }
      } else {
        console.log("Using old format");
        modulesToImport = importPaste
          .replace(/\s/g, "")
          .replace(/--v.*?;/g, ";")
          .slice(0, -1);
        modulesToImport = modulesToImport.split(";");
      }
    }

    html.find("#module-list input").prop("checked", false);
    for (let i = 0; i < modulesToImport.length; i++) {
      html
        .find('#module-list input[name="' + modulesToImport[i] + '"]')
        .prop("checked", true);
    }

    $("#importExportModal").fadeOut(function () {
      html.find("#modalIO").val("");
    });
  });

  // check if valid JSON
  function isJSON(str) {
    if (/^\s*$/.test(str)) return false;
    str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@");
    str = str.replace(
      /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
      "]"
    );
    str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, "");
    return /^[\],:{}\s]*$/.test(str);
  }

  if (game.settings.get("tidy-ui_game-settings", "hideDisableAll")) {
    html.find('button[name="deactivate"]').css("display", "none");
  }
});

Hooks.once("init", () => {
  game.settings.register("tidy-ui_game-settings", "hideDisableAll", {
    name: game.i18n.localize("TidyUI.hideDisableAll.name"),
    hint: game.i18n.localize("TidyUI.hideDisableAll.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  });
});

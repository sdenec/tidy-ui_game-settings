// set up array for toggles modules
var expandedModules = [];

// hook on Settings Config Window
Hooks.on("renderSettingsConfig", (app, html) => {

  
  let active = html.find('.tab[data-tab="modules"] .settings-list');
  let list = '.tab[data-tab="modules"] .settings-list';
// search field
  let searchField = '<div id="searchField"><input id="searchInput" type="text" spellcheck="false" placeholder="Start typing to filter modules"><button id="clear" title="clear search field"><i class="fas fa-times"></i></button></div>'
  active.prepend(searchField);

  // filter settings list
  let searchInput = html.find('#searchField #searchInput');
  let clearSearch = html.find('#searchField #clear');

  searchInput.on('input', function(){
    filterSettingsList(searchInput);
  });

  function filterSettingsList(input) {
    let value = $(input).val();
    if(value != ''){
      clearSearch.addClass('show');
    } else {
      clearSearch.removeClass();
    }

    value = value.toLowerCase().replace(/\b[a-z]/g, function(letter) {
      return letter.toUpperCase();
    });

    $(".settings-list .module-header").each(function() {
      if ($(this).text().search(value) > -1) {
        $(this).closest('.module-wrapper').show();
      } else {
        $(this).closest('.module-wrapper').hide();
      }
    });
  }

  // clear search
  clearSearch.on('click', function(e){
    e.preventDefault();
    searchInput.val('');
    filterSettingsList(searchInput);
  });

  // wrap separat module settings
 	$(':not(.form-group) + .form-group, * > .form-group:first-of-type').
    each(function() {
      $(this).
        nextUntil(':not(.form-group)').
        addBack().
        wrapAll('<section class="module-settings-wrapper" />');
    });

  // wrap module header and settings
  $('.tab[data-tab="modules"] .module-header').each( function () {
    $(this).next('.module-settings-wrapper').addBack().wrapAll('<article class="module-wrapper"></article>');
  });

  // sorting
  // clean module names
  let title = html.find('.tab[data-tab="modules"] .module-header');
  title.each(function(){
    var titleString = $(this).text();
    var cleanString = titleString.toLowerCase().replace(/[^\w\s]/g,'').replace(/  /g,' ').replace(/ /g,'-');
    $(this).closest('.module-wrapper').attr('data-sort-name', cleanString);
  });

  // sort by displayed module name
  function Ascending_sort(a, b) { 
      return ($(b).attr('data-sort-name').toUpperCase()) <  
          ($(a).attr('data-sort-name').toUpperCase()) ? 1 : -1;  
  } 

  $(".settings-list article.module-wrapper").sort(Ascending_sort).appendTo('.tab[data-tab="modules"] .settings-list');


  // add toggle icon
  let icon = "<span class='toggle-icon'><i class='far fa-plus-square'></i><i class='far fa-minus-square'></i></span>";
  $('.tab[data-tab="modules"] h2.module-header').prepend("<span class='toggle-icon'><i class='far fa-plus-square'></i><i class='far fa-minus-square'></i></span>");

  // hide module settings
  $('.tab[data-tab="modules"] .module-header').next('.module-settings-wrapper').hide();

  // toggle settings on click
  $('.tab[data-tab="modules"] .module-header').on('click', function(){
    $(this).toggleClass('open');
    //
    // store module name in array
    var moduleName = $(this).closest('.module-wrapper').attr('data-sort-name');
    storeExpandedModule(moduleName);
    //
  	$(this).next('.module-settings-wrapper').slideToggle(300);
  });

  // toggle checkboxes
  $('.form-group label').each(function(){
    if( $(this).next('div').find('input[type="checkbox"]').length ){
      $(this).wrapInner('<span>')
    }
  });

  $('.form-group label span').on('click', function(){
    var checkbox = $(this).parent().parent().find('input[type="checkbox"]');
    checkbox.prop("checked", !checkbox.prop("checked"));
  });

  // Restore logged modules
  if(expandedModules.length > 0){
    // console.log('something in array');
    for(var i=0; i<expandedModules.length; i++){
      var moduleToExpand = expandedModules[i];
      $('.module-wrapper[data-sort-name="'+ moduleToExpand +'"').find('.module-header').addClass('open');
      $('.module-wrapper[data-sort-name="'+ moduleToExpand +'"').find('.module-settings-wrapper').show();
    }
  }

  // Store expanded modules
  function storeExpandedModule(moduleName){
    if(expandedModules.includes(moduleName)){
      var index = expandedModules.indexOf(moduleName);
      expandedModules.splice(index,1);
    } else {
      expandedModules.push(moduleName);
    }
  }

  if (game.settings.get("tidy-ui_game-settings", "moduleSettingsActive")) {
    app._tabs[0].activate("modules");
  };

});

// hook on Module Management Window
Hooks.on("renderModuleManagement", (app, html) => {
  let form = html.find('form');
  let disable = '<button class="disable-all-modules">Uncheck all but Tidy UI modules</button>';
  let enable = '<button class="enable-all-modules">Check all modules</button>';
  let infos = '<button class="toggle-infos">Toggle Module Information</button>';
  let exportBtn = '<button class="modules-export" title="Export Active Module List"><i class="fas fa-file-export"></i></button>';
  let importBtn = '<button class="modules-import" title="Import Module List"><i class="fas fa-file-import"></i></button>';
  let exportClose = '<button class="modules-export-copy">Copy to Clipboard</button>';
  let importConfirm = '<button class="modules-import-confirm">Activate Modules</button>';
  let searchField = '<div id="searchField"><input id="searchInput" type="text" value="" placeholder="Start typing to filter modules"><button id="clear" title="clear search field"><i class="fas fa-times"></i></button></div>'
  let modalExport = '<div id="importExportModal"><div class="modal-wrap"><span id="close" title="close window"><i class="fas fa-times"></i></span><div id="exportToast"><p>Module list copied to clipboard - remember to save it!</p></div><textarea spellcheck="false" id="modalIO" placeholder="Paste your stored modules list here!"></textarea></div></div>';

  // add buttons
  form.prepend(modalExport);
  form.find('#importExportModal .modal-wrap').append(exportClose).append(importConfirm);
  form.prepend(infos);
  form.prepend('<div class="enhanced-module-management"></div>');
  form.prepend('<div class="mass-toggle"></div>');

  form.find('.enhanced-module-management').append(searchField).append(exportBtn).append(importBtn);
  form.find('.mass-toggle').append(disable).append(enable);

  let disableAll = html.find('.disable-all-modules');
  let enableAll = html.find('.enable-all-modules');
  let toggleInfos = html.find('.toggle-infos');

  // sorting
  // clean module names
  let title = html.find('.package-title');
  title.each(function(){
    var titleString = $(this).text();
    var cleanString = titleString.toLowerCase().replace(/[^\w\s]/g,'').replace(/  /g,' ').replace(/ /g,'-');
    $(this).closest('.package').attr('data-sort-name', cleanString);
  });

  // sort by displayed module name
  function Ascending_sort(a, b) { 
      return ($(b).attr('data-sort-name').toUpperCase()) <  
          ($(a).attr('data-sort-name').toUpperCase()) ? 1 : -1;  
  } 

  $("#module-list li.package").sort(Ascending_sort).appendTo('#module-list'); 

  // checkbox toggle
  title.wrapInner('<span>');

  let inputTrigger = html.find('.package-title span');
  let packageMetadata = html.find('.package-metadata');
  let packageDescription = html.find('.package-description');

  packageMetadata.hide();
  packageDescription.hide();
  form.addClass('infos-compressed');

  inputTrigger.on('click', function(){
    var checkbox = $(this).parent().siblings('input[type="checkbox"]');
    checkbox.prop("checked", !checkbox.prop("checked"));
  });

  // toggle infos
  toggleInfos.on('click', function(e){
    e.preventDefault();
    form.toggleClass('infos-compressed');
    packageMetadata.toggle();
    packageDescription.toggle();
  });

  // remove all checkboxes except fvtt uii
  disableAll.on('click', function(e){
    e.preventDefault();
    var checkbox = $('#module-management').find('.package:not([data-module-name="tidy-ui_game-settings"]):not([data-module-name="tidy-ui"]) input[type="checkbox"]');
    checkbox.prop("checked", false);
  });

  // set all checkboxes
  enableAll.on('click', function(e){
    e.preventDefault();
    var checkbox = $('#module-management').find('.package input[type="checkbox"]');
    checkbox.prop("checked", true);
  });

  // filter module list
  let searchInput = html.find('#searchField #searchInput');
  let clearSearch = html.find('#searchField #clear');

  searchInput.on('input', function(){
    filterModuleList(searchInput);
  });

  function filterModuleList(input) {
    let value = $(input).val();
    if(value != ''){
      clearSearch.addClass('show');
    } else {
      clearSearch.removeClass();
    }
    value = value.toLowerCase().replace(/\b[a-z]/g, function(letter) {
      return letter.toUpperCase();
    });

    $("#module-list h3 span").each(function() {
      if ($(this).text().search(value) > -1) {
        $(this).closest('.package').show();
      } else {
        $(this).closest('.package').hide();
      }
    });
  }

  // clear search
  clearSearch.on('click', function(e){
    e.preventDefault();
    searchInput.val('');
    filterModuleList(searchInput);
  });

  // export module list
  let modules = '';
  let moduleList = ''

  let exportButton = form.find('.modules-export');
  let importButton = form.find('.modules-import');
  let exportMsg = form.find('.modal');
  let exportCopyButton = form.find('.modules-export-copy');
  let importConfirmButton = form.find('.modules-import-confirm');

  // open export window and generate list
  exportButton.on('click', function(e){
    e.preventDefault();
    modules = '';
    moduleList = $('#module-list input[checked]');

    for(let i = 0; i < moduleList.length; i++){
      let moduleName = moduleList[i].attributes.name.value;
      let version = $('input[name="'+moduleName+'"').parent().find('.version').text();
      version = version.slice(8);
      if(i == moduleList.length - 1){
        modules += moduleName+'--v'+version+';';
      } else {
        modules += moduleName+'--v'+version+';\n';
      }
    }

    $('#importExportModal').removeClass().addClass('export').find('#modalIO').val(modules);

    $('#importExportModal').fadeIn();
  });

  // copy list to clipboard
  exportCopyButton.on('click', function(e){
    e.preventDefault();
    $("#modalIO").select();
    document.execCommand('copy');
    $('#importExportModal #exportToast').fadeIn();
    return false;
  });

  // close the import/export window
  $('#importExportModal #close').on('click', function(e){
    e.preventDefault();
    $('#importExportModal').fadeOut(function(){
      $('#modalIO').val('');
      $('#importExportModal #exportToast').hide();
    });
  });

  // open import input
  importButton.on('click', function(e){
    e.preventDefault();
    modules = '';
    $('#importExportModal').removeClass().addClass('import').fadeIn();
  });

  // Activate all pasted Modules and close window
  importConfirmButton.on('click', function(e){
    e.preventDefault();
    let importPaste = $('#importExportModal #modalIO').val();
    let modulesToImport = importPaste.replace(/\s/g,'').replace(/--v.*?;/g, ';').slice(0, -1);
    modulesToImport = modulesToImport.split(";");

    for(let i = 0; i<modulesToImport.length; i++){
      $('#module-list input[name="'+modulesToImport[i]+'"]').prop("checked", true);
    }

    $('#importExportModal').fadeOut(function(){
      $('#modalIO').val('');
    });
  });

});

Hooks.once("init", () => {
  console.log('activation tidy ui settings');
  game.settings.register("tidy-ui_game-settings", "moduleSettingsActive", {
    name: "Always activate the Module Settings Tab",
    hint: "If you happen to visit the Module Settings often you might want to set this option so you don't have to click to activate the Module Settings Tab.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
});
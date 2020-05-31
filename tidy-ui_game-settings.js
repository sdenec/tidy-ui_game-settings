// set up array for toggles modules
var expandedModules = [];

// hook on Settings Config Window
Hooks.on("renderSettingsConfig", (app, html) => {


  let active = html.find('.tab[data-tab="modules"] .settings-list');
  let list = '.tab[data-tab="modules"] .settings-list';

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

});

// hook on Module Management Window
Hooks.on("renderModuleManagement", (app, html) => {
  let form = html.find('form');
  let disable = '<button class="disable-all-modules">Uncheck all but Tidy UI modules</button>';
  let enable = '<button class="enable-all-modules">Check all modules</button>';
  let infos = '<button class="toggle-infos">Toggle Module Information</button>';
  
  // add buttons
  form.prepend(infos);
  form.prepend('<div class="mass-toggle"></div>');

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

});
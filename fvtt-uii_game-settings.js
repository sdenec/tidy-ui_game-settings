Hooks.on("renderSettingsConfig", (app, html) => {
  let active = html.find('.tab[data-tab="modules"] .settings-list');
  let list = '.tab[data-tab="modules"] .settings-list';

 	$(':not(.form-group) + .form-group, * > .form-group:first-of-type').
   each(function() {
     $(this).
         nextUntil(':not(.form-group)').
         addBack().
         wrapAll('<section class="module-settings-wrapper" />');
   });

   let icon = "<span class='toggle-icon'><i class='far fa-plus-square'></i><i class='far fa-minus-square'></i></span>";

   $('h2.module-header').prepend("<span class='toggle-icon'><i class='far fa-plus-square'></i><i class='far fa-minus-square'></i></span>");

   $('.module-header').next('.module-settings-wrapper').hide();

   $('.module-header').on('click', function(){
    $(this).toggleClass('open');
   	$(this).next('.module-settings-wrapper').slideToggle(300);
   });

   $('.form-group label').each(function(){
    if( $(this).next('div').find('input[type="checkbox"]').length ){
      $(this).wrapInner('<span>')
    }
   });

   $('.form-group label span').on('click', function(){
    var checkbox = $(this).parent().parent().find('input[type="checkbox"]');
    checkbox.prop("checked", !checkbox.prop("checked"));
   });

});

Hooks.on("renderModuleManagement", (app, html) => {
  let form = html.find('form');
  let button = '<button class="toggle-infos">Toggle Module Information</button>';
  
  form.prepend(button);

  let toggleInfos = html.find('.toggle-infos');
  let title = html.find('.package-title');
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

  toggleInfos.on('click', function(e){
    e.preventDefault();
    form.toggleClass('infos-compressed');
    packageMetadata.toggle();
    packageDescription.toggle();
  });
});
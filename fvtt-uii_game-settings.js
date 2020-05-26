Hooks.on("renderSettingsConfig", (app, html) => {
  console.log('settings-ready!');
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
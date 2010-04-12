document.on('click', '#reorder_task_lists_link, #done_reordering_task_lists_link', function(e, element){
  $$('.task_list_container').each(function(value) { value.toggleClassName('reordering'); });
  $('reorder_task_lists_link').hide();
  $('done_reordering_task_lists_link').show();
});

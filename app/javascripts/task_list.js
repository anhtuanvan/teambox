var TaskList = {
  destroy: function(element, url) {
    new Ajax.Request(url, {
      method: 'delete',
      asynchronous: true,
      evalScripts: true,
      onLoading: function() {
        //element.up('.actions_menu').hide();
      },
      onSuccess: function(response){
        // ...
      },
      onFailure: function(response){	
        //element.up('.actions_menu').show();
      }
    });
  },

  updateForm: function(element, url) { 
    new Ajax.Request(url, {
      method: 'get',
      asynchronous: true,
      evalScripts: true,
      onLoading: function() {
        //element.up('.actions_menu').hide();
      },
      onSuccess: function(response){
        // ...
      },
      onFailure: function(response){	
        //element.up('.actions_menu').show();
      }
    });	
  }
};

document.on('click', '#reorder_task_lists_link, #done_reordering_task_lists_link', function(e, element){
  $$('.task_list_container').each(function(value) { value.toggleClassName('reordering'); });
  $('reorder_task_lists_link').hide();
  $('done_reordering_task_lists_link').show();
});

document.on('click', 'a.taskListUpdate', function(e, el) {
	TaskList.updateForm(el, el.readAttribute('action_url'));
	e.stop();
});

document.on('click', 'a.taskListDelete', function(e, el) {
	if (confirm(el.readAttribute('aconfirm')))
	  TaskList.destroy(el, el.readAttribute('action_url'));
	e.stop();
});

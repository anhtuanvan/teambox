var TaskList = {
  destroy: function(element, url) {
    new Ajax.Request(url, {
      method: 'delete',
      asynchronous: true,
      evalScripts: true,
      onLoading: function() {
        TaskList.setLoading(element, true);
      },
      onSuccess: function(response){
        // ...
      },
      onFailure: function(response){
        TaskList.setLoading(element, false);
      }
    });
  },

  updateForm: function(element, url) { 
    new Ajax.Request(url, {
      method: 'get',
      asynchronous: true,
      evalScripts: true,
      onLoading: function() {
        TaskList.setLoading(element, true);
      },
      onSuccess: function(response){
        TaskList.setActions(element, false);
        TaskList.setLoading(element, false);
      },
      onFailure: function(response){	
        TaskList.setLoading(element, false);
      }
    });	
  },

  setActions: function(element, visible) {
    var actions = element.up('.task_list_container').down('.actions_menu');
    if (actions == null)
      return;
    if (visible)
      actions.show();
    else
      actions.hide();
  },

  setTitle: function(element, visible) {
    var title = $(element.readAttribute('jennybase') + 'title');
    if (title == null)
      return;
    if (visible)
      title.show();
    else
      title.hide();
  },

  setLoading: function(element, loading) {
    var actions = element.up('.task_list_container').down('.actions_menu');
    if (actions == null)
      return;
    if (loading)
    {
      actions.addClassName('loading');
      actions.down('span.loading').show();
      actions.down('span.actiondate').hide();
    }
    else
    {
      actions.removeClassName('loading');
      actions.down('span.loading').hide();
      actions.down('span.actiondate').show();	
    }
  },

  setReorder: function(active) {
    $$('.task_list_container').each(function(value) { 
      if(active)
        value.addClassName('reordering');
      else
        value.removeClassName('reordering');
    });

    if (active)
    {
      $('reorder_task_lists_link').hide();
      $('done_reordering_task_lists_link').show();
      Filter.showAllTaskLists();
    }
    else
    {
      $('reorder_task_lists_link').show();
      $('done_reordering_task_lists_link').hide();
      Filter.updateFilters();
    }
  }
};

document.on('click', '#reorder_task_lists_link, #done_reordering_task_lists_link', function(e, element){
  TaskList.setReorder(true);
});

document.on('click', '#done_reordering_task_lists_link', function(e, element){
  TaskList.setReorder(false);
});

document.observe('jenny:cancel:edit_task_list', function(evt) {
  // Only do this on the index
  if (evt.memo.form.up('.task_list_container'))
  {
    TaskList.setTitle(evt.memo.form, true);
    TaskList.setActions(evt.memo.form, true);
  }
  else
  {
    evt.memo.form.up().down(".task_header").show();
  }
});

// update action
document.on('click', 'a.taskListUpdate', function(e, el) {
  TaskList.updateForm(el, el.readAttribute('action_url'));
  e.stop();
});

// delete action
document.on('click', 'a.taskListDelete', function(e, el) {
  if (confirm(el.readAttribute('aconfirm')))
    TaskList.destroy(el, el.readAttribute('action_url'));
  e.stop();
});

document.on('click', 'a.create_first_task_list_link', function(e, el) {
  Jenny.toggleElement(el); // edit form on task list show
  e.stop();
});

document.on('click', 'a.edit_task_list_link', function(e, el) {
  Jenny.toggleElement(el); // edit form on task list show
  e.stop();
});


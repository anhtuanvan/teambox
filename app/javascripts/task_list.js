var TaskList = {
  in_sort: false,

  makeSortable: function() {
	TaskList.in_sort = true;
    Sortable.create('task_lists', {
      constraint:'vertical',
      handle:'img.drag',
      tag:'div',
      only:'task_list_container',
      onUpdate: function(){
        new Ajax.Request($('task_lists').readAttribute("reorder_url"), {
          asynchronous: true,
          evalScripts: true,
          parameters: Sortable.serialize('task_lists')
        });
      }
    });
  },
  destroySortable: function() {
	TaskList.in_sort = false;
	Sortable.destroy('task_lists');
  },

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
        setTimeout(function(){TaskList.updatePrimer();}, 0);
      },
      onFailure: function(response){
        TaskList.setLoading(element, false);
      }
    });
  },

  // Updates task list state
  updateList: function(id) {
    // ...
    var list = $(id);
    if (!list)
      return;
    
    var open = $(id + '_the_main_tasks');
    var archived = $(id + '_the_closed_tasks');
    var open_count = open.childElements().length;
    var archived_count = archived.childElements().length;
    var link = $(id + '_archive_link');
    if (open_count == 0 && archived_count > 0)
      link.show();
    else
      link.hide();
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

  updatePage: function(part) {
    var el = $('task_lists');
    if (!el)
      el = $('show_task_list');
    if (!el)
      el = $('show_task');
    if (!el)
      return;
    var url = el.readAttribute('reload_url');
    url = url.indexOf('?') >= 0 ? (url + '&part=' + part) : (url + '?part=' + part);
    new Ajax.Request(url, {
      asynchronous: true,
      evalScripts: true,
      method: 'get'
    })
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
      TaskList.makeSortable();
    }
    else
    {
      $('reorder_task_lists_link').show();
      $('done_reordering_task_lists_link').hide();
      Filter.updateFilters();
      TaskList.destroySortable();
    }
  },
  
  updatePrimer: function() {
    var primer = $('primer');
    if (primer && $$('.task_list').length == 0)
      primer.show();
    else if (primer)
      primer.hide();
  }
};

document.on('click', '#reorder_task_lists_link', function(e, element){
  TaskList.setReorder(true);
});

document.on('click', '#done_reordering_task_lists_link', function(e, element){
  TaskList.setReorder(false);
});

document.observe('jenny:loaded:edit_task_list', function(evt) {
  // Reload sort
  if (TaskList.in_sort) {
    setTimeout(function(){
      TaskList.setReorder(false);	
      TaskList.setReorder(true);
    }, 0);
  }
  TaskList.updatePage('column');
});

document.observe('jenny:loaded:new_task_list', function(evt) {
  // Reload sort
  if (TaskList.in_sort) {
	setTimeout(function(){
      TaskList.setReorder(false);	
      TaskList.setReorder(true);
    }, 0);
  }
  setTimeout(function(){
    TaskList.updatePrimer();
    TaskList.updatePage('column');
  }, 0);
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


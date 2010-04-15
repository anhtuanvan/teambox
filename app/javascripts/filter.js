Filter = {
  showAllTaskLists: function() {
    $$(".task_list_container").each(function(e){ e.show() })
  },
  showAllTasks: function() {
    $$("table.task_list tr.task").each(function(e){ e.show() });
    $$("table.task_list_closed tr.task").each(function(e){ e.show() });
  },
  hideAllTasks: function() {
    $$("table.task_list tr.task").each(function(e){ e.hide() });
    $$("table.task_list_closed tr.task").each(function(e){ e.hide() });
  },
  showTasks: function(by, filter) {
    $$("table.task_list tr." + by).each(function(e){
      if (filter == null || e.hasClassName(filter))
        e.show();
      else
        e.hide();
    });
  },
  hideTasks: function(by, filter) {
    $$("table.task_list tr." + by).each(function(e){
      if (filter == null || e.hasClassName(filter))
        e.hide();
      else
        e.show();
    });
  },
  // Hides task lists if they don't have any visible tasks
  foldEmptyTaskLists: function() {
    $$("table.task_list").each(function(e) {
      visible_tasks = e.select("tr.task").reject( function(e) {
        return e.getStyle("display") == "none";
      })
      if(visible_tasks.length == 0) {
        e.up('.task_list_container').hide();
      }
    })
  },

  updateFilters: function() {
    var el = $("filter_assigned");
    var el_filter = $("filter_due_date");

    var assigned = el.value == 'all' ? 'task' : el.value;
    var filter = el_filter.value == 'all' ? null : el_filter.value;
    
    Filter.showAllTaskLists();
    Filter.hideAllTasks();
    Filter.showTasks(assigned, filter);

    if (!(assigned == 'task' && filter == null))
      Filter.foldEmptyTaskLists();
  }
};

document.on("change", "#filter_assigned", function(evt, el){
  Filter.updateFilters();
});

document.on("change", "#filter_due_date", function(evt, el){
  Filter.updateFilters();
});

Event.addBehavior({
  ".note:mouseover": function(e){
    $(this).select('p.actions').each(function(e) {
      e.show();
    });
  },
  ".note:mouseout": function(e){
    $$(".note p.actions").each(function(e){ 
      e.hide();
    });
  },
  ".divider:mouseover": function(e){
    $(this).select('p.actions').each(function(e) {
      e.show();
    });
  },
  ".divider:mouseout": function(e){
    $$(".divider p.actions").each(function(e){ 
      e.hide();
    });
  },
  ".pageSlot .upload:mouseover": function(e){
    $(this).select('p.slotActions').each(function(e) {
      e.show();
    });
  },
  ".pageSlot .upload:mouseout": function(e){
    $$(".pageSlot .upload p.slotActions").each(function(e){ 
      e.hide();
    });
  },
  ".pageForm a.cancel:click": function(e){
    e.element().up('.pageForm').remove();
    return false;
  },
  "#pageInsert:click": function(e) {
    if (InsertionBar.current_form) {
      InsertionBar.place();
    } else {
      InsertionBar.show();
      InsertionMarker.setEnabled(false);
      InsertionMarker.hide();
    }

    return false;
  },
  "#pageInsertItemCancel a:click": function(e) {
    InsertionBar.hide();
    InsertionMarker.setEnabled(true);
    
    return false;
  }
});

// Page controller object
var Page = {
  MARGIN: 20,
  SLOT_VERGE: 20,
  SLOT_GAP: 36,
  READONLY: false,

  init: function(readonly, url, auth) {
    this.READONLY = readonly;
    this.url = url;
    this.auth = auth;
    document.currentPage = this;
    if (!readonly) {
      InsertionMarker.init();
      InsertionBar.init();
      InsertionMarker.set(null, true);

      $($('content').parentNode).observe('mousemove', InsertionMarkerFunc);
    }
  },

  makeSortable: function() {
    if (this.READONLY)
      return;

    Sortable.create('slots', {handle: 'slot_handle', tag: 'div', only: 'pageSlot',
      onUpdate: function() {
        new Ajax.Request(Page.url + '/reorder',
        {
          asynchronous:true, evalScripts:true,
          onComplete:function(request) {},
          parameters:Sortable.serialize('slots', {name: 'slots'}) + '&authenticity_token=' + Page.auth
        });
      } 
    });
  },

  insertWidget: function(widget_id, pos, element_id, content) {
    var el = $(element_id);
    var opts = {};
    if (!el) {
      // fallback: before/after == top/bottom
      el = $('slots');
      if (pos == 'before')
        opts['top'] = content;
      else if (pos == 'after')
        opts['bottom'] = content;
      else
        opts[pos] = content; // 0_0;
    } else {
      opts[pos] = content;
    }

    el.insert(opts);
    new Effect.Highlight(widget_id, {duration:3});
  },

  refreshEvents: function() {
    Event.addBehavior.reload();
  },

  removeIFrameForm: function(frameDoc) {
  $$('iframe').each(function(element) {
    if (Page.uploaderDocument(element) == frameDoc) {
      $(element).up('.pageForm').remove();
      throw $break;
    }
  });
  },

  uploaderDocument: function(iframe) {
    var doc = iframe.contentDocument;
    if (!doc) {
      var wnd = iframe.contentWindow;
      doc = wnd ? wnd.document : null;
    }
    if (!doc) {
      return iframe.document;
    }
    return doc;
  },

  widgetActionHandler: function(el, method, href) {
    new Ajax.Request(href, {
      asynchronous: true,
      evalScripts: true,
      method: method,
      onLoading: function() {
        el.hide();
        el.next('.loading_action').show();
      },
      onComplete: function(response) {
        el.show();
        el.next('.loading_action').hide();
      }
    });
  }
}

// Insertion bar which appears between slots
var InsertionBar = {
  element: null,
  element_bar: null,
  element_form: null,

  init: function() {
    this.element = $('pageInsertItems');
    this.element_bar  = $('pageInsertItemsBar');
    this.current_form = null;
  },

  show: function() {
    this.place();
    this.element_bar.setStyle({'height': '32px'}).blindDown({duration: 0.3});
  },

  place: function() {
    InsertionMarker.element.insert({before: this.element});
  },

  hide: function() {
    this.element_bar.hide();
  },

  revealForm: function() {
    // Reveal form
    this.element_bar.hide();
    this.current_form.show();

    InsertionMarker.setEnabled(true);
  },
    
  // Widget form
  setWidgetForm: function(id) {
    if (this.current_form)
      this.clearWidgetForm();

      var template = $(id);

      // Set insertion position
      $(id + 'Before').writeAttribute('value', Page.insert_before ? '1' : '0');
      $(id + 'Slot').writeAttribute('value', Page.insert_element ? Page.insert_element.readAttribute('slot') : '-1');

      // Form should go in the insertion bar, so we can change the insertion location and maintain
      // state
      this.current_form = template;
      this.revealForm();
  },

  setWidgetFormLoading: function(id, active) {
    var form = $(id);
    var submit = form ? form.down('.submit') : null;
    var loading = form ? form.down('.loading') : null;

    if (!(submit && loading))
      return;

    if (active)
    {
      submit.hide();
      loading.show();
    }
    else
    {
      submit.show();
      loading.hide();
    }
  },

  insertTempForm: function(template) {
    var el = null;
    var before = Page.insert_before ? '1' : '0';
    var slot = Page.insert_element ? Page.insert_element.readAttribute('slot') : '-1';
    var content = template.replace(/\{POS\}/, 'position[slot]=' + slot + '&position[before]=' + before);

    if (Page.insert_element == null) {
      el = $('slots').insert({bottom: content}).next();
    } else if (Page.insert_before) {
      el = Page.insert_element.insert({before: content}).previous();
    } else {
      el = Page.insert_element.insert({after: content}).next();
    }

    this.hide();
    return el;
  },

  clearWidgetForm: function() {
    if (!this.current_form)
      return;

    this.current_form.reset();
    this.current_form.hide();
    this.current_form = null;
  },

  widgetButtonFormHandler: function(form_name) {
    InsertionBar.setWidgetFormLoading(form_name, false);
    InsertionBar.setWidgetForm(form_name);
    Form.reset(form_name);
    $(form_name).focusFirstElement();
  },

  widgetFormHandler: function(form) {
    new Ajax.Request(form.readAttribute('action'), {
      asynchronous: true,
      evalScripts: true,
      method: form.readAttribute('method'),
      parameters: form.serialize(),
      onLoading: function() {
        form.down('.submit').hide();
        form.down('img.loading').show();
      },
      onFailure: function(response) {
        form.down('.submit').show();
        form.down('img.loading').hide();
      }
    });
  }
};

// Insertion marker which appears between slots
var InsertionMarker = {
  element: null,
  enabled: false,
  visible: false,

  init: function() {
    this.element = $('pageInsert');
    this.enabled = true;
    this.visible = false;
    Page.insert_element = null;
  },

  setEnabled: function(val) {
    this.enabled = val;
  },

  show: function(el, insert_before) {
    this.visible = true;
    this.set(el, insert_before);
    this.element.show();
    this.updateSlot(true);
  },

  hide: function() {
    if (this.visible) {
      this.element.hide();
      this.visible = false;
      this.updateSlot(false);
      if (this.enabled)
        this.set(null, true);
      }
  },

  updateSlot: function(active) {
    if (Page.insert_element == null)
      return;
    var el = Page.insert_before ? Page.insert_element : Page.next_element;
    if (el == null)
      return;
    if (active) {
      el.addClassName("InsertBefore");
    } else {
      el.removeClassName("InsertBefore");
    }
  },

  nextSlot: function() {
    if (Page.insert_element == null)
      return;
    var next = Page.insert_element.next();
    while (next != null && next.readAttribute('slot') == null) {
      next = next.next();
    }
    return next;
  },

  set: function(element, insert_before) {
    var el = element == null ? $(Element.getElementsBySelector($('slots'), '.pageSlot')[0]) : element;
    
    this.updateSlot(false);
    Page.insert_element = el;
    Page.next_element = this.nextSlot();
    Page.insert_before = el ? insert_before : true;
    if (this.visible)
      this.updateSlot(true);

    if (el == null)
      $('slots').insert({bottom: this.element});
    else if (insert_before)
      el.insert({before: this.element});
    else
      el.insert({after: this.element});
  }
};

// Hover observer for InsertionMarker
var InsertionMarkerFunc = function(evt){
  if (!InsertionMarker.enabled)
    return;

  var el = $(evt.target);
  var pt = evt.pointer();
  var offset = el.cumulativeOffset();

  pt.x -= Page.SLOT_GAP;
  var delta = pt.x - offset.left;

  if (!(delta < 0 || delta > Page.MARGIN))
  {
    // Show bar here *if* we are within the slot
    if (el.hasClassName('pageSlot'))
    {
      var h = el.getHeight(), thr = Math.min(h / 2, Page.SLOT_VERGE);
      var t = offset.top, b = t + h;

      // console.log(h + "," + thr + " | " + t + "," + b);

      if (el.hasClassName('pageFooter')) // before footer
        InsertionMarker.show(el, true);
      else if (pt.y - t <= thr) // before element
        InsertionMarker.show(el, true);
      else if (b - pt.y <= thr) // after element
        InsertionMarker.show(el, false);
      else
        InsertionMarker.hide(); // *poof*           
      }
  }
  else
  {
    // Ignore the insertion marker
    if (el.readAttribute('id') == "PIB") 
      return;

    InsertionMarker.hide(); // *poof*
  }
}

// Buttons

document.on('click', 'a.note_button', function(evt, el) {
  evt.stop();
  var in_bar = this.up('.pageSlots') != null;
  if (!in_bar) {
    InsertionMarker.set(null, true);
    InsertionBar.place();
  }
  
  InsertionBar.widgetButtonFormHandler('new_note_form');
});

document.on('click', 'a.divider_button', function(evt, el) {
  evt.stop();
  var in_bar = this.up('.pageSlots') != null;
  if (!in_bar) {
    InsertionMarker.set(null, true);
    InsertionBar.place();
  }
  
  InsertionBar.widgetButtonFormHandler('new_divider_form');
});

document.on('click', 'a.upload_button', function(evt, el) {
  evt.stop();
  var in_bar = this.up('.pageSlots') != null;
  if (!in_bar) {
    InsertionMarker.set(null, true);
    InsertionBar.place();
  }
  
  InsertionMarker.setEnabled(true);
  InsertionBar.clearWidgetForm();
  InsertionBar.insertTempForm(Page.upload_template);
});

document.on('click', 'a.cancelPageWidget', function(evt, el) {
  InsertionBar.clearWidgetForm();
});

// Widget Actions

document.on('click', 'a.edit_divider', function(evt, el) {
  evt.stop();

  Page.widgetActionHandler(el, 'get', el.readAttribute('href'));;
});

document.on('click', 'a.delete_divider', function(evt, el) {
  evt.stop();
  
  if (!confirm(el.readAttribute('aconfirm')))
    return;
  
  Page.widgetActionHandler(el, 'delete', el.readAttribute('href'));
});

document.on('click', 'a.edit_note', function(evt, el) {
  evt.stop();
  
  Page.widgetActionHandler(el, 'get', el.readAttribute('href'));
});

document.on('click', 'a.delete_note', function(evt, el) {
  evt.stop();
  
  if (!confirm(el.readAttribute('aconfirm')))
    return;
  
  Page.widgetActionHandler(el, 'delete', el.readAttribute('href'));
});

document.on('click', 'a.delete_page_upload', function(evt, el) {
  evt.stop();
  
  if (!confirm(el.readAttribute('aconfirm')))
    return;
  
  Page.widgetActionHandler(el, 'delete', el.readAttribute('href'));
});

// Actual widget forms

document.on('submit', 'form.edit_divider', function(evt, form) {
  evt.stop();
  InsertionBar.widgetFormHandler(form);
});

document.on('submit', 'form.edit_note', function(evt, form) {
  evt.stop();
  InsertionBar.widgetFormHandler(form);
});

document.on('submit', 'form.new_note', function(evt, form) {
  evt.stop();
  InsertionBar.widgetFormHandler(form);
});

document.on('submit', 'form.new_divider', function(evt, form) {
  evt.stop();
  InsertionBar.widgetFormHandler(form);
});


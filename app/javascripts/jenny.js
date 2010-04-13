// Jenny
//
// Callbacks:
//   jenny:toggle:action_class
//   jenny:loading:action_class
//   jenny:failed:action_class
//   jenny:loaded:action_class
//   jenny:cancel:action_class

var Jenny = {
	toggleElement: function(el) {
		Jenny.toggle(parseInt(el.readAttribute('new_record')),
		             el.readAttribute('header_id'),
		             el.readAttribute('link_id'),
		             el.readAttribute('form_id'));
	},
	
	// Handles typical jenny toggles
	toggle: function(new_record, header_id, link_id, form_id) {
		var header = $(header_id);
		var link = $(link_id);
		var form = $(form_id);
		
		if (new_record) {
			if (link)
	        	link.toggle();
	        if (!form.visible())
		      Effect.BlindDown(form_id, { duration: .3 });
		    else
		      Effect.BlindUp(form_id, { duration: .3 });
		} else {
			
	        if (!form.visible())
		    	Effect.BlindDown(form_id, { duration: .3 });
			else	
		    	Effect.BlindUp(form_id, { duration: .3 });
			
			if (header)
			{
	        	if (!form.visible())
			    	Effect.BlindDown(header_id, { duration: .3 });
				else
		    		Effect.BlindUp(header_id, { duration: .3 });
			}
		}

		Form.reset(form_id);

		if (form.hasClassName('form_error'))
		{ 
			form.removeClassName('form_error');
		}

		$$('# ' + form_id + ' .error').each(function(e){e.remove();});

		if (form.getStyle('display') == 'block' && form.down('.focus'))
		{
			form.auto_focus();
		}
		
		var formClass = "";
		document.fire("jenny:toggle:" + formClass, {form:form});
	},
	
	// Handles a typical jenny app_form
	handleForm: function(form) {
		var url = form.readAttribute('action');
		var formClass = form.readAttribute('jennytype');
		
	    new Ajax.Request(url, {
	      asynchronous: true,
	      evalScripts: true,
	      method: form.readAttribute('method'),
	      parameters: form.serialize(),
	      onLoading: function() {
		  	form.down('.submit').hide();
		  	form.down('img.loading').show();
			document.fire("jenny:loading:" + formClass, {form:form});
	      },
	      onFailure: function(response) {	
		  	form.down('.submit').show();
		  	form.down('img.loading').hide();
			document.fire("jenny:failed:" + formClass, {form:form});
	      },
	      onSuccess: function(response){
		    // Handled in the RJS
			document.fire("jenny:loaded:" + formClass, {form:form});
	      }
	   });
    },

    handleCancelForm: function(form) {
		var formClass = form.readAttribute('jennytype');
		Jenny.toggleElement(form);
		document.fire("jenny:cancel:" + formClass, {form:form});
	}
};

// Generic jenny form
document.on('submit', 'form.appform', function(e, el) {
	Jenny.handleForm(el);
	e.stop();
});

document.on('click', 'a.new_task_list_link', function(e, el) {
	Jenny.toggleElement(el);
	e.stop();
});

document.on('click', 'a.inline_form_create_cancel', function(e, el) {
	Jenny.handleCancelForm(el.up('form')); // hide form
	e.stop();
});

document.on('click', 'a.inline_form_update_cancel', function(e, el) {
	Jenny.handleCancelForm(el.up('form')); // hide form
	e.stop();
});

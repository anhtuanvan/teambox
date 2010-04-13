var Jenny = {
	toggleElement: function(el) {
		Jenny.toggle(parseInt(el.readAttribute('new_record')),
		             el.readAttribute('header_id'),
		             el.readAttribute('link_id'),
		             el.readAttribute('form_id'));
	},
	
	toggle: function(new_record, header_id, link_id, form_id) {
		if (new_record) {
	        $(link_id).toggle();
	        if (!$(form_id).visible())
		      Effect.BlindDown(form_id, { duration: .3 });
		    else
		      Effect.BlindUp(form_id, { duration: .3 });
		} else {
			
	        if (!$(form_id).visible())
		    	Effect.BlindDown(form_id, { duration: .3 });
			else	
		    	Effect.BlindUp(form_id, { duration: .3 });
			
	        if (!$(header_id).visible())
			    Effect.BlindDown(header_id, { duration: .3 });
			else
		    	Effect.BlindUp(header_id, { duration: .3 });
		}

		Form.reset(form_id);

		if ($(form_id).hasClassName('form_error'))
		{ 
			$(form_id).removeClassName('form_error') 
		}

		$$('# ' + form_id + ' .error').each(function(e){e.remove();});

		if ($(form_id).getStyle('display') == 'block' && $(form_id).down('.focus'))
		{
			$(form_id).auto_focus();
		}
	}	
};
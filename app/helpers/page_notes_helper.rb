module PageNotesHelper

  def new_note_form(project,page)
    render :partial => 'notes/new', :locals => { 
      :project => project, :page => page, :note => Note.new } 
  end

  def note_fields(f)
    render :partial => 'notes/fields', :locals => { :f => f }
  end
  
  def new_page_note_link(project,page)
    link_to "<span>#{t('.new_note')}</span>", new_project_page_note_path(project, page), :class => 'add_button note_button'
  end
  
  def note_actions_link(note)
    return unless note.editable?(current_user)
    render :partial => 'notes/actions',
      :locals => { :note => note }
  end
  
  def edit_note_link(note)
    link_to pencil_image,
      edit_project_page_note_path(note.project,note.page,note),
      :id => "edit_note_#{note.id}_link",
      :class => :edit_note
  end
  
  def delete_note_link(note)
    link_to trash_image,
      project_page_note_path(note.project,note.page,note),
      :aconfirm => t('.delete_confirm'),
      :id => "delete_note_#{note.id}_link",
      :class => 'delete_note'
  end
  
  def remove_form(show_element=nil)
    update_page do |page|  
      page << "$(this).up('form').remove();"
      if show_element
        page[show_element].show
      end
    end
  end

  def show_loading_note_form(id=nil)
    update_page do |page|
      page.loading_note_form(true,id)
    end  
  end
      
  def loading_note_form(toggle,id=nil)
    if toggle
      page["note_form_loading#{"_#{id}" if id}"].show
      page["note_submit#{"_#{id}" if id}"].hide
    else
      page["note_form_loading#{"_#{id}" if id}"].hide
      page["note_submit#{"_#{id}" if id}"].show
    end
  end
end
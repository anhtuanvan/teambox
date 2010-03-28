class Task
  def after_create
    project.log_activity(self,'create')
    add_watcher(self.user)
    create_comment_if_present
  end

  def before_save
    unless position
      last_position = task_list.tasks.first(:select => 'position')
      self.position = last_position.nil? ? 1 : last_position.position.succ
    end
    if assigned.try(:user) && watchers_ids && !watchers_ids.include?(assigned.user.id)
      add_watcher(assigned.user)
    end
  end

  def after_save
    update_counter_cache
  end

  def after_destroy
    Activity.destroy_all  :target_id => self.id, :target_type => self.class.to_s
    Comment.destroy_all   :target_id => self.id, :target_type => self.class.to_s
    update_counter_cache
  end
  
  protected
  
    def create_comment_if_present
      if @body
        comment = comments.new
        comment.user = user
        comment.body = @body
        comment.project = project
        comment.save!
      end
    end
end  
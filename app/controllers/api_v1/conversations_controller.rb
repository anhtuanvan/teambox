class ApiV1::ConversationsController < ApiV1::APIController
  before_filter :load_conversation, :only => [:show,:update,:destroy,:watch,:unwatch]
  before_filter :check_permissions, :only => [:create,:update,:destroy,:watch,:unwatch]
  
  def index
    query = {:conditions => api_range, :limit => api_limit, :include => [:user, :project]}
    
    @conversations = if @current_project
      @current_project.conversations.scoped(api_scope).all(query)
    else
      Conversation.scoped(api_scope).find_all_by_project_id(current_user.project_ids, query)
    end
    
    api_respond @conversations, :references => [:user, :project]
  end

  def show
    api_respond @conversation, :include => api_include
  end
  
  def create
    @conversation = @current_project.new_conversation(current_user,params)
    @conversation.body = params[:body]
    @saved = @conversation.save
    
    if @saved
      if (params[:user_all] || 0).to_i == 1
        @conversation.add_watchers @current_project.users
      else
        add_watchers params[:user]
      end
    end
    
    if @saved
      handle_api_success(@conversation, :is_new => true)
    else
      handle_api_error(@conversation)
    end
  end
  
  def update
    @saved = @conversation.update_attributes params
    
    if @saved
      handle_api_success(@conversation)
    else
      handle_api_error(@conversation)
    end
  end

  def destroy
    @conversation.destroy
    handle_api_success(@conversation)
  end
  
  def watch
    @conversation.add_watcher(current_user)
    handle_api_success(@conversation)
  end

  def unwatch
    @conversation.remove_watcher(current_user)
    handle_api_success(@conversation)
  end

  protected
  
  def load_conversation
    @conversation = if @current_project
      @current_project.conversations.find(params[:id])
    else
      Conversation.find_by_id(params[:id], :conditions => {:project_id => current_user.project_ids})
    end
    api_status(:not_found) unless @conversation
  end
  
  def api_scope
    conditions = {}
    if params[:type]
      case params[:type]
      when 'thread'
        conditions[:simple] = true
      when 'conversation'
        conditions[:simple] = false
      end
    end
    {:conditions => conditions}
  end
  
  def check_permissions
    unless (@conversation || @current_project).editable?(current_user)
      api_error(t('common.not_allowed'), :unauthorized)
    end
  end
  
  def add_watchers(hash)
    (hash || []).each do |user_id, should_notify|
      if should_notify == "1" and Person.exists? :project_id => @conversation.project_id, :user_id => user_id
        user = User.find user_id
        @conversation.add_watcher user# if user
      end
    end
  end
    
  def api_include
    [:comments, :user] & (params[:include]||{}).map(&:to_sym)
  end
  
end
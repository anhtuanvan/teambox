require 'net/pop'
require 'net/imap'
require 'net/http'

# Receives an email and performs the adequate action
#
# Emails can be sent to project@app.server.com or project+model+id@app.server.com
# Cases:
#
# keiretsu@app.server.com                  Will post a new comment on the project's activity wall
# keiretsu+conversation@app.server.com     Will create a new conversation with Subject as a title and Body as a comment
# keiretsu+conversation+5@app.server.com   Will post a new comment in the conversation whose id is 5
# keiretsu+task_list+8@app.server.com      Will post a new comment in the task list whose id is 8
# keiretsu+task+12@app.server.com          Will post a new comment in the task whose id is 12
#
# Invalid or malformed emails will be ignored
#
# TODO: Enhance mime and plain messages treatment
#       Parse HTML to Markdown
#       Strip the quoted text from email replies
#
module Emailer::Incoming

  def self.fetch(settings)
    type = settings[:type].to_s.downcase
    send("fetch_#{type}", settings)
  rescue SocketError
    settings_out = settings.merge(:password => '*' * settings[:password].to_s.length)
    $stderr.puts "Error connecting to mail server with settings:\n  #{settings_out.inspect}"
    raise
  end

  def self.fetch_pop(settings)
    Net::POP3.start(settings[:address], settings[:port], settings[:user_name], settings[:password]) do |pop|
      pop.mails.each do |email|
        begin
          Emailer.receive(email.pop)
        rescue Exception
          $stderr.puts "Error receiving email at #{Time.now}: #{$!}"
        end
        email.delete
      end
    end
  end
  
  def self.fetch_imap(settings)
    imap = Net::IMAP.new(settings[:address], settings[:port], true)
    imap.login(settings[:user_name], settings[:password])
    imap.select('Inbox')

    imap.uid_search(["NOT", "DELETED"]).each do |uid|
      source = imap.uid_fetch(uid, ['RFC822']).first.attr['RFC822']

      begin
        Emailer.receive(source)
      rescue Exception
        $stderr.puts "Error receiving email at #{Time.now}: #{$!}"
      end

      imap.uid_copy(uid, "[Gmail]/All Mail")
      imap.uid_store(uid, "+FLAGS", [:Deleted])
    end

    imap.expunge
    imap.logout
    imap.disconnect
  end

  REPLY_REGEX = /(Re:|RE:|Fwd:|FWD:)/

  def receive(email)
    process email
    get_target
    
    case @type
    when :project
      puts "Posting to project #{@target.id} '#{@subject}'"
      post_to @target
    when :conversation
      if @target
        puts "Posting to conversation #{@target.id} '#{@subject}'"
        post_to @target
      else
        puts "Creating conversation '#{@subject}'"
        create_conversation
      end
    when :task_list
      if @target
        puts "Posting to task list #{@target.id} '#{@subject}'"
        post_to @target        
      end
    when :task
      if @target
        puts "Posting to task #{@target.id} '#{@subject}'"
        post_to @target
      end
    else
      raise "Invalid target type"
    end    
  end
  
  private
  
  def process(email)
    raise "Invalid To field"   unless email.to   and email.to.first
    raise "Invalid From field" unless email.from and email.from.first

    @to       = email.to.first.split('@').first.downcase
    @body     = (email.multipart? ? email.parts.first.body : email.body)
    @body     = @body.split(Emailer::ANSWER_LINE).first.split("<div class='email'").first.strip
    @user     = User.find_by_email email.from.first
    @subject  = email.subject.gsub(REPLY_REGEX, "")
    @project  = Project.find_by_permalink @to.split('+').first
    
    raise "Invalid project '#{@to}'" unless @project
    raise "Invalid user '#{email.from.first}'" unless @user
    raise "Invalid body" unless @body
    
    raise "User does not belong to project" unless @user.projects.include? @project

    raise "Exclude Auto Responder" unless @project.include? "Auto Response"
    
    puts "#{@user.name} <#{@user.email}> sent '#{@subject}' to #{@to}"
  end
  
  # Decides which kind of object we'll be posting to (Conversation, Task, Task List..)
  # and finds it if appliable.
  def get_target
    extra_params = @to.split('+')

    case extra_params.size
      when 1 # projectname@mailserver.com
        @type = :project
        @target = @project
      when 2 # projectname+targetclass@mailserver.com
        case extra_params.second
        when 'conversation'
          @type = :conversation
          @target = Conversation.find_by_name_and_project_id(@subject, @project.id)
        else
          raise "Invalid target class"
        end
      when 3 # projectname+targetclass+id@mailserver.com
        case extra_params.second
        when 'conversation'
          @type = :conversation
          @target = Conversation.find_by_id_and_project_id(extra_params.third, @project.id)
        when 'task_list'
          @type = :task_list
          @target = TaskList.find_by_id_and_project_id(extra_params.third, @project.id)
        when 'task'
          @type = :task
          @target = Task.find_by_id_and_project_id(extra_params.third, @project.id)          
        else
          raise "Invalid target class"
        end
      else
        raise "Invalid recipient: '#{@to}'"
    end
  end
  
  def post_to(target)
    comment = @project.new_comment(@user, target, :name => @subject)
    comment.body = @body
    if target.class == Task
      comment.status = target.status
      comment.assigned = target.assigned
    end
    comment.save!
  end
  
  def create_conversation
    conversation = @project.new_conversation(@user, :name => @subject)
    conversation.body = @body
    conversation.save!
  end

end

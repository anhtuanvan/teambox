class Group < ActiveRecord::Base
  belongs_to :user
  has_many :projects, :dependent => :nullify
  has_many :invitations
  has_and_belongs_to_many :users
  
  acts_as_paranoid
  
  has_attached_file :logo,
    :styles => { 
      :top => ["134x24>", :jpg],
      :icon => ["96x72>", :png] },
    :url  => "/logos/:id/:style.:extension",
    :path => ":rails_root/public/logos/:id/:style.:extension"

  validates_attachment_size :logo, :less_than => 10.megabytes, :if => :has_logo?

  validates_uniqueness_of :permalink, :case_sensitive => false
  validates_length_of :permalink, :minimum => 5
  validates_format_of :permalink, :with => /^[a-z0-9_\-]{5,}$/, :if => :permalink_length_valid?
  
  def permalink_length_valid?
    self.permalink.length >= 5
  end
  
  def owner?(user)
    self.user_id == user.id
  end
  
  def admin?(user)
    self.has_member?(user)
  end
  
  def has_member?(user)
    self.user_ids.include? user.id
  end
  
  def has_logo?
    !logo.original_filename.nil?
  end
  
  def add_user(user)
    self.users << user
    self.users.uniq!
    save(false)
  end
  
  def remove_user(user)
    if !self.owner?(user)
      self.users.remove(user)
      save(false)  
    end
  end
  
  def to_param
    permalink
  end
  
end

require File.dirname(__FILE__) + '/../spec_helper'

describe ProjectsController do
  describe "on GET to /projects/new" do
    before(:each) do
      Factory.stub(:project)
      @user = Factory(:user)
      controller.stub(:current_user).returns(@user)
      get :new
    end

    it "assigns the new project to the current user" do
      assigns(:project).user_id.should == @user.id
    end
  end 
end
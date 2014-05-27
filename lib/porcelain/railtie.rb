require 'porcelain/view_helpers'
module Porcelain
  class Railtie < Rails::Railtie
    initializer "porcelain.view_helpers" do
      ActionView::Base.send :include, ViewHelpers
    end
  end
end

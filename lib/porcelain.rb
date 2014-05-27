require "porcelain/version"
require "porcelain/railtie" if defined?(Rails)

module Porcelain
  module Rails
    class Engine < ::Rails::Engine
    end
  end
end

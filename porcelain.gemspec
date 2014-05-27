# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'porcelain/version'

Gem::Specification.new do |spec|
  spec.name          = "porcelain"
  spec.version       = Porcelain::VERSION
  spec.authors       = ["jjluebke"]
  spec.email         = ["jjluebke@gmail.com"]
  spec.summary       = %q{Generic charting library wrapper}
  spec.description   = %q{Generic charting library wrapper}
  spec.homepage      = "https://github.com/theablefew/porcelain/tree/master/src"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0")
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.6"
  spec.add_development_dependency "rake"
  spec.add_dependency "railties"
end

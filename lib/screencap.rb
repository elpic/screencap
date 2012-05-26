require "screencap/version"
require 'phantomjs.rb'



module Screencap
  SCREENCAP_ROOT = Pathname.new(File.dirname(__FILE__))
  TMP_DIRECTORY = SCREENCAP_ROOT.join('..', 'tmp')
end

#config

#tmp directory to store files

#should return a file handle to tmp director where it is stored

require 'screencap/fetcher'
require 'screencap/phantom'
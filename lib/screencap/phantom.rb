module Screencap
  class Casper
    RASTERIZE = SCREENCAP_ROOT.join('screencap', 'raster.js')

    class << self

      def rasterize(url, path, args = {})
        params = {
          url: url,
          output: path
        }.merge(args).collect {|k,v| "--#{k}=#{v}"}

        runner = FriendlyGhost::Runner.new

        runner.command "#{RASTERIZE.to_s} #{params.join(' ')}"

        puts runner.process.out
        puts runner.process.err
      end

    end
  end
end
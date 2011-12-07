require 'rubygems'
require 'rack'
require 'json'


statics = Rack::Builder.new do
    use Rack::Static, :urls => ['/daumeditor', '/test']
    run Rack::Directory.new('.')
end

map '/DaumEditor' do
    run statics
end


class EditorJS
    def call(env)
        resp = Rack::Response.new
        resp.header['Content-Type'] = 'application/javascript'

        prefix = 'daumeditor/js'

        resp.write File.read(prefix + "/trex/eval.js")
        resp.write "\n"
        resp.write "(function(){\n"

        resp.write File.read(prefix + "/trex/header.js")
        resp.write "\n"

        list = JSON.parse(File.read(prefix + '/editor.json'));
        list.each do |f|
            resp.write File.read(prefix + '/' + f)
            resp.write "\n"
        end

        resp.write File.read(prefix + "/trex/footer.js")
        resp.write "\n"
        resp.write '})();'
        resp
    end
end

map '/DaumEditor/daumeditor/js/editor.js' do
   run EditorJS.new
end

map '/favicon.ico' do
    run Rack::File.new('favicon.ico')
end

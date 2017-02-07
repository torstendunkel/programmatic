describe("testing the setting priority of the renderer options",function(){

    /**
     * Here we are testing the order of the options priority. The order priority is
     * 1. Hash
     * 2. JSON/ passed in config
     * 3. default settings
     */
    var adRenderer;

    beforeEach(function(){
        spyOn(ch.tam.addnexusRender.prototype,"loadJSON").and.callFake(function(url,cb){
            cb("{}");
        });
        spyOn(ch.tam.addnexusRender.prototype,"loadStyle").and.callFake(function(){
        });
    });

    it("should set options to hash values",function(){
        var hashIdentifier = "MyIdentifier";
        // config value
        var config = {
            "identifier" : "configIdentifier"
        };
        spyOn(ch.tam.addnexusRender.prototype,"parseHash").and.callFake(function(){
            return {
                "identifier" : hashIdentifier
            }
        });
        adRenderer = new ch.tam.addnexusRender(config);
        expect(adRenderer.options.identifier).toBe(hashIdentifier);
    });

    it("should set identifier to config identifier, because no hash identifier is set",function(){
        var config = {
            "identifier" : "configIdentifier"
        };
        adRenderer = new ch.tam.addnexusRender(config);
        expect(adRenderer.options.identifier).toBe(config.identifier);
    });

    it("should set identifier to default identifier, because no hash and config identifier is set",function(){
        adRenderer = new ch.tam.addnexusRender();
        expect(adRenderer.options.identifier).toBe(adRenderer.settings.identifier);
    });

    it("should set identifier to default identifier, because no hash and config identifier is set",function(){
        adRenderer = new ch.tam.addnexusRender();
        var myIdentifier = "Hallo";
        adRenderer.options.identifier = myIdentifier;
        adRenderer.validateOptions();
        expect(adRenderer.options.identifier).toBe(myIdentifier);
    });



});
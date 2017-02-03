describe("testing the generation of the tags array that is passed to appnexus",function(){

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
        spyOn(ch.tam.addnexusRender.prototype,"addStyle").and.callFake(function(){
        });
    });


    //testing the helper methods
    it("should test helpermethod parseNumadsFromIdentifier",function(){
        adRenderer = new ch.tam.addnexusRender();
        var result = adRenderer.parseNumadsFromIdentifier("ppn_sb_rectangle5_20min");
        expect(result).toBe(5);
    });
    //testing the helper methods
    it("should test helpermethod parseNumadsFromIdentifier with larger number",function(){
        adRenderer = new ch.tam.addnexusRender();
        var result = adRenderer.parseNumadsFromIdentifier("ppn_sb_rectangle50_20min");
        expect(result).toBe(50);
    });
    //testing the helper methods
    it("should test helpermethod parseChallengeData",function(){
        var config = {
            challenge : "ppn_sb_tralala3_21min,ppn_huhu5_21min",
            ctagid : "1234,22323"
        };
        adRenderer = new ch.tam.addnexusRender(config);
        adRenderer.parseChallengeData();
        expect(adRenderer.options.challenge).toEqual(["ppn_sb_tralala3_21min","ppn_huhu5_21min"]);
        expect(adRenderer.options.ctagid).toEqual(["1234","22323"]);
    });
    //testing the helper methods
    it("should test helpermethod parseChallengeData with array notation",function(){
        var config = {
            challenge : "[ppn_sb_tralala3_21min,ppn_huhu5_21min]",
            ctagid : "[1234,22323]"
        };
        adRenderer = new ch.tam.addnexusRender(config);
        adRenderer.parseChallengeData();
        expect(adRenderer.options.challenge).toEqual(["ppn_sb_tralala3_21min","ppn_huhu5_21min"]);
        expect(adRenderer.options.ctagid).toEqual(["1234","22323"]);
    });

    it("should generate an array containing only 'numads' entries",function(done){
        var config = {
            numads : 5
        };
        adRenderer = new ch.tam.addnexusRender(config);
        //to avoid errors
        apntag.onEvent = function(){};
        spyOn(adRenderer,"loadAds").and.callFake(function(arr){
            expect(arr.length).toBe(config.numads);
            done();
        });
        adRenderer.prepareTags();
    });

    it("should generate an array containing the 'numads' entries and the challenge entries",function(done){
        var config = {
            numads : 5,
            challenge : "ppn_sb_tralala3_21min,ppn_huhu5_21min",
            ctagid : "1234,22323"
        };
        adRenderer = new ch.tam.addnexusRender(config);
        //to avoid errors
        apntag.onEvent = function(){};
        spyOn(adRenderer,"loadAds").and.callFake(function(arr){
            //3 + 5 + 3
            expect(arr.length).toBe(13);
            done();
        });
        adRenderer.prepareTags();
    });

});
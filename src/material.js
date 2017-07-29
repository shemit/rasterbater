var Material = function() {

  this.vertexShaderSrc = "";
  this.fragmentShaderSrc = "";

  this.vertexShader = "";
  this.fragmentShader = "";

  this.compiledVertexShader = null;
  this.compiledFragmentShader = null;

  this.shaderProgram = null;

  this.attributes = [];
  this.uniforms = [];

  this.loaded = false;

  this.loadShader = function(file, shaderType, material) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false); 
    rawFile.overrideMimeType('text\/plain; charset=x-user-defined');

    var _this = this;
    rawFile.onreadystatechange = function () {
      if(rawFile.readyState === 4) {
        if(rawFile.status === 200 || rawFile.status == 0) {
          var allText = rawFile.responseText;
          if (shaderType in _this) {
            _this[shaderType] = allText;
          }
        }
      }
    }
    rawFile.send(null);
  }

  this.load = function() {
    this.loadShader(this.vertexShaderSrc, "vertexShader", this);
    this.loadShader(this.fragmentShaderSrc, "fragmentShader", this);

    var startTime = new Date().getTime() / 1000;
    var currTime = startTime;
    var timeOut = 5;
    var timedOut = false;

    while (
        this.vertexShader == "" && 
        this.fragmentShader == "" &&
        !timedOut
      ) 
    {
      var currTime = new Date().getTime() / 1000;
      if (currTime - startTime < timeOut) {
        timedOut = true;
      }
    }
    console.log(this.fragmentShader);

    if (timedOut) {
      return false;
    }
    
    return true;
  }
}

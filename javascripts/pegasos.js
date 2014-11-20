var pegasos = (function(){

  /*
    This is a binary SVM and is trained using the Pegasos algorithm.
    Reference: ?)
    
  */
  var SVM = function(options) {
  };

  SVM.prototype = {
    
    // data is NxD array of floats. 
	//labels is N array of [1 -1].
    train: function(data, labels, options) {
      
      this.data = data;
      this.labels = labels;

      // parameters
      options = options || {};
	  // lambda
      var lambda = options.lambda || 1e-4; 
	  // maximum number of iterations
      var maxiter = options.maxiter || 10000;
	  //stop iterations if there are no updates after
	  //this amount of consecutive iterations
      var maxIdle = options.maxIdle || 2 * data.length;
      
      // instantiate kernel according to options. kernel can be given as string or as a custom function
      var kernel = dotProduct;
      this.kernelType = "linear";
      if("kernel" in options) {
        if(typeof options.kernel === "string") {
          // kernel was specified as a string. Handle these special cases appropriately
          if(options.kernel === "linear") { 
            this.kernelType = "linear"; 
            kernel = dotProduct; 
          }
          if(options.kernel === "rbf") { 
			//rbf sigma default to 0.5
            var rbfSigma = options.rbfsigma || 0.5;
            this.rbfSigma = rbfSigma; // back this up
            this.kernelType = "rbf";
            kernel = makeRbfKernel(rbfSigma);
          }
        } else {
          // assume kernel was specified as a function. Let's just use it
          this.kernelType = "custom";
          kernel = options.kernel;
        }
      }

      // initializations
      this.kernel = kernel;
      this.N = data.length;
      this.D = data[0].length;
      this.alpha = zeros(this.N);
      
	  //Monitor updates during iterations
	  var idleCount = 0;
	   var iter = 0;
      // Pegasos
      for(var t=0; t<maxiter; t++) {
		if(idleCount == maxIdle) {
			//Stop
			iter--;
			continue;
		}
		//Choose an instance at random
		var randInt = randi(0, this.N);
		//Compute w.x => predict the sampled instance
		var wx = this.computeMargin(this.data[randInt]);
		//is prediction correct
		if((labels[randInt] * wx / (lambda * t)) < 1) {
			//Wrong...so update
			this.alpha[randInt] = this.alpha[randInt] + 1;
			idleCount = 0;
		} else {
			idleCount++;
		}
		iter++;
	  }
	  
	  //Todo:
      // if the user was using a linear kernel, lets also compute and store the
      // weights. This will speed up evaluations during testing time
      if(this.kernelType === "linear") {

        // compute weights and store them
        this.w = new Array(this.D);
        for(var j=0;j<this.D;j++) {
          var s= 0.0;
          for(var i=0;i<this.N;i++) {
            s+= this.alpha[i] * labels[i] * data[i][j];
          }
          this.w[j] = s;
          this.usew_ = true;
        }
      } else {

        //get the support vectors
		//non-zero alpha
        var svData = [];
        var svLabels = [];
        var svAlpha = [];
        for(var p=0;p<this.N;p++) {
          //console.log("alpha=%f", this.alpha[i]);
          if(this.alpha[p] > 0) {
            svData.push(this.data[p]);
            svLabels.push(this.labels[p]);
            svAlpha.push(this.alpha[p]);
          }
        }

        // discard previous data
		// and use only support vectors data
        this.data = svData;
        this.labels = svLabels;
        this.alpha = svAlpha;
        this.N = this.data.length;
        //console.log("filtered training data from %d to %d support vectors.", data.length, this.data.length);
      }
	  
	  var trainstats = {};
      trainstats.iters= iter;
      return trainstats;
    }, 
    
    computeMargin: function(inst) {
	
      var f = 0;
		for(var i=0;i<this.N;i++) {
		  f += this.alpha[i] * this.labels[i] * this.kernel(inst, this.data[i]);
		}
		
       return f;
    },
    
	//predict one instance
    predictOne: function(inst) { 
      return this.computeMargin(inst) > 0 ? 1 : -1; 
    },
    
    // predictions
    predict: function(data) {
      var pred = [];
      for(var i=0;i<data.length;i++) {
        pred[i] = this.predictOne(data[i]);
      }
      return pred;
    }
  };
  
  // Kernels
  function makeRbfKernel(sigma) {
    return function(v1, v2) {
      var s=0;
	  //The value 1 for x_0 is added here for the bias term.
	  //For rbf kernel..the 1s cancel out.
	  //v1.unshift(1);
	  //v2.unshift(1);
      for(var q=0;q<v1.length;q++) { s += (v1[q] - v2[q])*(v1[q] - v2[q]); } 
      return Math.exp(-s/(2.0*sigma*sigma));
    };
  }
  
  //normal dot product.. for linear kernel
  function dotProduct(v1, v2) {
    var s=0; 
	//The value 1 for x_0 is added here for the bias term.
    for(var q=0;q<v1.length;q++) { s += v1[q] * v2[q] + 1; } 
    return s;
  }

  // utility functions
  // generate random floating point number between a and b
  function randf(a, b) {
    return a + Math.random()*(b-a);
  }

  // generate random integer between a and b (b excluded)
  function randi(a, b) {
     return Math.floor(randf(a, b));
  }

  // create vector of zeros of length n
  function zeros(n) {
    var arr= [];
    for(var i=0;i<n;i++) { arr[i]= 0; }
    return arr;
  }

  //public members
  var pub = {};
  pub.SVM = SVM;
  return pub;
})();
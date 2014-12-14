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
	  //alpha tolerance
	  var alphatol = options.alphatol || 1e-4;
      
      // kernel defaults to linear - dot product
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
            this.rbfSigma = rbfSigma;
            this.kernelType = "rbf";
            kernel = makeRbfKernel(rbfSigma);
          }
        }
      }

      // initializations
      this.kernel = kernel;
      this.N = data.length;
      this.D = data[0].length;
      this.alpha = zeros(this.N);
	  this.svIndex = [];
      
	  //Pegasos Linear
      if(this.kernelType === "linear") {
	  
        // use weights
        this.w = zeros(this.D + 1);
		for(var t=1; t<maxiter; t++) {
			var eta = 1 / (lambda * t);
			//Choose an instance at random
			var randInt = randi(0, this.N);
			var wx = this.computeMargin(this.data[randInt]);
			//Update w..
			for(var j = -1; j < this.D; j++) {
				this.w[j+1] = (1 - (1/t)) * this.w[j+1];
				if((labels[randInt] * wx) < 1) {
					//bias term
					if(j < 0) {
						this.w[j+1] += eta*labels[randInt];
					} else {
						this.w[j+1] += eta*labels[randInt]*this.data[randInt][j];
					}
				}
			}
		}
      } else {
		  //Kernelized Pegasos
		  //Monitor updates during iterations
		  var idleCount = 0;
		   var iter = 0;
		  // Pegasos
		  for(var t=1; t<maxiter; t++) {
			if(idleCount == maxIdle) {
				//Stop
				iter--;
				break;
			}
			//Choose an instance at random
			var randInt = randi(0, this.N);
			//Compute w.x => predict the sampled instance
			var wx = this.computeMarginForTraining(this.data[randInt]);
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
		
			//Normalise the support vectors
			var sum = 0;
			for(var p=0;p<this.N;p++) {
			  sum += this.alpha[p];
			}
			
			//get the index of the support vectors
			//non-zero alpha
			//Only the support vectors are needed to compute the margins when predicting
			//But the whole data is needed when drawing
			
			for(var p=0;p<this.N;p++) {
			  this.alpha[p] /= sum;
			  if(this.alpha[p] > alphatol) {
				this.svIndex.push(p);
			  }
			}		
      }
	  
	  var trainstats = {};
      trainstats.iters= iter;
      return trainstats;
    }, 
	
	computeMarginForTraining: function(inst) {	
      var f = 0;
		for(var i=0;i<this.N;i++) {
		  f += this.alpha[i] * this.labels[i] * this.kernel(inst, this.data[i]);
		}		
       return f;
    },
    
    computeMargin: function(inst) {	
		var f = 0;
		if(this.kernelType === "linear") {
			f = dotProduct(this.w, inst);
		} else {
			for(var i=0;i<this.svIndex.length;i++) {
				f += this.alpha[this.svIndex[i]] * this.labels[this.svIndex[i]] * this.kernel(inst, this.data[this.svIndex[i]]);
			}
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
  function dotProduct(w, x) {
    var s=0; 
	//The value 1 for x_0 is added here for the bias term.
    for(var q=0;q<x.length;q++) { s += w[q+1] * x[q]; } 
    return s + w[0];
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